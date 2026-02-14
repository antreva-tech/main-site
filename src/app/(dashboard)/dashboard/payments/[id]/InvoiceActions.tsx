"use client";

/**
 * Invoice actions for pending payment cards:
 * - Download branded PDF invoice
 * - Send invoice link via WhatsApp (prefilled wa.me link)
 */

interface Props {
  paymentId: string;
  clientPhone: string | null;
  clientName: string;
  amount: number;
  currency: string;
  serviceName: string;
  singleChargeLabel: string | null;
}

/**
 * Formats amount with currency symbol.
 */
function fmtCurrency(amount: number, currency: string): string {
  const symbol = currency === "DOP" ? "RD$" : "$";
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

/**
 * Builds the WhatsApp prefilled message URL.
 */
function buildWhatsAppUrl(phone: string, paymentId: string, amount: number, currency: string, label: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const invoiceUrl = `${window.location.origin}/api/invoices/${paymentId}/pdf`;
  const message = [
    `Hello! Here is your invoice from Antreva Tech.`,
    ``,
    `Charge: ${label}`,
    `Amount: ${fmtCurrency(amount, currency)}`,
    ``,
    `Download your invoice: ${invoiceUrl}`,
    ``,
    `Thank you for your business!`,
  ].join("\n");

  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

/**
 * Invoice action buttons for pending payments.
 */
export function InvoiceActions({
  paymentId,
  clientPhone,
  clientName,
  amount,
  currency,
  serviceName,
  singleChargeLabel,
}: Props) {
  const chargeLabel = singleChargeLabel ?? serviceName;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Invoice Actions
      </h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Generate a branded PDF or share this invoice with {clientName}.
      </p>

      <div className="flex flex-wrap gap-3">
        {/* Download PDF Invoice */}
        <a
          href={`/api/invoices/${paymentId}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#0B132B] text-white text-sm rounded-xl font-medium shadow-sm hover:bg-[#0B132B]/90 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
          </svg>
          Download PDF Invoice
        </a>

        {/* WhatsApp Message */}
        {clientPhone ? (
          <a
            href={buildWhatsAppUrl(clientPhone, paymentId, amount, currency, chargeLabel)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-[#25D366] text-white text-sm rounded-xl font-medium shadow-sm hover:bg-[#1da851] transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.96 7.96 0 01-4.108-1.137l-.29-.174-3.022.793.807-2.953-.19-.303A7.963 7.963 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
            </svg>
            Message via WhatsApp
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-sm rounded-xl font-medium cursor-not-allowed">
            WhatsApp unavailable (no phone)
          </span>
        )}
      </div>
    </div>
  );
}
