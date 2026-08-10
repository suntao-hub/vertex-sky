import { db } from "@/lib/db/client";
import { createKeyword, addRankingEntry, deleteKeyword } from "./actions";
import { RANKING_SOURCES, label } from "@/lib/constants";
import { HintBox, buttonClass, cardClass, inputClass, labelClass, secondaryButtonClass } from "@/components/ui";

export default async function RankingsPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const keywords = await db.keyword.findMany({
    where: { siteId },
    orderBy: { createdAt: "desc" },
    include: { entries: { orderBy: { date: "desc" }, take: 5 } },
  });

  const createKw = createKeyword.bind(null, siteId);

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass}>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Add a target keyword</h2>
        <HintBox>
          <strong>Where to find keywords, free:</strong>{" "}
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Search Console
          </a>{" "}
          → Performance report shows real queries this site already gets impressions for — the fastest source of
          keywords worth tracking. Beyond that: think about what a buyer would actually type (competitor names,
          the problem they have, &quot;best X for Y&quot;) rather than guessing generic terms.
        </HintBox>
        <form action={createKw} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Keyword</label>
            <input name="keyword" type="text" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Target URL (optional)</label>
            <input name="targetUrl" type="text" className={inputClass} />
          </div>
          <div className="sm:col-span-3">
            <button type="submit" className={buttonClass}>
              Add keyword
            </button>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-4">
        {keywords.length === 0 ? (
          <p className="text-sm text-slate-500">No keywords tracked yet.</p>
        ) : (
          keywords.map((kw) => {
            const addEntry = addRankingEntry.bind(null, siteId, kw.id);
            const delKw = deleteKeyword.bind(null, siteId, kw.id);
            const latest = kw.entries[0];
            return (
              <div key={kw.id} className={cardClass}>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-slate-900">{kw.keyword}</h3>
                    {kw.targetUrl && <p className="text-xs text-slate-500">{kw.targetUrl}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {latest?.position != null && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        Position {latest.position}
                      </span>
                    )}
                    <form action={delKw}>
                      <button type="submit" className="text-xs text-slate-400 hover:text-red-600">
                        Remove
                      </button>
                    </form>
                  </div>
                </div>

                {kw.entries.length > 0 && (
                  <table className="mb-3 w-full text-left text-sm">
                    <thead className="text-xs uppercase text-slate-400">
                      <tr>
                        <th className="pb-1">Date</th>
                        <th className="pb-1">Position</th>
                        <th className="pb-1">Source</th>
                        <th className="pb-1">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kw.entries.map((e) => (
                        <tr key={e.id} className="border-t border-slate-100">
                          <td className="py-1">{e.date.toLocaleDateString()}</td>
                          <td className="py-1">{e.position ?? "—"}</td>
                          <td className="py-1">{label(e.source)}</td>
                          <td className="py-1 text-slate-500">{e.notes ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <form action={addEntry} className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className={labelClass}>Position</label>
                    <input name="position" type="number" min="1" className={`${inputClass} w-24`} />
                  </div>
                  <div>
                    <label className={labelClass}>Source</label>
                    <select name="source" defaultValue="manual" className={inputClass}>
                      {RANKING_SOURCES.map((s) => (
                        <option key={s} value={s}>
                          {label(s)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className={labelClass}>Notes</label>
                    <input name="notes" type="text" className={inputClass} />
                  </div>
                  <button type="submit" className={secondaryButtonClass}>
                    Log position
                  </button>
                </form>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
