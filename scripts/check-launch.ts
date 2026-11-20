import { readFileSync, existsSync, statSync } from "node:fs";
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const shop = JSON.parse(readFileSync("content/shop.json", "utf8"));
const issues: string[] = [];
if (!/^\+?[1-9]\d{9,14}$/.test(shop.phone))
  issues.push("REPLACE verified phone number");
if (!/^[1-9]\d{9,14}$/.test(shop.whatsapp))
  issues.push("REPLACE verified WhatsApp number");
if (!shop.streetAddress || !shop.mapsEmbed)
  issues.push("REPLACE exact address and Google Maps embed URL");
if (!shop.hours) issues.push("REPLACE verified opening hours");
if (!shop.photos.length)
  issues.push("REPLACE with real owner-approved shop photographs");
if (shop.products.some((p: { placeholder: boolean }) => p.placeholder))
  issues.push("REPLACE product concepts with verified inventory");
if (!process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://"))
  issues.push("Set canonical HTTPS NEXT_PUBLIC_SITE_URL");
if (process.env.NEXT_PUBLIC_SITE_URL !== process.env.SITE_ORIGIN)
  issues.push("SITE_ORIGIN must match canonical public URL");
for (const name of ["RESEND_API_KEY", "INQUIRY_FROM", "INQUIRY_TO"])
  if (!process.env[name]) issues.push(`Configure ${name}`);
if (process.env.INQUIRY_EDGE_RATE_LIMIT_CONFIGURED !== "true")
  issues.push(
    "Configure and verify Vercel WAF rate limit before enabling production enquiries",
  );
if (
  shop.modelEnabled &&
  (!existsSync("public/models/key.glb") ||
    statSync("public/models/key.glb").size >= 1_500_000)
)
  issues.push("key.glb must exist and be under 1.5 MB");
if (issues.length) {
  console.error("Launch blocked:\n" + issues.map((s) => " - " + s).join("\n"));
  process.exitCode = 1;
} else
  console.log(
    "Configuration checks passed. Complete manual launch checklist in README.",
  );
