import test from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "../app/api/inquiry/route";
import { GET } from "../app/api/reviews/route";
let counter = 0;
function request(data: FormData, origin = "http://localhost:3000") {
  return new NextRequest("http://localhost:3000/api/inquiry", {
    method: "POST",
    headers: { origin, "x-forwarded-for": `test-${counter++}` },
    body: data,
  });
}
function form() {
  const f = new FormData();
  Object.entries({
    name: "Test Person",
    phone: "9876543210",
    brand: "Example",
    model: "Test",
    year: "2020",
    service: "car-keys",
    consent: "yes",
    website: "",
  }).forEach(([k, v]) => f.set(k, v));
  return f;
}
test("route contracts without sending any real email", async () => {
  delete process.env.VERCEL;
  delete process.env.RESEND_API_KEY;
  delete process.env.GOOGLE_PLACES_API_KEY;
  process.env.SITE_ORIGIN = "http://localhost:3000";
  assert.equal(
    (await POST(request(form(), "https://attacker.invalid"))).status,
    403,
  );
  const trap = form();
  trap.set("website", "spam");
  assert.equal((await POST(request(trap))).status, 200);
  const invalid = form();
  invalid.set("phone", "abc");
  assert.equal((await POST(request(invalid))).status, 400);
  assert.equal((await POST(request(form()))).status, 503);
  assert.equal(await (await GET()).json(), null);
  process.env.VERCEL = "1";
  process.env.INQUIRY_EDGE_RATE_LIMIT_CONFIGURED = "false";
  assert.equal((await POST(request(form()))).status, 503);
  delete process.env.VERCEL;
  process.env.RESEND_API_KEY = "test-only";
  process.env.INQUIRY_FROM = "test@example.invalid";
  process.env.INQUIRY_TO = "owner@example.invalid";
  const real = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response("{}", { status: 200 });
    assert.equal((await POST(request(form()))).status, 200);
    globalThis.fetch = async () => new Response("{}", { status: 500 });
    assert.equal((await POST(request(form()))).status, 502);
    const photo = form();
    photo.set(
      "photo",
      new File(["<svg/>"], "photo.png", { type: "image/png" }),
    );
    assert.equal((await POST(request(photo))).status, 415);
    const large = form();
    large.set("photo", new File([new Uint8Array(1_400_000)], "photo.jpg"));
    const largeRequest = request(large);
    const encoded = await largeRequest.arrayBuffer();
    assert.equal(
      (
        await POST(
          new NextRequest(largeRequest.url, {
            method: "POST",
            headers: largeRequest.headers,
            body: encoded,
          }),
        )
      ).status,
      413,
    );
  } finally {
    globalThis.fetch = real;
    delete process.env.RESEND_API_KEY;
  }
});
