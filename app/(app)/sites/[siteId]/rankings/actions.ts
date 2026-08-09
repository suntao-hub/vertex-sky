"use server";

import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function createKeyword(siteId: string, formData: FormData) {
  const keyword = String(formData.get("keyword") ?? "").trim();
  const targetUrl = String(formData.get("targetUrl") ?? "").trim() || null;
  if (!keyword) throw new Error("Keyword is required");

  await db.keyword.create({ data: { siteId, keyword, targetUrl } });
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
