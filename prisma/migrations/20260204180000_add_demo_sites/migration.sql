-- CreateTable
CREATE TABLE IF NOT EXISTS "DemoSite" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemoSite_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "DemoSite_sortOrder_idx" ON "DemoSite"("sortOrder");

-- Add enum value for audit (PostgreSQL: add to existing enum)
ALTER TYPE "AuditEntityType" ADD VALUE IF NOT EXISTS 'demo_site';
