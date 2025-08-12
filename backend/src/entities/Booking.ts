import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { IsEnum, IsNumber, Min } from "class-validator";
import { Room } from "./Room";
import { Guest } from "./Guest";

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CHECKED_IN = "checked_in",
  CHECKED_OUT = "checked_out",
  CANCELLED = "cancelled",
  NO_SHOW = "no_show",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       required:
 *         - roomId
 *         - guestId
 *         - checkInDate
 *         - checkOutDate
 *         - totalAmount
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         roomId:
 *           type: string
 *           format: uuid
 *         guestId:
 *           type: string
 *           format: uuid
 *         checkInDate:
 *           type: string
 *           format: date
 *         checkOutDate:
 *           type: string
 *           format: date
 *         actualCheckInDate:
 *           type: string
 *           format: date-time
 *         actualCheckOutDate:
 *           type: string
 *           format: date-time
 *         numberOfNights:
 *           type: integer
 *           minimum: 1
 *         numberOfGuests:
 *           type: integer
 *           minimum: 1
 *         totalAmount:
 *           type: number
 *           minimum: 0
 *         paidAmount:
 *           type: number
 *           minimum: 0
 *         status:
 *           type: string
 *           enum: [pending, confirmed, checked_in, checked_out, cancelled, no_show]
 *         notes:
 *           type: string
 *         specialRequests:
 *           type: string
 */
@Entity("bookings")
export class Booking {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  roomId: string;

  @Column()
  guestId: string;

  @Column("date")
  checkInDate: Date;

  @Column("date")
  checkOutDate: Date;

  @Column({ nullable: true })
  actualCheckInDate: Date;

  @Column({ nullable: true })
  actualCheckOutDate: Date;

  @Column()
  @IsNumber()
  @Min(1)
  numberOfNights: number;

  @Column({ default: 1 })
  @IsNumber()
  @Min(1)
  numberOfGuests: number;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @Column({
    type: "enum",
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @Column("text", { nullable: true })
  notes: string;

  @Column("text", { nullable: true })
  specialRequests: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Room, (room) => room.bookings)
  @JoinColumn({ name: "roomId" })
  room: Room;

  @ManyToOne(() => Guest, (guest) => guest.bookings)
  @JoinColumn({ name: "guestId" })
  guest: Guest;

  get isActive(): boolean {
    return [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN].includes(
      this.status,
    );
  }

  get remainingAmount(): number {
    return this.totalAmount - this.paidAmount;
  }
}
