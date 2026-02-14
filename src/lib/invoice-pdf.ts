/**
 * Branded PDF invoice generator for Antreva Tech.
 * Uses pdf-lib for zero-dependency server-side generation.
 *
 * Brand colors:
 *   Midnight Navy  #0B132B  → rgb(11, 19, 43)
 *   Tech Blue      #1C6ED5  → rgb(28, 110, 213)
 *   Slate Gray     #8A8F98  → rgb(138, 143, 152)
 *   White          #FFFFFF
 */

import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/** Antreva brand palette as pdf-lib rgb values. */
const BRAND = {
  navy: rgb(11 / 255, 19 / 255, 43 / 255),
  blue: rgb(28 / 255, 110 / 255, 213 / 255),
  slate: rgb(138 / 255, 143 / 255, 152 / 255),
  white: rgb(1, 1, 1),
  lightBg: rgb(245 / 255, 247 / 255, 250 / 255),
} as const;

/** Data required to build an invoice PDF. */
export interface InvoiceData {
  /** Payment ID (displayed on invoice). */
  paymentId: string;
  /** Date the payment card was created. */
  invoiceDate: Date;
  /** Logged-in user generating the invoice. */
  generatorName: string;
  /** Optional company phone number (from WhatsAppPhone or similar). */
  companyPhone: string | null;
  /** Customer name. */
  clientName: string;
  /** Customer company (optional). */
  clientCompany: string | null;
  /** Customer email. */
  clientEmail: string;
  /** Line items on the invoice. */
  items: Array<{ description: string; amount: number; currency: string }>;
  /** Total amount. */
  total: number;
  /** Currency code (DOP / USD). */
  currency: string;
  /** Receiving bank info for customer transfer instructions. */
  bankInfo: {
    bankName: string;
    accountHolder: string;
    accountNumberLast4: string;
    accountType: string;
    currency: string;
  } | null;
}

/**
 * Formats amount with currency symbol.
 */
