"use server";

import { db } from "@/lib/db/client";
import { maybeCreateFinding } from "@/lib/db/findings";
import { revalidatePath } from "next/cache";

export async function createAiVisibilityEntry(siteId: string, formData: FormData) {
  const query = String(formData.get("query") ?? "").trim();
  const platform = String(formData.get("platform") ?? "other");
  const cited = formData.get("cited") === "1";
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!query) throw new Error("Query is required");

  const entry = await db.aiVisibilityEntry.create({
    data: { siteId, query, platform, cited, notes },
  });

  const flagTask = formData.get("flagTask") === "1";
  if (flagTask) {
    const priority = (String(formData.get("taskPriority") ?? "medium")) as "low" | "medium" | "high";
    const summary =
      String(formData.get("taskSummary") ?? "").trim() ||
      `AI visibility gap — not cited for "${query}" on ${platform}`;
    await maybeCreateFinding({
      siteId,
      category: "ai_visibility",
      summary,
      detail: notes,
      priority,
      sourceType: "ai_visibility_entry",
      sourceId: entry.id,
    });
  }

  revalidatePath(`/sites/${siteId}/ai-visibility`);
  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/sites/${siteId}/tasks`);
  revalidatePath("/tasks");
}
