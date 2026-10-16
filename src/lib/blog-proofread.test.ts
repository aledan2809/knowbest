// Run: npx tsx --test src/lib/blog-proofread.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { allowedChanges, comparable, reviewTranslation as review, suspiciousWords, wordChanges, type Engine, type SpellCheck } from "./blog-proofread";

// Without a dictionary unless a test brings one: the readings alone decide.
const reviewTranslation = (en: string, ro: string, engines: Engine[], spell: SpellCheck = async () => []) => review(en, ro, engines, spell);
/** A dictionary that does not know the given words. */
const dictionary = (unknown: string[]): SpellCheck => async (text) => unknown.filter((w) => text.includes(w));

const EN = "There's a small padlock in the browser bar, and your customers read it fluently.\n\nThe fix costs almost nothing.";
const RO = "Există un mic lacăt în bara browserului, iar clienții tăi îl citește fluent.\n\nRemedierea costă aproape nimic.";
const FIXED = "Există un mic lacăt în bara browserului, iar clienții tăi îl citesc fluent.\n\nRemedierea costă aproape nimic.";
const REWRITTEN = "Bara browserului are un lăcățel pe care toți clienții tăi îl înțeleg imediat.\n\nReparația e aproape gratuită.";
const REWRITTEN2 = "În bara browserului stă un lacăt mic, iar oricare client al tău îl pricepe pe loc.\n\nReparația nu costă aproape nimic.";
const DROPPED = "Există un mic lacăt în bara browserului, iar clienții tăi îl citesc fluent.";

/** An engine that answers from a list, one answer per call; an Error in the list is thrown. */
function engine(family: Engine["family"], name: string, answers: (string | Error)[]): Engine & { calls: string[] } {
  const calls: string[] = [];
  return {
    family,
    name,
    calls,
    run: async (_system, user) => {
      calls.push(user);
      const next = answers.shift();
      if (next === undefined) throw new Error("no more answers");
      if (next instanceof Error) throw next;
      return next;
    },
  };
}

test("wordChanges counts replaced, added and removed words once each", () => {
  assert.equal(wordChanges(RO, RO), 0);
  assert.equal(wordChanges(RO, FIXED), 1);
  assert.equal(wordChanges("a b c", "a x b c"), 1);
  assert.equal(wordChanges("a b c", "a c"), 1);
  assert.equal(wordChanges("a b c", "x y z"), 3);
});

test("cedilla or comma ș/ț, the kind of quote and punctuation are not a disagreement", () => {
  assert.equal(wordChanges(comparable("Ştii că ţine „aşa”."), comparable('Știi că ține "așa"')), 0);
  assert.equal(allowedChanges("cuvânt ".repeat(100)), 3);
  assert.equal(allowedChanges("cuvânt ".repeat(400)), 6);
});

test("a confirming reading that only retypes ș/ț with a comma confirms", async () => {
  const en = "And the country knows that, and you like it.\n\nThat is how it is.";
  const cedilla = "Şi ţara ştie aşa ceva, iar ţie îţi place.\n\nAşa e.";
  const comma = "Și țara știe așa ceva, iar ție îți place.\n\nAșa e.";
  const r = await reviewTranslation(en, cedilla, [engine("gemini", "g", [cedilla]), engine("claude", "c", [comma])]);
  assert.equal(r.status === "ok" && r.text, comma);
});

test("the other family confirms the correction: published, by both", async () => {
  // Gemini could answer every time; the confirming reading still has to come from the other family.
  const g = engine("gemini", "gemini/a", [FIXED, FIXED]);
  const c = engine("claude", "claude-cli/sonnet", [FIXED]);
  const r = await reviewTranslation(EN, RO, [g, c]);
  assert.deepEqual(r, { status: "ok", text: FIXED, by: "gemini/a + claude-cli/sonnet", fixes: 1 });
  assert.equal(g.calls.length, 1);
  // the second reading gets the corrected text, not the original
  assert.match(c.calls[0], /îl citesc/);
});

test("Gemini busy: Claude reads first and Gemini confirms", async () => {
  const g = engine("gemini", "gemini/a", [new Error("503"), FIXED]);
  const c = engine("claude", "claude-cli/sonnet", [FIXED]);
  const r = await reviewTranslation(EN, RO, [g, c]);
  assert.equal(r.status === "ok" && r.by, "claude-cli/sonnet + gemini/a");
});

test("one family never confirms its own text: without the other one, nothing is decided", async () => {
  const r = await reviewTranslation(EN, RO, [engine("gemini", "g1", [FIXED, FIXED]), engine("gemini", "g2", [FIXED])]);
  assert.equal(r.status, "unavailable");
});

test("a small touch-up in the confirming reading is kept", async () => {
  const touched = FIXED.replace("aproape nimic", "aproape deloc");
  const r = await reviewTranslation(EN, RO, [engine("gemini", "g", [FIXED]), engine("claude", "c", [touched])]);
  assert.equal(r.status === "ok" && r.text, touched);
});

