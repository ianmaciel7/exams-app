import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Lighthouse runs with its default mobile profile: a Moto G Power sized
// screen, simulated slow 4G and a 4x CPU slowdown.
export const defaultBudget = {
  categories: {
    accessibility: 0.95,
    "best-practices": 0.9,
    seo: 0.9,
    // A regression floor, not a target: the simulated mobile score varies
    // between runners by several points.
    performance: 0.4,
  },
  audits: {
    // Core Web Vitals "good" threshold.
    "cumulative-layout-shift": 0.1,
  },
};

export const defaultRoutes = ["/", "/sign-in"];

// Extra audit ceilings per route. The home hero renders on the server, so its
// LCP is held well under the ~6 s it took while it waited for Firebase. The
// margin over the Core Web Vitals 2.5 s covers runner variance.
export const routeBudgets = {
  "/": { audits: { "largest-contentful-paint": 4000 } },
};

export function budgetFor(route, budget = defaultBudget) {
  const extra = routeBudgets[route];
  return {
    categories: { ...budget.categories, ...extra?.categories },
    audits: { ...budget.audits, ...extra?.audits },
  };
}

export function evaluateLighthouseReport(report, budget = defaultBudget) {
  const failures = [];
  for (const [id, minimum] of Object.entries(budget.categories)) {
    const score = report.categories?.[id]?.score;
    if (typeof score !== "number") {
      failures.push(`Category ${id} is missing from the report.`);
    } else if (score < minimum) {
      failures.push(
        `${id} scored ${Math.round(score * 100)}, below ${Math.round(minimum * 100)}.`,
      );
    }
  }
  for (const [id, maximum] of Object.entries(budget.audits)) {
    const value = report.audits?.[id]?.numericValue;
    if (typeof value !== "number") {
      failures.push(`Audit ${id} is missing from the report.`);
    } else if (value > maximum) {
      failures.push(`${id} is ${value.toFixed(3)}, above ${maximum}.`);
    }
  }
  return failures;
}

export function summarizeLighthouseReport(report) {
  const scores = Object.values(report.categories ?? {})
    .map((category) => `${category.id} ${Math.round(category.score * 100)}`)
    .join(", ");
  const lcp = report.audits?.["largest-contentful-paint"]?.displayValue;
  const cls = report.audits?.["cumulative-layout-shift"]?.displayValue;
  return `${scores}; LCP ${lcp}; CLS ${cls}`;
}

async function isServing(url) {
  try {
    return (await fetch(url)).ok;
  } catch {
    return false;
  }
}

async function startServerIfNeeded(baseUrl) {
  if (await isServing(baseUrl)) return null;
  const { port } = new URL(baseUrl);
  // Its own process group, so stopping it also stops the Next.js child.
  const server = spawn("pnpm", ["start", "--port", port || "3000"], {
    detached: true,
    stdio: "ignore",
  });
  for (let attempt = 0; attempt < 60; attempt++) {
    if (await isServing(baseUrl)) return server;
    await new Promise((done) => setTimeout(done, 1000));
  }
  stopServer(server);
  throw new Error(`No server answered at ${baseUrl}. Run pnpm build first.`);
}

function stopServer(server) {
  if (server?.pid) process.kill(-server.pid, "SIGTERM");
}

async function resolveChromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const { chromium } = await import("@playwright/test");
  return chromium.executablePath();
}

async function main() {
  const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
  const baseUrl = process.env.LIGHTHOUSE_BASE_URL ?? "http://127.0.0.1:3000";
  const outputDir = join(repoRoot, "reports/lighthouse");
  mkdirSync(outputDir, { recursive: true });
  const chromePath = await resolveChromePath();
  const server = await startServerIfNeeded(baseUrl);
  let failed = false;
  try {
    for (const route of defaultRoutes) {
      const name = route === "/" ? "home" : route.replaceAll("/", "");
      const outputBase = join(outputDir, name);
      const run = spawnSync(
        "pnpm",
        [
          "exec",
          "lighthouse",
          new URL(route, baseUrl).href,
          "--quiet",
          "--output=json",
          "--output=html",
          `--output-path=${outputBase}`,
          "--chrome-flags=--headless=new --no-sandbox",
        ],
        {
          env: { ...process.env, CHROME_PATH: chromePath },
          stdio: "inherit",
        },
      );
      if (run.status !== 0) {
        console.error(`Lighthouse failed to run on ${route}.`);
        failed = true;
        continue;
      }
      const report = JSON.parse(
        readFileSync(`${outputBase}.report.json`, "utf8"),
      );
      console.log(`${route}: ${summarizeLighthouseReport(report)}`);
      for (const failure of evaluateLighthouseReport(
        report,
        budgetFor(route),
      )) {
        console.error(`${route}: ${failure}`);
        failed = true;
      }
    }
  } finally {
    stopServer(server);
  }
  if (failed) process.exitCode = 1;
  else console.log("Lighthouse mobile budgets passed.");
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  await main();
}
