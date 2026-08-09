"use server";

import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSite(formData: FormData) {
  const url = String(formData.get("url") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const businessType = String(formData.get("businessType") ?? "").trim() || null;
  const primaryGoal = String(formData.get("primaryGoal") ?? "").trim() || null;

  if (!url || !clientName) {
    throw new Error("URL and client/owner name are required");
  }

  const site = await db.site.create({
    data: { url, clientName, businessType, primaryGoal },
  });

  revalidatePath("/sites");
  redirect(`/sites/${site.id}`);
}

export async function deleteSite(siteId: string) {
  await db.site.delete({ where: { id: siteId } });
  revalidatePath("/sites");
}
