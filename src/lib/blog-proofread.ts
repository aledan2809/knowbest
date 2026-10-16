// Readings of every Romanian translation before it is published on the blog (2026-10-16).
//
// The translators (Groq, then AIRouter) write Romanian that reads finished but is not: on the first 12 posts
// a native reader found "clienții tăi îl citește", "Facilităază", "vădă", "Tăcirea", "îți costă", "vă
// comportați" (the blog says «tu»), "două trilioane" and an English sentence left in quotes. Here an editor
// model corrects the text and the other model family reads the result again, back and forth, until one
// reading confirms the text (changes almost nothing). Only then does the page show it; otherwise the post
// keeps its English text and Alex is told why.
//
// Who reads (measured on those 12 posts, 2026-10-16): Gemini corrects well and is free, but answered "high
// demand" to 4-5 of 12; Claude (the server's subscription CLI, never API credit) answered all 12 and
// changed the least. The local models on the Mac made the text worse ("Explică claram", "Facilităza",
// "subiectiv → debil", "un lucru minus"), and Groq's free daily allowance was used up by the translations, so
// neither reads here. Gemini reads first; one family never confirms its own text. With the first version
// (two readings, then stop) 5 of the 12 were held although the second reading only fixed real mistakes
// ("nu depun" → "nu depune", "randat" → "afișat"); alternating until confirmed lets those through.
import { spawn } from "child_process";
import { tmpdir } from "os";
import { cleanAnswer, rejectReason } from "@/lib/blog-translate";

export type EngineFamily = "gemini" | "claude";
export interface Engine {
  family: EngineFamily;
  name: string;
  run: (system: string, user: string) => Promise<string>;
}

export const PROOFREAD_SYSTEM = [
  "You are a native Romanian editor proofreading a machine translation for a company blog.",
  "You get the English original and its Romanian translation. Return the Romanian text a careful native editor would publish:",
  "- fix grammar and agreement (subject–verb, gender, number, case), misspellings and missing diacritics (ă â î ș ț);",
  "- fix sentences that are calques, do not make sense in Romanian, or say something different from the English;",
  "- translate English words or sentences left in the text, except brand and product names, URLs and an interface label quoted on purpose;",
  "- address the reader with «tu» (singular, informal), never «dumneavoastră» or «voi»;",
  '- an English "trillion" is «mii de miliarde» in Romanian and "billion" is «miliard»;',
  "- Romanian quotation marks are „…”.",
  "Change nothing that is already correct and natural: this is proofreading, not rewriting.",
  "Keep every line break, blank line, list marker, number, link, emoji and word written in capitals.",
  "Answer with the corrected Romanian text only: no comments, no notes, no quotation marks around it.",
].join("\n");

export const proofreadPrompt = (english: string, romanian: string, doubtful: string[] = []) =>
  `English original:\n<<<\n${english.trim()}\n>>>\n\nRomanian translation:\n<<<\n${romanian.trim()}\n>>>` +
  (doubtful.length
    ? `\n\nThese words are not in the Romanian dictionary: ${doubtful.join(", ")}. Correct the ones that are misspelled; keep names, brands and established terms as they are.`
    : "");

/** Readings at most, alternating the two families, before a translation that keeps changing is held. */
export const MAX_READINGS = 4;

/** Words a confirming reading may still touch: 3, or 1.5% of a long post. */
export const allowedChanges = (text: string) => Math.max(3, Math.ceil(tokens(text).length * 0.015));

const tokens = (s: string) => s.split(/\s+/).filter(Boolean);

/** How many words one text has to change to become the other (insertions, deletions, replacements). */
export function wordChanges(a: string, b: string): number {
  const x = tokens(a);
  const y = tokens(b);
  // Longest common subsequence of words; a replaced word counts once, not as a deletion plus an insertion.
  const prev = new Array<number>(y.length + 1).fill(0);
  for (let i = 1; i <= x.length; i++) {
    let diag = 0;
    for (let j = 1; j <= y.length; j++) {
      const up = prev[j];
      prev[j] = x[i - 1] === y[j - 1] ? diag + 1 : Math.max(prev[j], prev[j - 1]);
      diag = up;
    }
  }
  const common = prev[y.length];
  return Math.max(x.length, y.length) - common;
}

