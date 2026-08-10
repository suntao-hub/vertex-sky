import Link from "next/link";
import { db } from "@/lib/db/client";
import { cardClass } from "@/components/ui";
import { label } from "@/lib/constants";
import { getSiteStatusMap, STALE_DAYS, type CategoryStatus } from "@/lib/db/site-status";

function daysAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  return days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
}

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
    lastTraffic,
    openTasks,
    statusMap,
  ] = await Promise.all([
    db.technicalAudit.findFirst({ where: { siteId }, orderBy: { auditDate: "desc" } }),
    db.keyword.count({ where: { siteId } }),
    db.contentItem.groupBy({ by: ["status"], where: { siteId }, _count: true }),
    db.authorityEntry.findFirst({ where: { siteId }, orderBy: { date: "desc" } }),
    db.aiVisibilityEntry.count({ where: { siteId, cited: true } }),
    db.trafficSnapshot.findFirst({ where: { siteId }, orderBy: { periodEnd: "desc" } }),
    db.task.findMany({ where: { siteId, status: { not: "done" } }, orderBy: { createdAt: "desc" }, take: 5 }),
    getSiteStatusMap([siteId]),
  ]);

  const status = statusMap.get(siteId)!;

  const checklist: {
    title: string;
    desc: string;
    href: string;
    status: CategoryStatus;
    lastDate: Date | null;
  }[] = [
    {
      title: "Log a technical audit",
      desc: "Crawl errors, Core Web Vitals, indexation, schema markup.",
      href: `/sites/${siteId}/technical`,
      status: status.technical.status,
      lastDate: status.technical.lastDate,
    },
    {
      title: "Track target keywords",
      desc: "Add the keywords this site should rank for, and log positions.",
      href: `/sites/${siteId}/rankings`,
      status: status.rankings.status,
      lastDate: status.rankings.lastDate,
    },
    {
      title: "Add a content item",
      desc: "Log what's published, in progress, or planned.",
      href: `/sites/${siteId}/content`,
      status: status.content.status,
      lastDate: null,
    },
    {
      title: "Log an authority snapshot",
      desc: "Backlink count and quality trend.",
      href: `/sites/${siteId}/authority`,
      status: status.authority.status,
      lastDate: status.authority.lastDate,
    },
    {
      title: "Check AI visibility",
      desc: "Is this site cited in AI Overviews, ChatGPT, or Perplexity?",
      href: `/sites/${siteId}/ai-visibility`,
      status: status.ai_visibility.status,
      lastDate: status.ai_visibility.lastDate,
    },
    {
      title: "Log a traffic snapshot",
      desc: "Sessions and conversions from GA4/Search Console.",
      href: `/sites/${siteId}/traffic`,
      status: status.traffic.status,
      lastDate: status.traffic.lastDate,
    },
  ];
  const remaining = checklist.filter((c) => c.status !== "ok");

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
              {checklist.length - remaining.length} of {checklist.length} up to date
            </span>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            Not sure where to start? Work through these to get — and keep — a baseline for this site.
            Anything not refreshed in {STALE_DAYS} days counts as stale.
          </p>
          <ul className="flex flex-col gap-3">
            {checklist.map((step) => (
              <li key={step.title} className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                    step.status === "ok"
                      ? "border-green-600 bg-green-600 text-white"
                      : step.status === "stale"
                        ? "border-amber-500 bg-amber-500 text-white"
                        : "border-slate-300 text-transparent"
                  }`}
                >
                  {step.status === "stale" ? "!" : "✓"}
                </span>
                <div className="flex-1">
                  <div
                    className={`text-sm font-medium ${
                      step.status === "ok" ? "text-slate-400 line-through" : "text-slate-900"
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {step.status === "stale" && step.lastDate
                      ? `Stale — last logged ${daysAgo(step.lastDate)}.`
                      : step.desc}
                  </div>
                </div>
                {step.status !== "ok" && (
                  <Link href={step.href} className="mt-0.5 shrink-0 text-xs font-medium text-sky-700 hover:text-sky-800">
                    {step.status === "stale" ? "Update →" : "Start →"}
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
          All monitoring categories are up to date (logged within the last {STALE_DAYS} days).
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.title} href={tile.href} className={`${cardClass} block hover:border-sky-300`}>
            <h3 className="text-sm font-semibold text-slate-800">{tile.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{tile.body}</p>
          </Link>
        ))}
      </div>

      <div className={cardClass}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800">Open tasks</h3>
          <Link href={`/sites/${siteId}/tasks`} className="text-sm text-sky-700 hover:text-sky-800">
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
