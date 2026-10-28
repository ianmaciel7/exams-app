import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  runProductionSmoke,
  validateProductionOrigin,
} from "./check-production-smoke.mjs";

const publicAddress = async () => [{ address: "93.184.216.34", family: 4 }];

describe("production URL security boundary", () => {
  it("rejects raw IP literals, private ranges and local hostnames", async () => {
    for (const host of [
      "127.0.0.1",
      "10.0.0.1",
      "172.16.0.1",
      "172.31.255.254",
      "192.168.1.1",
      "169.254.169.254",
      "[::1]",
      "[fc00::1]",
      "localhost",
      "metadata.google.internal",
      "app.local",
    ]) {
      await assert.rejects(
        validateProductionOrigin(`https://${host}`, publicAddress),
      );
    }
  });

  it("rejects unsafe schemes, credentials, ports, paths and queries", async () => {
    for (const origin of [
      "http://app.example.org",
      "https://user:password@app.example.org",
      "https://app.example.org:8443",
      "https://app.example.org/sign-in",
      "https://app.example.org/?token=123",
    ]) {
      await assert.rejects(validateProductionOrigin(origin, publicAddress));
    }
  });

  it("rejects public names resolving to private or mixed addresses", async () => {
    for (const address of [
      "127.0.0.1",
      "10.2.3.4",
      "172.20.1.2",
      "192.168.1.2",
      "100.64.0.1",
      "169.254.169.254",
      "::1",
      "fc00::1",
      "fe80::1",
      "::ffff:127.0.0.1",
    ]) {
      const family = address.includes(":") ? 6 : 4;
      await assert.rejects(
        validateProductionOrigin("https://app.example.org", async () => [
          { address: "93.184.216.34", family: 4 },
          { address, family },
        ]),
      );
    }
  });

  it("pins the checked public DNS address and validates all response locales", async () => {
    const observed = [];
    await runProductionSmoke("https://app.example.org", {
      resolveHost: publicAddress,
      readHtml: async (target, record, locale) => {
        observed.push([target.hostname, record.address, locale]);
        return {
          status: 200,
          contentType: "text/html; charset=utf-8",
          html: `<!doctype html><html lang="${locale}"><body>OK</body></html>`,
        };
      },
    });
    assert.deepEqual(observed, [
      ["app.example.org", "93.184.216.34", "en"],
      ["app.example.org", "93.184.216.34", "pt-BR"],
      ["app.example.org", "93.184.216.34", "es"],
    ]);
  });

  it("fails closed on redirects, invalid HTML and mismatched server language", async () => {
    for (const response of [
      { status: 302, contentType: "text/html", html: '<html lang="en">' },
      { status: 200, contentType: "text/plain", html: '<html lang="en">' },
      { status: 200, contentType: "text/html", html: '<html lang="es">' },
    ]) {
      await assert.rejects(
        runProductionSmoke("https://app.example.org", {
          resolveHost: publicAddress,
          readHtml: async () => response,
        }),
      );
    }
  });
});
