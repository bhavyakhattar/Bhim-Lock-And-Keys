# Bhim Lock and Keys

A mobile-first Next.js App Router website for a key and locksmith shop in Sector 22, Chandigarh. Charcoal, brass, Fraunces headings, Inter body type, English/Hindi UI, progressive 3D and direct contact links.

**Delivery status:** Source project; not deployed. The owner supplied +91 98553 67929 for calls and WhatsApp, SCO 3002, Sector 22 D, Chandigarh for the address, and 10:00 AM–8:00 PM Monday–Saturday / 10:00 AM–4:00 PM Sunday (IST). The map and directions use that street address. Real inventory, photos and provider credentials still need configuration.

**Vercel free-tier constraint:** Vercel Hobby is for personal, non-commercial use. This business lead-generation site requires an eligible commercial plan (normally Pro) for production. The code uses standard Next.js/Vercel capabilities and can be used in an eligible Hobby learning/demo project, but commercial deployment cannot honestly be promised as free. Check the current plan terms: https://vercel.com/docs/plans/hobby and https://vercel.com/docs/limits/fair-use-guidelines.

## What is included

- All requested sections: Hero, Services, Car Remote Finder, How It Works, Keychain Gallery, Why Us, Real Photos, Google Reviews, FAQ, Contact/Map and Footer.
- Static HTML pages with LocalBusiness subtype `Locksmith` JSON-LD, canonical URLs, Open Graph PNG, favicon, sitemap and robots.
- Call/WhatsApp anchors rendered in the initial HTML. Analytics never intercepts navigation. A sticky mobile contact bar includes directions.
- English/Hindi dictionaries and bilingual JSON content. Hindi updates the document language. Punjabi is not included.
- Hours calculated explicitly in `Asia/Kolkata` (the IANA zone for India), with dated exceptions. Missing hours produce “Call to confirm hours”, not a fabricated status.
- Finder with free-text brand/model/year; it encodes an enquiry into a WhatsApp URL. No compatibility claims or external database.
- Optional 1 MB photo in the email enquiry. The separate “send a photo” link opens WhatsApp; the visitor attaches the photo there. Click-to-chat cannot attach local files or deliver form data automatically to WhatsApp.
- Resend email transport only. No Telegram, CMS, storage service or other API integration has been added.
- Actual Google Places reviews only, with author links, source attribution and a 24-hour route revalidation interval. Missing key, missing rating or API failure yields `null`; the section is omitted.
- Google Maps no-key iframe. The embed and directions use the owner-supplied street address; check the map result before launch.
- GA4 consent choice and events: `call_click`, `whatsapp_click`, `form_submit` (only successful submissions), `directions_click`. No form fields or personal data in event parameters. Analytics is disabled if its env value is empty.

## Content recommendation

Use the included **`content/shop.json`** for this small catalogue. It is versioned alongside the site, has no additional runtime/API cost, and lets a developer review edits before deployment. JSON has no comments, so `_comment` and `_replace_*` properties carry literal `// REPLACE` markers. Component and asset placeholders also use comments/markers where the format permits them.

If the owner later needs frequent phone-only catalogue editing, Sanity can be considered as a separate follow-up. It is not wired in here: the current integration scope remains limited to the requested services.

### Owner details

Edit `content/shop.json`:

| Field             | Expected value                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| `phone`           | Verified international number, optionally with leading `+`                                     |
| `whatsapp`        | Verified WhatsApp international number, digits only                                            |
| `streetAddress`   | Actual shop/building/street; Sector 22 alone is not an exact address                           |
| `directions`      | Owner-verified Google Maps link to the actual shop                                             |
| `mapsEmbed`       | Google Maps → Share → Embed a map → copy the iframe `src`, not the whole HTML                  |
| `hours`           | Verified weekly schedule; see format below                                                     |
| `hoursExceptions` | Date-specific opening intervals/closures, using Indian local dates                             |
| `photos`          | Actual shop photos with English/Hindi alt text                                                 |
| `services`        | Owner-confirmed services and wording; current entries are enquiries, not availability promises |
| `products`        | Real stock, actual images, optional INR price, `placeholder: false`                            |
| `modelEnabled`    | `true` only after adding the model described below                                             |

