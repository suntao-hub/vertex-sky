export const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500";

export const labelClass = "block text-xs font-medium text-slate-600 mb-1";

export const buttonClass =
  "inline-flex items-center justify-center rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-sky-300";

export const linkClass = "text-sky-700 hover:text-sky-800 font-medium";

export const cardClass = "rounded-lg border border-slate-200 bg-white p-5 shadow-sm";

export function HintBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-md bg-sky-50 px-3 py-2 text-xs leading-relaxed text-sky-800">
      {children}
    </div>
  );
}

const priorityColors: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
};

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
        priorityColors[priority] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {priority}
    </span>
  );
}

const statusColors: Record<string, string> = {
  backlog: "bg-slate-100 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        statusColors[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}
