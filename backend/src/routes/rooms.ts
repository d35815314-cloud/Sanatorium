import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Room, RoomType, RoomStatus } from "../entities/Room";
import {
  authenticateToken,
  requireManagerOrAdmin,
  requireAnyRole,
} from "../middleware/auth";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { auditLog } from "../middleware/audit";
import { AuditAction } from "../entities/AuditLog";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: building
 *         schema:
 *           type: string
 *       - in: query
 *         name: floor
 *         schema:
 *           type: integer
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of rooms
 */
router.get(
  "/",
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, building, floor, type, status } = req.query;
    const roomRepository = AppDataSource.getRepository(Room);

    const queryBuilder = roomRepository
      .createQueryBuilder("room")
      .orderBy("room.building", "ASC")
      .addOrderBy("room.floor", "ASC")
      .addOrderBy("room.number", "ASC");

    if (building) {
      queryBuilder.andWhere("room.building = :building", { building });
    }

    if (floor) {
      queryBuilder.andWhere("room.floor = :floor", { floor: Number(floor) });
    }

    if (type) {
      queryBuilder.andWhere("room.type = :type", { type });
    }

    if (status) {
      queryBuilder.andWhere("room.status = :status", { status });
    }

    const [rooms, total] = await queryBuilder
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .getManyAndCount();

    res.json({
      rooms,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  }),
);

/**
 * @swagger
 * /api/rooms/availability:
 *   get:
 *     summary: Check room availability for date range
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: checkIn
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: checkOut
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: guests
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Available rooms
 */
router.get(
  "/availability",
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { checkIn, checkOut, guests = 1 } = req.query;

    if (!checkIn || !checkOut) {
      throw createError("Check-in and check-out dates are required", 400);
    }

    const roomRepository = AppDataSource.getRepository(Room);

    // Get rooms that are not booked for the specified period
    const availableRooms = await roomRepository
      .createQueryBuilder("room")
      .leftJoin(
        "room.bookings",
        "booking",
        "booking.status IN (:...statuses) AND NOT (booking.checkOutDate <= :checkIn OR booking.checkInDate >= :checkOut)",
        {
          statuses: ["confirmed", "checked_in"],
          checkIn: new Date(checkIn as string),
          checkOut: new Date(checkOut as string),
        },
      )
      .where("room.status = :status", { status: RoomStatus.AVAILABLE })
      .andWhere("room.capacity >= :guests", { guests: Number(guests) })
      .andWhere("booking.id IS NULL")
      .orderBy("room.building", "ASC")
      .addOrderBy("room.floor", "ASC")
      .addOrderBy("room.number", "ASC")
      .getMany();

    res.json(availableRooms);
  }),
);

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       201:
 *         description: Room created successfully
 */
router.post(
  "/",
  requireManagerOrAdmin,
  auditLog(AuditAction.CREATE, "Room"),
  asyncHandler(async (req, res) => {
    const {
      number,
      type,
      building,
      floor,
      capacity,
      pricePerNight,
      description,
      amenities,
    } = req.body;

    const roomRepository = AppDataSource.getRepository(Room);

    // Check if room number already exists
    const existingRoom = await roomRepository.findOne({ where: { number } });
    if (existingRoom) {
      throw createError("Room with this number already exists", 400);
    }

    const room = new Room();
    room.number = number;
    room.type = type;
    room.building = building;
    room.floor = floor;
    room.capacity = capacity;
    room.pricePerNight = pricePerNight;
    room.description = description;
    room.amenities = amenities || [];

    await roomRepository.save(room);
    res.status(201).json(room);
  }),
);

/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Get room by ID
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Room data
 */
router.get(
  "/:id",
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const roomRepository = AppDataSource.getRepository(Room);
    const room = await roomRepository.findOne({
      where: { id: req.params.id },
      relations: ["bookings", "bookings.guest"],
    });

    if (!room) {
      throw createError("Room not found", 404);
    }

    res.json(room);
  }),
);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Update room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       200:
 *         description: Room updated successfully
 */
router.put(
  "/:id",
  requireManagerOrAdmin,
  auditLog(AuditAction.UPDATE, "Room"),
  asyncHandler(async (req, res) => {
    const roomRepository = AppDataSource.getRepository(Room);

    const room = await roomRepository.findOne({ where: { id: req.params.id } });
    if (!room) {
      throw createError("Room not found", 404);
    }

    // Store old values for audit
    req.body.oldValues = { ...room };

    Object.assign(room, req.body);
    await roomRepository.save(room);

    res.json(room);
  }),
);

/**
 * @swagger
 * /api/rooms/{id}/status:
 *   patch:
 *     summary: Update room status
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, occupied, booked, reserved, maintenance, out_of_order]
 *     responses:
 *       200:
 *         description: Room status updated successfully
 */
router.patch(
  "/:id/status",
  requireAnyRole,
  auditLog(AuditAction.UPDATE, "Room"),
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const roomRepository = AppDataSource.getRepository(Room);

    const room = await roomRepository.findOne({ where: { id: req.params.id } });
    if (!room) {
      throw createError("Room not found", 404);
    }

    // Store old values for audit
    req.body.oldValues = { status: room.status };

    room.status = status;
    await roomRepository.save(room);

    res.json(room);
  }),
);

/**
 * @swagger
 * /api/rooms/{id}:
 *   delete:
 *     summary: Delete room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Room deleted successfully
 */
router.delete(
  "/:id",
  requireManagerOrAdmin,
  auditLog(AuditAction.DELETE, "Room"),
  asyncHandler(async (req, res) => {
    const roomRepository = AppDataSource.getRepository(Room);

    const room = await roomRepository.findOne({ where: { id: req.params.id } });
    if (!room) {
      throw createError("Room not found", 404);
    }

    // Store old values for audit
    req.body.oldValues = { ...room };

    await roomRepository.remove(room);
    res.json({ message: "Room deleted successfully" });
  }),
);

export default router;
