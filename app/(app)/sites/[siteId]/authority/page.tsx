import { db } from "@/lib/db/client";
import { createAuthorityEntry } from "./actions";
import { QUALITY_TRENDS, label } from "@/lib/constants";
import { HintBox, buttonClass, cardClass, inputClass, labelClass } from "@/components/ui";
import { TaskFlagFieldset } from "@/components/task-flag-fieldset";

export default async function AuthorityPage({
  params,
  searchParams,
}: {
  params: Promise<{ siteId: string }>;
  searchParams: Promise<{ prefill?: string }>;
}) {
  const { siteId } = await params;
  const { prefill } = await searchParams;
  const entries = await db.authorityEntry.findMany({ where: { siteId }, orderBy: { date: "desc" }, take: 20 });

  const createEntry = createAuthorityEntry.bind(null, siteId);

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass}>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Log an authority snapshot</h2>
        <HintBox>
          <strong>Where to find backlinks, free:</strong>{" "}
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Search Console
          </a>{" "}
          → Links report shows every site linking to you — first-party data, no limits. For a broader (but
          rate-limited) view of competitors too, Ahrefs and Moz both offer free backlink checkers with a handful
          of lookups per day.
        </HintBox>
        {prefill && (
          <p className="mb-4 rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-800">
            Logging distribution for a published content item — edit the note below as needed.
          </p>
        )}
        <form action={createEntry} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Backlink count</label>
              <input name="backlinkCount" type="number" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Quality trend</label>
              <select name="qualityTrend" defaultValue="" className={inputClass}>
                <option value="">Not assessed</option>
                {QUALITY_TRENDS.map((t) => (
                  <option key={t} value={t}>
                    {label(t)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Notable new links</label>
            <textarea name="notableNewLinks" rows={2} defaultValue={prefill ?? ""} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" rows={2} className={inputClass} />
          </div>
          <TaskFlagFieldset />
          <div>
            <button type="submit" className={buttonClass}>
              Save entry
            </button>
          </div>
        </form>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">History</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">No authority entries yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">Backlinks</th>
                <th className="pb-2">Trend</th>
                <th className="pb-2">Notable new links</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="py-2">{e.date.toLocaleDateString()}</td>
                  <td className="py-2">{e.backlinkCount ?? "—"}</td>
                  <td className="py-2">{label(e.qualityTrend)}</td>
                  <td className="py-2 text-slate-500">{e.notableNewLinks ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
