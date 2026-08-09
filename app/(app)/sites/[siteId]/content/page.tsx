import { db } from "@/lib/db/client";
import { createContentItem, updateContentStatus } from "./actions";
import { CONTENT_STATUSES, label } from "@/lib/constants";
import { buttonClass, cardClass, inputClass, labelClass } from "@/components/ui";
import { TaskFlagFieldset } from "@/components/task-flag-fieldset";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const items = await db.contentItem.findMany({ where: { siteId }, orderBy: { createdAt: "desc" } });

  const createItem = createContentItem.bind(null, siteId);

  return (
    <div className="flex flex-col gap-6">
      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Add a content item</h2>
        <form action={createItem} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title</label>
              <input name="title" type="text" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select name="status" defaultValue="planned" className={inputClass}>
                {CONTENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {label(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Keyword gap addressed</label>
              <input name="keywordGap" type="text" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>URL (if published)</label>
              <input name="url" type="text" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Publish date</label>
              <input name="publishDate" type="date" className={inputClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Notes</label>
            <textarea name="notes" rows={2} className={inputClass} />
          </div>
          <TaskFlagFieldset />
          <div>
            <button type="submit" className={buttonClass}>
              Save content item
            </button>
          </div>
        </form>
      </div>

      <div className={cardClass}>
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Content pipeline</h2>
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No content items yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const update = updateContentStatus.bind(null, siteId, item.id);
              return (
                <li key={item.id} className="rounded-md border border-slate-200 px-4 py-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-medium text-slate-900">{item.title}</div>
                      {item.keywordGap && (
                        <div className="text-xs text-slate-500">Keyword gap: {item.keywordGap}</div>
                      )}
                      {item.url && <div className="text-xs text-slate-500">{item.url}</div>}
                      {item.notes && <div className="mt-1 text-sm text-slate-600">{item.notes}</div>}
                    </div>
                    <form action={update} className="flex items-center gap-2">
                      <select name="status" defaultValue={item.status} className={`${inputClass} w-auto`}>
                        {CONTENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {label(s)}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs text-slate-500 hover:text-slate-800">
                        Save
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
