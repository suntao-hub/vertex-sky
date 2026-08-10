import { db } from "@/lib/db/client";
import { createAiVisibilityEntry } from "./actions";
import { AI_PLATFORMS, label } from "@/lib/constants";
import { buttonClass, cardClass, inputClass, labelClass } from "@/components/ui";
import { TaskFlagFieldset } from "@/components/task-flag-fieldset";

export default async function AiVisibilityPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const entries = await db.aiVisibilityEntry.findMany({
    where: { siteId },
    orderBy: { checkedDate: "desc" },
    take: 30,
  });

  const createEntry = createAiVisibilityEntry.bind(null, siteId);

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Check AI visibility for a query</h2>
        <p className="mb-1 text-xs text-slate-500">
          Track whether this site is cited in AI Overviews, ChatGPT, Perplexity, etc. for a target query.
        </p>
        <p className="mb-4 rounded-md bg-sky-50 px-3 py-2 text-xs text-sky-800">
          Quickest check: open an incognito window, type a real buyer question this site should own, and see if it
          gets named. Also worth asking — does this site's product have any agent-callable surface (a documented
          API, an MCP server, a ChatGPT/Claude plugin)? Products AI agents can operate directly are more likely to
          get recommended by those same agents.
        </p>
        <form action={createEntry} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className={labelClass}>Query</label>
              <input name="query" type="text" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Platform</label>
              <select name="platform" defaultValue="ai_overviews" className={inputClass}>
                {AI_PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {label(p)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="cited" value="1" className="h-4 w-4 rounded border-slate-300" />
            Site is cited
          </label>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" rows={2} className={inputClass} />
          </div>
          <TaskFlagFieldset />
          <div>
            <button type="submit" className={buttonClass}>
              Save check
            </button>
          </div>
        </form>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">History</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">No AI visibility checks logged yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-2">Date</th>
                <th className="pb-2">Query</th>
                <th className="pb-2">Platform</th>
                <th className="pb-2">Cited</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="py-2">{e.checkedDate.toLocaleDateString()}</td>
                  <td className="py-2">{e.query}</td>
                  <td className="py-2">{label(e.platform)}</td>
                  <td className="py-2">
                    {e.cited ? (
                      <span className="text-green-700">Yes</span>
                    ) : (
                      <span className="text-slate-400">No</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
