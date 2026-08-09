"use server";

import { db } from "@/lib/db/client";
import { maybeCreateFinding } from "@/lib/db/findings";
import { revalidatePath } from "next/cache";

export async function createContentItem(siteId: string, formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const status = String(formData.get("status") ?? "planned");
  const keywordGap = String(formData.get("keywordGap") ?? "").trim() || null;
  const url = String(formData.get("url") ?? "").trim() || null;
  const publishDateRaw = String(formData.get("publishDate") ?? "").trim();
  const publishDate = publishDateRaw ? new Date(publishDateRaw) : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!title) throw new Error("Title is required");

  const item = await db.contentItem.create({
    data: { siteId, title, status, keywordGap, url, publishDate, notes },
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
