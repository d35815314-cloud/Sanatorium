import { Router, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { Booking, BookingStatus } from "../entities/Booking";
import { Room } from "../entities/Room";
import { Guest } from "../entities/Guest";
import { authenticateToken, requireManagerOrAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { Between, MoreThanOrEqual, LessThanOrEqual } from "typeorm";

const router = Router();

/**
 * @swagger
 * /api/reports/occupancy:
 *   get:
 *     summary: Get occupancy report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *       - in: query
 *         name: building
 *         schema:
 *           type: string
 *         description: Filter by building
 *     responses:
 *       200:
 *         description: Occupancy report data
 */
router.get(
  "/occupancy",
  authenticateToken,
  requireManagerOrAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, building } = req.query;

    const bookingRepository = AppDataSource.getRepository(Booking);
    const roomRepository = AppDataSource.getRepository(Room);

    // Default to current month if no dates provided
    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate
      ? new Date(endDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Get total rooms
    const roomQuery = roomRepository.createQueryBuilder("room");
    if (building) {
      roomQuery.where("room.building = :building", { building });
    }
    const totalRooms = await roomQuery.getCount();

    // Get bookings in date range
    const bookingQuery = bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.room", "room")
      .where(
        "booking.checkInDate <= :endDate AND booking.checkOutDate >= :startDate",
        {
          startDate: start,
          endDate: end,
        },
      )
      .andWhere("booking.status IN (:...statuses)", {
        statuses: [
          BookingStatus.CONFIRMED,
          BookingStatus.CHECKED_IN,
          BookingStatus.CHECKED_OUT,
        ],
      });

    if (building) {
      bookingQuery.andWhere("room.building = :building", { building });
    }

    const bookings = await bookingQuery.getMany();

    // Calculate occupancy by day
    const dailyOccupancy = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dayBookings = bookings.filter(
        (booking) =>
          booking.checkInDate <= currentDate &&
          booking.checkOutDate > currentDate,
      );

      dailyOccupancy.push({
        date: new Date(currentDate),
        occupiedRooms: dayBookings.length,
        totalRooms,
        occupancyRate:
          totalRooms > 0
            ? ((dayBookings.length / totalRooms) * 100).toFixed(2)
            : 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate average occupancy
    const avgOccupancy =
      dailyOccupancy.reduce(
        (sum, day) => sum + parseFloat(day.occupancyRate as string),
        0,
      ) / dailyOccupancy.length;

    // Get occupancy by room type
    const roomTypeOccupancy = await roomRepository
      .createQueryBuilder("room")
      .select("room.type", "type")
      .addSelect("COUNT(DISTINCT room.id)", "totalRooms")
      .addSelect("COUNT(DISTINCT booking.id)", "occupiedRooms")
      .leftJoin(
        "room.bookings",
        "booking",
        "booking.checkInDate <= :endDate AND booking.checkOutDate >= :startDate AND booking.status IN (:...statuses)",
        {
          startDate: start,
          endDate: end,
          statuses: [
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
            BookingStatus.CHECKED_OUT,
          ],
        },
      )
      .where(building ? "room.building = :building" : "1=1", { building })
      .groupBy("room.type")
      .getRawMany();

    res.json({
      period: { startDate: start, endDate: end },
      summary: {
        totalRooms,
        averageOccupancyRate: avgOccupancy.toFixed(2),
        totalBookings: bookings.length,
      },
      dailyOccupancy,
      roomTypeOccupancy: roomTypeOccupancy.map((item) => ({
        type: item.type,
        totalRooms: parseInt(item.totalRooms),
        occupiedRooms: parseInt(item.occupiedRooms),
        occupancyRate:
          item.totalRooms > 0
            ? ((item.occupiedRooms / item.totalRooms) * 100).toFixed(2)
            : 0,
      })),
    });
  }),
);

/**
 * @swagger
 * /api/reports/revenue:
 *   get:
 *     summary: Get revenue report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *           default: day
 *         description: Group results by time period
 *     responses:
 *       200:
 *         description: Revenue report data
 */
router.get(
  "/revenue",
  authenticateToken,
  requireManagerOrAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const bookingRepository = AppDataSource.getRepository(Booking);

    // Default to current month if no dates provided
    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate
      ? new Date(endDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Get bookings in date range
    const bookings = await bookingRepository
      .createQueryBuilder("booking")
      .leftJoinAndSelect("booking.room", "room")
      .where(
        "booking.checkInDate >= :startDate AND booking.checkInDate <= :endDate",
        {
          startDate: start,
          endDate: end,
        },
      )
      .andWhere("booking.status IN (:...statuses)", {
        statuses: [
          BookingStatus.CONFIRMED,
          BookingStatus.CHECKED_IN,
          BookingStatus.CHECKED_OUT,
        ],
      })
      .getMany();

    // Calculate total revenue
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + parseFloat(booking.totalAmount.toString()),
      0,
    );
    const totalPaid = bookings.reduce(
      (sum, booking) => sum + parseFloat(booking.paidAmount.toString()),
      0,
    );
    const totalPending = totalRevenue - totalPaid;

    // Group revenue by time period
    let dateFormat: string;
    switch (groupBy) {
      case "week":
        dateFormat = 'YYYY-"W"WW';
        break;
      case "month":
        dateFormat = "YYYY-MM";
        break;
      default:
        dateFormat = "YYYY-MM-DD";
    }

    const revenueByPeriod = await bookingRepository
      .createQueryBuilder("booking")
      .select(`TO_CHAR(booking.checkInDate, '${dateFormat}')`, "period")
      .addSelect("SUM(booking.totalAmount)", "totalRevenue")
      .addSelect("SUM(booking.paidAmount)", "paidAmount")
      .addSelect("COUNT(*)", "bookingCount")
      .where(
        "booking.checkInDate >= :startDate AND booking.checkInDate <= :endDate",
        {
          startDate: start,
          endDate: end,
        },
      )
      .andWhere("booking.status IN (:...statuses)", {
        statuses: [
          BookingStatus.CONFIRMED,
          BookingStatus.CHECKED_IN,
          BookingStatus.CHECKED_OUT,
        ],
      })
      .groupBy("period")
      .orderBy("period", "ASC")
      .getRawMany();

    // Revenue by room type
    const revenueByRoomType = await bookingRepository
      .createQueryBuilder("booking")
      .leftJoin("booking.room", "room")
      .select("room.type", "roomType")
      .addSelect("SUM(booking.totalAmount)", "totalRevenue")
      .addSelect("SUM(booking.paidAmount)", "paidAmount")
      .addSelect("COUNT(*)", "bookingCount")
      .where(
        "booking.checkInDate >= :startDate AND booking.checkInDate <= :endDate",
        {
          startDate: start,
          endDate: end,
        },
      )
      .andWhere("booking.status IN (:...statuses)", {
        statuses: [
          BookingStatus.CONFIRMED,
          BookingStatus.CHECKED_IN,
          BookingStatus.CHECKED_OUT,
        ],
      })
      .groupBy("room.type")
      .getRawMany();

    res.json({
      period: { startDate: start, endDate: end },
      summary: {
        totalRevenue: totalRevenue.toFixed(2),
        totalPaid: totalPaid.toFixed(2),
        totalPending: totalPending.toFixed(2),
        totalBookings: bookings.length,
        averageBookingValue:
          bookings.length > 0 ? (totalRevenue / bookings.length).toFixed(2) : 0,
      },
      revenueByPeriod: revenueByPeriod.map((item) => ({
        period: item.period,
        totalRevenue: parseFloat(item.totalRevenue).toFixed(2),
        paidAmount: parseFloat(item.paidAmount).toFixed(2),
        bookingCount: parseInt(item.bookingCount),
      })),
      revenueByRoomType: revenueByRoomType.map((item) => ({
        roomType: item.roomType,
        totalRevenue: parseFloat(item.totalRevenue).toFixed(2),
        paidAmount: parseFloat(item.paidAmount).toFixed(2),
        bookingCount: parseInt(item.bookingCount),
      })),
    });
  }),
);

