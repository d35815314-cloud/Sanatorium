import { Router } from "express";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../entities/User";
import {
  authenticateToken,
  requireAdmin,
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
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [administrator, manager, reception]
 *     responses:
 *       200:
 *         description: List of users
 */
router.get(
  "/",
  requireManagerOrAdmin,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, role } = req.query;
    const userRepository = AppDataSource.getRepository(User);

    const queryBuilder = userRepository
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.email",
        "user.firstName",
        "user.lastName",
        "user.role",
        "user.isActive",
        "user.lastLogin",
        "user.createdAt",
      ])
      .orderBy("user.createdAt", "DESC");

    if (role) {
      queryBuilder.andWhere("user.role = :role", { role });
    }

    const [users, total] = await queryBuilder
      .skip((Number(page) - 1) * Number(limit))
      .take(Number(limit))
      .getManyAndCount();

    res.json({
      users,
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
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [administrator, manager, reception]
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post(
  "/",
  requireAdmin,
  auditLog(AuditAction.CREATE, "User"),
  asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;

    const userRepository = AppDataSource.getRepository(User);

    // Check if user already exists
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw createError("User with this email already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User();
    user.email = email;
    user.password = hashedPassword;
    user.firstName = firstName;
    user.lastName = lastName;
    user.role = role;

    await userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  }),
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User data
 */
router.get(
  "/:id",
  requireManagerOrAdmin,
  asyncHandler(async (req, res) => {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: req.params.id },
      select: [
        "id",
        "email",
        "firstName",
        "lastName",
        "role",
        "isActive",
        "lastLogin",
        "createdAt",
        "updatedAt",
      ],
    });

    if (!user) {
      throw createError("User not found", 404);
    }

    res.json(user);
  }),
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [administrator, manager, reception]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put(
  "/:id",
  requireAdmin,
  auditLog(AuditAction.UPDATE, "User"),
  asyncHandler(async (req, res) => {
    const { email, firstName, lastName, role, isActive } = req.body;
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id: req.params.id } });
    if (!user) {
      throw createError("User not found", 404);
    }

    // Store old values for audit
    req.body.oldValues = { ...user };

    if (email) user.email = email;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (role) user.role = role;
    if (typeof isActive === "boolean") user.isActive = isActive;

    await userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  }),
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
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
 *         description: User deleted successfully
 */
router.delete(
  "/:id",
  requireAdmin,
  auditLog(AuditAction.DELETE, "User"),
  asyncHandler(async (req, res) => {
    const userRepository = AppDataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id: req.params.id } });
    if (!user) {
      throw createError("User not found", 404);
    }

    // Store old values for audit
    req.body.oldValues = { ...user };

    await userRepository.remove(user);
    res.json({ message: "User deleted successfully" });
  }),
);

export default router;
