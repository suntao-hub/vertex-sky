"use server";

import { db } from "@/lib/db/client";
import { maybeCreateFinding } from "@/lib/db/findings";
import { revalidatePath } from "next/cache";

export async function createAuthorityEntry(siteId: string, formData: FormData) {
  const backlinkCount = formData.get("backlinkCount") ? Number(formData.get("backlinkCount")) : null;
  const qualityTrend = String(formData.get("qualityTrend") ?? "").trim() || null;
  const notableNewLinks = String(formData.get("notableNewLinks") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const entry = await db.authorityEntry.create({
    data: { siteId, backlinkCount, qualityTrend, notableNewLinks, notes },
  });

  const flagTask = formData.get("flagTask") === "1";
  if (flagTask) {
    const priority = (String(formData.get("taskPriority") ?? "medium")) as "low" | "medium" | "high";
    const summary =
      String(formData.get("taskSummary") ?? "").trim() ||
      `Authority: ${qualityTrend ? qualityTrend + " trend" : "review backlink profile"}`;
    await maybeCreateFinding({
      siteId,
      category: "authority",
      summary,
      detail: notes,
      priority,
      sourceType: "authority_entry",
      sourceId: entry.id,
    });
  }

  revalidatePath(`/sites/${siteId}/authority`);
  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/sites/${siteId}/tasks`);
  revalidatePath("/tasks");
}
