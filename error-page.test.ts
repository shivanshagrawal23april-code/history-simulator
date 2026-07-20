import { assert, assertStringIncludes } from "jsr:@std/assert@1";
import { renderErrorPage } from "./error-page.ts";

Deno.test("renderErrorPage returns a complete HTML document", () => {
  const html = renderErrorPage();
  assertStringIncludes(html, "<!doctype html>");
  assertStringIncludes(html, "<html lang=\"en\">");
  assertStringIncludes(html, "</html>");
  assertStringIncludes(html, "<head>");
  assertStringIncludes(html, "<body>");
});

Deno.test("renderErrorPage includes the user-facing recovery copy", () => {
  const html = renderErrorPage();
  assertStringIncludes(html, "This page didn't load");
  assertStringIncludes(html, "Try again");
  assertStringIncludes(html, "Go home");
});

Deno.test("renderErrorPage wires up the reload and home actions", () => {
  const html = renderErrorPage();
  assertStringIncludes(html, "location.reload()");
  assertStringIncludes(html, "href=\"/\"");
});

Deno.test("renderErrorPage is deterministic", () => {
  assert(renderErrorPage() === renderErrorPage());
});