/**
 * @swagger
 * /api/reports/guests:
 *   get:
 *     summary: Get guest statistics report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the report
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the report
 *     responses:
 *       200:
 *         description: Guest statistics
 */
router.get(
  "/guests",
  authenticateToken,
  requireManagerOrAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const guestRepository = AppDataSource.getRepository(Guest);
    const bookingRepository = AppDataSource.getRepository(Booking);

    // Default to current month if no dates provided
    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate
      ? new Date(endDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    // Total guests
    const totalGuests = await guestRepository.count();

    // New guests in period
    const newGuests = await guestRepository.count({
      where: {
        createdAt: Between(start, end),
      },
    });

    // Guests with bookings in period
    const guestsWithBookings = await bookingRepository
      .createQueryBuilder("booking")
      .select("COUNT(DISTINCT booking.guestId)", "count")
      .where(
        "booking.checkInDate >= :startDate AND booking.checkInDate <= :endDate",
        {
          startDate: start,
          endDate: end,
        },
      )
      .getRawOne();

    // Repeat guests (guests with more than one booking)
    const repeatGuests = await bookingRepository
      .createQueryBuilder("booking")
      .select("booking.guestId", "guestId")
      .addSelect("COUNT(*)", "bookingCount")
      .where(
        "booking.checkInDate >= :startDate AND booking.checkInDate <= :endDate",
        {
          startDate: start,
          endDate: end,
        },
      )
      .groupBy("booking.guestId")
      .having("COUNT(*) > 1")
      .getRawMany();

    // Top guests by revenue
    const topGuestsByRevenue = await bookingRepository
      .createQueryBuilder("booking")
      .leftJoin("booking.guest", "guest")
      .select("guest.firstName", "firstName")
      .addSelect("guest.lastName", "lastName")
      .addSelect("guest.id", "guestId")
      .addSelect("SUM(booking.totalAmount)", "totalRevenue")
      .addSelect("COUNT(*)", "bookingCount")
      .where(
        "booking.checkInDate >= :startDate AND booking.checkInDate <= :endDate",
        {
          startDate: start,
          endDate: end,
        },
      )
      .andWhere("booking.status IN (:...statuses)", {
        statuses: [
          BookingStatus.CONFIRMED,
          BookingStatus.CHECKED_IN,
          BookingStatus.CHECKED_OUT,
        ],
      })
      .groupBy("guest.id, guest.firstName, guest.lastName")
      .orderBy("totalRevenue", "DESC")
      .limit(10)
      .getRawMany();

    res.json({
      period: { startDate: start, endDate: end },
      summary: {
        totalGuests,
        newGuests,
        guestsWithBookings: parseInt(guestsWithBookings.count),
        repeatGuests: repeatGuests.length,
        repeatGuestRate:
          guestsWithBookings.count > 0
            ? ((repeatGuests.length / guestsWithBookings.count) * 100).toFixed(
                2,
              )
            : 0,
      },
      topGuestsByRevenue: topGuestsByRevenue.map((guest) => ({
        guestId: guest.guestId,
        name: `${guest.firstName} ${guest.lastName}`,
        totalRevenue: parseFloat(guest.totalRevenue).toFixed(2),
        bookingCount: parseInt(guest.bookingCount),
      })),
    });
  }),
);

