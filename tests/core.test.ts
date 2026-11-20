import test from "node:test";
import assert from "node:assert/strict";
import { openingState } from "../lib/hours";
import { inquirySchema, rateLimit, photoType } from "../lib/inquiry";
const hours = { Mon: [["09:00", "18:00"]] as [string, string][] };
test("hours use Kolkata even when timestamp is UTC", () =>
  assert.equal(openingState(new Date("2026-10-19T04:00:00Z"), hours), "open"));
test("closing boundary is exclusive", () =>
  assert.equal(
    openingState(new Date("2026-10-19T12:30:00Z"), hours),
    "closed",
  ));
test("unknown schedule does not invent open status", () =>
  assert.equal(openingState(new Date(), null), "unknown"));
test("holiday exception overrides weekly opening", () =>
  assert.equal(
    openingState(new Date("2026-10-19T04:00:00Z"), hours, { "2026-10-19": [] }),
    "closed",
  ));
test("India calendar date differs from UTC around midnight", () =>
  assert.equal(
    openingState(new Date("2026-10-18T23:00:00Z"), {
      Mon: [["00:00", "06:00"]],
    }),
    "open",
  ));
const valid = {
  name: "Test Person",
  phone: "+919876543210",
  brand: "Example",
  model: "Example",
  year: "2020",
  service: "car-keys",
  consent: "yes",
  website: "",
};
test("valid enquiry parses year", () =>
  assert.equal(inquirySchema.parse(valid).year, 2020));
test("honeypot, short phone, missing consent and unknown service fail", () => {
  for (const change of [
    { website: "spam" },
    { phone: "123" },
    { consent: "" },
    { service: "invented" },
  ])
    assert.equal(
      inquirySchema.safeParse({ ...valid, ...change }).success,
      false,
    );
});
test("rate limit enforces window and expires", () => {
  for (let i = 0; i < 5; i++) assert.equal(rateLimit("unit", 1000), true);
  assert.equal(rateLimit("unit", 1001), false);
  assert.equal(rateLimit("unit", 61000), true);
});
test("file sniff rejects disguised executable and SVG", () => {
  assert.equal(photoType(Buffer.from("<svg/>")), null);
  assert.equal(photoType(Buffer.from("MZ")), null);
  assert.equal(photoType(Buffer.from([255, 216, 255])), "jpeg");
});