test("a second reading that still fixes a lot goes back to the first family, which confirms", async () => {
  const g = engine("gemini", "g", [REWRITTEN, FIXED]);
  const c = engine("claude", "c", [FIXED]);
  const r = await reviewTranslation(EN, RO, [g, c]);
  assert.equal(r.status === "ok" && r.text, FIXED);
  assert.equal(g.calls.length, 2);
});

test("readers that never settle: held after four readings", async () => {
  const r = await reviewTranslation(EN, RO, [engine("gemini", "g", [REWRITTEN, REWRITTEN]), engine("claude", "c", [REWRITTEN2, REWRITTEN2])]);
  assert.equal(r.status, "held");
  assert.match(r.status === "held" ? r.reason : "", /după 4 citiri/);
});

test("a broken answer (a paragraph dropped, broken letters, a preamble) falls through to the next reader", async () => {
  for (const bad of [DROPPED, FIXED.replace("ț", "�"), `Iată textul corectat:\n${FIXED}`]) {
    const g = engine("gemini", "g", [bad, FIXED]);
    const c = engine("claude", "c", [FIXED]);
    const r = await reviewTranslation(EN, RO, [g, c]);
    assert.equal(r.status, "ok", bad.slice(0, 30));
    assert.equal(r.status === "ok" && r.by, "c + g");
  }
});

test("every reader breaks the text: held", async () => {
  const r = await reviewTranslation(EN, RO, [engine("gemini", "g", [DROPPED]), engine("claude", "c", [DROPPED])]);
  assert.equal(r.status, "held");
  assert.match(r.status === "held" ? r.reason : "", /au stricat textul/);
});

test("nobody answers, or the other family is down: nothing is decided", async () => {
  const none = await reviewTranslation(EN, RO, [engine("gemini", "g", [new Error("503")]), engine("claude", "c", [new Error("timeout")])]);
  assert.equal(none.status, "unavailable");
  const half = await reviewTranslation(EN, RO, [engine("gemini", "g", [FIXED]), engine("claude", "c", [new Error("timeout")])]);
  assert.equal(half.status, "unavailable");
});

test("prompt markers are removed and a straight closing quote after „ becomes ”", async () => {
  const quoted = FIXED.replace("fluent", "„fluent”");
  const r = await reviewTranslation(EN, RO, [engine("gemini", "g", [`<<<\n${quoted}\n>>>`]), engine("claude", "c", [quoted.replace("”", '"')])]);
  assert.equal(r.status === "ok" && r.text, quoted);
});

test("BLOG_PROOFREAD=0 switches the readings off: nothing gets published", async () => {
  process.env.BLOG_PROOFREAD = "0";
  try {
    const r = await reviewTranslation(EN, RO, [engine("gemini", "g", [FIXED]), engine("claude", "c", [FIXED])]);
    assert.equal(r.status, "unavailable");
  } finally {
    delete process.env.BLOG_PROOFREAD;
  }
});

test("suspicious words: unknown to the dictionary and not English words of the original or forms of them", () => {
  const en = "Every few months a headline says blockchain will unlock it. Use mobile data, not the office Wi-Fi, and the second SIM.";
  assert.deepEqual(suspiciousWords(["blockchainul", "Wi", "SIM", "surpris", "procesatorii", "surpris"], en), ["surpris", "procesatorii"]);
});

test("a misspelled word the readers missed goes back to a reader, named, and the fix is published", async () => {
  const typo = FIXED.replace("îl citesc", "îl citesk");
  const g = engine("gemini", "g", [typo, FIXED]);
  const c = engine("claude", "c", [typo]);
  const r = await reviewTranslation(EN, RO, [g, c], dictionary(["citesk"]));
  assert.equal(r.status === "ok" && r.text, FIXED);
  assert.match(g.calls[1], /not in the Romanian dictionary: citesk/);
});

test("a word the reader keeps on purpose stays; no dictionary means the readings stand", async () => {
  const term = FIXED.replace("browserului", "procesatorului");
  const kept = await reviewTranslation(EN, RO, [engine("gemini", "g", [term, term]), engine("claude", "c", [term])], dictionary(["procesatorului"]));
  assert.equal(kept.status === "ok" && kept.text, term);
  const none = await reviewTranslation(EN, RO, [engine("gemini", "g", [FIXED]), engine("claude", "c", [FIXED])], async () => null);
  assert.equal(none.status, "ok");
});

test("the spelling fix adds a new unknown word, or rewrites the text: held", async () => {
  const typo = FIXED.replace("îl citesc", "îl citesk");
  const worse = FIXED.replace("îl citesc", "îl citeskk");
  const added = await reviewTranslation(EN, RO, [engine("gemini", "g", [typo, worse]), engine("claude", "c", [typo])], dictionary(["citesk", "citeskk"]));
  assert.match(added.status === "held" ? added.reason : "", /cuvinte necunoscute noi/);
  const rewrite = await reviewTranslation(EN, RO, [engine("gemini", "g", [typo, REWRITTEN]), engine("claude", "c", [typo])], dictionary(["citesk"]));
  assert.match(rewrite.status === "held" ? rewrite.reason : "", /a schimbat \d+ cuvinte/);
});