/** The text two readings are compared on: what a reader sees, not how the quote or the ș was typed. */
export function comparable(s: string): string {
  return s
    .normalize("NFC")
    .replace(/ş/g, "ș").replace(/Ş/g, "Ș").replace(/ţ/g, "ț").replace(/Ţ/g, "Ț")
    .replace(/[„“”«»"]/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[‑–—]/g, "-")
    .replace(/[.,;:!?…()]/g, " ");
}

/** The answer without the markers the prompt uses, and with the Romanian closing quote put back. */
function cleanProofread(answer: string, translation: string): string {
  const text = answer.replace(/^\s*<<<\s*\n?/, "").replace(/\n?\s*>>>\s*$/, "");
  // Claude closes „…” with a straight quote: „terminat" → „terminat”.
  return cleanAnswer(text, translation).replace(/„([^„"”\n]*)"/g, "„$1”");
}

class AllBroken extends Error {}

/** One reading: the first engine whose corrected text passes the checks. `exclude`: a family that may not read. */
async function readOnce(
  engines: Engine[],
  english: string,
  romanian: string,
  exclude?: EngineFamily,
  doubtful: string[] = [],
): Promise<{ text: string; engine: Engine }> {
  const errors: string[] = [];
  let broken = 0;
  for (const engine of engines.filter((e) => e.family !== exclude)) {
    let answer: string;
    try {
      answer = await engine.run(PROOFREAD_SYSTEM, proofreadPrompt(english, romanian, doubtful));
    } catch (e) {
      errors.push(`${engine.name}: ${e instanceof Error ? e.message.slice(0, 120) : "error"}`);
      continue;
    }
    const text = cleanProofread(answer, romanian);
    // A reply cut in the middle of a letter, a preamble, an error message printed as an answer: the next one.
    const bad = !text ? "empty" : text.includes("\uFFFD") ? "broken characters" : rejectReason(english, text);
    if (!bad) return { text, engine };
    broken++;
    errors.push(`${engine.name}: ${bad}`);
  }
  const message = errors.join("; ") || "no proofreader configured";
  throw broken ? new AllBroken(message) : new Error(message);
}

export type Review =
  | { status: "ok"; text: string; by: string; fixes: number }
  | { status: "held"; reason: string }
  | { status: "unavailable"; reason: string };

/**
 * Readings of a translation, alternating Gemini and Claude, until one confirms the text: it changes at most
 * `allowedChanges` words of what the other family wrote. "ok": the text to publish. "held": readers answered
 * but every answer broke the text, or after MAX_READINGS they still kept changing it. "unavailable": a reading
 * got no usable answer (including when the other family is down: one family never confirms itself); nothing
 * is decided and the next run tries again.
 */
export async function reviewTranslation(
  english: string,
  romanian: string,
  engines: Engine[] = defaultEngines(),
  spell: SpellCheck = hunspellUnknown,
): Promise<Review> {
  if (process.env.BLOG_PROOFREAD === "0") return { status: "unavailable", reason: "proofreading switched off (BLOG_PROOFREAD=0)" };
  let text = romanian;
  let previous: Engine | null = null;
  const readers: string[] = [];
  for (let n = 0; n < MAX_READINGS; n++) {
    let reading;
    try {
      reading = await readOnce(engines, english, text, previous?.family);
    } catch (e) {
      const why = e instanceof Error ? e.message : "no answer";
      if (e instanceof AllBroken) return { status: "held", reason: `citirea ${n + 1}: toate corecturile au stricat textul (${why})` };
      return { status: "unavailable", reason: n === 0 ? why : `citirea ${n + 1} (cealaltă familie de modele): ${why}` };
    }
    readers.push(reading.engine.name);
    const changed = wordChanges(comparable(text), comparable(reading.text));
    text = reading.text;
    if (previous && changed <= allowedChanges(text)) {
      return spellingPass(english, romanian, text, readers, engines, spell);
    }
    previous = reading.engine;
  }
  return { status: "held", reason: `după ${MAX_READINGS} citiri (${readers.join(", ")}) corecturile încă nu s-au oprit` };
}

// ---- the dictionary -----------------------------------------------------------------------------------
//
// The readers miss typos: "surpris" (for "surprins") passed both of them and a third reading that was asked
// only to find mistakes. The Romanian hunspell dictionary finds exactly those (on the 12 posts: Lentețea,
// Facilităază, Tăcirea, iata, răspunsă, vădă, testuri, surpris) and otherwise only English or technical words
// the English original also has (SIM, Wi-Fi, blockchainul). So a confirmed text goes through it once more:
// unknown words go back to a reader, named, to correct the misspelled ones. The text passes when that
// reading adds no new unknown word; a word the reader kept on purpose ("procesatorii") stays.

/** Words the dictionary does not know, or null when the dictionary is not installed. */
export type SpellCheck = (text: string) => Promise<string[] | null>;

/** Unknown words that are not English words of the original or Romanian forms of them (blockchain → blockchainul). */
export function suspiciousWords(unknown: string[], english: string): string[] {
  const en = english.toLowerCase().match(/\p{L}+/gu) ?? [];
  const known = new Set(en);
  return [...new Set(unknown.map((w) => w.normalize("NFC")))].filter((w) => {
    const lower = w.toLowerCase();
    return !known.has(lower) && !en.some((e) => e.length >= 4 && lower.startsWith(e));
  });
}

async function spellingPass(
  english: string,
  romanian: string,
  confirmed: string,
  readers: string[],
  engines: Engine[],
  spell: SpellCheck,
): Promise<Review> {
  const ok = (text: string): Review => ({ status: "ok", text, by: [...new Set(readers)].join(" + "), fixes: wordChanges(romanian, text) });
  const unknown = await spell(confirmed);
  if (!unknown) return ok(confirmed); // no dictionary on this machine: the readings stand
  const doubtful = suspiciousWords(unknown, english);
  if (!doubtful.length) return ok(confirmed);
  let reading;
  try {
    reading = await readOnce(engines, english, confirmed, undefined, doubtful);
  } catch (e) {
    const why = e instanceof Error ? e.message : "no answer";
    if (e instanceof AllBroken) return { status: "held", reason: `corectarea cuvintelor ${doubtful.join(", ")} a stricat textul (${why})` };
    return { status: "unavailable", reason: `corectarea cuvintelor ${doubtful.join(", ")}: ${why}` };
  }
  readers.push(reading.engine.name);
  // Only the named words may change, with what grammar needs around them.
  const changed = wordChanges(comparable(confirmed), comparable(reading.text));
  if (changed > doubtful.length * 2 + 2) {
    return { status: "held", reason: `la corectarea cuvintelor ${doubtful.join(", ")}, ${reading.engine.name} a schimbat ${changed} cuvinte` };
  }
  const after = await spell(reading.text);
  const added = after ? suspiciousWords(after, english).filter((w) => !doubtful.includes(w)) : [];
  if (added.length) return { status: "held", reason: `cuvinte necunoscute noi după corectare: ${added.join(", ")}` };
  return ok(reading.text);
}

/** hunspell with the Romanian dictionary (apt: hunspell hunspell-ro), started asynchronously and killed at 10 s. */
export const hunspellUnknown: SpellCheck = (text) =>
  new Promise((resolve) => {
    if (process.env.BLOG_SPELLCHECK === "0") return resolve(null);
    let out = "";
    let done = false;
    const finish = (v: string[] | null) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(v);
    };
    const child = spawn(process.env.HUNSPELL_BIN || "hunspell", ["-i", "UTF-8", "-d", process.env.BLOG_SPELL_DICT || "ro_RO", "-l"], {
      env: { ...process.env, LANG: "C.UTF-8", LC_ALL: "C.UTF-8" },
      stdio: ["pipe", "pipe", "ignore"],
    });
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish(null);
    }, 10_000);
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (d) => (out += d));
    child.on("error", () => finish(null)); // not installed
    child.on("close", (code) => finish(code === 0 ? [...new Set(out.split("\n").map((w) => w.trim()).filter(Boolean))] : null));
    child.stdin.on("error", () => {});
    child.stdin.end(text);
  });

