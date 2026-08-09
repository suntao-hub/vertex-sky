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

  const [lastAudit, keywordCount, contentCounts, lastAuthority, aiCited, lastTraffic, openTasks] =
    await Promise.all([
      db.technicalAudit.findFirst({ where: { siteId }, orderBy: { auditDate: "desc" } }),
      db.keyword.count({ where: { siteId } }),
      db.contentItem.groupBy({ by: ["status"], where: { siteId }, _count: true }),
      db.authorityEntry.findFirst({ where: { siteId }, orderBy: { date: "desc" } }),
      db.aiVisibilityEntry.count({ where: { siteId, cited: true } }),
      db.trafficSnapshot.findFirst({ where: { siteId }, orderBy: { periodEnd: "desc" } }),
      db.task.findMany({ where: { siteId, status: { not: "done" } }, orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

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
