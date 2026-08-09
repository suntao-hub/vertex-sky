import Link from "next/link";
import { updateTaskStatus, deleteTask } from "@/app/(app)/tasks/actions";
import { TASK_STATUSES, label } from "@/lib/constants";
import { PriorityBadge, inputClass } from "@/components/ui";

type BoardTask = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  priority: string;
  status: string;
  dueDate: Date | null;
  site: { id: string; url: string };
};

export function TaskBoard({ tasks, showSite = true }: { tasks: BoardTask[]; showSite?: boolean }) {
  const columns = TASK_STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((t) => t.status === status),
  }));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {columns.map((col) => (
        <div key={col.status} className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-700">
            {label(col.status)} <span className="text-slate-400">({col.tasks.length})</span>
          </h3>
          <div className="flex flex-col gap-3">
            {col.tasks.length === 0 && <p className="text-xs text-slate-400">No tasks</p>}
            {col.tasks.map((task) => {
              const update = updateTaskStatus.bind(null, task.id);
              const del = deleteTask.bind(null, task.id);
              return (
                <div key={task.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-slate-900">{task.title}</span>
                    <PriorityBadge priority={task.priority} />
                  </div>
                  {task.description && (
                    <p className="mb-2 text-xs text-slate-500">{task.description}</p>
                  )}
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5">{label(task.category)}</span>
                    {showSite && (
                      <Link href={`/sites/${task.site.id}/tasks`} className="hover:text-slate-800">
                        {task.site.url}
                      </Link>
                    )}
                    {task.dueDate && <span>Due {task.dueDate.toLocaleDateString()}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={update} className="flex items-center gap-1">
                      <select name="status" defaultValue={task.status} className={`${inputClass} py-1 text-xs`}>
                        {TASK_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {label(s)}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs text-slate-500 hover:text-slate-800">
                        Save
                      </button>
                    </form>
                    <form action={del}>
                      <button type="submit" className="text-xs text-slate-400 hover:text-red-600">
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
