-- CreateEnum
CREATE TYPE "LineOfBusiness" AS ENUM ('retail', 'tourism', 'medical', 'restaurant', 'administrative', 'warehouse_logistics');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "lineOfBusiness" "LineOfBusiness";

-- AlterTable
ALTER TABLE "Client" ADD COLUMN "lineOfBusiness" "LineOfBusiness";

-- CreateIndex
CREATE INDEX "Lead_lineOfBusiness_idx" ON "Lead"("lineOfBusiness");

-- CreateIndex
CREATE INDEX "Client_lineOfBusiness_idx" ON "Client"("lineOfBusiness");
