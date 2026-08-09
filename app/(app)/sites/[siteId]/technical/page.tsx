import { db } from "@/lib/db/client";
import { createTechnicalAudit, upsertSchemaMarkup } from "./actions";
import { CWV_STATUSES, SCHEMA_TYPES, label } from "@/lib/constants";
import { buttonClass, cardClass, inputClass, labelClass } from "@/components/ui";
import { TaskFlagFieldset } from "@/components/task-flag-fieldset";

export default async function TechnicalPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const [audits, schemaMarkups] = await Promise.all([
    db.technicalAudit.findMany({ where: { siteId }, orderBy: { auditDate: "desc" }, take: 10 }),
    db.schemaMarkup.findMany({ where: { siteId } }),
  ]);

  const createAudit = createTechnicalAudit.bind(null, siteId);
  const upsertSchema = upsertSchemaMarkup.bind(null, siteId);
  const presentTypes = new Set(schemaMarkups.filter((s) => s.present).map((s) => s.type));

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Log an audit</h2>
        <form action={createAudit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Crawl errors</label>
              <input name="crawlErrors" type="number" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Core Web Vitals</label>
              <select name="coreWebVitalsStatus" defaultValue="" className={inputClass}>
                <option value="">Not checked</option>
                {CWV_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Indexation issues</label>
              <input name="indexationIssues" type="number" min="0" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" rows={2} className={inputClass} />
          </div>
          <TaskFlagFieldset />
          <div>
            <button type="submit" className={buttonClass}>
              Save audit
            </button>
          </div>
        </form>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Schema markup</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {SCHEMA_TYPES.map((type) => (
            <form key={type} action={upsertSchema} className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2">
              <input type="hidden" name="type" value={type} />
              <label className="flex flex-1 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="present"
                  value="1"
                  defaultChecked={presentTypes.has(type)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                {type}
              </label>
              <button type="submit" className="text-xs text-slate-500 hover:text-slate-800">
                Save
              </button>
            </form>
          ))}
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Audit history</h2>
        {audits.length === 0 ? (
          <p className="text-sm text-slate-500">No audits logged yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">Crawl errors</th>
                <th className="pb-2">CWV</th>
                <th className="pb-2">Indexation issues</th>
                <th className="pb-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {audits.map((a) => (
                <tr key={a.id} className="border-t border-slate-100">
                  <td className="py-2">{a.auditDate.toLocaleDateString()}</td>
                  <td className="py-2">{a.crawlErrors ?? "—"}</td>
                  <td className="py-2">{label(a.coreWebVitalsStatus)}</td>
                  <td className="py-2">{a.indexationIssues ?? "—"}</td>
                  <td className="py-2 text-slate-500">{a.notes ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
