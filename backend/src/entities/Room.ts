import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { IsEnum, IsNumber, Min, Max } from "class-validator";
import { Booking } from "./Booking";

export enum RoomType {
  SINGLE = "single",
  DOUBLE = "double",
  DOUBLE_WITH_BALCONY = "double_with_balcony",
  FAMILY = "family",
  LUXURY = "luxury",
  LUXURY_2X = "luxury_2x",
}

export enum RoomStatus {
  AVAILABLE = "available",
  OCCUPIED = "occupied",
  BOOKED = "booked",
  RESERVED = "reserved",
  MAINTENANCE = "maintenance",
  OUT_OF_ORDER = "out_of_order",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       required:
 *         - number
 *         - type
 *         - building
 *         - floor
 *         - capacity
 *         - pricePerNight
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         number:
 *           type: string
 *         type:
 *           type: string
 *           enum: [single, double, double_with_balcony, family, luxury, luxury_2x]
 *         building:
 *           type: string
 *         floor:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         capacity:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *         pricePerNight:
 *           type: number
 *           minimum: 0
 *         status:
 *           type: string
 *           enum: [available, occupied, booked, reserved, maintenance, out_of_order]
 *         description:
 *           type: string
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 */
@Entity("rooms")
export class Room {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  number: string;

  @Column({
    type: "enum",
    enum: RoomType,
  })
  @IsEnum(RoomType)
  type: RoomType;

  @Column()
  building: string; // 'A' or 'B'

  @Column()
  @IsNumber()
  @Min(1)
  @Max(5)
  floor: number;

  @Column()
  @IsNumber()
  @Min(1)
  @Max(4)
  capacity: number;

  @Column("decimal", { precision: 10, scale: 2 })
  @IsNumber()
  @Min(0)
  pricePerNight: number;

  @Column({
    type: "enum",
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
  })
  @IsEnum(RoomStatus)
  status: RoomStatus;

  @Column({ nullable: true })
  description: string;

  @Column("simple-array", { nullable: true })
  amenities: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings: Booking[];
}
