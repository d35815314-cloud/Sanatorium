import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../config/database";
import { AuditLog, AuditAction } from "../entities/AuditLog";
import { AuthRequest } from "./auth";

export const auditLog = (action: AuditAction, entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    let responseData: any;

    res.send = function (data) {
      responseData = data;
      return originalSend.call(this, data);
    };

    res.on("finish", async () => {
      if (req.user && res.statusCode < 400) {
        try {
          const auditRepository = AppDataSource.getRepository(AuditLog);
          const audit = new AuditLog();

          audit.userId = req.user.id;
          audit.action = action;
          audit.entityType = entityType;
          audit.entityId = req.params.id || null;
          audit.oldValues = req.body.oldValues || null;
          audit.newValues = req.body;
          audit.ipAddress = req.ip;
          audit.userAgent = req.get("User-Agent") || null;

          await auditRepository.save(audit);
        } catch (error) {
          console.error("Audit log error:", error);
        }
      }
    });

    next();
  };
};
