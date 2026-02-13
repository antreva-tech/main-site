-- CreateEnum
CREATE TYPE "PaymentHandling" AS ENUM ('CASH', 'BANK_TRANSFER', 'CARD', 'MIXED');

-- AlterTable: Lead intake + logo fields
ALTER TABLE "Lead" ADD COLUMN     "addressToUse" TEXT,
ADD COLUMN     "adminEaseNotes" TEXT,
ADD COLUMN     "businessDescription" TEXT,
ADD COLUMN     "businessName" TEXT,
ADD COLUMN     "domain" TEXT,
ADD COLUMN     "hasDomain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasLogo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "logoBlobUrl" TEXT,
ADD COLUMN     "logoContentType" TEXT,
ADD COLUMN     "logoDownloadUrl" TEXT,
ADD COLUMN     "logoPathname" TEXT,
ADD COLUMN     "logoSize" INTEGER,
ADD COLUMN     "paymentHandling" "PaymentHandling",
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "serviceOutcome" TEXT,
ADD COLUMN     "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wonAt" TIMESTAMP(3);

-- AlterTable: DevelopmentProject intake snapshot + lead relation
ALTER TABLE "DevelopmentProject" ADD COLUMN     "intakeAddressToUse" TEXT,
ADD COLUMN     "intakeAdminEaseNotes" TEXT,
ADD COLUMN     "intakeBusinessDescription" TEXT,
ADD COLUMN     "intakeBusinessName" TEXT,
ADD COLUMN     "intakeDomain" TEXT,
ADD COLUMN     "intakeHasDomain" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "intakeHasLogo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "intakeLineOfBusiness" TEXT,
ADD COLUMN     "intakeLogoBlobUrl" TEXT,
ADD COLUMN     "intakeLogoContentType" TEXT,
ADD COLUMN     "intakeLogoDownloadUrl" TEXT,
ADD COLUMN     "intakeLogoPathname" TEXT,
ADD COLUMN     "intakeLogoSize" INTEGER,
ADD COLUMN     "intakePaymentHandling" TEXT,
ADD COLUMN     "intakePhoneNumber" TEXT,
ADD COLUMN     "intakeServiceOutcome" TEXT,
ADD COLUMN     "intakeWhatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "leadId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DevelopmentProject_leadId_key" ON "DevelopmentProject"("leadId");

-- AddForeignKey
ALTER TABLE "DevelopmentProject" ADD CONSTRAINT "DevelopmentProject_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
