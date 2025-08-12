import { Router } from "express";
import { AppDataSource } from "../config/database";
import { Guest } from "../entities/Guest";
import {
  authenticateToken,
  requireAnyRole,
  requireManagerOrAdmin,
} from "../middleware/auth";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { auditLog } from "../middleware/audit";
import { AuditAction } from "../entities/AuditLog";

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/guests:
 *   get:
 *     summary: Get all guests
 *     tags: [Guests]
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
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, phone, or passport number
 *     responses:
 *       200:
 *         description: List of guests
 */
router.get(
  "/",
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, search } = req.query;
    const guestRepository = AppDataSource.getRepository(Guest);

    const queryBuilder = guestRepository
      .createQueryBuilder("guest")
      .orderBy("guest.createdAt", "DESC");

    if (search) {
      queryBuilder.andWhere(
        "(guest.firstName ILIKE :search OR guest.lastName ILIKE :search OR guest.phone ILIKE :search OR guest.passportNumber ILIKE :search)",
        { search: `%${search}%` },
      );
    }

    const [guests, total] = await queryBuilder
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .getManyAndCount();

    res.json({
      guests,
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
 * /api/guests:
 *   post:
 *     summary: Create a new guest
 *     tags: [Guests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Guest'
 *     responses:
 *       201:
 *         description: Guest created successfully
 */
router.post(
  "/",
  requireAnyRole,
  auditLog(AuditAction.CREATE, "Guest"),
  asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      middleName,
      passportNumber,
      phone,
      email,
      dateOfBirth,
      address,
      emergencyContact,
      emergencyPhone,
      notes,
    } = req.body;

    const guestRepository = AppDataSource.getRepository(Guest);

    // Check if guest with passport number already exists
    const existingGuest = await guestRepository.findOne({
      where: { passportNumber },
    });
    if (existingGuest) {
      throw createError("Guest with this passport number already exists", 400);
    }

    const guest = new Guest();
    guest.firstName = firstName;
    guest.lastName = lastName;
    guest.middleName = middleName;
    guest.passportNumber = passportNumber;
    guest.phone = phone;
    guest.email = email;
    guest.dateOfBirth = new Date(dateOfBirth);
    guest.address = address;
    guest.emergencyContact = emergencyContact;
    guest.emergencyPhone = emergencyPhone;
    guest.notes = notes;

    await guestRepository.save(guest);
    res.status(201).json(guest);
  }),
);

/**
 * @swagger
 * /api/guests/{id}:
 *   get:
 *     summary: Get guest by ID
 *     tags: [Guests]
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
 *         description: Guest data
 */
router.get(
  "/:id",
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const guestRepository = AppDataSource.getRepository(Guest);
    const guest = await guestRepository.findOne({
      where: { id: req.params.id },
      relations: ["bookings", "bookings.room"],
    });

    if (!guest) {
      throw createError("Guest not found", 404);
    }

    res.json(guest);
  }),
);

/**
 * @swagger
 * /api/guests/{id}/history:
 *   get:
 *     summary: Get guest booking history
 *     tags: [Guests]
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
 *         description: Guest booking history
 */
router.get(
  "/:id/history",
  requireAnyRole,
  asyncHandler(async (req, res) => {
    const guestRepository = AppDataSource.getRepository(Guest);
    const guest = await guestRepository.findOne({
      where: { id: req.params.id },
      relations: ["bookings", "bookings.room"],
    });

    if (!guest) {
      throw createError("Guest not found", 404);
    }

    const bookings = guest.bookings.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    res.json({
      guest: {
        id: guest.id,
        fullName: guest.fullName,
        phone: guest.phone,
        email: guest.email,
      },
      bookings,
    });
  }),
);

/**
 * @swagger
 * /api/guests/{id}:
 *   put:
 *     summary: Update guest
 *     tags: [Guests]
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
 *             $ref: '#/components/schemas/Guest'
 *     responses:
 *       200:
 *         description: Guest updated successfully
 */
router.put(
  "/:id",
  requireAnyRole,
  auditLog(AuditAction.UPDATE, "Guest"),
  asyncHandler(async (req, res) => {
    const guestRepository = AppDataSource.getRepository(Guest);

    const guest = await guestRepository.findOne({
      where: { id: req.params.id },
    });
    if (!guest) {
      throw createError("Guest not found", 404);
    }

    // Store old values for audit
    req.body.oldValues = { ...guest };

    Object.assign(guest, req.body);
    if (req.body.dateOfBirth) {
      guest.dateOfBirth = new Date(req.body.dateOfBirth);
    }

    await guestRepository.save(guest);
    res.json(guest);
  }),
);

/**
 * @swagger
 * /api/guests/{id}:
 *   delete:
 *     summary: Delete guest
 *     tags: [Guests]
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
 *         description: Guest deleted successfully
 */
router.delete(
  "/:id",
  requireManagerOrAdmin,
  auditLog(AuditAction.DELETE, "Guest"),
  asyncHandler(async (req, res) => {
    const guestRepository = AppDataSource.getRepository(Guest);

    const guest = await guestRepository.findOne({
      where: { id: req.params.id },
      relations: ["bookings"],
    });

    if (!guest) {
      throw createError("Guest not found", 404);
    }

    // Check if guest has active bookings
    const activeBookings = guest.bookings.filter((booking) =>
      ["confirmed", "checked_in"].includes(booking.status),
    );

    if (activeBookings.length > 0) {
      throw createError("Cannot delete guest with active bookings", 400);
    }

    // Store old values for audit
    req.body.oldValues = { ...guest };

    await guestRepository.remove(guest);
    res.json({ message: "Guest deleted successfully" });
  }),
);

export default router;
