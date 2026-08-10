"use client";

import { useState, useTransition } from "react";
import { generateDraftForItem, saveDraft } from "@/app/(app)/sites/[siteId]/content/actions";
import { buttonClass, secondaryButtonClass } from "@/components/ui";

export function ContentDraftEditor({
  siteId,
  itemId,
  initialDraft,
}: {
  siteId: string;
  itemId: string;
  initialDraft: string | null;
}) {
  const [draft, setDraft] = useState(initialDraft ?? "");
  const [savedDraft, setSavedDraft] = useState(initialDraft ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const hasUnsavedChanges = draft !== savedDraft;
  const confirmMessage = draft.trim()
    ? "This will replace the current draft text with a new one from Claude. Continue?"
    : null;

  function generate() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateDraftForItem(siteId, itemId);
        setDraft(result);
        await saveDraft(siteId, itemId, result);
        setSavedDraft(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong generating the draft.");
      }
    });
  }

  function save() {
    startTransition(async () => {
      await saveDraft(siteId, itemId, draft);
      setSavedDraft(draft);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <button type="button" onClick={generate} disabled={isPending} className={buttonClass}>
          {isPending ? "Working…" : draft.trim() ? "Regenerate with Claude" : "Generate draft with Claude"}
        </button>
        {hasUnsavedChanges && (
          <button type="button" onClick={save} disabled={isPending} className={secondaryButtonClass}>
            Save changes
          </button>
        )}
        {!hasUnsavedChanges && savedDraft && <span className="text-xs text-slate-400">Saved</span>}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={24}
        placeholder="No draft yet — click Generate draft with Claude, or write one here manually."
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
      />
    </div>
  );
}
