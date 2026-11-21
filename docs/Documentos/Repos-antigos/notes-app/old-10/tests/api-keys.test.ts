import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  bearerToken,
  generateApiKey,
  hashApiKey,
  isApiKey,
  keyLength,
  keyPrefix,
} from "../src/domain/api-keys";

test("generateApiKey: matches the rcl_live_ + 32 base62 contract", () => {
  const key = generateApiKey();
  assert.ok(key.startsWith(keyPrefix));
  assert.equal(key.length, keyPrefix.length + keyLength);
  assert.ok(isApiKey(key));
});

test("generateApiKey: draws distinct keys", () => {
  const keys = new Set(Array.from({ length: 500 }, generateApiKey));
  assert.equal(keys.size, 500);
});

test("generateApiKey: covers the whole base62 alphabet", () => {
  const seen = new Set(
    Array.from({ length: 200 }, generateApiKey)
      .join("")
      .slice(keyPrefix.length),
  );
  // Rejection sampling must not starve any symbol class.
  assert.ok([...seen].some((char) => /[0-9]/.test(char)));
  assert.ok([...seen].some((char) => /[a-z]/.test(char)));
  assert.ok([...seen].some((char) => /[A-Z]/.test(char)));
});

test("hashApiKey: is a stable SHA-256 hex digest", () => {
  const key = generateApiKey();
  const expected = createHash("sha256").update(key).digest("hex");
  assert.equal(hashApiKey(key), expected);
  assert.equal(hashApiKey(key).length, 64);
  assert.notEqual(hashApiKey(key), hashApiKey(generateApiKey()));
});

test("isApiKey: rejects malformed tokens", () => {
  assert.equal(isApiKey(`rcl_test_${"a".repeat(keyLength)}`), false);
  assert.equal(isApiKey(`${keyPrefix}${"a".repeat(keyLength - 1)}`), false);
  assert.equal(isApiKey(`${keyPrefix}${"a".repeat(keyLength + 1)}`), false);
  assert.equal(isApiKey(`${keyPrefix}${"-".repeat(keyLength)}`), false);
  assert.equal(isApiKey(""), false);
});

test("bearerToken: extracts only a well-formed key", () => {
  const key = generateApiKey();
  assert.equal(bearerToken(`Bearer ${key}`), key);
  assert.equal(bearerToken(key), null); // scheme required
  assert.equal(bearerToken(`bearer ${key}`), null); // scheme is case-sensitive
  assert.equal(bearerToken("Bearer not-a-key"), null);
  assert.equal(bearerToken(null), null);
});
