import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { IsEmail, IsPhoneNumber, MinLength } from "class-validator";
import { Booking } from "./Booking";

/**
 * @swagger
 * components:
 *   schemas:
 *     Guest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - passportNumber
 *         - phone
 *         - dateOfBirth
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         middleName:
 *           type: string
 *         passportNumber:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         address:
 *           type: string
 *         emergencyContact:
 *           type: string
 *         emergencyPhone:
 *           type: string
 *         notes:
 *           type: string
 */
@Entity("guests")
export class Guest {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ unique: true })
  @MinLength(6)
  passportNumber: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  @IsEmail()
  email: string;

  @Column("date")
  dateOfBirth: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  emergencyPhone: string;

  @Column("text", { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Booking, (booking) => booking.guest)
  bookings: Booking[];

  get fullName(): string {
    return `${this.lastName} ${this.firstName} ${this.middleName || ""}`.trim();
  }

  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
