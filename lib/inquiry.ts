import { z } from "zod";
import { shop } from "./shop";
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .min(10)
    .max(20)
    .regex(/^\+?[\d ()-]+$/)
    .refine(
      (s) =>
        s.replace(/\D/g, "").length >= 10 && s.replace(/\D/g, "").length <= 15,
    ),
  brand: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  year: z.coerce
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),
  service: z
    .string()
    .refine((s) => shop.services.some((item) => item.id === s)),
  consent: z.literal("yes"),
  website: z.string().max(0),
});
// Per-instance backstop, NOT a distributed rate limiter. Production also requires
// a Vercel WAF rate-limit rule, documented in README; fail closed without its flag.
const buckets = new Map<string, { count: number; until: number }>();
export function rateLimit(key: string, now = Date.now()) {
  for (const [k, v] of buckets) if (v.until <= now) buckets.delete(k);
  const old = buckets.get(key);
  if (old) {
    if (old.count >= 5) return false;
    old.count++;
    return true;
  }
  if (buckets.size >= 10000) return false;
  buckets.set(key, { count: 1, until: now + 60000 });
  return true;
}
export function photoType(bytes: Uint8Array): "jpeg" | "png" | "webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "jpeg";
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n))
    return "png";
  if (
    Buffer.from(bytes.subarray(0, 4)).toString() === "RIFF" &&
    Buffer.from(bytes.subarray(8, 12)).toString() === "WEBP"
  )
    return "webp";
  return null;
}
