import { PRIORITIES, label } from "@/lib/constants";
import { inputClass, labelClass } from "@/components/ui";

export function TaskFlagFieldset() {
  return (
    <fieldset className="mt-2 rounded-md border border-dashed border-slate-300 p-3">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input type="checkbox" name="flagTask" value="1" className="h-4 w-4 rounded border-slate-300" />
        Flag this as an issue and create a task
      </label>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Task summary (optional — auto-filled if blank)</label>
          <input name="taskSummary" type="text" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Priority</label>
          <select name="taskPriority" defaultValue="medium" className={inputClass}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {label(p)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
}
