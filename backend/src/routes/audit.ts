import { Router, Request, Response } from "express";
import { AppDataSource } from "../config/database";
import { AuditLog, AuditAction } from "../entities/AuditLog";
import { authenticateToken, requireManagerOrAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { Between } from "typeorm";

const router = Router();

/**
 * @swagger
 * /api/audit:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [create, update, delete, login, logout, check_in, check_out, cancel_booking, extend_booking]
 *         description: Filter by action type
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filter by entity type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get(
  "/",
  authenticateToken,
  requireManagerOrAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      userId,
      action,
      entityType,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const auditRepository = AppDataSource.getRepository(AuditLog);
    const queryBuilder = auditRepository
      .createQueryBuilder("audit")
      .leftJoinAndSelect("audit.user", "user")
      .select([
        "audit.id",
        "audit.action",
        "audit.entityType",
        "audit.entityId",
        "audit.oldValues",
        "audit.newValues",
        "audit.ipAddress",
        "audit.userAgent",
        "audit.createdAt",
        "user.id",
        "user.firstName",
        "user.lastName",
        "user.email",
      ]);

    // Apply filters
    if (userId) {
      queryBuilder.andWhere("audit.userId = :userId", { userId });
    }
    if (action) {
      queryBuilder.andWhere("audit.action = :action", { action });
    }
    if (entityType) {
      queryBuilder.andWhere("audit.entityType = :entityType", { entityType });
    }
    if (startDate && endDate) {
      queryBuilder.andWhere("audit.createdAt BETWEEN :startDate AND :endDate", {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      });
    } else if (startDate) {
      queryBuilder.andWhere("audit.createdAt >= :startDate", {
        startDate: new Date(startDate as string),
      });
    } else if (endDate) {
      queryBuilder.andWhere("audit.createdAt <= :endDate", {
        endDate: new Date(endDate as string),
      });
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    queryBuilder.skip(skip).take(Number(limit));
    queryBuilder.orderBy("audit.createdAt", "DESC");

    const [auditLogs, total] = await queryBuilder.getManyAndCount();

    res.json({
      auditLogs,
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
 * /api/audit/{id}:
 *   get:
 *     summary: Get audit log by ID
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audit log details
 *       404:
 *         description: Audit log not found
 */
router.get(
  "/:id",
  authenticateToken,
  requireManagerOrAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const auditRepository = AppDataSource.getRepository(AuditLog);

    const auditLog = await auditRepository.findOne({
      where: { id },
      relations: ["user"],
      select: {
        user: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    });

    if (!auditLog) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    res.json(auditLog);
  }),
);

/**
 * @swagger
 * /api/audit/stats:
 *   get:
 *     summary: Get audit statistics
 *     tags: [Audit]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Audit statistics
 */
router.get(
  "/stats",
  authenticateToken,
  requireManagerOrAdmin,
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    const auditRepository = AppDataSource.getRepository(AuditLog);

    // Default to last 30 days if no dates provided
    const start = startDate
      ? new Date(startDate as string)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Total actions in period
    const totalActions = await auditRepository.count({
      where: {
        createdAt: Between(start, end),
      },
    });

    // Actions by type
    const actionStats = await auditRepository
      .createQueryBuilder("audit")
      .select("audit.action", "action")
      .addSelect("COUNT(*)", "count")
      .where("audit.createdAt BETWEEN :startDate AND :endDate", {
        startDate: start,
        endDate: end,
      })
      .groupBy("audit.action")
      .orderBy("count", "DESC")
      .getRawMany();

    // Actions by entity type
    const entityStats = await auditRepository
      .createQueryBuilder("audit")
      .select("audit.entityType", "entityType")
      .addSelect("COUNT(*)", "count")
      .where("audit.createdAt BETWEEN :startDate AND :endDate", {
        startDate: start,
        endDate: end,
      })
      .groupBy("audit.entityType")
      .orderBy("count", "DESC")
      .getRawMany();

    // Most active users
    const userStats = await auditRepository
      .createQueryBuilder("audit")
      .leftJoin("audit.user", "user")
      .select("user.firstName", "firstName")
      .addSelect("user.lastName", "lastName")
      .addSelect("user.email", "email")
      .addSelect("COUNT(*)", "actionCount")
      .where("audit.createdAt BETWEEN :startDate AND :endDate", {
        startDate: start,
        endDate: end,
      })
      .groupBy("user.id, user.firstName, user.lastName, user.email")
      .orderBy("actionCount", "DESC")
      .limit(10)
      .getRawMany();

    // Daily activity
    const dailyActivity = await auditRepository
      .createQueryBuilder("audit")
      .select("DATE(audit.createdAt)", "date")
      .addSelect("COUNT(*)", "count")
      .where("audit.createdAt BETWEEN :startDate AND :endDate", {
        startDate: start,
        endDate: end,
      })
      .groupBy("DATE(audit.createdAt)")
      .orderBy("date", "ASC")
      .getRawMany();

    res.json({
      period: { startDate: start, endDate: end },
      summary: {
        totalActions,
        averageActionsPerDay:
          dailyActivity.length > 0
            ? (totalActions / dailyActivity.length).toFixed(2)
            : 0,
      },
      actionStats: actionStats.map((stat) => ({
        action: stat.action,
        count: parseInt(stat.count),
      })),
      entityStats: entityStats.map((stat) => ({
        entityType: stat.entityType,
        count: parseInt(stat.count),
      })),
      userStats: userStats.map((stat) => ({
        name: `${stat.firstName} ${stat.lastName}`,
        email: stat.email,
        actionCount: parseInt(stat.actionCount),
      })),
      dailyActivity: dailyActivity.map((activity) => ({
        date: activity.date,
        count: parseInt(activity.count),
      })),
    });
  }),
);

export default router;
