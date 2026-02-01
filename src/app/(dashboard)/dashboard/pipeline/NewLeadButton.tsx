"use client";

/**
 * Button that opens the shared New Lead modal (same as overview "Create Lead").
 */

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { NewLeadModal } from "./NewLeadModal";

/**
 * Button that opens new lead modal.
 */
export function NewLeadButton() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="min-h-[44px] w-full sm:w-auto flex items-center justify-center px-4 py-2.5 bg-[#1C6ED5] text-white rounded-xl hover:bg-[#1559B3] transition font-medium text-sm sm:text-base"
      >
        + {t.dashboard.common.createLead}
      </button>
      <NewLeadModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => setOpen(false)}
      />
    </>
  );
}
