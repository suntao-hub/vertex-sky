"use server";

import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { suggestKeywords, type KeywordSuggestion } from "@/lib/ai/keyword-research";

export async function createKeyword(siteId: string, formData: FormData) {
  const keyword = String(formData.get("keyword") ?? "").trim();
  const bucket = String(formData.get("bucket") ?? "").trim() || null;
  const targetUrl = String(formData.get("targetUrl") ?? "").trim() || null;
  if (!keyword) throw new Error("Keyword is required");

  await db.keyword.create({ data: { siteId, keyword, bucket, targetUrl } });
  revalidatePath(`/sites/${siteId}/rankings`);
}

export async function suggestKeywordsForSite(
  siteId: string,
  topic: string,
  competitors: string
): Promise<KeywordSuggestion[]> {
  const [site, existing] = await Promise.all([
    db.site.findUniqueOrThrow({ where: { id: siteId } }),
    db.keyword.findMany({ where: { siteId }, select: { keyword: true } }),
  ]);

  return suggestKeywords({
    siteUrl: site.url,
    clientName: site.clientName,
    businessType: site.businessType,
    primaryGoal: site.primaryGoal,
    topic,
    competitors,
    existingKeywords: existing.map((k) => k.keyword),
  });
}

export async function addSuggestedKeyword(siteId: string, keyword: string, bucket: string) {
  await db.keyword.upsert({
    where: { siteId_keyword: { siteId, keyword } },
    update: { bucket },
    create: { siteId, keyword, bucket },
  });
  revalidatePath(`/sites/${siteId}/rankings`);
}

export async function addRankingEntry(siteId: string, keywordId: string, formData: FormData) {
  const position = formData.get("position") ? Number(formData.get("position")) : null;
  const source = String(formData.get("source") ?? "manual");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await db.rankingEntry.create({ data: { keywordId, position, source, notes } });
  revalidatePath(`/sites/${siteId}/rankings`);
}

export async function deleteKeyword(siteId: string, keywordId: string) {
  await db.keyword.delete({ where: { id: keywordId } });
  revalidatePath(`/sites/${siteId}/rankings`);
}
