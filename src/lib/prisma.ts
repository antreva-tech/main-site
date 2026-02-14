/**
 * Prisma Client with Neon Serverless Adapter
 * Uses WebSocket for serverless environments with connection pooling.
 * @see https://neon.com/docs/guides/prisma
 */

import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";
import ws from "ws";

// Configure WebSocket for Node.js environments
neonConfig.webSocketConstructor = ws;

/**
 * Creates a new Prisma client with Neon adapter.
 * Connection params optimized for serverless cold starts.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local");
  }

  const adapter = new PrismaNeon({ connectionString });
  
  return new PrismaClient({ adapter });
}

// Singleton pattern for development to avoid connection exhaustion
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma client instance.
 * In development, reuses the same client across hot reloads.
 * In production, creates a fresh client per cold start.
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
