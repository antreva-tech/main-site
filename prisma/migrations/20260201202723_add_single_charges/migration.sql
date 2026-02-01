-- CreateEnum
CREATE TYPE "SingleChargeStatus" AS ENUM ('pending', 'paid', 'cancelled');

-- AlterEnum
ALTER TYPE "AuditEntityType" ADD VALUE 'single_charge';

-- CreateTable
CREATE TABLE "SingleCharge" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'DOP',
    "chargedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SingleChargeStatus" NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SingleCharge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SingleCharge_clientId_idx" ON "SingleCharge"("clientId");

-- CreateIndex
CREATE INDEX "SingleCharge_chargedAt_idx" ON "SingleCharge"("chargedAt" DESC);

-- AddForeignKey
ALTER TABLE "SingleCharge" ADD CONSTRAINT "SingleCharge_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