// ---- the engines ---------------------------------------------------------------------------------------

const GEMINI_TIMEOUT_MS = 60_000;
const CLAUDE_TIMEOUT_MS = 120_000;

function gemini(model: string): Engine {
  return {
    family: "gemini",
    name: `gemini/${model}`,
    run: async (system, user) => {
      const key = process.env.GEMINI_API_KEY;
      if (!key) throw new Error("no GEMINI_API_KEY");
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: user }] }],
          generationConfig: { temperature: 0 },
        }),
        signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const text = (data?.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("");
      if (!text.trim()) throw new Error("empty reply");
      return text;
    },
  };
}

// The Claude CLI on the server, on the subscription (CLAUDE_CODE_OAUTH_TOKEN from /etc/environment). Started
// asynchronously and killed at the deadline: a CLI that hangs must not freeze the site (Consult, 2026-08-07).
function claude(model: string): Engine {
  return {
    family: "claude",
    name: `claude-cli/${model}`,
    run: (system, user) =>
      new Promise<string>((resolve, reject) => {
        // No tools, no saved session: it only reads the text it is given.
        const args = ["-p", "--model", model, "--output-format", "text", "--no-session-persistence", "--tools", "", "--system-prompt", system];
        const child = spawn(process.env.CLAUDE_BIN || "claude", args, {
          cwd: tmpdir(),
          stdio: ["pipe", "pipe", "pipe"],
        });
        let out = "";
        let err = "";
        let done = false;
        const finish = (fn: () => void) => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          fn();
        };
        const timer = setTimeout(() => {
          child.kill("SIGTERM");
          setTimeout(() => child.kill("SIGKILL"), 5_000).unref();
          finish(() => reject(new Error("timeout")));
        }, CLAUDE_TIMEOUT_MS);
        // Decoded as text by the stream, not chunk by chunk: a chunk can end in the middle of an „ț”.
        child.stdout.setEncoding("utf8");
        child.stderr.setEncoding("utf8");
        child.stdout.on("data", (d) => (out += d));
        child.stderr.on("data", (d) => (err += d));
        child.on("error", (e) => finish(() => reject(e)));
        child.on("close", (code) =>
          finish(() => (code === 0 && out.trim() ? resolve(out) : reject(new Error(`exit ${code}: ${(err || out).trim().slice(0, 120)}`)))),
        );
        child.stdin.on("error", () => {}); // a CLI that exits early must not crash the process with EPIPE
        child.stdin.end(user);
      }),
  };
}

export function defaultEngines(): Engine[] {
  const geminiModels = (process.env.BLOG_PROOFREAD_GEMINI_MODELS || "gemini-3.5-flash-lite,gemini-3.1-flash-lite")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  const engines: Engine[] = geminiModels.map(gemini);
  if (process.env.BLOG_PROOFREAD_CLAUDE !== "0") engines.push(claude(process.env.BLOG_PROOFREAD_CLAUDE_MODEL || "sonnet"));
  return engines;
}
