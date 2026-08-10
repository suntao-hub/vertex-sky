"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { suggestKeywordsForSite, addSuggestedKeyword } from "@/app/(app)/sites/[siteId]/rankings/actions";
import type { KeywordSuggestion } from "@/lib/ai/keyword-research";
import { label } from "@/lib/constants";
import { buttonClass, inputClass, labelClass } from "@/components/ui";

const BUCKET_ORDER = ["problem", "competitor", "category_fit"] as const;

export function KeywordResearchPanel({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[] | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function runSuggest() {
    if (!topic.trim()) {
      setError("Enter a topic to research first.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const results = await suggestKeywordsForSite(siteId, topic, competitors);
        setSuggestions(results);
        setAdded(new Set());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong asking Claude for suggestions.");
      }
    });
  }

  function addKeyword(s: KeywordSuggestion) {
    startTransition(async () => {
      await addSuggestedKeyword(siteId, s.keyword, s.bucket);
      setAdded((prev) => new Set(prev).add(s.keyword));
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Topic to research</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. floor jacks for home garages"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Known competitors (optional)</label>
          <input
            value={competitors}
            onChange={(e) => setCompetitors(e.target.value)}
            placeholder="e.g. Acme Tools, Brand X"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <button type="button" onClick={runSuggest} disabled={isPending} className={buttonClass}>
          {isPending ? "Asking Claude…" : "Suggest keywords"}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      {suggestions && (
        <div className="flex flex-col gap-4">
          {BUCKET_ORDER.map((bucket) => {
            const items = suggestions.filter((s) => s.bucket === bucket);
            if (items.length === 0) return null;
            return (
              <div key={bucket}>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label(bucket)}
                </h4>
                <ul className="flex flex-col gap-2">
                  {items.map((s) => {
                    const isAdded = added.has(s.keyword);
                    return (
                      <li
                        key={s.keyword}
                        className="flex items-start justify-between gap-3 rounded-md border border-slate-200 px-3 py-2"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-900">{s.keyword}</div>
                          <div className="text-xs text-slate-500">{s.rationale}</div>
                        </div>
                        <button
                          type="button"
                          disabled={isAdded || isPending}
                          onClick={() => addKeyword(s)}
                          className="shrink-0 text-xs font-medium text-sky-700 hover:text-sky-800 disabled:text-green-600"
                        >
                          {isAdded ? "Added ✓" : "Add →"}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
