import { assert, assertEquals, assertExists } from "jsr:@std/assert@1";
import {
  DEFAULT_MODE,
  getMode,
  MODES,
  type Mode,
  type ModeId,
} from "./historyverse-modes.ts";

const EXPECTED_IDS: ModeId[] = [
  "explorer",
  "alternate",
  "civilization",
  "figure",
  "timeline",
  "geopolitics",
  "debate",
  "forecast",
  "research",
  "learn",
];

Deno.test("MODES contains every declared mode id exactly once", () => {
  const ids = MODES.map((m) => m.id);
  assertEquals(ids.length, EXPECTED_IDS.length);
  assertEquals(new Set(ids).size, ids.length, "mode ids must be unique");
  for (const id of EXPECTED_IDS) {
    assert(ids.includes(id), `missing mode: ${id}`);
  }
});

Deno.test("every mode has fully populated, non-empty fields", () => {
  for (const mode of MODES) {
    assert(mode.name.trim().length > 0, `${mode.id} name`);
    assert(mode.tagline.trim().length > 0, `${mode.id} tagline`);
    assert(mode.description.trim().length > 0, `${mode.id} description`);
    assert(mode.icon.trim().length > 0, `${mode.id} icon`);
    assert(mode.accent.trim().length > 0, `${mode.id} accent`);
    assert(mode.systemPrompt.trim().length > 0, `${mode.id} systemPrompt`);
    assert(Array.isArray(mode.suggestions), `${mode.id} suggestions is array`);
    assert(mode.suggestions.length > 0, `${mode.id} has suggestions`);
    for (const s of mode.suggestions) {
      assert(s.trim().length > 0, `${mode.id} suggestion non-empty`);
    }
  }
});

Deno.test("every systemPrompt embeds the shared base framework and its own active-mode line", () => {
  for (const mode of MODES) {
    assert(
      mode.systemPrompt.includes("You are HistoryVerse AI"),
      `${mode.id} should include the base framework`,
    );
    assert(
      mode.systemPrompt.includes("ACTIVE MODE:"),
      `${mode.id} should declare its active mode`,
    );
  }
});

Deno.test("getMode returns the matching mode for a known id", () => {
  for (const id of EXPECTED_IDS) {
    const mode: Mode = getMode(id);
    assertEquals(mode.id, id);
  }
});

Deno.test("getMode falls back to the first mode for unknown ids", () => {
  const fallback = MODES[0];
  assertEquals(getMode("does-not-exist").id, fallback.id);
  assertEquals(getMode("").id, fallback.id);
});

Deno.test("getMode falls back to the first mode for null / undefined", () => {
  const fallback = MODES[0];
  assertEquals(getMode(null).id, fallback.id);
  assertEquals(getMode(undefined).id, fallback.id);
});

Deno.test("DEFAULT_MODE is a real, resolvable mode id", () => {
  assertExists(MODES.find((m) => m.id === DEFAULT_MODE));
  assertEquals(DEFAULT_MODE, "explorer");
  // The default mode resolves to itself through getMode.
  assertEquals(getMode(DEFAULT_MODE).id, DEFAULT_MODE);
});
