"use server";

import { db } from "@/lib/db/client";
import { maybeCreateFinding } from "@/lib/db/findings";
import { revalidatePath } from "next/cache";

export async function createTechnicalAudit(siteId: string, formData: FormData) {
  const crawlErrors = formData.get("crawlErrors") ? Number(formData.get("crawlErrors")) : null;
  const coreWebVitalsStatus = String(formData.get("coreWebVitalsStatus") ?? "").trim() || null;
  const indexationIssues = formData.get("indexationIssues") ? Number(formData.get("indexationIssues")) : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const audit = await db.technicalAudit.create({
    data: { siteId, crawlErrors, coreWebVitalsStatus, indexationIssues, notes },
  });

  const flagTask = formData.get("flagTask") === "1";
  if (flagTask) {
    const priority = (String(formData.get("taskPriority") ?? "medium")) as "low" | "medium" | "high";
    const summary =
      String(formData.get("taskSummary") ?? "").trim() ||
      `Technical audit issue — ${crawlErrors ?? 0} crawl errors, CWV: ${coreWebVitalsStatus ?? "unknown"}`;
    await maybeCreateFinding({
      siteId,
      category: "technical",
      summary,
      detail: notes,
      priority,
      sourceType: "technical_audit",
      sourceId: audit.id,
    });
  }

  revalidatePath(`/sites/${siteId}/technical`);
  revalidatePath(`/sites/${siteId}`);
  revalidatePath(`/sites/${siteId}/tasks`);
  revalidatePath("/tasks");
}

export async function upsertSchemaMarkup(siteId: string, formData: FormData) {
  const type = String(formData.get("type") ?? "").trim();
  const present = formData.get("present") === "1";
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!type) throw new Error("Schema type is required");

  const existing = await db.schemaMarkup.findFirst({ where: { siteId, type } });
  if (existing) {
    await db.schemaMarkup.update({
      where: { id: existing.id },
      data: { present, notes, lastChecked: new Date() },
    });
  } else {
    await db.schemaMarkup.create({ data: { siteId, type, present, notes } });
  }

  revalidatePath(`/sites/${siteId}/technical`);
}
