"use server";

import { db } from "@/lib/db/client";
import { maybeCreateFinding } from "@/lib/db/findings";
import { generateContentDraft } from "@/lib/ai/content-draft";
import { revalidatePath } from "next/cache";

export async function createContentItem(siteId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const status = String(formData.get("status") ?? "planned");
  const format = String(formData.get("format") ?? "").trim() || null;
  const keywordGap = String(formData.get("keywordGap") ?? "").trim() || null;
  const url = String(formData.get("url") ?? "").trim() || null;
  const publishDateRaw = String(formData.get("publishDate") ?? "").trim();
  const publishDate = publishDateRaw ? new Date(publishDateRaw) : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!title) throw new Error("Title is required");

  const item = await db.contentItem.create({
    data: { siteId, title, status, format, keywordGap, url, publishDate, notes },
  });

  const flagTask = formData.get("flagTask") === "1";
  if (flagTask) {
    const priority = (String(formData.get("taskPriority") ?? "medium")) as "low" | "medium" | "high";
    const summary = String(formData.get("taskSummary") ?? "").trim() || `Content: ${title}`;
    await maybeCreateFinding({
      siteId,
      category: "content",
      summary,
      detail: notes,
      priority,
      sourceType: "content_item",
      sourceId: item.id,
    });
  }

  revalidatePath(`/sites/${siteId}/content`);
  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/sites/${siteId}/tasks`);
  revalidatePath("/tasks");
}

export async function updateContentStatus(siteId: string, itemId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "planned");
  await db.contentItem.update({ where: { id: itemId }, data: { status } });
  revalidatePath(`/sites/${siteId}/content`);
}

export async function generateDraftForItem(siteId: string, itemId: string): Promise<string> {
  const [site, item] = await Promise.all([
    db.site.findUniqueOrThrow({ where: { id: siteId } }),
    db.contentItem.findUniqueOrThrow({ where: { id: itemId } }),
  ]);

  return generateContentDraft({
    siteUrl: site.url,
    clientName: site.clientName,
    businessType: site.businessType,
    title: item.title,
    format: item.format,
    keywordGap: item.keywordGap,
    notes: item.notes,
  });
}

export async function saveDraft(siteId: string, itemId: string, draftContent: string) {
  await db.contentItem.update({ where: { id: itemId }, data: { draftContent } });
  revalidatePath(`/sites/${siteId}/content/${itemId}`);
  revalidatePath(`/sites/${siteId}/content`);
}
