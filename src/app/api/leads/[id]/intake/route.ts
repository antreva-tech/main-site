/**
 * GET /api/leads/[id]/intake — returns intake fields for a lead.
 * Used by IntakeModal to populate form with current values.
 */

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const lead = await prisma.lead.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      company: true,
      phone: true,
      hasLogo: true,
      logoBlobUrl: true,
      logoDownloadUrl: true,
      logoContentType: true,
      logoSize: true,
      hasDomain: true,
      domain: true,
      addressToUse: true,
      whatsappEnabled: true,
      businessDescription: true,
      serviceOutcome: true,
      adminEaseNotes: true,
      lineOfBusiness: true,
      paymentHandling: true,
    },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  return NextResponse.json(lead);
}
