import { db } from "@/lib/db/client";
import { createManualTask } from "@/app/(app)/tasks/actions";
import { TaskBoard } from "@/components/task-board";
import { TASK_CATEGORIES, PRIORITIES, label } from "@/lib/constants";
import { buttonClass, cardClass, inputClass, labelClass } from "@/components/ui";

export default async function SiteTasksPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const tasks = await db.task.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    include: { site: { select: { id: true, url: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Add a task for this site</h2>
        <form action={createManualTask} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input type="hidden" name="siteId" value={siteId} />
          <div>
            <label className={labelClass}>Category</label>
            <select name="category" defaultValue="technical" className={inputClass}>
              {TASK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {label(c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select name="priority" defaultValue="medium" className={inputClass}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {label(p)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Due date</label>
            <input name="dueDate" type="date" className={inputClass} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelClass}>Title</label>
            <input name="title" type="text" required className={inputClass} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className={labelClass}>Description</label>
            <textarea name="description" rows={2} className={inputClass} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <button type="submit" className={buttonClass}>
              Add task
            </button>
          </div>
        </form>
      </div>

      <TaskBoard tasks={tasks} showSite={false} />
    </div>
  );
}
