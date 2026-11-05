import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { describe, it } from "node:test";
import { localeCookie, locales } from "../../src/lib/locale-config.mjs";
import {
  requestProductionHtml,
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
    assert.deepEqual(
      observed,
      locales.map((locale) => ["app.example.org", "93.184.216.34", locale]),
    );
  });

  it("constructs requests with the shared locale cookie and pinned DNS address", async () => {
    for (const locale of locales) {
      const record = { address: "93.184.216.34", family: 4 };
      const result = await requestProductionHtml(
        new URL("https://app.example.org"),
        record,
        locale,
        (_target, options, callback) => {
          assert.equal(options.headers.cookie, `${localeCookie}=${locale}`);
          options.lookup("app.example.org", {}, (_error, address, family) => {
            assert.equal(address, record.address);
            assert.equal(family, record.family);
          });
          const request = new EventEmitter();
          request.end = () => {
            const response = Readable.from([`<html lang="${locale}">`]);
            response.statusCode = 200;
            response.headers = { "content-type": "text/html" };
            callback(response);
          };
          return request;
        },
      );
      assert.equal(result.html, `<html lang="${locale}">`);
    }
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
