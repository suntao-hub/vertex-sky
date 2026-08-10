import "server-only";
import { anthropic } from "@/lib/ai/anthropic";

export type DistributionPosts = {
  linkedin: string;
  twitter: string;
};

export async function generateDistributionPosts(input: {
  siteUrl: string;
  clientName: string;
  title: string;
  url: string | null;
  summary: string | null;
}): Promise<DistributionPosts> {
  const prompt = `Write two short social posts distributing this piece of content. Real, specific, no hype-filler
("game-changer", "excited to announce"). Each post should make someone want to click, not just describe the article.

Site: ${input.siteUrl}
Owner/client: ${input.clientName}
Article title: ${input.title}
Article URL: ${input.url ?? "[URL]"}
What it's about: ${input.summary ?? input.title}

Respond with ONLY a JSON object, no markdown fences, no commentary:
{"linkedin": "...", "twitter": "..."}

linkedin: 3-5 sentences, can use line breaks, ends with the article link on its own line.
twitter: under 260 characters including the link, punchy, one clear hook.`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
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

  const obj = parsed as Record<string, unknown>;
  if (typeof obj.linkedin !== "string" || typeof obj.twitter !== "string") {
    throw new Error("Claude's response was missing linkedin/twitter fields — try again.");
  }

  return { linkedin: obj.linkedin, twitter: obj.twitter };
}
