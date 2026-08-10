"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { generateDistributionPostsForItem } from "@/app/(app)/sites/[siteId]/content/actions";
import type { DistributionPosts } from "@/lib/ai/distribution-draft";
import { buttonClass } from "@/components/ui";

function CopyBox({ label, text }: { label: string; text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs text-sky-700 hover:text-sky-800"
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      <textarea
        readOnly
        value={text}
        rows={label === "LinkedIn" ? 6 : 3}
        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
      />
    </div>
  );
}

export function DistributionPostsPanel({
  siteId,
  itemId,
  itemTitle,
  itemUrl,
}: {
  siteId: string;
  itemId: string;
  itemTitle: string;
  itemUrl: string | null;
}) {
  const [posts, setPosts] = useState<DistributionPosts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function generate() {
    setError(null);
    startTransition(async () => {
      try {
        setPosts(await generateDistributionPostsForItem(siteId, itemId));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong generating posts.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <button type="button" onClick={generate} disabled={isPending} className={buttonClass}>
        {isPending ? "Working…" : posts ? "Regenerate posts" : "Generate distribution posts"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {posts && (
        <>
          <CopyBox label="LinkedIn" text={posts.linkedin} />
          <CopyBox label="X / Twitter" text={posts.twitter} />
          <p className="text-xs text-slate-500">
            Copy, post manually to each platform, then{" "}
            <Link
              href={`/sites/${siteId}/authority?prefill=${encodeURIComponent(
                `Distributed "${itemTitle}"${itemUrl ? ` (${itemUrl})` : ""}`
              )}`}
              className="text-sky-700 hover:text-sky-800"
            >
              log the distribution →
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
