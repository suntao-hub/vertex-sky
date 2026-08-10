export const PRIMARY_GOALS = ["traffic", "leads", "affiliate_revenue"] as const;
export const PRIORITIES = ["low", "medium", "high"] as const;
export const TASK_STATUSES = ["backlog", "in_progress", "done"] as const;
export const TASK_CATEGORIES = ["technical", "content", "authority", "ai_visibility"] as const;
export const CWV_STATUSES = ["good", "needs_improvement", "poor"] as const;
export const SCHEMA_TYPES = ["LocalBusiness", "Product", "Article", "FAQ", "Organization", "BreadcrumbList", "Review"] as const;
export const QUALITY_TRENDS = ["improving", "stable", "declining"] as const;
export const AI_PLATFORMS = ["ai_overviews", "chatgpt", "perplexity", "gemini", "other"] as const;
export const CONTENT_STATUSES = ["planned", "in_progress", "published"] as const;
export const CONTENT_FORMATS = ["review", "guide", "best_of", "comparison", "alternative", "other"] as const;
export const RANKING_SOURCES = ["manual", "dataforseo"] as const;
export const TRAFFIC_SOURCES = ["manual", "ga4", "gsc"] as const;

export const LABELS: Record<string, string> = {
  traffic: "Traffic",
  leads: "Leads",
  affiliate_revenue: "Affiliate Revenue",
  low: "Low",
  medium: "Medium",
  high: "High",
  backlog: "Backlog",
  in_progress: "In Progress",
  done: "Done",
  technical: "Technical",
  content: "Content",
  authority: "Authority",
  ai_visibility: "AI Visibility",
  good: "Good",
  needs_improvement: "Needs Improvement",
  poor: "Poor",
  improving: "Improving",
  stable: "Stable",
  declining: "Declining",
  ai_overviews: "AI Overviews",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  gemini: "Gemini",
  other: "Other",
  planned: "Planned",
  published: "Published",
  manual: "Manual",
  dataforseo: "DataForSEO",
  ga4: "GA4",
  gsc: "Search Console",
  review: "Review",
  guide: "Guide",
  best_of: "Best-of List",
  comparison: "X vs Y Comparison",
  alternative: "Alternatives Page",
};

export function label(value: string | null | undefined): string {
  if (!value) return "—";
  return LABELS[value] ?? value;
}
