-- Add optional demo account login (username + password) to DemoSite for display on card.
ALTER TABLE "DemoSite" ADD COLUMN "demoLoginUsername" TEXT;
ALTER TABLE "DemoSite" ADD COLUMN "demoLoginPassword" TEXT;
