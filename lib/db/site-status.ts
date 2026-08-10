import "server-only";
import { db } from "@/lib/db/client";

export const STALE_DAYS = 30;

export type CategoryStatus = "missing" | "stale" | "ok";

export type SiteStatus = {
  technical: { status: CategoryStatus; lastDate: Date | null };
  rankings: { status: CategoryStatus; lastDate: Date | null };
  content: { status: "missing" | "ok"; count: number };
  authority: { status: CategoryStatus; lastDate: Date | null };
  ai_visibility: { status: CategoryStatus; lastDate: Date | null };
  traffic: { status: CategoryStatus; lastDate: Date | null };
  needsAttention: number;
};

function statusFromDate(date: Date | null | undefined): CategoryStatus {
  if (!date) return "missing";
  const days = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return days > STALE_DAYS ? "stale" : "ok";
}

/**
 * Computes per-category freshness for every given site in a fixed number of
 * batched queries (not one query per site), so this stays cheap regardless
 * of how many sites are in the registry.
 */
export async function getSiteStatusMap(siteIds: string[]): Promise<Map<string, SiteStatus>> {
  const [audits, rankingLatest, contentCounts, authorityLatest, aiLatest, trafficLatest] =
    await Promise.all([
      db.technicalAudit.groupBy({ by: ["siteId"], _max: { auditDate: true } }),
      db.$queryRaw<{ siteId: string; latest: Date | null }[]>`
        SELECT k."siteId" as "siteId", MAX(r."date") as "latest"
        FROM "RankingEntry" r
        JOIN "Keyword" k ON r."keywordId" = k."id"
        GROUP BY k."siteId"
      `,
      db.contentItem.groupBy({ by: ["siteId"], _count: true }),
      db.authorityEntry.groupBy({ by: ["siteId"], _max: { date: true } }),
      db.aiVisibilityEntry.groupBy({ by: ["siteId"], _max: { checkedDate: true } }),
      db.trafficSnapshot.groupBy({ by: ["siteId"], _max: { periodEnd: true } }),
    ]);

  const auditMap = new Map(audits.map((a) => [a.siteId, a._max.auditDate ?? null]));
  const rankingMap = new Map(rankingLatest.map((r) => [r.siteId, r.latest]));
  const contentMap = new Map(contentCounts.map((c) => [c.siteId, c._count]));
  const authorityMap = new Map(authorityLatest.map((a) => [a.siteId, a._max.date ?? null]));
  const aiMap = new Map(aiLatest.map((a) => [a.siteId, a._max.checkedDate ?? null]));
  const trafficMap = new Map(trafficLatest.map((t) => [t.siteId, t._max.periodEnd ?? null]));

  const result = new Map<string, SiteStatus>();
  for (const siteId of siteIds) {
    const technical = { status: statusFromDate(auditMap.get(siteId)), lastDate: auditMap.get(siteId) ?? null };
    const rankings = { status: statusFromDate(rankingMap.get(siteId)), lastDate: rankingMap.get(siteId) ?? null };
    const contentCount = contentMap.get(siteId) ?? 0;
    const content: SiteStatus["content"] = {
      status: contentCount > 0 ? "ok" : "missing",
      count: contentCount,
    };
    const authority = { status: statusFromDate(authorityMap.get(siteId)), lastDate: authorityMap.get(siteId) ?? null };
    const ai_visibility = { status: statusFromDate(aiMap.get(siteId)), lastDate: aiMap.get(siteId) ?? null };
    const traffic = { status: statusFromDate(trafficMap.get(siteId)), lastDate: trafficMap.get(siteId) ?? null };

    const needsAttention = [technical.status, rankings.status, content.status, authority.status, ai_visibility.status, traffic.status].filter(
      (s) => s !== "ok"
    ).length;

    result.set(siteId, { technical, rankings, content, authority, ai_visibility, traffic, needsAttention });
  }

  return result;
}
