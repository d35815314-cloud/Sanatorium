import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User } from "../entities/User";
import { AuditLog, AuditAction } from "../entities/AuditLog";
import { asyncHandler, createError } from "../middleware/errorHandler";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 */
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError("Email and password are required", 400);
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw createError("Invalid credentials", 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await userRepository.save(user);

    // Create audit log
    const auditRepository = AppDataSource.getRepository(AuditLog);
    const audit = new AuditLog();
    audit.userId = user.id;
    audit.action = AuditAction.LOGIN;
    audit.entityType = "User";
    audit.entityId = user.id;
    audit.ipAddress = req.ip;
    audit.userAgent = req.get("User-Agent") || null;
    await auditRepository.save(audit);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ token, user: userWithoutPassword });
  }),
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post(
  "/logout",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    // Create audit log
    const auditRepository = AppDataSource.getRepository(AuditLog);
    const audit = new AuditLog();
    audit.userId = req.user!.id;
    audit.action = AuditAction.LOGOUT;
    audit.entityType = "User";
    audit.entityId = req.user!.id;
    audit.ipAddress = req.ip;
    audit.userAgent = req.get("User-Agent") || null;
    await auditRepository.save(audit);

    res.json({ message: "Logout successful" });
  }),
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get(
  "/me",
  authenticateToken,
  asyncHandler(async (req: AuthRequest, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  }),
);

export default router;
