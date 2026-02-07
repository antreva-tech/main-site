"use client";

/**
 * Editable Name Form Component
 * Allows users to update their display name inline.
 */

import { useState, useTransition } from "react";
import { updateName } from "./actions";

interface EditNameFormProps {
  currentName: string;
}

/**
 * Inline editable name form with save/cancel actions.
 */
export function EditNameForm({ currentName }: EditNameFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (name.trim() === currentName) {
      setIsEditing(false);
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await updateName(name);
      if (result.success) {
        setIsEditing(false);
      } else {
        setError(result.error || "Failed to update name");
      }
    });
  };

  const handleCancel = () => {
    setName(currentName);
    setError(null);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-gray-900 dark:text-gray-100">{currentName}</p>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-sm text-[#1C6ED5] hover:underline"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[#1C6ED5] focus:border-transparent"
          placeholder="Your name"
          autoFocus
          disabled={isPending}
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || name.trim().length < 2}
            className="px-4 py-2 bg-[#1C6ED5] text-white rounded-md hover:bg-[#1559B3] transition disabled:opacity-50 text-sm font-medium min-h-[40px]"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isPending}
            className="px-4 py-2 border border-gray-300 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition disabled:opacity-50 text-sm font-medium min-h-[40px]"
          >
            Cancel
          </button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
