"use client";

// ruleid: no-server-api-in-client-components
import { cookies } from "next/headers";

// ruleid: no-server-only-in-client-components
import "server-only";

export async function Client() {
  // ruleid: no-process-env-in-client-components
  const a = process.env.DATABASE_URL ?? "";
  // ok: no-process-env-in-client-components
  const b = process.env.NEXT_PUBLIC_SITE_NAME;
  // ok: no-process-env-in-client-components
  const c = process.env.NODE_ENV;
  // ruleid: no-process-env-in-client-components
  const bracket = process.env["SECRET"];
  // ruleid: no-process-env-in-client-components
  const { SECRET } = process.env;
  // ruleid: no-dynamic-code-execution
  eval("1 + 1");
  // ruleid: no-dynamic-code-execution
  window.eval("1 + 1");
  // ruleid: no-dynamic-code-execution
  setTimeout("run()", 10);
  // ok: no-dynamic-code-execution
  setTimeout(() => {}, 10);
  // ruleid: no-dynamic-code-execution
  const f = new Function("return 1");
  // ok: no-dynamic-code-execution
  const g = JSON.parse("{}");
  // ruleid: no-unsafe-html-sinks
  document.body.innerHTML = "<b>x</b>";
  // ruleid: no-unsafe-html-sinks
  document.write("x");
  // ruleid: no-unsafe-html-sinks
  document.body.insertAdjacentHTML("beforeend", "<b>x</b>");
  // ok: no-unsafe-html-sinks
  document.body.textContent = "x";
  // ruleid: no-secret-in-public-env
  const k = process.env.NEXT_PUBLIC_AUTH_TOKEN;
  // ok: no-secret-in-public-env
  const firebaseKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  // ok: no-secret-in-public-env
  const s = process.env.NEXT_PUBLIC_SITE_NAME;
  // ruleid: no-dangerously-set-inner-html
  const bad = <div dangerouslySetInnerHTML={{ __html: a }} />;
  // ok: no-dangerously-set-inner-html
  const good = <div>{b}{c}{f}{g}{k}{s}</div>;
  const store = await cookies();
  // ruleid: session-cookie-must-be-http-only
  store.set("session", a, { path: "/" });
  // ruleid: session-cookie-must-be-http-only
  store.set("auth-token", a, { httpOnly: true });
  // ok: session-cookie-must-be-http-only
  store.set("session", a, { httpOnly: true, secure: true, sameSite: "lax" });
  // ok: session-cookie-must-be-http-only
  store.set("theme", a, { path: "/" });
  // ruleid: no-ignored-build-errors
  const config = { typescript: { ignoreBuildErrors: true } };
  // ok: no-ignored-build-errors
  const strict = { typescript: { ignoreBuildErrors: false } };
  return [bad, good, firebaseKey, bracket, SECRET, config, strict];
}
