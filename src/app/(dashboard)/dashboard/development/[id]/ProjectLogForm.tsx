"use client";

/**
 * Form to add a log entry to a development project. CTO only (enforced in action).
 */

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addDevelopmentProjectLog } from "../actions";

type Props = { projectId: string };

/**
 * Renders textarea and submit to add an activity log entry; resets form and refreshes after add.
 */
export function ProjectLogForm({ projectId }: Props) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  return (
    <form
      ref={formRef}
      action={(formData) => {
        const content = formData.get("content") as string;
        if (!content?.trim()) return;
        startTransition(async () => {
          await addDevelopmentProjectLog(projectId, content);
          formRef.current?.reset();
          router.refresh();
        });
      }}
      className="flex flex-col gap-2"
    >
      <textarea
        name="content"
        rows={2}
        placeholder="Add an update (e.g. Sprint completed, blocked on design approval...)"
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#1C6ED5]"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full sm:w-auto px-4 py-2 bg-[#1C6ED5] text-white text-sm rounded-lg hover:bg-[#1559B3] transition font-medium disabled:opacity-60"
      >
        {pending ? "Adding..." : "Add log entry"}
      </button>
    </form>
  );
}
