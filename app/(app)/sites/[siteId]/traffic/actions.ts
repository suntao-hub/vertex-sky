"use server";

import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function createTrafficSnapshot(siteId: string, formData: FormData) {
  const periodStartRaw = String(formData.get("periodStart") ?? "").trim();
  const periodEndRaw = String(formData.get("periodEnd") ?? "").trim();
  if (!periodStartRaw || !periodEndRaw) throw new Error("Period start and end are required");

  const sessions = formData.get("sessions") ? Number(formData.get("sessions")) : null;
  const conversions = formData.get("conversions") ? Number(formData.get("conversions")) : null;
  const source = String(formData.get("source") ?? "manual");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  await db.trafficSnapshot.create({
    data: {
      siteId,
      periodStart: new Date(periodStartRaw),
      periodEnd: new Date(periodEndRaw),
      sessions,
      conversions,
      source,
      notes,
    },
  });

  revalidatePath(`/sites/${siteId}/traffic`);
  revalidatePath(`/sites/${siteId}`);
}
