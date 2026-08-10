import { db } from "@/lib/db/client";
import { createTrafficSnapshot } from "./actions";
import { TRAFFIC_SOURCES, label } from "@/lib/constants";
import { HintBox, buttonClass, cardClass, inputClass, labelClass } from "@/components/ui";

export default async function TrafficPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const snapshots = await db.trafficSnapshot.findMany({
    where: { siteId },
    orderBy: { periodEnd: "desc" },
    take: 20,
  });

  const createSnapshot = createTrafficSnapshot.bind(null, siteId);

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass}>
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Log traffic / conversions</h2>
        <HintBox>
          <strong>Where to find this, free:</strong> Sessions —{" "}
          <a href="https://analytics.google.com" target="_blank" rel="noreferrer" className="underline">
            GA4
          </a>{" "}
          → Reports → Acquisition (filter to Organic Search for SEO-specific traffic). Clicks/impressions from
          search specifically — Search Console → Performance report. Conversions depend on what you&apos;ve set up
          as a goal/event in GA4.
        </HintBox>
        <form action={createSnapshot} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Period start</label>
              <input name="periodStart" type="date" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Period end</label>
              <input name="periodEnd" type="date" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Sessions</label>
              <input name="sessions" type="number" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Conversions</label>
              <input name="conversions" type="number" min="0" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Source</label>
              <select name="source" defaultValue="manual" className={inputClass}>
                {TRAFFIC_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" rows={2} className={inputClass} />
          </div>
          <div>
            <button type="submit" className={buttonClass}>
              Save snapshot
            </button>
          </div>
        </form>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">History</h2>
        {snapshots.length === 0 ? (
          <p className="text-sm text-slate-500">No traffic snapshots yet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-400">
              <tr>
                <th className="pb-2">Period</th>
                <th className="pb-2">Sessions</th>
                <th className="pb-2">Conversions</th>
                <th className="pb-2">Source</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="py-2">
                    {s.periodStart.toLocaleDateString()} – {s.periodEnd.toLocaleDateString()}
                  </td>
                  <td className="py-2">{s.sessions ?? "—"}</td>
                  <td className="py-2">{s.conversions ?? "—"}</td>
                  <td className="py-2">{label(s.source)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
