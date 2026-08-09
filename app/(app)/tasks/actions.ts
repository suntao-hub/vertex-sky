"use server";

import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function createManualTask(formData: FormData) {
  const siteId = String(formData.get("siteId") ?? "").trim();
  const category = String(formData.get("category") ?? "technical");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "medium");
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const dueDate = dueDateRaw ? new Date(dueDateRaw) : null;

  if (!siteId || !title) throw new Error("Site and title are required");

  await db.task.create({
    data: { siteId, category, title, description, priority, dueDate, status: "backlog" },
  });

  revalidatePath("/tasks");
  revalidatePath(`/sites/${siteId}/tasks`);
  revalidatePath(`/sites/${siteId}`);
}

export async function updateTaskStatus(taskId: string, formData: FormData) {
  const status = String(formData.get("status") ?? "backlog");
  const task = await db.task.update({ where: { id: taskId }, data: { status }, select: { siteId: true } });

  revalidatePath("/tasks");
  revalidatePath(`/sites/${task.siteId}/tasks`);
  revalidatePath(`/sites/${task.siteId}`);
}

export async function deleteTask(taskId: string) {
  const task = await db.task.delete({ where: { id: taskId }, select: { siteId: true } });

  revalidatePath("/tasks");
  revalidatePath(`/sites/${task.siteId}/tasks`);
  revalidatePath(`/sites/${task.siteId}`);
}
