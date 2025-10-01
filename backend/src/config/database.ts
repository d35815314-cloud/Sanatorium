import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "../entities/User";
import { Room } from "../entities/Room";
import { Guest } from "../entities/Guest";
import { Booking } from "../entities/Booking";
import { AuditLog } from "../entities/AuditLog";

dotenv.config();

// Проверяем, есть ли DATABASE_URL (Railway)
const isProd = !!process.env.DATABASE_URL;

export const AppDataSource = new DataSource({
  type: isProd ? "postgres" : "postgres", // PostgreSQL и локально, и на Railway
  url: isProd ? process.env.DATABASE_URL : undefined,
  host: isProd ? undefined : process.env.DB_HOST || "localhost",
  port: isProd ? undefined : parseInt(process.env.DB_PORT || "5432"),
  username: isProd ? undefined : process.env.DB_USERNAME || "sanatorium",
  password: isProd ? undefined : process.env.DB_PASSWORD || "password",
  database: isProd ? undefined : process.env.DB_NAME || "sanatorium_db",
  synchronize: !isProd, // В prod не используем synchronize, используем миграции
  logging: process.env.NODE_ENV === "development",
  entities: [User, Room, Guest, Booking, AuditLog],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
});
