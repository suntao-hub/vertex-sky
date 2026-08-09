import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db/client";
import { label } from "@/lib/constants";

const TABS = [
  { href: "", label: "Overview" },
  { href: "/technical", label: "Technical" },
  { href: "/rankings", label: "Rankings" },
  { href: "/content", label: "Content" },
  { href: "/authority", label: "Authority" },
  { href: "/ai-visibility", label: "AI Visibility" },
  { href: "/traffic", label: "Traffic" },
  { href: "/tasks", label: "Tasks" },
];

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;
  const site = await db.site.findUnique({ where: { id: siteId } });
  if (!site) notFound();

  const base = `/sites/${siteId}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/sites" className="text-sm text-slate-500 hover:text-slate-800">
          ← All sites
        </Link>
        <h1 className="mt-1 text-2xl font-semibold">{site.url}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {site.clientName}
          {site.businessType ? ` · ${site.businessType}` : ""}
          {site.primaryGoal ? ` · ${label(site.primaryGoal)}` : ""}
        </p>
      </div>
      <nav className="flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={`${base}${tab.href}`}
            className="rounded-t-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
