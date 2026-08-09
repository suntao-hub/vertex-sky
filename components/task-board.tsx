"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dragOverStatus, setDragOverStatus] = useState<string | null>(null);

  const columns = TASK_STATUSES.map((status) => ({
    status,
    tasks: tasks.filter((t) => t.status === status),
  }));

  function moveTask(taskId: string, status: string) {
    const formData = new FormData();
    formData.set("status", status);
    startTransition(async () => {
      await updateTaskStatus(taskId, formData);
      router.refresh();
    });
  }

  return (
    <div className={`grid grid-cols-1 gap-4 sm:grid-cols-3 ${isPending ? "opacity-70" : ""}`}>
      {columns.map((col) => (
        <div
          key={col.status}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverStatus(col.status);
          }}
          onDragLeave={() => setDragOverStatus((s) => (s === col.status ? null : s))}
          onDrop={(e) => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData("text/plain");
            setDragOverStatus(null);
            if (taskId) moveTask(taskId, col.status);
          }}
          className={`flex flex-col gap-3 rounded-lg p-2 transition-colors ${
            dragOverStatus === col.status ? "bg-sky-50 outline-dashed outline-2 outline-sky-300" : ""
          }`}
        >
          <h3 className="text-sm font-semibold text-slate-700">
            {label(col.status)} <span className="text-slate-400">({col.tasks.length})</span>
          </h3>
          <div className="flex flex-col gap-3">
            {col.tasks.length === 0 && <p className="text-xs text-slate-400">No tasks</p>}
            {col.tasks.map((task) => {
              const del = deleteTask.bind(null, task.id);
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", task.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  className="cursor-grab rounded-lg border border-slate-200 bg-white p-3 shadow-sm active:cursor-grabbing"
                >
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
                    <select
                      defaultValue={task.status}
                      onChange={(e) => moveTask(task.id, e.target.value)}
                      className={`${inputClass} py-1 text-xs`}
                    >
                      {TASK_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {label(s)}
                        </option>
                      ))}
                    </select>
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
