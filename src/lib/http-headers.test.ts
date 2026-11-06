import { expect, it } from "vitest";
import { parseRequestDate } from "./http-headers";

it.each([
  "Sun, 06 Nov 1994 08:49:37 GMT",
  "Sunday, 06-Nov-94 08:49:37 GMT",
  "Sun Nov  6 08:49:37 1994",
])("accepts required recipient date format %s", (value) => {
  expect(parseRequestDate(value)).toBe(Date.UTC(1994, 10, 6, 8, 49, 37));
});

it.each(["0", "2026-11-06", "Invalid Date", "Mon, 31 Feb 2026 00:00:00 GMT"])(
  "ignores invalid HTTP date %s",
  (value) => {
    expect(parseRequestDate(value)).toBeNull();
  },
);