Hours structure (format example only — **// REPLACE**, these are not the shop's hours):

```json
{
  "Mon": [["09:00", "18:00"]],
  "Tue": [
    ["09:00", "13:00"],
    ["14:00", "18:00"]
  ],
  "Wed": [],
  "Thu": [],
  "Fri": [],
  "Sat": [],
  "Sun": []
}
```

Empty arrays mean closed. Missing days mean unknown. Opening is inclusive and closing exclusive. Split overnight hours across two calendar days: `[["22:00","24:00"]]` and the following day's `[["00:00","02:00"]]`. For a special closure, add an actual `YYYY-MM-DD: []` entry to `hoursExceptions`. The shipped schedule uses the hours supplied by the owner.

Photo format (**// REPLACE**):

```json
{
  "src": "/images/shop-front.webp",
  "alt": {
    "en": "Verified shop-front description",
    "hi": "दुकान के सामने का सही विवरण"
  }
}
```

Use local public images, provide intrinsic dimensions where necessary and retain the original image rights. Product photos use `next/image` with lazy loading, responsive sizes and AVIF/WebP negotiation. The hero fallback is priority-loaded. The included key/keychain art is original vector illustration, explicitly labelled as a concept; it does not depict verified inventory. Do not relabel an illustration as a real photograph.

## 3D architecture

`KeyStage.tsx` starts with a local, small WebP illustration. After two animation frames, hydration, capability checks and intersection, it renders a `next/dynamic` import with `ssr: false`. R3F/Three/drei are kept out of the initial HTML rendering path. The scene:

- Builds a rounded-box key fob with a metal rim at `metalness: 0.9`, `roughness: 0.25`.
- Uses the local procedural HDR environment, a brass spotlight and contact shadow. No external HDR CDN is fetched.
- Rotates gently and responds to desktop mouse movement or pointer dragging. Mobile vertical page scrolling remains available.
- Offers an explicit motion-permission button; gyroscope requires browser support and a secure context. Denial keeps drag available.
- Maps the How It Works section's scroll progress to rotation, scale and position.
- Uses `frameloop="never"` when off-screen or the tab is hidden. DPR is capped at 1.5.
- Keeps the static image if `hardwareConcurrency <= 4`, reduced motion is requested, WebGL cannot initialise, the context is lost, or an asset throws during loading.
- Has an error boundary; its 3D assets never own the contact actions.

### Supply the final model

1. **// REPLACE:** add `public/models/key.glb`, below **1,500,000 bytes**, with Draco-compressed geometry and embedded textures.
2. Centre it at the origin, front facing +Z, longest dimension about 2.8 units. Keep textures at 1024 px or smaller and reduce draw calls. Adjust scale in `KeyScene.tsx` if needed.
3. Set `modelEnabled` to `true` in JSON.
4. `postinstall` copies the decoder from the pinned `three` package into `/public/draco`; no runtime decoder CDN is needed.
5. Run the launch check and manually verify appearance, size, decoder loading, fallback and mobile interaction. The model is intentionally not included because no actual model was supplied.

## Enquiries, privacy and rate limiting

The route is Node.js `/api/inquiry`, not a static export. Pages remain statically generated. Do not set `output: "export"` or the email endpoint will disappear.

Request processing: exact Origin check → per-instance rate backstop → bounded body read (1.3 MB maximum, including multipart overhead) → honeypot → Zod validation → file magic-byte validation → Sharp decode/pixel-limit/re-encode → Resend. Photos are capped at 1 MB and 16 million decoded pixels; output is resized to at most 1600 × 1600 JPEG and metadata stripped. No enquiry is saved in a site database. Mailbox/provider retention still applies. Do not send sensitive documents.

The in-memory limiter permits five requests per minute per source IP **per server instance**. Serverless instances do not share a Map, so it is not a complete production limiter. To stay within the allowed integrations, use **Vercel's native WAF**, not an additional Redis service:

1. In Vercel project → Firewall, create a rule matching method `POST` and path `/api/inquiry`.
2. Rate-limit by source IP to five requests per 60 seconds; use block/rate-limit action, not a JS challenge that would break form fetches. Configure the nearest supported window if your plan UI differs, and document that setting.
3. Verify distributed requests are blocked and the intended threshold works on the deployed origin. Check your plan's current WAF limits/pricing.
4. Only then set `INQUIRY_EDGE_RATE_LIMIT_CONFIGURED=true` and redeploy.

On Vercel, the route fails closed with 503 unless that flag is true. The flag is an operator assertion, not automatic evidence that a WAF rule exists. The app reads Vercel's platform-provided forwarding header; do not copy its trust assumptions to another host. For self-hosting, configure equivalent proxy-level rate limiting and trusted IP extraction.

Set up Resend, verify your sender domain, then configure `RESEND_API_KEY`, `INQUIRY_FROM` and `INQUIRY_TO`. These are server-only. Verify inbox receipt using an owner-approved test enquiry after deployment. Automated tests mock Resend and do not send emails. Enquiries have no automatic retry because retries can duplicate deliveries. A delivery timeout can be ambiguous; visitors can use the direct contact links.

## Google reviews

Enable Places API (New), configure billing/restrictions/quotas on your own Google project, and set `GOOGLE_PLACES_API_KEY` and the verified `GOOGLE_PLACE_ID`. Restrict the key to the required API and apply any feasible server restrictions. Never prefix this key with `NEXT_PUBLIC_`.

`/api/reviews` has `revalidate = 86400` and fetch revalidation of 24 hours. It requests only rating, count, reviews and Maps URI. A failure hides reviews; it never inserts sample testimonials. The first visitor after the revalidation period can briefly receive the previous ISR response while regeneration occurs. Configuration changes require a rebuild/redeploy. A no-key build stays empty until revalidation or redeployment.

The requested cache interval is implemented; **verify that caching these fields for 24 hours is permitted by the Google Maps Platform terms applicable to your account before enabling it**. A short TTL is not itself permission to store Google content. If your terms disallow this cache, change the route to `dynamic = 'force-dynamic'`, remove `revalidate`, and use `cache: 'no-store'` on its fetch before activation. This changes the requested caching behaviour but preserves the static page shell. Follow current review-author and Google attribution requirements; the official attribution image is bundled unmodified.

References:

- https://developers.google.com/maps/documentation/places/web-service/policies
- https://developers.google.com/maps/documentation/places/web-service/place-details
- https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting

## Performance and accessibility verification

Targets are **mobile Performance 85+, Accessibility 95+, SEO 100**, and a visible/clickable configured call link within 2 seconds on 4G. These are targets, not measured claims. The production build and automated tests pass. Browser automation timed out in the delivery environment, so layout, WebGL/gyro and Lighthouse have not been verified in a browser here. No deployment or live provider delivery has been claimed.

Measure the production deployment in Chrome Lighthouse with mobile throttling, both with and without consent, and with a cold cache. Test the configured link with JavaScript disabled and while blocking the 3D chunk. Use the Network panel to confirm no Three.js request before the initial text/buttons paint. On a slow mobile device the deliberate fallback should preserve the lightweight hero.

Manually test: 360/390/768/1440px layouts, keyboard focus, native FAQ details, screen-reader field labels, Hindi text wrapping, reduced motion, low core-count override, WebGL disabled/context loss, portrait scroll vs drag, iOS motion permission denied/allowed, tab-background pause, and the bottom bar's safe-area spacing. The English/Hindi toggle is a client-side interface toggle, not separate Hindi SEO URLs.

The Google Maps iframe is lazy-loaded. Fraunces/Inter are fetched by `next/font` at build time and served locally; the build machine therefore needs Google Fonts access. Hindi uses the browser's Devanagari fallback. No Lighthouse guarantee should be made until the production site, supplied imagery and final integrations are measured.

## Folder structure

```text
bhim-lock-and-keys/
  app/
    api/inquiry/route.ts       # Bounded, validated email enquiry endpoint
    api/reviews/route.ts       # Server-only Places fetch; 24-hour ISR
    privacy/page.tsx           # Bilingual draft; owner review needed
    terms/page.tsx             # Bilingual draft; owner review needed
    globals.css
    layout.tsx                 # next/font, metadata, analytics
    page.tsx                   # Static page and JSON-LD
    robots.ts
    sitemap.ts
  components/
    Analytics.tsx              # Consent + non-blocking GA4 events
    Experience.tsx             # Sections, bilingual UI, finder, form
    KeyScene.tsx               # R3F/drei scene, scroll/drag/gyro
    KeyStage.tsx               # Deferred import + static/error fallback
    Reviews.tsx                # Lazy real reviews, hidden when absent
  content/shop.json            # Owner details, products, services, FAQs
  lib/
    hours.ts
    inquiry.ts
    shop.ts
  public/
    draco/                     # Decoder copied on install
    images/                    # Original SVG/WebP art, HDR, OG, Google credit
    models/README.md           # // REPLACE key.glb instructions
    icon.svg
  scripts/
    check-launch.ts
    copy-draco.mjs
  tests/
    core.test.ts
    routes.test.ts
  .env.example
  .gitignore
  next-env.d.ts
  next.config.ts
  package.json
  package-lock.json            # Exact resolved dependency graph
  postcss.config.mjs
  tailwind.config.ts
  tsconfig.json
  README.md
```

## Install and run

Use Node.js 22 LTS or newer and npm. Every direct dependency has an exact version. The lockfile pins resolved transitive versions; use `npm ci` rather than regenerating it. Motion transitive packages are explicitly overridden to their compatible versions.

```bash
cd bhim-lock-and-keys
npm ci
cp .env.example .env.local
npm run dev
```

Windows PowerShell: use `Copy-Item .env.example .env.local` in place of `cp` if necessary. Open `http://localhost:3000`. Edit the JSON and `.env.local`; restart the dev server after env changes.

```bash
npm run typecheck
npm test
npm run build
npm start
npm run check:launch
```

The launch check will intentionally report missing business configuration in the delivered project. It does not replace owner verification or a live test. Next.js is pinned to 16.4.2; review official security advisories before deploying later and update exact pins/lockfile when necessary. Official security reference: https://nextjs.org/blog/nextjs-security-update-october-14-2026.

## Vercel deployment steps

1. Complete the owner details and review privacy/terms. Confirm a commercial-eligible Vercel plan for the real shop; Hobby is restricted to personal, non-commercial use.
2. Push the project to a Git repository. Do not commit `.env.local`, credentials, `.next` or `node_modules`.
3. Import the repository into Vercel; choose **Next.js**. Set the root directory to this project's directory, install command `npm ci`, build command `npm run build`, and a supported Node.js 22+ runtime. Leave the output directory at the framework default.
4. Add every desired value listed in `.env.example` through Vercel Settings → Environment Variables. Production `SITE_ORIGIN` and `NEXT_PUBLIC_SITE_URL` must be the exact same canonical HTTPS origin, without a trailing slash. Give preview deployments their own matching origin/env scope if you need to test forms on preview URLs. Rebuild when changing any `NEXT_PUBLIC_*` variable.
5. Configure the WAF rule described above. Leave the production enquiry endpoint closed until the rule is installed and verified; set its flag and redeploy afterward.
6. Deploy. Add the domain, configure its DNS using Vercel's displayed records, confirm HTTPS and redirect alternate domains to the canonical host. Set the canonical env values and redeploy if the domain changes.
7. Test an authorised real enquiry, call, WhatsApp and directions on a phone. Verify the Google place identity and real reviews. Check GA4 DebugView after consent without sending personal data.
8. Run Lighthouse and the launch checklist below. Do not launch merely because the build succeeds.

## Launch checklist

- [ ] Verify the exact shop name, telephone and WhatsApp number; test both links on mobile with JavaScript off.
- [ ] Replace the exact address, Maps pin/embed and directions; confirm that they point to this shop.
- [ ] Add verified India-time opening hours and closures; check the open/closed boundary.
- [ ] Confirm every proposed service and product; add real photographs and alt text, or remove unsupported catalogue items.
- [ ] Keep “Call for price” unless the owner supplies a real INR price. Do not add invented reviews, awards, years or compatibility.
- [ ] Add the final Draco model under 1.5 MB if desired; validate the placeholder/fallback independently.
- [ ] Verify the sender domain, destination email, successful delivery, failure message and safe image handling.
- [ ] Configure and verify WAF limits; set the production flag only after verification.
- [ ] Review privacy/terms, retention and contact information; remove their `// REPLACE` draft notes.
- [ ] Verify Google account permissions, caching policy, place identity and required attribution before activating reviews.
- [ ] Set canonical URLs and all intended environment variables; ensure secrets never appear in client bundles.
- [ ] Test consent and all four GA4 events without names, numbers or uploaded files in analytics.
- [ ] Pass typecheck/tests/build and `npm run check:launch` on the configured project.
- [ ] Test keyboard, Hindi, small screens, reduced motion, low-core fallback, WebGL errors, drag/gyro and off-screen pause.
- [ ] Measure mobile Lighthouse 85+/95+/100 and call-link visibility within 2 seconds on throttled 4G.
- [ ] Confirm an eligible hosting plan, domain, HTTPS, sitemap, robots and social sharing image before public launch.

## November 2026 owner update

- Added the Keys For menu with 28 enquiry categories, including Other brand. These links request model/year confirmation; they do not promise compatibility.
- Added all three supplied shop photographs and all three supplied Google review screenshots. Screenshot reviews are clearly identified as owner-supplied snapshots, separate from the optional live Google Places section. No aggregate rating is inferred.
- Strengthened brass accents and retained the interactive 3D fob, with stable readiness/error callbacks. Reduced-motion, low-core devices and WebGL failures retain the static illustration as required.
- On Windows, double-click OPEN-WEBSITE.cmd and wait for Ready, then visit http://localhost:3000. Keep the command window open.

### Update an existing Windows copy
Stop the running server with Ctrl+C. Extract the new ZIP into a separate folder. Copy its contents into the existing project folder and choose Replace for matching files. Keep the existing node_modules folder and .env.local file; neither is included in the ZIP. Double-click OPEN-WEBSITE.cmd. If your browser still shows the older page, press Ctrl+F5.

## Final ivory and burgundy edition

This edition implements the owner-approved light design with a large real shopfront hero, 12 services, an illustrative equipment section, real photos throughout, early owner-supplied review screenshots, a scroll-controlled 3D key, hover tilt and scroll reveals. Generated product/equipment imagery is explicitly illustrative. Replace the machine image when the actual photo is available. All compatibility and prices are confirmed by the shop.

Edit services in content/shop.json and car enquiry brands in content/car-brands.json. The service art indices select cells from the generated 3-by-4 image sheet through ServiceArt.tsx. No unverified aggregate ratings or years-in-business claims are added.

Windows: extract the ZIP to a NEW folder, double-click OPEN-WEBSITE.cmd, wait for Ready, and open http://localhost:3000. Keep that window open. Stop an older running copy first with Ctrl+C. No API credentials are needed to preview the site; inquiry delivery, live Google reviews and analytics require the keys listed in .env.example.


## Owner updates
Business age: 35 years (owner confirmed; no inferred founding date).
Phone: +91 98553 67929 and +91 94633 93119. WhatsApp stays on the first number.
Email: navneet3588@gmail.com. The example environment targets this inbox; delivery still requires a Resend key and verified sender. Existing .env.local files must also set INQUIRY_TO=navneet3588@gmail.com.
Open every day: Monday–Saturday 10 AM–8 PM, Sunday 10 AM–4 PM, Asia/Kolkata.
Interview: https://www.youtube.com/watch?v=n06074_bv-c
Interview snapshots supplied by the owner; linked to Harsimar Daily Vlogs. No transcript claims added.
Machine pictures remain illustrative. // REPLACE with actual shop equipment photos.
