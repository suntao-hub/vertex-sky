import Link from "next/link";
import { db } from "@/lib/db/client";
import { createSite, deleteSite } from "./actions";
import { PRIMARY_GOALS, label } from "@/lib/constants";
import { buttonClass, cardClass, inputClass, labelClass } from "@/components/ui";
import { getSiteStatusMap, STALE_DAYS } from "@/lib/db/site-status";

export default async function SitesPage() {
  const sites = await db.site.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { tasks: { where: { status: { not: "done" } } } },
      },
    },
  });
  const statusMap = await getSiteStatusMap(sites.map((s) => s.id));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Site Registry</h1>
        <p className="mt-1 text-sm text-slate-600">
          All sites under SEO monitoring — your own properties and client sites.
        </p>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Add a site</h2>
        <form action={createSite} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Site URL</label>
            <input name="url" type="text" required placeholder="https://example.com" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Client / Owner Name</label>
            <input name="clientName" type="text" required placeholder="Acme Co. or Internal" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Business Type</label>
            <input name="businessType" type="text" placeholder="e.g. Ecommerce, SaaS, Local service" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Primary Goal</label>
            <select name="primaryGoal" className={inputClass} defaultValue="">
              <option value="">Select a goal</option>
              {PRIMARY_GOALS.map((g) => (
                <option key={g} value={g}>
                  {label(g)}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className={buttonClass}>
              Add Site
            </button>
          </div>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          {sites.length} site{sites.length === 1 ? "" : "s"}
        </h2>
        {sites.length === 0 ? (
          <p className="text-sm text-slate-500">No sites yet — add one above.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sites.map((site) => {
              const del = deleteSite.bind(null, site.id);
              const status = statusMap.get(site.id);
              return (
                <li
                  key={site.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm transition-colors hover:border-sky-300"
                >
                  <Link href={`/sites/${site.id}`} className="flex-1">
                    <div className="font-medium text-slate-900">{site.url}</div>
                    <div className="mt-0.5 text-sm text-slate-500">
                      {site.clientName}
                      {site.businessType ? ` · ${site.businessType}` : ""}
                      {site.primaryGoal ? ` · ${label(site.primaryGoal)}` : ""}
                    </div>
                  </Link>
                  <div className="flex items-center gap-3">
                    {status && status.needsAttention > 0 && (
                      <span
                        title={`Missing data or nothing logged in the last ${STALE_DAYS} days for ${status.needsAttention} of 6 categories`}
                        className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700"
                      >
                        {status.needsAttention} need{status.needsAttention === 1 ? "s" : ""} attention
                      </span>
                    )}
                    {site._count.tasks > 0 && (
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                        {site._count.tasks} open task{site._count.tasks === 1 ? "" : "s"}
                      </span>
                    )}
                    <form action={del}>
                      <button type="submit" className="text-xs text-slate-400 hover:text-red-600">
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
