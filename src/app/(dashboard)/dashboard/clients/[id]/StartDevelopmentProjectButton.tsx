"use client";

/**
 * Button to start a development project for this client. CTO only (action enforces).
 */

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createDevelopmentProject } from "@/app/(dashboard)/dashboard/development/actions";

type Props = { clientId: string };

/**
 * Renders "Start development project" and creates project via server action.
 */
export function StartDevelopmentProjectButton({ clientId }: Props) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          try {
            await createDevelopmentProject(clientId);
            router.refresh();
          } catch (e) {
            console.error(e);
            alert(e instanceof Error ? e.message : "Failed to start project");
          }
        });
      }}
      disabled={pending}
      className="px-4 py-2 border border-[#1C6ED5] text-[#1C6ED5] text-sm rounded-lg hover:bg-[#1C6ED5]/10 transition font-medium disabled:opacity-60"
    >
      {pending ? "Starting..." : "Start development project"}
    </button>
  );
}
