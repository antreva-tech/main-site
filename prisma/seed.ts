/**
 * Prisma Seed Script for Antreva CRM
 * Creates initial admin role, users (CEO, CTO), services, and bank account.
 * 
 * Run with: npx prisma db seed
 * 
 * Environment variables (optional, will prompt if not set):
 * - SEED_CEO_EMAIL, SEED_CEO_NAME
 * - SEED_CTO_EMAIL, SEED_CTO_NAME
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

/** All permissions available in the system */
const ALL_PERMISSIONS = [
  "leads.read",
  "leads.write",
  "clients.read",
  "clients.write",
  "credentials.read",
  "credentials.decrypt",
  "tickets.read",
  "tickets.write",
  "payments.read",
  "payments.write",
  "users.manage",
  "audit.read",
];

/**
 * Service catalog per dev-docs/Phase1.md — Restaurant Plans (SPM).
 * Target: Restaurants in San Pedro de Macorís. Pricing in RD$ (DOP).
 */
const SERVICES = [
  // --- Phase1: Plan 1 — Restaurant START ---
  {
    name: "Restaurant START",
    slug: "restaurant-start",
    description:
      "WhatsApp Business setup, Digital menu, Basic website with WhatsApp button, Instagram optimization. Monthly support included. Deliverables: WhatsApp configured, Digital menu link + QR, 1-page website (mobile-first), Instagram profile optimized.",
    billingType: "recurring",
    defaultAmount: 4500,
    currency: "DOP",
  },
  // --- Phase1: Plan 2 — Restaurant PRO ---
  {
    name: "Restaurant PRO",
    slug: "restaurant-pro",
    description:
      "Everything in START, plus: Advanced WhatsApp flows, Monthly Instagram content, Website with order form, Basic cybersecurity (if applicable). Deliverables: WhatsApp automation/flows, Content pack (posts/reels/stories), Order form + routing to WhatsApp/email, Basic security hardening checklist.",
    billingType: "recurring",
    defaultAmount: 7500,
    currency: "DOP",
  },
  // --- Phase1: Plan 3 — Restaurant PREMIUM ---
  {
    name: "Restaurant PREMIUM",
    slug: "restaurant-premium",
    description:
      "Everything in PRO, plus: Semi-automated WhatsApp, Digital campaigns, Advanced website, Reinforced cybersecurity. Deliverables: Advanced WhatsApp automation, Campaign setup & reporting, Multi-page website (menu, location, ordering), Security improvements & monitoring.",
    billingType: "recurring",
    defaultAmount: 12000,
    currency: "DOP",
  },
  // --- Phase1: Add-ons (optional; quote-based default 0) ---
  {
    name: "Professional photography",
    slug: "addon-photography",
    description: "Add-on: Professional photography for menu, venue, or content.",
    billingType: "one_time",
    defaultAmount: 0,
    currency: "DOP",
  },
  {
    name: "Paid ads management",
    slug: "addon-paid-ads",
    description: "Add-on: Paid ads management (meta, Google, etc.).",
    billingType: "recurring",
    defaultAmount: 0,
    currency: "DOP",
  },
  {
    name: "Extra content packs",
    slug: "addon-content-packs",
    description: "Add-on: Extra content packs (posts/reels/stories).",
    billingType: "recurring",
    defaultAmount: 0,
    currency: "DOP",
  },
  {
    name: "Additional pages / e-commerce",
    slug: "addon-pages-ecommerce",
    description: "Add-on: Additional pages or e-commerce on website.",
    billingType: "one_time",
    defaultAmount: 0,
    currency: "DOP",
  },
  {
    name: "Extended cybersecurity services",
    slug: "addon-cybersecurity",
    description: "Add-on: Extended cybersecurity services.",
    billingType: "one_time",
    defaultAmount: 0,
    currency: "DOP",
  },
];

/**
 * Generates a secure temporary password
 */
function generateTempPassword(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Encrypts a value using AES-256-GCM (same as encryption.ts will use)
 */
function encryptValue(plaintext: string): { encrypted: string; iv: string } {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    // Use a placeholder for seeding - will be re-encrypted with real key later
    return { encrypted: plaintext, iv: "placeholder" };
  }
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(key, "hex"), iv);
  
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  
  return {
    encrypted: encrypted + ":" + authTag,
    iv: iv.toString("hex"),
  };
}

