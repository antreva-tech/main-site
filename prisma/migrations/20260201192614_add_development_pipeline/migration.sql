-- CreateEnum
CREATE TYPE "DevelopmentStage" AS ENUM ('discovery', 'design', 'development', 'qa', 'deployment', 'completed', 'on_hold');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditEntityType" ADD VALUE 'development_project';
ALTER TYPE "AuditEntityType" ADD VALUE 'development_project_log';

-- CreateTable
CREATE TABLE "DevelopmentProject" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "stage" "DevelopmentStage" NOT NULL DEFAULT 'discovery',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevelopmentProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopmentProjectLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevelopmentProjectLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DevelopmentProject_clientId_key" ON "DevelopmentProject"("clientId");

-- CreateIndex
CREATE INDEX "DevelopmentProject_stage_idx" ON "DevelopmentProject"("stage");

-- CreateIndex
CREATE INDEX "DevelopmentProject_clientId_idx" ON "DevelopmentProject"("clientId");

-- CreateIndex
CREATE INDEX "DevelopmentProjectLog_projectId_idx" ON "DevelopmentProjectLog"("projectId");

-- CreateIndex
CREATE INDEX "DevelopmentProjectLog_createdAt_idx" ON "DevelopmentProjectLog"("createdAt" DESC);

-- AddForeignKey
ALTER TABLE "DevelopmentProject" ADD CONSTRAINT "DevelopmentProject_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentProjectLog" ADD CONSTRAINT "DevelopmentProjectLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "DevelopmentProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevelopmentProjectLog" ADD CONSTRAINT "DevelopmentProjectLog_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
