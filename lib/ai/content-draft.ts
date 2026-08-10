import "server-only";
import { anthropic } from "@/lib/ai/anthropic";

const FORMAT_STRUCTURE: Record<string, string> = {
  best_of: `Structure:
1. Intro (3-4 sentences) opening with the real problem or result, not fluff
2. A comparison table immediately after the intro: columns Tool, Best for, Price, Key strength
3. H2 "What to look for in a [category] tool" — the real evaluation criteria
4. H2 "How I evaluated these" — the method
5. H2 "How to choose" — a short decision guide
6. Final recommendation`,
  comparison: `Structure:
1. Intro framing why someone is comparing these two options
2. A head-to-head comparison table
3. A section per major decision factor (pricing, core feature, ease of use, etc.) as a question heading
4. Verdict — who should pick which one, and why`,
  alternative: `Structure:
1. Intro on why someone would be looking for an alternative (the specific pain point with the incumbent)
2. A comparison table of alternatives
3. One section per alternative: what it's best for, one genuine strength, one genuine weakness
4. Verdict`,
  review: `Structure:
1. Intro — what this is and who it's for
2. Overview of the product/service
3. Pros and cons, as two short lists
4. A verdict section
5. A short FAQ (2-3 questions) addressing likely buyer objections`,
  guide: `Structure:
1. Intro framing the task or problem this guide solves
2. Step-by-step or topic sections, each heading phrased as a question
3. A short FAQ (2-3 questions) at the end`,
  other: `Structure: intro, a few clearly-headed sections answering the likely sub-questions a reader has, and a short conclusion.`,
};

export async function generateContentDraft(input: {
  siteUrl: string;
  clientName: string;
  businessType: string | null;
  title: string;
  format: string | null;
  keywordGap: string | null;
  notes: string | null;
}): Promise<string> {
  const format = input.format ?? "other";
  const structure = FORMAT_STRUCTURE[format] ?? FORMAT_STRUCTURE.other;

  const prompt = `Write a draft article for this site, formatted to be quoted by AI answers (ChatGPT, Claude, AI Overviews), not just to rank on Google.

Site: ${input.siteUrl}
Owner/client: ${input.clientName}
Business type: ${input.businessType ?? "not specified"}
Article title: ${input.title}
Format: ${format}
Target keyword / gap this addresses: ${input.keywordGap ?? "not specified"}
Notes: ${input.notes ?? "none"}

${structure}

Formatting rules (these matter more than usual because AI answer engines quote paragraphs out of context):
- Every heading must be phrased as a question a buyer would actually type.
- Answer the question in the first 1-2 sentences directly under each heading, before any elaboration.
- Every paragraph should be self-contained and understandable even if quoted alone, out of context.
- Be specific — real numbers, real specifics — never vague filler like "this is a great option."
- Do NOT invent specific facts you can't know (prices, exact specs, real competitor names unless given). Where a real fact is needed, insert a clear placeholder like [PRICE] or [SPECIFIC FEATURE] instead of making one up.
- Write in Markdown. Use ## for headings, and a Markdown table where the structure calls for a comparison table.

Output ONLY the article in Markdown. No preamble, no commentary about what you're doing.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}
