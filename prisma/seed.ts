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

import { PrismaClient, BillingType, Currency } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";

const prisma = new PrismaClient();

/** All permissions available in the system (admin = CEO/CTO only) */
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
  "roles.manage",
  "audit.read",
];

/**
 * Service catalog: Start, Pro, Premium plans only.
 */
const SERVICES: Array<{
  name: string;
  slug: string;
  description: string;
  billingType: BillingType;
  defaultAmount: number;
  currency: Currency;
}> = [
  {
    name: "Start",
    slug: "start",
    description: "Entry plan: WhatsApp setup, digital menu, basic website, Instagram optimization.",
    billingType: BillingType.recurring,
    defaultAmount: 4500,
    currency: Currency.DOP,
  },
  {
    name: "Pro",
    slug: "pro",
    description: "Growth plan: Everything in Start plus advanced WhatsApp flows, content pack, order form.",
    billingType: BillingType.recurring,
    defaultAmount: 7500,
    currency: Currency.DOP,
  },
  {
    name: "Premium",
    slug: "premium",
    description: "Full plan: Everything in Pro plus campaigns, multi-page website, reinforced security.",
    billingType: BillingType.recurring,
    defaultAmount: 12000,
    currency: Currency.DOP,
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

  // 2. Create or update single CEO user (default email: ingramonechavarria@gmail.com)
  const ceoEmail = process.env.SEED_CEO_EMAIL || "ingramonechavarria@gmail.com";
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
  // Remove CEO title from any other users (avoid duplicates)
  const otherCeos = await prisma.user.updateMany({
    where: { title: "CEO", id: { not: ceoUser.id } },
    data: { title: null },
  });
  if (otherCeos.count > 0) {
    console.log(`  ✓ Removed CEO title from ${otherCeos.count} duplicate user(s)`);
  }
  // Delete legacy CEO account (ceo@antreva.com) so only ingramonechavarria@gmail.com remains
  if (ceoUser.email !== "ceo@antreva.com") {
    const deleted = await prisma.user.deleteMany({
      where: { email: "ceo@antreva.com" },
    });
    if (deleted.count > 0) {
      console.log(`  ✓ Deleted legacy CEO account (ceo@antreva.com)`);
    }
  }
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

  // 4. Create services (Start, Pro, Premium only)
  const planSlugs = SERVICES.map((s) => s.slug);
  console.log("Creating services (Start, Pro, Premium)...");
  for (const service of SERVICES) {
    const created = await prisma.service.upsert({
      where: { slug: service.slug },
      update: { ...service, isActive: true },
      create: service,
    });
    console.log(`  ✓ ${created.name} (${created.slug})`);
  }
  // Deactivate any service not in the plan catalog
  const deactivated = await prisma.service.updateMany({
    where: { slug: { notIn: planSlugs } },
    data: { isActive: false },
  });
  if (deactivated.count > 0) {
    console.log(`  ⚠ Deactivated ${deactivated.count} service(s) not in catalog`);
  }
  console.log("");

  // 5. Create additional roles for future use
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

  const developerRole = await prisma.role.upsert({
    where: { name: "developer" },
    update: {},
    create: {
      name: "developer",
      permissions: [
        "leads.read",
        "clients.read",
        "clients.write",
        "tickets.read",
        "tickets.write",
        "credentials.read",
      ],
    },
  });
  console.log(`  ✓ Developer role: ${developerRole.id}`);

  const salesRole = await prisma.role.upsert({
    where: { name: "sales" },
    update: {},
    create: {
      name: "sales",
      permissions: [
        "leads.read",
        "leads.write",
        "clients.read",
        "clients.write",
        "payments.read",
        "tickets.read",
      ],
    },
  });
  console.log(`  ✓ Sales role: ${salesRole.id}\n`);

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
