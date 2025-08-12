import { Router, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Booking } from "../entities/Booking";
import { Room } from "../entities/Room";
import { Guest } from "../entities/Guest";
import { User } from "../entities/User";
import { authenticateToken } from "../middleware/auth";
import { auditLog } from "../middleware/audit";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

const router = Router();

// Get all bookings with optional filters
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      roomId,
      guestId,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const bookingRepository = AppDataSource.getRepository(Booking);
    const queryBuilder = bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.room", "room")
      .leftJoinAndSelect("booking.guest", "guest")
      .leftJoinAndSelect("booking.createdBy", "createdBy");

    // Apply filters
    if (startDate && endDate) {
      queryBuilder.andWhere(
        "booking.checkInDate >= :startDate AND booking.checkOutDate <= :endDate",
        {
          startDate: new Date(startDate as string),
          endDate: new Date(endDate as string),
        },
      );
    }

    if (roomId) {
      queryBuilder.andWhere("booking.roomId = :roomId", { roomId });
    }

    if (guestId) {
      queryBuilder.andWhere("booking.guestId = :guestId", { guestId });
    }

    if (status) {
      queryBuilder.andWhere("booking.status = :status", { status });
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    queryBuilder.skip(skip).take(Number(limit));

    const [bookings, total] = await queryBuilder.getManyAndCount();

    res.json({
      bookings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get booking by ID
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const bookingRepository = AppDataSource.getRepository(Booking);

    const booking = await bookingRepository.findOne({
      where: { id: parseInt(id) },
      relations: ["room", "guest", "createdBy"],
    });

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new booking
router.post(
  "/",
  authenticateToken,
  auditLog("CREATE_BOOKING"),
  async (req: Request, res: Response) => {
    try {
      const {
        roomId,
        guestId,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        totalAmount,
        specialRequests,
        status = "confirmed",
      } = req.body;

      // Validate required fields
      if (
        !roomId ||
        !guestId ||
        !checkInDate ||
        !checkOutDate ||
        !numberOfGuests
      ) {
        return res.status(400).json({
          error:
            "Missing required fields: roomId, guestId, checkInDate, checkOutDate, numberOfGuests",
        });
      }

      const bookingRepository = AppDataSource.getRepository(Booking);
      const roomRepository = AppDataSource.getRepository(Room);
      const guestRepository = AppDataSource.getRepository(Guest);

      // Validate room exists
      const room = await roomRepository.findOne({ where: { id: roomId } });
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      // Validate guest exists
      const guest = await guestRepository.findOne({ where: { id: guestId } });
      if (!guest) {
        return res.status(404).json({ error: "Guest not found" });
      }

      // Check room availability
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      if (checkIn >= checkOut) {
        return res
          .status(400)
          .json({ error: "Check-out date must be after check-in date" });
      }

      const conflictingBookings = await bookingRepository.find({
        where: {
          roomId,
          status: "confirmed",
          checkInDate: LessThanOrEqual(checkOut),
          checkOutDate: MoreThanOrEqual(checkIn),
        },
      });

      if (conflictingBookings.length > 0) {
        return res
          .status(409)
          .json({ error: "Room is not available for the selected dates" });
      }

      // Check room capacity
      if (numberOfGuests > room.capacity) {
        return res.status(400).json({
          error: `Room capacity exceeded. Maximum capacity: ${room.capacity}`,
        });
      }

      // Create booking
      const booking = new Booking();
      booking.roomId = roomId;
      booking.guestId = guestId;
      booking.checkInDate = checkIn;
      booking.checkOutDate = checkOut;
      booking.numberOfGuests = numberOfGuests;
      booking.totalAmount = totalAmount || room.pricePerNight;
      booking.specialRequests = specialRequests;
      booking.status = status;
      booking.createdById = (req as any).user.id;

      const savedBooking = await bookingRepository.save(booking);

      // Fetch the complete booking with relations
      const completeBooking = await bookingRepository.findOne({
        where: { id: savedBooking.id },
        relations: ["room", "guest", "createdBy"],
      });

      res.status(201).json(completeBooking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Update booking
router.put(
  "/:id",
  authenticateToken,
  auditLog("UPDATE_BOOKING"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        roomId,
        guestId,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        totalAmount,
        specialRequests,
        status,
      } = req.body;

      const bookingRepository = AppDataSource.getRepository(Booking);
      const roomRepository = AppDataSource.getRepository(Room);
      const guestRepository = AppDataSource.getRepository(Guest);

      const booking = await bookingRepository.findOne({
        where: { id: parseInt(id) },
      });
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Validate room if changed
      if (roomId && roomId !== booking.roomId) {
        const room = await roomRepository.findOne({ where: { id: roomId } });
        if (!room) {
          return res.status(404).json({ error: "Room not found" });
        }
        booking.roomId = roomId;
      }

      // Validate guest if changed
      if (guestId && guestId !== booking.guestId) {
        const guest = await guestRepository.findOne({ where: { id: guestId } });
        if (!guest) {
          return res.status(404).json({ error: "Guest not found" });
        }
        booking.guestId = guestId;
      }

      // Update dates if provided
      if (checkInDate) {
        const newCheckIn = new Date(checkInDate);
        const checkOut = checkOutDate
          ? new Date(checkOutDate)
          : booking.checkOutDate;

        if (newCheckIn >= checkOut) {
          return res
            .status(400)
            .json({ error: "Check-out date must be after check-in date" });
        }
        booking.checkInDate = newCheckIn;
      }

      if (checkOutDate) {
        const newCheckOut = new Date(checkOutDate);
        const checkIn = checkInDate
          ? new Date(checkInDate)
          : booking.checkInDate;

        if (checkIn >= newCheckOut) {
          return res
            .status(400)
            .json({ error: "Check-out date must be after check-in date" });
        }
        booking.checkOutDate = newCheckOut;
      }

      // Check room availability for updated dates (excluding current booking)
      if (checkInDate || checkOutDate || roomId) {
        const conflictingBookings = await bookingRepository.find({
          where: {
            roomId: booking.roomId,
            status: "confirmed",
            checkInDate: LessThanOrEqual(booking.checkOutDate),
            checkOutDate: MoreThanOrEqual(booking.checkInDate),
          },
        });

        const hasConflict = conflictingBookings.some(
          (b) => b.id !== booking.id,
        );
        if (hasConflict) {
          return res
            .status(409)
            .json({ error: "Room is not available for the selected dates" });
        }
      }

      // Update other fields
      if (numberOfGuests !== undefined) booking.numberOfGuests = numberOfGuests;
      if (totalAmount !== undefined) booking.totalAmount = totalAmount;
      if (specialRequests !== undefined)
        booking.specialRequests = specialRequests;
      if (status !== undefined) booking.status = status;

      booking.updatedAt = new Date();

      const updatedBooking = await bookingRepository.save(booking);

      // Fetch the complete booking with relations
      const completeBooking = await bookingRepository.findOne({
        where: { id: updatedBooking.id },
        relations: ["room", "guest", "createdBy"],
      });

      res.json(completeBooking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Cancel booking
router.patch(
  "/:id/cancel",
  authenticateToken,
  auditLog("CANCEL_BOOKING"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const bookingRepository = AppDataSource.getRepository(Booking);
      const booking = await bookingRepository.findOne({
        where: { id: parseInt(id) },
      });

      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status === "cancelled") {
        return res.status(400).json({ error: "Booking is already cancelled" });
      }

      booking.status = "cancelled";
      booking.specialRequests = booking.specialRequests
        ? `${booking.specialRequests}\n\nCancellation reason: ${reason || "No reason provided"}`
        : `Cancellation reason: ${reason || "No reason provided"}`;
      booking.updatedAt = new Date();

      const updatedBooking = await bookingRepository.save(booking);

      // Fetch the complete booking with relations
      const completeBooking = await bookingRepository.findOne({
        where: { id: updatedBooking.id },
        relations: ["room", "guest", "createdBy"],
      });

      res.json(completeBooking);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Delete booking (hard delete - use with caution)
router.delete(
  "/:id",
  authenticateToken,
  auditLog("DELETE_BOOKING"),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const bookingRepository = AppDataSource.getRepository(Booking);

      const booking = await bookingRepository.findOne({
        where: { id: parseInt(id) },
      });
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      await bookingRepository.remove(booking);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Get room availability
router.get(
  "/availability/:roomId",
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { roomId } = req.params;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res
          .status(400)
          .json({ error: "startDate and endDate are required" });
      }

      const bookingRepository = AppDataSource.getRepository(Booking);
      const roomRepository = AppDataSource.getRepository(Room);

      // Check if room exists
      const room = await roomRepository.findOne({
        where: { id: parseInt(roomId) },
      });
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const checkIn = new Date(startDate as string);
      const checkOut = new Date(endDate as string);

      const conflictingBookings = await bookingRepository.find({
        where: {
          roomId: parseInt(roomId),
          status: "confirmed",
          checkInDate: LessThanOrEqual(checkOut),
          checkOutDate: MoreThanOrEqual(checkIn),
        },
      });

      const isAvailable = conflictingBookings.length === 0;

      res.json({
        roomId: parseInt(roomId),
        startDate: checkIn,
        endDate: checkOut,
        isAvailable,
        conflictingBookings: conflictingBookings.map((booking) => ({
          id: booking.id,
          checkInDate: booking.checkInDate,
          checkOutDate: booking.checkOutDate,
          status: booking.status,
        })),
      });
    } catch (error) {
      console.error("Error checking room availability:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
