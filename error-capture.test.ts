import { assert, assertEquals } from "jsr:@std/assert@1";
import { FakeTime } from "jsr:@std/testing@1/time";
import { consumeLastCapturedError } from "./error-capture.ts";

// The module records errors via a global "error" / "unhandledrejection"
// listener registered at import time. Each test dispatches through the same
// global bus and then drains it so tests stay independent.

function drain() {
  consumeLastCapturedError();
}

Deno.test("consumeLastCapturedError returns undefined when nothing was captured", () => {
  drain();
  assertEquals(consumeLastCapturedError(), undefined);
});

Deno.test("captures the error carried by a global 'error' event", () => {
  drain();
  const err = new Error("boom");
  globalThis.dispatchEvent(new ErrorEvent("error", { error: err }));
  assertEquals(consumeLastCapturedError(), err);
});

Deno.test("falls back to the event itself when no error field is present", () => {
  drain();
  const event = new ErrorEvent("error");
  globalThis.dispatchEvent(event);
  assertEquals(consumeLastCapturedError(), event);
});

Deno.test("captures the reason from an 'unhandledrejection' event", () => {
  drain();
  const reason = new Error("rejected");
  // PromiseRejectionEvent needs a real (handled) promise to avoid leaks.
  const promise = Promise.reject(reason);
  promise.catch(() => {});
  globalThis.dispatchEvent(
    new PromiseRejectionEvent("unhandledrejection", { promise, reason }),
  );
  assertEquals(consumeLastCapturedError(), reason);
});

Deno.test("consume is single-shot: the second read is undefined", () => {
  drain();
  const err = new Error("once");
  globalThis.dispatchEvent(new ErrorEvent("error", { error: err }));
  assertEquals(consumeLastCapturedError(), err);
  assertEquals(consumeLastCapturedError(), undefined);
});

Deno.test("a captured error expires after the 5s TTL", () => {
  drain();
  using time = new FakeTime();
  const err = new Error("stale");
  globalThis.dispatchEvent(new ErrorEvent("error", { error: err }));
  time.tick(5_001);
  assertEquals(consumeLastCapturedError(), undefined);
});

Deno.test("a captured error is still available just before the TTL elapses", () => {
  drain();
  using time = new FakeTime();
  const err = new Error("fresh");
  globalThis.dispatchEvent(new ErrorEvent("error", { error: err }));
  time.tick(4_999);
  assert(consumeLastCapturedError() === err);
});
