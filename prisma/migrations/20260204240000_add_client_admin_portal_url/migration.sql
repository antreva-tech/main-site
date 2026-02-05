-- Add admin portal URL to Client (separate from public website URL).
ALTER TABLE "Client" ADD COLUMN "adminPortalUrl" TEXT;
