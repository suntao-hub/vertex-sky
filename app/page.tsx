import Link from "next/link";

const CATEGORIES = [
  {
    icon: "⚙️",
    title: "Technical Health",
    desc: "Crawl errors, Core Web Vitals, indexation issues, and schema markup coverage — logged per audit.",
  },
  {
    icon: "📈",
    title: "Rankings",
    desc: "Target keyword lists with position history per site, ready to swap onto live SERP data later.",
  },
  {
    icon: "📝",
    title: "Content Pipeline",
    desc: "Published, in-progress, and planned content mapped to the keyword gap each piece addresses.",
  },
  {
    icon: "🔗",
    title: "Authority",
    desc: "Backlink count and quality trend over time, with notable new links called out.",
  },
  {
    icon: "🤖",
    title: "AI Visibility",
    desc: "Whether a site is cited in AI Overviews, ChatGPT, and Perplexity for its target queries — the fastest-moving layer of SEO right now.",
  },
  {
    icon: "📊",
    title: "Traffic & Conversions",
    desc: "Sessions and conversions per period, pulled from GA4 and Search Console.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white text-slate-900">
      {/* Nav */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-xs font-bold text-white">
              VS
            </div>
            <span className="text-lg font-semibold tracking-tight">Vertex Sky</span>
          </div>
          <Link
            href="/sign-in"
            className="rounded-md border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-slate-200 bg-slate-950 px-6 py-24 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-block rounded-full bg-sky-500/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-sky-300">
            SEO Monitoring &amp; Task System
          </div>
          <h1 className="mb-5 text-5xl font-bold leading-tight tracking-tight">
            Every site&apos;s SEO health,<br />in one task board
          </h1>
          <p className="mx-auto mb-9 max-w-xl text-lg leading-relaxed text-slate-300">
            Track technical health, rankings, content, authority, and AI visibility across your
            own properties and client sites — then turn every finding into a task you can
            actually work through.
          </p>
          <Link
            href="/sign-in"
            className="inline-block rounded-lg bg-sky-500 px-8 py-3.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
          >
            Sign in →
          </Link>
        </div>
      </section>

      {/* Categories grid */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight">
            Six categories, one registry
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-slate-500">
            Every site gets tracked the same way, so nothing falls through the cracks across a
            growing portfolio.
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c) => (
              <div key={c.title} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="mb-3 text-2xl">{c.icon}</div>
                <h3 className="mb-2 font-semibold text-slate-900">{c.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-14 text-center text-3xl font-bold tracking-tight">How it works</h2>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Log a finding",
                desc: "Enter an audit result, ranking, or content gap for any site in your registry.",
              },
              {
                step: "2",
                title: "Flag it as a task",
                desc: "One checkbox turns a finding into a prioritized task, pre-filled with site and category.",
              },
              {
                step: "3",
                title: "Work the board",
                desc: "See everything due across every site in one board, or drill into a single site's queue.",
              },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white">
                  {s.step}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-200 bg-slate-950 px-6 py-16 text-center text-white">
        <h2 className="mb-4 text-2xl font-bold">Ready to see everything in one place?</h2>
        <Link
          href="/sign-in"
          className="inline-block rounded-lg bg-sky-500 px-8 py-3.5 text-sm font-semibold text-slate-950 hover:bg-sky-400"
        >
          Sign in →
        </Link>
      </section>

      <footer className="px-6 py-8 text-center text-xs text-slate-400">
        Vertex Sky — internal SEO monitoring &amp; task system.
      </footer>
    </div>
  );
}
