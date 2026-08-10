import "server-only";
import { anthropic } from "@/lib/ai/anthropic";

export type KeywordSuggestion = {
  keyword: string;
  bucket: "competitor" | "problem" | "category_fit";
  rationale: string;
};

export async function suggestKeywords(input: {
  siteUrl: string;
  clientName: string;
  businessType: string | null;
  primaryGoal: string | null;
  topic: string;
  competitors: string;
  existingKeywords: string[];
}): Promise<KeywordSuggestion[]> {
  const prompt = `You are doing keyword research for an SEO monitoring tool. Suggest 15 target keywords for this site.

Site: ${input.siteUrl}
Owner/client: ${input.clientName}
Business type: ${input.businessType ?? "not specified"}
Primary goal: ${input.primaryGoal ?? "not specified"}
Topic/seed to research: ${input.topic}
Known competitors: ${input.competitors || "none given"}
Already tracked (do not repeat these): ${input.existingKeywords.length ? input.existingKeywords.join(", ") : "none"}

Bucket every keyword into exactly one of these three types:
- "competitor": terms naming a competitor or comparing to one (e.g. "X vs Y", "X alternative")
- "problem": terms describing a pain point or task the buyer has, in their own words, not generic industry jargon
- "category_fit": terms about what category/type of solution this is (e.g. "best X for Y")

Prioritize buyer-intent terms a real customer would type when close to a purchase decision, over broad awareness-stage terms.

Respond with ONLY a JSON array, no markdown fences, no commentary. Each item: {"keyword": string, "bucket": "competitor"|"problem"|"category_fit", "rationale": string (one short sentence on why this term matters)}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  const jsonText = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Claude returned a response that wasn't valid JSON — try again.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Claude's response wasn't a list of suggestions — try again.");
  }

  return parsed
    .filter(
      (item): item is KeywordSuggestion =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).keyword === "string" &&
        ["competitor", "problem", "category_fit"].includes((item as Record<string, unknown>).bucket as string)
    )
    .slice(0, 20);
}
