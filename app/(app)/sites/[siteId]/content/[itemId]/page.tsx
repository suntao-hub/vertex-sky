import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { label } from "@/lib/constants";
import { cardClass } from "@/components/ui";
import { ContentDraftEditor } from "@/components/content-draft-editor";

export default async function ContentItemPage({
  params,
}: {
  params: Promise<{ siteId: string; itemId: string }>;
}) {
  const { siteId, itemId } = await params;
  const item = await db.contentItem.findUnique({ where: { id: itemId } });
  if (!item || item.siteId !== siteId) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/sites/${siteId}/content`} className="text-sm text-slate-500 hover:text-sky-700">
          ← Content pipeline
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{item.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {label(item.format)} · {label(item.status)}
          {item.keywordGap ? ` · targeting "${item.keywordGap}"` : ""}
        </p>
      </div>

      <div className={cardClass}>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Draft</h2>
        <p className="mb-4 text-xs text-slate-500">
          Claude writes to the AEO formatting rules for this format (question headings, answer-first, comparison
          tables, no invented facts — placeholders instead). Always read it before publishing; treat it as a first
          draft, not final copy.
        </p>
        <ContentDraftEditor siteId={siteId} itemId={itemId} initialDraft={item.draftContent} />
      </div>
    </div>
  );
}
