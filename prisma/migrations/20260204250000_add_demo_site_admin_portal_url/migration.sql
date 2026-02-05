-- Add optional admin portal URL to DemoSite (website = url, admin = adminPortalUrl).
ALTER TABLE "DemoSite" ADD COLUMN "adminPortalUrl" TEXT;
