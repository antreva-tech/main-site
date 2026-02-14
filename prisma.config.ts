
/**
 * Prisma Configuration for Antreva CRM
 * Uses pooled connection (Prisma 5.10+ supports migrations via pooler)
 */
import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load .env.local for local development
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
