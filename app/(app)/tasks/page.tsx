import { db } from "@/lib/db/client";
import { createManualTask } from "./actions";
import { TaskBoard } from "@/components/task-board";
import { TASK_CATEGORIES, PRIORITIES, label } from "@/lib/constants";
import { buttonClass, cardClass, inputClass, labelClass } from "@/components/ui";

export default async function TaskBoardPage() {
  const [tasks, sites] = await Promise.all([
    db.task.findMany({
      where: { status: { not: "done" } },
      orderBy: { createdAt: "desc" },
      include: { site: { select: { id: true, url: true } } },
    }),
    db.site.findMany({ orderBy: { url: "asc" }, select: { id: true, url: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Task Board</h1>
        <p className="mt-1 text-sm text-slate-600">Everything due across all sites.</p>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Add a task</h2>
        <form action={createManualTask} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className={labelClass}>Site</label>
            <select name="siteId" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Select a site
              </option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.url}
                </option>
              ))}
            </select>
          </div>
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
          <div className="lg:col-span-2">
            <label className={labelClass}>Title</label>
            <input name="title" type="text" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Due date</label>
            <input name="dueDate" type="date" className={inputClass} />
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

      <TaskBoard tasks={tasks} showSite />
    </div>
  );
}
