import "server-only";
import { db } from "@/lib/db/client";

export async function maybeCreateFinding(input: {
  siteId: string;
  category: "technical" | "content" | "authority" | "ai_visibility";
  summary: string;
  detail?: string | null;
  priority: "low" | "medium" | "high";
  sourceType: string;
  sourceId: string;
}) {
  const finding = await db.finding.create({
    data: {
      siteId: input.siteId,
      category: input.category,
      summary: input.summary,
      detail: input.detail ?? null,
      severity: input.priority,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
    },
  });

  await db.task.create({
    data: {
      siteId: input.siteId,
      category: input.category,
      title: input.summary,
      description: input.detail ?? null,
      priority: input.priority,
      status: "backlog",
      findingId: finding.id,
    },
  });
}
