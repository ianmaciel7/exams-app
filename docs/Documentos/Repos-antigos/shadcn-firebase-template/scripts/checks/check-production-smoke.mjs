import { lookup } from "node:dns/promises";
import { request as httpsRequest } from "node:https";
import { BlockList, isIP } from "node:net";
import { fileURLToPath } from "node:url";

const blocked = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
]) {
  blocked.addSubnet(address, prefix, "ipv4");
}
for (const [address, prefix] of [
  ["::", 128],
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
  ["2001:db8::", 32],
]) {
  blocked.addSubnet(address, prefix, "ipv6");
}

export async function validateProductionOrigin(raw, resolveHost = lookup) {
  if (typeof raw !== "string" || !raw) {
    throw new Error("A public HTTPS deployment origin is required.");
  }
  const target = new URL(raw);
  if (
    target.protocol !== "https:" ||
    target.username ||
    target.password ||
    target.search ||
    target.hash ||
    target.pathname !== "/" ||
    target.port
  ) {
    throw new Error(
      "Use an HTTPS origin without credentials, ports, paths or query.",
    );
  }

  const host = target.hostname;
  if (
    !host.includes(".") ||
    host.startsWith("[") ||
    isIP(host) !== 0 ||
    !/^[a-z0-9][a-z0-9.-]*[a-z0-9]$/.test(host) ||
    /(?:^|\.)(?:localhost|local|internal|test|invalid|example)$/.test(host)
  ) {
    throw new Error("Production smoke requires a public DNS hostname.");
  }

  const addresses = await resolveHost(host, { all: true });
  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new Error("Deployment host did not resolve.");
  }
  for (const record of addresses) {
    const type = record.family === 6 ? "ipv6" : "ipv4";
    if (
      isIP(record.address) !== record.family ||
      blocked.check(record.address, type)
    ) {
      throw new Error("Deployment DNS resolves to a non-public address.");
    }
  }
  return { target, record: addresses[0] };
}

export function requestProductionHtml(target, record, locale) {
  return new Promise((resolve, reject) => {
    const request = httpsRequest(
      target,
      {
        method: "GET",
        family: record.family,
        lookup: (_hostname, _options, callback) =>
          callback(null, record.address, record.family),
        timeout: 15000,
        headers: { accept: "text/html", cookie: `NEXT_LOCALE=${locale}` },
      },
      (response) => {
        let html = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          html += chunk;
          if (html.length > 2_000_000) {
            request.destroy(
              new Error("Production HTML exceeds smoke test limit."),
            );
          }
        });
        response.on("error", reject);
        response.on("end", () => {
          resolve({
            status: response.statusCode,
            contentType: response.headers["content-type"] ?? "",
            html,
          });
        });
      },
    );
    request.on("timeout", () =>
      request.destroy(new Error("Production request timeout.")),
    );
    request.on("error", reject);
    request.end();
  });
}

export async function runProductionSmoke(
  raw,
  { resolveHost = lookup, readHtml = requestProductionHtml } = {},
) {
  const { target, record } = await validateProductionOrigin(raw, resolveHost);
  for (const locale of ["en", "pt-BR", "es"]) {
    const response = await readHtml(target, record, locale);
    if (
      response.status !== 200 ||
      !response.contentType.includes("text/html")
    ) {
      throw new Error(`Unexpected deployed HTML response for locale ${locale}`);
    }
    const firstHtml = response.html.match(/<html\b[^>]*>/i)?.[0];
    const declared = firstHtml?.match(/\blang=["']([^"']+)["']/i)?.[1];
    if (declared !== locale) {
      throw new Error(`Unexpected server HTML language for locale ${locale}`);
    }
    console.log(`Production HTML locale verified: ${locale}`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runProductionSmoke(process.env.PRODUCTION_URL).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
