import { assert, assertEquals } from "jsr:@std/assert@1";
import process from "node:process";
import { getServerConfig } from "./config.server.ts";

Deno.test("getServerConfig reflects the current NODE_ENV", () => {
  const original = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "production";
    assertEquals(getServerConfig().nodeEnv, "production");

    process.env.NODE_ENV = "development";
    assertEquals(getServerConfig().nodeEnv, "development");
  } finally {
    if (original === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = original;
  }
});

Deno.test("getServerConfig reads process.env lazily on each call", () => {
  const original = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = "first";
    const before = getServerConfig().nodeEnv;
    process.env.NODE_ENV = "second";
    const after = getServerConfig().nodeEnv;
    assertEquals(before, "first");
    assertEquals(after, "second");
  } finally {
    if (original === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = original;
  }
});

Deno.test("getServerConfig returns a plain object", () => {
  const cfg = getServerConfig();
  assert(typeof cfg === "object" && cfg !== null);
  assert("nodeEnv" in cfg);
});
