import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export enum AuditAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LOGIN = "login",
  LOGOUT = "logout",
  CHECK_IN = "check_in",
  CHECK_OUT = "check_out",
  CANCEL_BOOKING = "cancel_booking",
  EXTEND_BOOKING = "extend_booking",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         action:
 *           type: string
 *           enum: [create, update, delete, login, logout, check_in, check_out, cancel_booking, extend_booking]
 *         entityType:
 *           type: string
 *         entityId:
 *           type: string
 *         oldValues:
 *           type: object
 *         newValues:
 *           type: object
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */
@Entity("audit_logs")
export class AuditLog {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @Column({
    type: "enum",
    enum: AuditAction,
  })
  action: AuditAction;

  @Column()
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column("jsonb", { nullable: true })
  oldValues: any;

  @Column("jsonb", { nullable: true })
  newValues: any;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.auditLogs)
  @JoinColumn({ name: "userId" })
  user: User;
}