async function main() {
  console.log("🌱 Starting seed...\n");

  // 1. Create admin role
  console.log("Creating admin role...");
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: { permissions: ALL_PERMISSIONS },
    create: {
      name: "admin",
      permissions: ALL_PERMISSIONS,
    },
  });
  console.log(`  ✓ Admin role created/updated: ${adminRole.id}\n`);

  // 2. Create CEO user
  const ceoEmail = process.env.SEED_CEO_EMAIL || "ceo@antreva.com";
  const ceoName = process.env.SEED_CEO_NAME || "CEO";
  const ceoTempPassword = generateTempPassword();
  const ceoPasswordHash = await bcrypt.hash(ceoTempPassword, 12);

  console.log("Creating CEO user...");
  const ceoUser = await prisma.user.upsert({
    where: { email: ceoEmail },
    update: {
      name: ceoName,
      title: "CEO",
      roleId: adminRole.id,
    },
    create: {
      email: ceoEmail,
      name: ceoName,
      title: "CEO",
      passwordHash: ceoPasswordHash,
      roleId: adminRole.id,
      status: "active",
    },
  });
  console.log(`  ✓ CEO user: ${ceoUser.email}`);
  console.log(`  ⚠️  Temporary password: ${ceoTempPassword}\n`);

  // 3. Create or update CTO user (default email: tridentinnovations.investments@gmail.com)
  const ctoEmail = process.env.SEED_CTO_EMAIL || "tridentinnovations.investments@gmail.com";
  const ctoName = process.env.SEED_CTO_NAME || "CTO";
  const ctoTempPassword = generateTempPassword();
  const ctoPasswordHash = await bcrypt.hash(ctoTempPassword, 12);

  console.log("Creating CTO user...");
  const existingCto = await prisma.user.findFirst({ where: { title: "CTO" } });
  let ctoUser: { id: string; email: string };
  if (existingCto && existingCto.email !== ctoEmail) {
    // Update existing CTO to new email so we keep a single CTO account
    ctoUser = await prisma.user.update({
      where: { id: existingCto.id },
      data: {
        email: ctoEmail,
        name: ctoName,
        passwordHash: ctoPasswordHash,
        roleId: adminRole.id,
      },
    });
    console.log(`  ✓ CTO user updated to: ${ctoUser.email}`);
  } else {
    ctoUser = await prisma.user.upsert({
      where: { email: ctoEmail },
      update: {
        name: ctoName,
        title: "CTO",
        roleId: adminRole.id,
      },
      create: {
        email: ctoEmail,
        name: ctoName,
        title: "CTO",
        passwordHash: ctoPasswordHash,
        roleId: adminRole.id,
        status: "active",
      },
    });
    console.log(`  ✓ CTO user: ${ctoUser.email}`);
  }
  console.log(`  ⚠️  Temporary password: ${ctoTempPassword}\n`);

  // 4. Create services (Phase1.md is the only catalog — Restaurant Plans SPM + add-ons)
  const phase1Slugs = SERVICES.map((s) => s.slug);
  console.log("Creating services (Phase1 only)...");
  for (const service of SERVICES) {
    const created = await prisma.service.upsert({
      where: { slug: service.slug },
      update: { ...service, isActive: true },
      create: service,
    });
    console.log(`  ✓ ${created.name} (${created.slug})`);
  }
  // Deactivate any service not in Phase1 so the catalog is Phase1-only
  const deactivated = await prisma.service.updateMany({
    where: { slug: { notIn: phase1Slugs } },
    data: { isActive: false },
  });
  if (deactivated.count > 0) {
    console.log(`  ⚠ Deactivated ${deactivated.count} service(s) not in Phase1 catalog`);
  }
  console.log("");

  // 5. Create sample bank account (Antreva's receiving account)
  const bankAccountNumber = process.env.SEED_BANK_ACCOUNT || "1234567890";
  const { encrypted, iv } = encryptValue(bankAccountNumber);
  
  console.log("Creating bank account...");
  const bankAccount = await prisma.bankAccount.upsert({
    where: { id: "default-bank-account" },
    update: {},
    create: {
      id: "default-bank-account",
      bankName: process.env.SEED_BANK_NAME || "Banreservas",
      accountNumber: encrypted,
      accountNumberIv: iv,
      accountNumberLast4: bankAccountNumber.slice(-4),
      accountType: "checking",
      currency: "DOP",
      accountHolder: "Antreva Tech SRL",
      isActive: true,
    },
  });
  console.log(`  ✓ Bank account: ${bankAccount.bankName} (****${bankAccount.accountNumberLast4})\n`);

  // 6. Create additional roles for future use
  console.log("Creating additional roles...");
  
  const managerRole = await prisma.role.upsert({
    where: { name: "manager" },
    update: {},
    create: {
      name: "manager",
      permissions: [
        "leads.read", "leads.write",
        "clients.read", "clients.write",
        "tickets.read", "tickets.write",
        "payments.read", "payments.write",
      ],
    },
  });
  console.log(`  ✓ Manager role: ${managerRole.id}`);

  const supportRole = await prisma.role.upsert({
    where: { name: "support" },
    update: {},
    create: {
      name: "support",
      permissions: [
        "clients.read",
        "tickets.read", "tickets.write",
        "credentials.read",
      ],
    },
  });
  console.log(`  ✓ Support role: ${supportRole.id}`);

  const readonlyRole = await prisma.role.upsert({
    where: { name: "readonly" },
    update: {},
    create: {
      name: "readonly",
      permissions: [
        "leads.read",
        "clients.read",
        "tickets.read",
        "payments.read",
        "audit.read",
      ],
    },
  });
  console.log(`  ✓ Readonly role: ${readonlyRole.id}\n`);

  console.log("✅ Seed completed successfully!\n");
  console.log("⚠️  IMPORTANT: Save the temporary passwords above and change them on first login!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
