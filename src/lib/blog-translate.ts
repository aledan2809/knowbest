// English → Romanian for the blog's LinkedIn posts (2026-10-16).
//
// Borrowed from CONSJ (src/lib/translate.ts): a long free-first provider chain, `translatedBy` recorded, and
// checks that REFUSE a plausible-looking but wrong answer instead of saving it — a model that drops a
// paragraph, changes a link or leaves lines in English produces text that reads finished. Unlike CONSJ the
// text is short and plain (LinkedIn posts, ~600 characters), so it goes in one request, and a failed
// translation only means the Romanian page keeps showing the English original.
//
// Groq's gpt-oss models count hidden reasoning in the reply allowance and came back cut off or empty with
// the default effort (measured in Prompt Architect, 2026-10-15); asked directly with less reasoning they
// finish. AIRouter cannot pass that option, so they are asked directly first and the router follows.
import { ALL_PROVIDER_IDS, AIRouter } from "ai-router";
import type { AIProviderID } from "ai-router";

const REQUEST_TIMEOUT_MS = 60_000;

const GROQ_DIRECT = [
  { model: "openai/gpt-oss-120b", effort: "low" },
  { model: "qwen/qwen3.8-27b", effort: "none" },
  // openai/gpt-oss-20b is left out on purpose: on 33 posts (2026-10-16) it wrote "când vrei SAU" for
  // "when you want the HOW", "Unde-ar fi în Dubai acum", "Când îmi uit un site" and left English words in.
  // A post waits for the next run in English rather than going out like that.
] as const;

const SYSTEM_PROMPT = [
  "You translate LinkedIn posts from English into Romanian for a company blog.",
  "Write natural Romanian with diacritics (ă, â, î, ș, ț) and address the reader with «tu».",
  "Keep the meaning exactly: add nothing, drop nothing, no comments of your own.",
  "Keep every line break and every blank line exactly where it is: the answer has the same number of lines.",
  "Words written in capitals for emphasis (WHAT, HOW, WHY) are translated by meaning and stay in capitals: «tells you WHAT needs attention» → «îți spune CE trebuie îmbunătățit», «when you want the HOW» → «când vrei să știi CUM».",
  "Copy unchanged: URLs, @mentions, #hashtags, emojis, numbers, prices, dates and product or brand names (AVE, KnowBest, TechBiz, LinkedIn, Google).",
  "Answer with the Romanian text only.",
].join("\n");

let router: AIRouter | null = null;
function getRouter(): AIRouter {
  if (!router) {
    // Every provider AIRouter knows, the free ones first; a provider without a key is skipped, so one
    // added later joins on its own. claude-cli is left out: it is not installed on the server and its
    // spawn timeout made each failed field wait (CONSJ, measured).
    const preferred = ["gemini", "mistral", "cohere", "groq"];
    const rest = (ALL_PROVIDER_IDS as string[]).filter((p) => !preferred.includes(p) && p !== "claude-cli");
    router = new AIRouter({
      projectName: "knowbest",
      defaultProvider: "auto",
      providers: [...preferred, ...rest] as AIProviderID[],
    });
  }
  return router;
}

type Messages = { role: "system" | "user"; content: string }[];

async function groqDirect(messages: Messages, maxTokens: number, model: string, effort: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("no GROQ_API_KEY");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.2, reasoning_effort: effort }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text().catch(() => "")).slice(0, 160)}`);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("empty reply");
  return content;
}

/** Answers from every model in order, until one passes the checks. */
async function* answers(text: string): AsyncGenerator<{ text: string; by: string }> {
  const messages: Messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: text },
  ];
  const maxTokens = Math.min(4000, Math.ceil(text.length / 2) + 600);
  for (const { model, effort } of GROQ_DIRECT) {
    try {
      yield { text: await groqDirect(messages, maxTokens, model, effort), by: `groq/${model}` };
    } catch {
      // next model
    }
  }
  try {
    const res = await Promise.race([
      getRouter().chat({ messages, maxTokens, temperature: 0.2, languageHint: "ro", taskHint: "translation", thinkingBudget: 0 }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), REQUEST_TIMEOUT_MS)),
    ]);
    if (res.content?.trim()) yield { text: res.content, by: `${res.provider}/${res.model}` };
  } catch {
    // no model answered
  }
}

const URL_RE = /https?:\/\/[^\s)]+/g;
const RO_SIGNAL = /[ăâîșțşţ]|\b(și|în|pentru|că|sau|este|sunt|nu|cu|la|pe|din|care|mai|dacă|tău|ta|ți)\b/giu;
const EN_WORDS = /\b(the|and|you|your|with|that|this|for|of|roughly|just|which|what|when|isn't|don't)\b/gi;
const nonEmptyLines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

/** Why a translation is refused, or null when it passes. */
export function rejectReason(source: string, translated: string): string | null {
  const src = nonEmptyLines(source);
  const out = nonEmptyLines(translated);
  if (!out.length) return "empty";
  if (src.length !== out.length) return `lines ${out.length}/${src.length}`;
  const ratio = translated.length / source.length;
  if (source.length > 80 && (ratio < 0.7 || ratio > 1.9)) return `length ${ratio.toFixed(2)}`;
  for (const url of source.match(URL_RE) ?? []) if (!translated.includes(url)) return `link changed ${url}`;
  // A whole line of five or more words that came back word for word was not translated.
  const leftovers = out.filter((l) => l.split(/\s+/).length >= 5 && src.includes(l) && !/^(https?:|#|@)/.test(l));
  if (leftovers.length) return `english left: ${leftovers[0].slice(0, 60)}`;
  // English left inside the Romanian text. Quoted phrases and links are not counted: a post may quote an
  // English button or page title on purpose.
  const unquoted = translated.replace(/„[^”]*”|“[^”]*”|"[^"]*"|«[^»]*»/g, " ").replace(URL_RE, " ");
  const english = unquoted.match(EN_WORDS) ?? [];
  if (english.length >= 2) return `english words: ${english.slice(0, 3).join(" ")}`;
  const words = translated.split(/\s+/).length;
  if (words >= 20 && (translated.match(RO_SIGNAL)?.length ?? 0) < 3) return "not romanian";
  return null;
}

function clean(answer: string, source: string): string {
  const text = answer
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/^```[a-z]*\n?|\n?```$/g, "")
    .trim();
  // Quotes the model wrapped around its answer; never ones the post itself starts with.
  return /^["«„“]/.test(source) ? text : text.replace(/^["«„“]([\s\S]*)["»”]$/, "$1").trim();
}

export async function translateToRomanian(text: string): Promise<{ ok: true; text: string; by: string } | { ok: false; reason: string }> {
  let last = "no model answered";
  for await (const answer of answers(text.trim())) {
    const translated = clean(answer.text, text.trim());
    const reason = rejectReason(text.trim(), translated);
    if (!reason) return { ok: true, text: translated, by: answer.by };
    last = `${answer.by}: ${reason}`;
  }
  return { ok: false, reason: last };
}