function fmtCurrency(amount: number, currency: string): string {
  const symbol = currency === "DOP" ? "RD$" : "$";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/**
 * Formats a date as DD/MM/YYYY.
 */
function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * Generates a branded Antreva Tech PDF invoice and returns it as a Uint8Array.
 */
export async function generateInvoicePdf(data: InvoiceData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 50;
  const leftMargin = 50;
  const rightMargin = width - 50;

  // ── Header bar ──────────────────────────────────────────────
  page.drawRectangle({
    x: 0,
    y: height - 90,
    width,
    height: 90,
    color: BRAND.navy,
  });

  page.drawText("ANTREVA TECH", {
    x: leftMargin,
    y: height - 45,
    size: 22,
    font: fontBold,
    color: BRAND.white,
  });

  page.drawText("Engineering Digital Intelligence", {
    x: leftMargin,
    y: height - 65,
    size: 10,
    font: fontRegular,
    color: BRAND.slate,
  });

  page.drawText("INVOICE", {
    x: rightMargin - fontBold.widthOfTextAtSize("INVOICE", 20),
    y: height - 50,
    size: 20,
    font: fontBold,
    color: BRAND.blue,
  });

  // ── Invoice meta ────────────────────────────────────────────
  y = height - 120;
  const metaLabelX = rightMargin - 200;
  const metaValueX = rightMargin - 80;

  const drawMeta = (label: string, value: string) => {
    page.drawText(label, { x: metaLabelX, y, size: 9, font: fontBold, color: BRAND.slate });
    page.drawText(value, { x: metaValueX, y, size: 9, font: fontRegular, color: BRAND.navy });
    y -= 16;
  };

  drawMeta("Invoice #:", data.paymentId.slice(-8).toUpperCase());
  drawMeta("Date:", fmtDate(data.invoiceDate));
  drawMeta("Issued by:", data.generatorName);
  if (data.companyPhone) {
    drawMeta("Phone:", data.companyPhone);
  }

  // ── Bill To ─────────────────────────────────────────────────
  const billToY = height - 120;
  page.drawText("BILL TO", { x: leftMargin, y: billToY, size: 9, font: fontBold, color: BRAND.blue });

  let bty = billToY - 18;
  page.drawText(data.clientName, { x: leftMargin, y: bty, size: 11, font: fontBold, color: BRAND.navy });
  bty -= 16;

  if (data.clientCompany) {
    page.drawText(data.clientCompany, { x: leftMargin, y: bty, size: 10, font: fontRegular, color: BRAND.navy });
    bty -= 14;
  }

  page.drawText(data.clientEmail, { x: leftMargin, y: bty, size: 9, font: fontRegular, color: BRAND.slate });

  // ── Items table ─────────────────────────────────────────────
  const tableTop = Math.min(y, bty) - 30;
  const colDescX = leftMargin;
  const colAmtX = rightMargin - 100;

  // Table header bg
  page.drawRectangle({
    x: leftMargin - 10,
    y: tableTop - 5,
    width: rightMargin - leftMargin + 20,
    height: 22,
    color: BRAND.navy,
  });

  page.drawText("Description", { x: colDescX, y: tableTop, size: 10, font: fontBold, color: BRAND.white });
  page.drawText("Amount", { x: colAmtX, y: tableTop, size: 10, font: fontBold, color: BRAND.white });

  let rowY = tableTop - 28;
  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    // Alternate row bg
    if (i % 2 === 0) {
      page.drawRectangle({
        x: leftMargin - 10,
        y: rowY - 5,
        width: rightMargin - leftMargin + 20,
        height: 22,
        color: BRAND.lightBg,
      });
    }

    page.drawText(item.description, { x: colDescX, y: rowY, size: 10, font: fontRegular, color: BRAND.navy });
    const amountStr = fmtCurrency(item.amount, item.currency);
    page.drawText(amountStr, {
      x: colAmtX + 100 - fontRegular.widthOfTextAtSize(amountStr, 10),
      y: rowY,
      size: 10,
      font: fontRegular,
      color: BRAND.navy,
    });
    rowY -= 24;
  }

  // ── Total ───────────────────────────────────────────────────
  rowY -= 8;
  page.drawRectangle({
    x: colAmtX - 70,
    y: rowY - 5,
    width: 170,
    height: 26,
    color: BRAND.blue,
  });

  page.drawText("TOTAL", { x: colAmtX - 60, y: rowY + 2, size: 11, font: fontBold, color: BRAND.white });
  const totalStr = fmtCurrency(data.total, data.currency);
  page.drawText(totalStr, {
    x: colAmtX + 100 - fontBold.widthOfTextAtSize(totalStr, 11),
    y: rowY + 2,
    size: 11,
    font: fontBold,
    color: BRAND.white,
  });

  // ── Bank Transfer Instructions ──────────────────────────────
  if (data.bankInfo) {
    rowY -= 50;
    page.drawText("PAYMENT INSTRUCTIONS", { x: leftMargin, y: rowY, size: 10, font: fontBold, color: BRAND.blue });
    rowY -= 4;

    page.drawRectangle({
      x: leftMargin - 10,
      y: rowY - 74,
      width: rightMargin - leftMargin + 20,
      height: 72,
      color: BRAND.lightBg,
      borderColor: BRAND.slate,
      borderWidth: 0.5,
    });

    rowY -= 18;
    const bankLines = [
      ["Bank:", data.bankInfo.bankName],
      ["Account Holder:", data.bankInfo.accountHolder],
      ["Account:", `****${data.bankInfo.accountNumberLast4} (${data.bankInfo.accountType})`],
      ["Currency:", data.bankInfo.currency === "DOP" ? "DOP (RD$)" : "USD ($)"],
    ];

    for (const [label, value] of bankLines) {
      page.drawText(label, { x: leftMargin, y: rowY, size: 9, font: fontBold, color: BRAND.navy });
      page.drawText(value, { x: leftMargin + 110, y: rowY, size: 9, font: fontRegular, color: BRAND.navy });
      rowY -= 14;
    }
  }

  // ── Footer ──────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 30, color: BRAND.navy });
  const footerText = "Antreva Tech — Engineering Digital Intelligence";
  page.drawText(footerText, {
    x: (width - fontRegular.widthOfTextAtSize(footerText, 8)) / 2,
    y: 10,
    size: 8,
    font: fontRegular,
    color: BRAND.slate,
  });

  return doc.save();
}
