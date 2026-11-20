import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { inquirySchema, rateLimit, photoType } from "@/lib/inquiry";
export const runtime = "nodejs";
export const maxDuration = 15;
const MAX_BODY = 1_300_000;
function reply(status: number, message: string) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}
export async function POST(request: NextRequest) {
  const origin = process.env.SITE_ORIGIN || "http://localhost:3000";
  if (request.headers.get("origin") !== origin)
    return reply(403, "Origin rejected");
  if (
    process.env.VERCEL &&
    process.env.INQUIRY_EDGE_RATE_LIMIT_CONFIGURED !== "true"
  )
    return reply(503, "Contact the shop directly");
  const ip = process.env.VERCEL
    ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()
    : request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  // Host-provided IP on Vercel. Do not trust arbitrary forwarded headers on another host.
  const key = createHash("sha256")
    .update(ip || "unknown")
    .digest("hex");
  if (!rateLimit(key)) return reply(429, "Please wait before trying again");
  if (!request.headers.get("content-type")?.startsWith("multipart/form-data"))
    return reply(415, "Expected form data");
  if (Number(request.headers.get("content-length") || 0) > MAX_BODY)
    return reply(413, "Request too large");
  try {
    // Bound the actual stream too; Content-Length alone can be absent or untrusted.
    const reader = request.body?.getReader();
    if (!reader) return reply(400, "Missing request");
    let total = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY) {
        await reader.cancel();
        return reply(413, "Request too large");
      }
      chunks.push(value);
    }
    const data = await new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": request.headers.get("content-type")! },
      body: Buffer.concat(chunks),
    }).formData();
    if (String(data.get("website") || "")) return reply(200, "Received");
    const result = inquirySchema.safeParse(Object.fromEntries(data.entries()));
    if (!result.success) return reply(400, "Please check the form fields");
    const token = process.env.RESEND_API_KEY,
      from = process.env.INQUIRY_FROM,
      to = process.env.INQUIRY_TO;
    if (!token || !from || !to) return reply(503, "Contact the shop directly");
    const photo = data.get("photo");
    const attachments: { filename: string; content: string }[] = [];
    if (photo instanceof File && photo.size) {
      if (photo.size > 1024 * 1024)
        return reply(413, "Photo must be under 1 MB");
      const bytes = Buffer.from(await photo.arrayBuffer());
      if (!photoType(bytes)) return reply(415, "Unsupported photo");
      try {
        const clean = await sharp(bytes, {
          limitInputPixels: 16_000_000,
          animated: false,
        })
          .rotate()
          .resize({
            width: 1600,
            height: 1600,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: 80 })
          .toBuffer();
        attachments.push({
          filename: "key-photo.jpg",
          content: clean.toString("base64"),
        });
      } catch {
        return reply(400, "Invalid image");
      }
    }
    const v = result.data;
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "New Bhim Lock and Keys enquiry",
        text: `Name: ${v.name}\nPhone: ${v.phone}\nCar: ${v.brand} ${v.model} (${v.year})\nService: ${v.service}\nConsent to contact: yes`,
        attachments,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!sent.ok)
      return reply(502, "Delivery failed. Please contact the shop directly");
    return reply(200, "Enquiry delivered");
  } catch {
    return reply(400, "Unable to process enquiry");
  }
}