/**
 * @swagger
 * /api/reports/export:
 *   get:
 *     summary: Export report data as CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [bookings, guests, rooms]
 *         description: Type of data to export
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the export
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the export
 *     responses:
 *       200:
 *         description: CSV file
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 */
router.get(
  "/export",
  authenticateToken,
  requireManagerOrAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { type, startDate, endDate } = req.query;

    if (!type) {
      return res.status(400).json({ message: "Export type is required" });
    }

    const start = startDate
      ? new Date(startDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    let csvData = "";
    let filename = "";

    switch (type) {
      case "bookings":
        const bookings = await AppDataSource.getRepository(Booking)
          .createQueryBuilder("booking")
          .leftJoinAndSelect("booking.room", "room")
          .leftJoinAndSelect("booking.guest", "guest")
          .where(
            "booking.checkInDate >= :startDate AND booking.checkInDate <= :endDate",
            {
              startDate: start,
              endDate: end,
            },
          )
          .orderBy("booking.checkInDate", "DESC")
          .getMany();

        csvData =
          "ID,Guest Name,Room Number,Check In,Check Out,Status,Total Amount,Paid Amount\n";
        csvData += bookings
          .map(
            (booking) =>
              `${booking.id},"${booking.guest.fullName}",${booking.room.number},${booking.checkInDate.toISOString().split("T")[0]},${booking.checkOutDate.toISOString().split("T")[0]},${booking.status},${booking.totalAmount},${booking.paidAmount}`,
          )
          .join("\n");
        filename = `bookings_${start.toISOString().split("T")[0]}_${end.toISOString().split("T")[0]}.csv`;
        break;

      case "guests":
        const guests = await AppDataSource.getRepository(Guest)
          .createQueryBuilder("guest")
          .where(
            "guest.createdAt >= :startDate AND guest.createdAt <= :endDate",
            {
              startDate: start,
              endDate: end,
            },
          )
          .orderBy("guest.createdAt", "DESC")
          .getMany();

        csvData =
          "ID,Full Name,Passport Number,Phone,Email,Date of Birth,Created At\n";
        csvData += guests
          .map(
            (guest) =>
              `${guest.id},"${guest.fullName}",${guest.passportNumber},${guest.phone},${guest.email || ""},${guest.dateOfBirth.toISOString().split("T")[0]},${guest.createdAt.toISOString().split("T")[0]}`,
          )
          .join("\n");
        filename = `guests_${start.toISOString().split("T")[0]}_${end.toISOString().split("T")[0]}.csv`;
        break;

      case "rooms":
        const rooms = await AppDataSource.getRepository(Room)
          .createQueryBuilder("room")
          .orderBy("room.building", "ASC")
          .addOrderBy("room.floor", "ASC")
          .addOrderBy("room.number", "ASC")
          .getMany();

        csvData =
          "ID,Number,Type,Building,Floor,Capacity,Price Per Night,Status\n";
        csvData += rooms
          .map(
            (room) =>
              `${room.id},${room.number},${room.type},${room.building},${room.floor},${room.capacity},${room.pricePerNight},${room.status}`,
          )
          .join("\n");
        filename = `rooms_${new Date().toISOString().split("T")[0]}.csv`;
        break;

      default:
        return res.status(400).json({ message: "Invalid export type" });
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvData);
  }),
);

export default router;
