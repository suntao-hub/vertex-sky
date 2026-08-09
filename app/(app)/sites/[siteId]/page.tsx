import Link from "next/link";
import { db } from "@/lib/db/client";
import { cardClass } from "@/components/ui";
import { label } from "@/lib/constants";

export default async function SiteOverviewPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  const [
    lastAudit,
    keywordCount,
    contentCounts,
    lastAuthority,
    aiCited,
    aiVisibilityCount,
    lastTraffic,
    openTasks,
  ] = await Promise.all([
    db.technicalAudit.findFirst({ where: { siteId }, orderBy: { auditDate: "desc" } }),
    db.keyword.count({ where: { siteId } }),
    db.contentItem.groupBy({ by: ["status"], where: { siteId }, _count: true }),
    db.authorityEntry.findFirst({ where: { siteId }, orderBy: { date: "desc" } }),
    db.aiVisibilityEntry.count({ where: { siteId, cited: true } }),
    db.aiVisibilityEntry.count({ where: { siteId } }),
    db.trafficSnapshot.findFirst({ where: { siteId }, orderBy: { periodEnd: "desc" } }),
    db.task.findMany({ where: { siteId, status: { not: "done" } }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const checklist = [
    {
      title: "Log a technical audit",
      desc: "Crawl errors, Core Web Vitals, indexation, schema markup.",
      href: `/sites/${siteId}/technical`,
      done: !!lastAudit,
    },
    {
      title: "Track target keywords",
      desc: "Add the keywords this site should rank for.",
      href: `/sites/${siteId}/rankings`,
      done: keywordCount > 0,
    },
    {
      title: "Add a content item",
      desc: "Log what's published, in progress, or planned.",
      href: `/sites/${siteId}/content`,
      done: contentCounts.length > 0,
    },
    {
      title: "Log an authority snapshot",
      desc: "Backlink count and quality trend.",
      href: `/sites/${siteId}/authority`,
      done: !!lastAuthority,
    },
    {
      title: "Check AI visibility",
      desc: "Is this site cited in AI Overviews, ChatGPT, or Perplexity?",
      href: `/sites/${siteId}/ai-visibility`,
      done: aiVisibilityCount > 0,
    },
    {
      title: "Log a traffic snapshot",
      desc: "Sessions and conversions from GA4/Search Console.",
      href: `/sites/${siteId}/traffic`,
      done: !!lastTraffic,
    },
  ];
  const remaining = checklist.filter((c) => !c.done);

  const tiles = [
    {
      title: "Technical Health",
      href: `/sites/${siteId}/technical`,
      body: lastAudit
        ? `Last audit ${lastAudit.auditDate.toLocaleDateString()} · ${lastAudit.crawlErrors ?? 0} crawl errors · CWV: ${label(lastAudit.coreWebVitalsStatus)}`
        : "No audits logged yet",
    },
    {
      title: "Rankings",
      href: `/sites/${siteId}/rankings`,
      body: `${keywordCount} tracked keyword${keywordCount === 1 ? "" : "s"}`,
    },
    {
      title: "Content Pipeline",
      href: `/sites/${siteId}/content`,
      body:
        contentCounts.length > 0
          ? contentCounts.map((c) => `${c._count} ${label(c.status)}`).join(" · ")
          : "No content items yet",
    },
    {
      title: "Authority",
      href: `/sites/${siteId}/authority`,
      body: lastAuthority
        ? `${lastAuthority.backlinkCount ?? "—"} backlinks · trend: ${label(lastAuthority.qualityTrend)}`
        : "No authority entries yet",
    },
    {
      title: "AI Visibility",
      href: `/sites/${siteId}/ai-visibility`,
      body: `${aiCited} query citation${aiCited === 1 ? "" : "s"} confirmed`,
    },
    {
      title: "Traffic",
      href: `/sites/${siteId}/traffic`,
      body: lastTraffic
        ? `${lastTraffic.sessions ?? "—"} sessions / ${lastTraffic.conversions ?? "—"} conversions (${label(lastTraffic.source)})`
        : "No traffic snapshots yet",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {remaining.length > 0 ? (
        <div className={cardClass}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Getting started</h3>
            <span className="text-xs text-slate-500">
              {checklist.length - remaining.length} of {checklist.length} done
            </span>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            Not sure where to start? Work through these to get a baseline for this site.
          </p>
          <ul className="flex flex-col gap-3">
            {checklist.map((step) => (
              <li key={step.title} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                    step.done
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-slate-300 text-transparent"
                  }`}
                >
                  ✓
                </span>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${step.done ? "text-slate-400 line-through" : "text-slate-900"}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-500">{step.desc}</div>
                </div>
                {!step.done && (
                  <Link href={step.href} className="mt-0.5 shrink-0 text-xs font-medium text-sky-700 hover:text-sky-800">
                    Start →
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-green-700">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-xs text-white">
            ✓
          </span>
          All monitoring categories have data for this site.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.title} href={tile.href} className={`${cardClass} block hover:border-slate-400`}>
            <h3 className="text-sm font-semibold text-slate-800">{tile.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{tile.body}</p>
          </Link>
        ))}
      </div>

      <div className={cardClass}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Open tasks</h3>
          <Link href={`/sites/${siteId}/tasks`} className="text-sm text-slate-500 hover:text-slate-800">
            View all →
          </Link>
        </div>
        {openTasks.length === 0 ? (
          <p className="text-sm text-slate-500">No open tasks for this site.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {openTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <span>{t.title}</span>
                <span className="text-slate-400">{label(t.category)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
