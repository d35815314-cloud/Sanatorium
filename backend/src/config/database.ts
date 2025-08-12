import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User";
import { Room } from "../entities/Room";
import { Guest } from "../entities/Guest";
import { Booking } from "../entities/Booking";
import { AuditLog } from "../entities/AuditLog";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "sanatorium",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "sanatorium_db",
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Room, Guest, Booking, AuditLog],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
});
