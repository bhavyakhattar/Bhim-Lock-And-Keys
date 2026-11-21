"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  shop,
  callHref,
  whatsapp,
  defaultMessage,
  hasPhone,
  hasWhatsApp,
  type Locale,
} from "@/lib/shop";
import { openingState } from "@/lib/hours";
import KeyStage from "./KeyStage";
import ServiceArt from "./ServiceArt";
import RollingKey from "./RollingKey";
import Reviews from "./Reviews";
import BrandMenu from "./BrandMenu";
import CustomerReviews from "./CustomerReviews";
import { track } from "./Analytics";
const text = (l: Locale, en: string, hi: string) => (l === "en" ? en : hi);
function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: reduce ? 0 : 0.65 }}
      onViewportEnter={(e) => {
        if (e?.target && !reduce)
          e.target.animate(
            [
              { opacity: 0.6, transform: "translateY(18px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 650, easing: "ease-out" },
          );
      }}
    >
      {children}
    </motion.div>
  );
}
function Product({
  product,
  locale,
}: {
  product: (typeof shop.products)[number];
  locale: Locale;
}) {
  const reduce = useReducedMotion();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  return (
    <motion.article
      className="product"
      animate={tilt}
      transition={{ type: "spring", stiffness: 140, damping: 20 }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({
          rotateX: -(e.clientY - r.top - r.height / 2) / 45,
          rotateY: (e.clientX - r.left - r.width / 2) / 45,
        });
      }}
      onPointerLeave={() => setTilt({ rotateX: 0, rotateY: 0 })}
    >
      <div className="product-art">
        <Image
          src={product.image}
          alt={
            product.name[locale] +
            text(locale, " — illustrative concept", " — नमूना")
          }
          fill
          sizes="(max-width: 700px) 90vw, 30vw"
        />
        {product.placeholder && (
          <span className="image-note">
            {text(
              locale,
              "ILLUSTRATION · STOCK TO CONFIRM",
              "नमूना · स्टॉक पूछें",
            )}
          </span>
        )}
      </div>
      <p className="eyebrow">{product.category[locale]}</p>
      <h3>{product.name[locale]}</h3>
      <a data-event="call_click" href={callHref}>
        {product.price !== null
          ? `₹${product.price}`
          : text(locale, "Call for price", "कीमत के लिए कॉल करें")}{" "}
        <span aria-hidden>↗</span>
      </a>
    </motion.article>
  );
}
function HoursBadge({ locale }: { locale: Locale }) {
  const [state, setState] = useState("unknown");
  useEffect(() => {
    const update = () =>
      setState(openingState(new Date(), shop.hours, shop.hoursExceptions));
    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className={"hours " + state}>
      <i aria-hidden />
      {state === "open"
        ? text(locale, "Open now", "अभी खुला है")
        : state === "closed"
          ? text(locale, "Closed now", "अभी बंद है")
          : text(locale, "Call to confirm hours", "समय के लिए कॉल करें")}
    </span>
  );
}
function Finder({ locale }: { locale: Locale }) {
  const [values, setValues] = useState({ brand: "", model: "", year: "" });
  const [error, setError] = useState("");
  const message = `Hello Bhim Lock and Keys, please help me with a car key/remote. Brand: ${values.brand}. Model: ${values.model}. Year: ${values.year}. Please confirm options and price.`;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!hasWhatsApp) {
          setError(
            text(
              locale,
              "Shop WhatsApp number is not configured yet.",
              "दुकान का WhatsApp नंबर अभी उपलब्ध नहीं है।",
            ),
          );
          return;
        }
        if (e.currentTarget.reportValidity()) {
          track("whatsapp_click", { placement: "finder" });
          window.location.href = whatsapp(message);
        }
      }}
    >
      <div className="finder-fields">
        {(["brand", "model", "year"] as const).map((name, i) => (
          <label key={name}>
            {
              [
                text(locale, "Car brand", "कार ब्रांड"),
                text(locale, "Model", "मॉडल"),
                text(locale, "Year", "साल"),
              ][i]
            }
            <input
              name={name}
              required
              maxLength={name === "year" ? 4 : 60}
              type={name === "year" ? "number" : "text"}
              min={name === "year" ? 1950 : undefined}
              max={name === "year" ? new Date().getFullYear() + 1 : undefined}
              value={values[name]}
              placeholder={
                [
                  text(locale, "Enter brand", "ब्रांड लिखें"),
                  text(locale, "Enter model", "मॉडल लिखें"),
                  "YYYY",
                ][i]
              }
              onChange={(e) => setValues({ ...values, [name]: e.target.value })}
            />
          </label>
        ))}
      </div>
      <button className="button brass" type="submit">
        {text(locale, "Ask on WhatsApp", "WhatsApp पर पूछें")}{" "}
        <span aria-hidden>↗</span>
      </button>
      <p className="small">
        {text(
          locale,
          "A conversation, not a compatibility guarantee. We’ll need your exact key details.",
          "यह जानकारी भेजने का तरीका है, अनुकूलता की गारंटी नहीं। चाबी की पूरी जानकारी ज़रूरी है।",
        )}
      </p>
      <p role="status">{error}</p>
      <noscript>
        <a href={whatsapp(defaultMessage)}>
          Open WhatsApp and share your car details
        </a>
      </noscript>
    </form>
  );
}
function Inquiry({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setStatus("");
    try {
      const data = new FormData(e.currentTarget);
      const photo = data.get("photo");
      if (photo instanceof File && photo.size > 1024 * 1024)
        throw Error(
          text(
            locale,
            "Please choose a photo under 1 MB.",
            "कृपया 1 MB से छोटी फोटो चुनें।",
          ),
        );
      const res = await fetch("/api/inquiry", { method: "POST", body: data });
      if (!res.ok)
        throw Error(
          res.status === 429
            ? text(
                locale,
                "Too many requests. Please try again in a minute.",
                "बहुत अधिक अनुरोध। एक मिनट बाद प्रयास करें।",
              )
            : text(
                locale,
                "Unable to send. Please call or use WhatsApp.",
                "भेज नहीं सके। कॉल या WhatsApp करें।",
              ),
        );
      track("form_submit", { form_name: "inquiry" });
      setStatus(
        text(
          locale,
          "Sent. The shop has received your enquiry.",
          "भेज दिया। दुकान को आपका अनुरोध मिल गया है।",
        ),
      );
      form.current?.reset();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Unable to send");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      ref={form}
      onSubmit={submit}
      className="inquiry"
      action="/api/inquiry"
      method="post"
      encType="multipart/form-data"
    >
      <h3>
        {text(locale, "Leave the details with us.", "अपनी जानकारी भेजें।")}
      </h3>
      <div className="form-grid">
        <label>
          {text(locale, "Your name", "आपका नाम")}
          <input
            required
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={80}
          />
        </label>
        <label>
          {text(locale, "Phone number", "फ़ोन नंबर")}
          <input
            required
            name="phone"
            type="tel"
            autoComplete="tel"
            minLength={10}
            maxLength={20}
          />
        </label>
        <label>
          {text(locale, "Car brand", "कार ब्रांड")}
          <input name="brand" maxLength={60} required />
        </label>
        <label>
          {text(locale, "Model", "मॉडल")}
          <input name="model" maxLength={60} required />
        </label>
        <label>
          {text(locale, "Year", "साल")}
          <input
            name="year"
            type="number"
            min="1950"
            max={new Date().getFullYear() + 1}
            required
          />
        </label>
        <label>
          {text(locale, "Service needed", "सेवा चुनें")}
          <select name="service" required>
            <option value="">
              {text(locale, "Select a service", "सेवा चुनें")}
            </option>
            {shop.services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title[locale]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="small">
        {text(
          locale,
          "For non-car enquiries, please call or WhatsApp the shop.",
          "कार से अलग अनुरोध के लिए दुकान को कॉल या WhatsApp करें।",
        )}
      </p>
      <label>
        {text(
          locale,
          "Photo (optional · JPEG, PNG, WebP · max 1 MB)",
          "फोटो (वैकल्पिक · JPEG, PNG, WebP · अधिकतम 1 MB)",
        )}
        <input
          type="file"
          name="photo"
          accept="image/jpeg,image/png,image/webp"
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="consent">
        <input name="consent" value="yes" type="checkbox" required />
        {text(
          locale,
          "I agree to be contacted about this enquiry.",
          "मैं इस अनुरोध के बारे में संपर्क किए जाने से सहमत हूं।",
        )}{" "}
        <a href="/privacy">{text(locale, "Privacy", "गोपनीयता")}</a>
      </label>
      <button className="button brass" disabled={busy}>
        {busy
          ? text(locale, "Sending…", "भेज रहे हैं…")
          : text(locale, "Send enquiry", "अनुरोध भेजें")}{" "}
        <span aria-hidden>↗</span>
      </button>
      <p role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
export default function Experience() {
  const [locale, setLocale] = useState<Locale>("en");
  const t = (en: string, hi: string) => text(locale, en, hi);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return (
    <>
      <a className="skip" href="#main">
        {t("Skip to content", "मुख्य सामग्री पर जाएं")}
      </a>
      <header className="header">
        <a className="brand" href="#" aria-label="Bhim Lock and Keys home">
          <span className="monogram" aria-hidden>
            {" "}
            B<span>↗</span>
          </span>
          <span>
            BHIM <small>LOCK AND KEYS</small>
          </span>
        </a>
        <nav aria-label={t("Main navigation", "मुख्य नेविगेशन")}>
          <BrandMenu locale={locale} />
          <a href="#services">{t("Services", "सेवाएं")}</a>
          <a href="#collection">{t("The collection", "कलेक्शन")}</a>
          <a href="#contact">{t("Visit us", "मिलने आएं")}</a>
        </nav>
        <div className="header-end">
          <button
            className="language"
            aria-label={t("Switch to Hindi", "अंग्रेज़ी में बदलें")}
            onClick={() => setLocale(locale === "en" ? "hi" : "en")}
          >
            {locale === "en" ? "हिंदी" : "English"}
          </button>
          <a
            className="button small-button"
            data-event="call_click"
            href={callHref}
          >
            {t("Call 98553 67929", "कॉल 98553 67929")} ↗
          </a>
          {shop.secondaryPhone && (
  <a className="button small-button" data-event="call_click" href={`tel:${shop.secondaryPhone}`}>
    {t("Call 94633 93119", "कॉल 94633 93119")} ↗
  </a>
)}
        </div>
      </header>
      <RollingKey locale={locale} />
      <main id="main">
        <section className="hero section">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="tiny-line" />
              {t("YOUR NEIGHBOURHOOD KEY SHOP", "आपके पड़ोस की चाबी की दुकान")}
            </p>
            <h1>{t("Your keys.", "आपकी चाबी।")}<br /><em>{t("Our craft.", "हमारा हुनर।")}</em></h1>
            <p className="hero-description">
              {t(
                "For the car you drive. The door you open. The keys you carry every day. Let’s find your next step.",
                "आपकी कार, आपके घर और रोज़मर्रा की चाबियों के लिए। आइए, आपकी ज़रूरत समझें।",
              )}
            </p>
            <div className="actions">
              <a
                className="button brass"
                href={callHref}
                data-event="call_click"
              >
                {t("Call 98553 67929", "कॉल 98553 67929")}{" "}
                <span aria-hidden>↗</span>
              </a>
              {shop.secondaryPhone && (
  <a className="button brass" href={`tel:${shop.secondaryPhone}`} data-event="call_click">
    {t("Call 94633 93119", "कॉल 94633 93119")}{" "}<span aria-hidden>↗</span>
  </a>
)}
              <a
                className="button outline"
                href={whatsapp(defaultMessage)}
                data-event="whatsapp_click"
              >
                WhatsApp <span aria-hidden>↗</span>
              </a>
            </div>
            <div className="shop-essential"><strong>{t("35 years of key-making craft.", "चाबी बनाने का 35 वर्षों का अनुभव।")}</strong><p>{t("Open all 7 days", "सप्ताह के सातों दिन खुला")}<br />{t("Mon–Sat: 10 AM – 8 PM · Sunday: 10 AM – 4 PM (IST)", "सोम–शनि: सुबह 10–रात 8 · रविवार: सुबह 10–शाम 4 (IST)")}</p><a href={`tel:${shop.secondaryPhone}`} data-event="call_click">{t("Also call", "या कॉल करें")}: 94633 93119</a></div><div className="hero-meta">
              <span>⌖ {t("Sector 22 D, Chandigarh", "सेक्टर 22 डी, चंडीगढ़")}</span>
              <HoursBadge locale={locale} />
            </div>
          </div>
          <figure className="hero-shop"><Image src="/Bhim-Lock-And-Keys/images/shop-front.webp" alt={t("Bhim Lock and Keys storefront in Sector 22 D, Chandigarh", "सेक्टर 22 डी चंडीगढ़ में भीम लॉक एंड कीज़ की दुकान")} width={1206} height={677} priority sizes="(max-width:700px) 100vw, 60vw" /><figcaption>SCO 3002 · Sector 22 D · Chandigarh</figcaption></figure>
        </section>
        <div className="ribbon">
          <span>{t("KEYS & REMOTES", "चाबियां और रिमोट")}</span>
          <i>✦</i>
          <span>{t("LOCKS & ACCESS", "ताले और एक्सेस")}</span>
          <i>✦</i>
          <span>{t("EVERYDAY ACCESSORIES", "रोज़मर्रा की एक्सेसरीज़")}</span>
          <i>✦</i>
          <span>{t("SECTOR 22, CHANDIGARH", "सेक्टर 22, चंडीगढ़")}</span>
        </div>
        <section id="services" className="section">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow">
                01 / {t("WHAT BRINGS YOU IN?", "आपकी ज़रूरत")}
              </p>
              <h2>
                {t("Keys, remotes", "चाबियां, रिमोट")}
                <br />
                <em>{t("& lock services.", "और ताले की सेवाएं।")}</em>
              </h2>
            </div>
            <p>
              {t(
                "Start with what you need. Speak to the shop to confirm the service, availability and price.",
                "अपनी ज़रूरत बताएं। सेवा, उपलब्धता और कीमत की पुष्टि दुकान से करें।",
              )}
            </p>
          </Reveal>
          <div className="services">
            {shop.services.map((s) => (
              <Reveal key={s.id}>
                <a
                  className="service"
                  href={whatsapp(
                    `Hello, I would like to ask about ${s.title.en}. Please confirm availability and price.`,
                  )}
                  data-event="whatsapp_click"
                >
                  <ServiceArt index={s.art} alt={s.title[locale]} />
                  <span className="service-number">{s.icon}</span>
                  <h3>{s.title[locale]}</h3>
                  <p>{s.description[locale]}</p>
                  <span className="arrow" aria-hidden>
                    ↗
                  </span>
                </a>
              </Reveal>
            ))}
          </div>
        </section>
        <section className="section equipment">
          <Reveal><ServiceArt index={11} alt={t("Illustrative key-cutting machine and programming tablet", "चाबी मशीन और प्रोग्रामिंग टैबलेट का नमूना")} /><p className="small">{t("Illustrative equipment image — actual shop photo coming soon.", "उपकरण का नमूना चित्र — दुकान की असली फोटो जल्द आएगी।")}</p></Reveal>
          <Reveal><p className="eyebrow">{t("THE TOOLS BEHIND THE CRAFT", "हुनर के पीछे उपकरण")}</p><h2>{t("Key-cutting & programming equipment.", "चाबी कटिंग और प्रोग्रामिंग उपकरण।")}</h2><p>{t("From a spare key to a remote enquiry, talk to us about the work your key needs. Share your car model and year for confirmation.", "अतिरिक्त चाबी या रिमोट के लिए हमसे बात करें। पुष्टि के लिए कार का मॉडल और साल भेजें।")}</p><a className="button brass" href={callHref} data-event="call_click">{t("Call 98553 67929", "कॉल 98553 67929")} ↗</a></Reveal>
        </section>
        <section className="section machine-gallery"><div><p className="eyebrow">{t("MODERN KEY TECHNOLOGY", "आधुनिक चाबी तकनीक")}</p><h2>{t("Cut. Programme. Restore.", "कटिंग। प्रोग्रामिंग। मरम्मत।")}</h2><p>{t("Illustrative equipment and tools. Contact us to discuss your key and vehicle.", "उपकरणों के नमूना चित्र। अपनी चाबी और गाड़ी के बारे में हमसे बात करें।")}</p></div><div className="machine-grid">{[11,6,8].map((art,i)=><figure key={art}><ServiceArt index={art} alt={t(["Illustrative modern key-cutting equipment","Illustrative remote programming tools","Illustrative remote repair workbench"][i],["आधुनिक चाबी कटिंग उपकरण का नमूना","रिमोट प्रोग्रामिंग उपकरण का नमूना","रिमोट मरम्मत उपकरण का नमूना"][i])} /><figcaption>{t(["Key-cutting equipment","Remote programming","Remote repair tools"][i],["चाबी कटिंग उपकरण","रिमोट प्रोग्रामिंग","रिमोट मरम्मत उपकरण"][i])}</figcaption></figure>)}</div></section>
<section className="section shop-inline"><Reveal><Image src="/Bhim-Lock-And-Keys/images/key-making-sign.webp" alt={t("Real duplicate key and sensor chip sign outside our shop", "दुकान का डुप्लीकेट चाबी और सेंसर चिप बोर्ड")} width={700} height={900} sizes="(max-width:700px) 90vw, 35vw" /></Reveal><div><p className="eyebrow">{t("YOUR LOCAL KEY SHOP", "आपकी स्थानीय चाबी की दुकान")}</p><h2>{t("A real shop. A conversation away.", "आपकी अपनी दुकान। बस एक कॉल दूर।")}</h2><p>{t("Visit SCO 3002, Sector 22 D, Chandigarh. Bring your key or send a clear photo before visiting.", "एससीओ 3002, सेक्टर 22 डी, चंडीगढ़ आएं। अपनी चाबी लाएं या पहले साफ़ फोटो भेजें।")}</p><a className="button" href={whatsapp(defaultMessage)} data-event="whatsapp_click">WhatsApp ↗</a></div></section>
        <section id="interview" className="section interview-section">
<figure><Image src="/Bhim-Lock-And-Keys/images/interview-snapshot.png" alt={t("Bhim Lock and Keys owner being interviewed inside the shop by Harsimar Daily Vlogs", "दुकान के अंदर मालिक का इंटरव्यू")} width={1010} height={1440} sizes="(max-width:700px) 90vw, 40vw" /><figcaption>{t("Interview snapshot supplied by the shop · Harsimar Daily Vlogs", "दुकान द्वारा साझा इंटरव्यू की तस्वीर · Harsimar Daily Vlogs")}</figcaption></figure>
<div><p className="eyebrow">{t("MEET THE PERSON BEHIND THE KEYS", "चाबियों के पीछे का हुनर")}</p><h2>{t("35 years. A story worth sharing.", "35 साल। एक खास कहानी।")}</h2><p>{t("Meet the owner of Bhim Lock and Keys in this interview filmed inside our Chandigarh shop.", "चंडीगढ़ की हमारी दुकान में फिल्माए गए इस इंटरव्यू में मालिक से मिलिए।")}</p><a className="button brass" href={shop.interviewUrl} target="_blank" rel="noopener noreferrer">{t("Watch the full interview on YouTube", "YouTube पर पूरा इंटरव्यू देखें")} ↗</a><a href={shop.interviewUrl} target="_blank" rel="noopener noreferrer" aria-label={t("Open the full interview on YouTube", "YouTube पर पूरा इंटरव्यू खोलें")}><Image className="interview-preview" src="/Bhim-Lock-And-Keys/images/interview-preview.jpeg" alt={t("YouTube interview: I Interviewed a 35-Year Car Key Business Owner", "YouTube इंटरव्यू: 35 साल पुराने चाबी व्यवसाय के मालिक")} width={1206} height={314} sizes="(max-width:700px) 90vw, 45vw" /></a></div></section>
<CustomerReviews locale={locale} />
        <Reviews locale={locale} />
        <section id="finder" className="finder section">
          <div>
            <p className="eyebrow">
              02 / {t("LET’S TALK CAR KEYS", "कार की चाबी की बात")}
            </p>
            <h2>
              {t("Your car.", "आपकी कार।")}
              <br />
              <em>{t("Your next key.", "आपकी अगली चाबी।")}</em>
            </h2>
            <p>
              {t(
                "Three details to get the conversation started. The shop checks the options with you.",
                "बात शुरू करने के लिए तीन जानकारियां। दुकान आपके साथ विकल्प जांचेगी।",
              )}
            </p>
          </div>
          <Finder locale={locale} />
        </section>
        <section id="how-it-works" className="section story">
          <div className="story-sticky">
            <p className="eyebrow">
              03 / {t("FROM QUESTION TO KEY", "सवाल से चाबी तक")}
            </p>
            <h2>
              {t("Keep it", "आसान")}
              <br />
              <em>{t("simple.", "रखें।")}</em>
            </h2>
            <KeyStage story locale={locale} />
          </div>
          <div className="steps">
            {[
              [
                t("Tell us what you need.", "अपनी ज़रूरत बताएं।"),
                t(
                  "A spare key? A remote that needs attention? Start with a call or send your car details.",
                  "अतिरिक्त चाबी या खराब रिमोट? कॉल करें या कार की जानकारी भेजें।",
                ),
              ],
              [
                t("Share the small details.", "ज़रूरी जानकारी भेजें।"),
                t(
                  "A clear photo and your model/year help the shop understand the job. Confirm the options and quote.",
                  "साफ़ फोटो, मॉडल और साल काम समझने में मदद करते हैं। विकल्प और कीमत की पुष्टि करें।",
                ),
              ],
              [
                t("Plan your visit.", "दुकान आने की योजना बनाएं।"),
                t(
                  "Confirm the opening hours and what to bring, then visit us in Sector 22, Chandigarh.",
                  "समय और ज़रूरी सामान की पुष्टि करके सेक्टर 22, चंडीगढ़ आएं।",
                ),
              ],
            ].map(([title, body], i) => (
              <Reveal className="step" key={i}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </Reveal>
            ))}
          </div>
        </section>
        <section id="collection" className="section">
          <Reveal className="section-heading">
            <div>
              <p className="eyebrow">
                04 / {t("THE LITTLE THINGS", "छोटी-छोटी चीज़ें")}
              </p>
              <h2>
                {t("Good company", "चाबियों के")}
                <br />
                <em>{t("for your keys.", "अच्छे साथी।")}</em>
              </h2>
            </div>
            <p>
              {t(
                "A look at the possibilities. Illustrations below are concepts; ask the shop for real products and current stock.",
                "कुछ संभावनाएं देखें। नीचे नमूने हैं; असली उत्पाद और स्टॉक के लिए दुकान से पूछें।",
              )}
            </p>
          </Reveal>
          <div className="products">
            {shop.products.map((product) => (
              <Product key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </section>
        <section className="photo-cta section">
          <span className="photo-symbol" aria-hidden>
            ⌗
          </span>
          <div>
            <p className="eyebrow">
              {t("NO NEED TO KNOW THE NAME", "नाम जानना ज़रूरी नहीं")}
            </p>
            <h2>
              {t("Not sure which key?", "कौन-सी चाबी है?")}
              <br />
              <em>{t("Send a photo.", "फोटो भेजें।")}</em>
            </h2>
            <p>
              {t(
                "Open WhatsApp, attach a clear photo of your key or remote, and tell us what you need.",
                "WhatsApp खोलें, चाबी या रिमोट की साफ़ फोटो जोड़ें और अपनी ज़रूरत बताएं।",
              )}
            </p>
          </div>
          <a
            className="button brass"
            data-event="whatsapp_click"
            href={whatsapp(
              "Hello, I need help identifying my key. I will attach a photo here. Please advise.",
            )}
          >
            {t("Send on WhatsApp", "WhatsApp पर भेजें")} ↗
          </a>
        </section>
        <section className="section why">
          <div>
            <p className="eyebrow">
              05 / {t("WHY VISIT BHIM", "भीम पर क्यों आएं")}
            </p>
            <h2>
              {t("A real shop.", "असली दुकान।")}
              <br />
              <em>{t("A direct conversation.", "सीधी बातचीत।")}</em>
            </h2>
          </div>
          <div className="why-items">
            {[
              [
                t("Talk to the shop", "दुकान से बात करें"),
                t(
                  "Ask your questions directly, without guessing which key is right.",
                  "अंदाज़ा लगाने के बजाय अपनी ज़रूरत पर सीधे सवाल पूछें।",
                ),
              ],
              [
                t("Decide with the details", "जानकारी के साथ तय करें"),
                t(
                  "Discuss the work and price before you go ahead.",
                  "आगे बढ़ने से पहले काम और कीमत पर बात करें।",
                ),
              ],
              [
                t("Find us in Sector 22", "सेक्टर 22 में आएं"),
                t(
                  "A local address in Chandigarh for your key and lock enquiries.",
                  "चाबियों और तालों के लिए चंडीगढ़ का स्थानीय पता।",
                ),
              ],
            ].map(([a, b]) => (
              <div key={a}>
                <span aria-hidden>↗</span>
                <h3>{a}</h3>
                <p>{b}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="faq" className="section faq">
          <div>
            <p className="eyebrow">
              07 / {t("BEFORE YOU VISIT", "आने से पहले")}
            </p>
            <h2>
              {t("A few", "कुछ")}
              <br />
              <em>{t("good questions.", "अच्छे सवाल।")}</em>
            </h2>
          </div>
          <div>
            {shop.faqs.map((f) => (
              <details key={f.q.en}>
                <summary>
                  {f.q[locale]}
                  <span aria-hidden>+</span>
                </summary>
                <p>{f.a[locale]}</p>
              </details>
            ))}
          </div>
        </section>
        <section id="contact" className="section contact">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                08 / {t("COME SAY HELLO", "आइए, मिलते हैं")}
              </p>
              <h2>
                {t("Let’s open", "नई राहें")}
                <br />
                <em>{t("new doors.", "खोलें।")}</em>
              </h2>
            </div>
            <div>
              <p>
                Bhim Lock and Keys
                <br />
                {shop.streetAddress}
                {shop.streetAddress && <br />}
                {t("Chandigarh, India", "चंडीगढ़, भारत")}
              </p>
              <p className="contact-extra"><strong>{t("Open all 7 days", "सप्ताह के सातों दिन खुला")}</strong><br /><a href={`tel:${shop.secondaryPhone}`} data-event="call_click">+91 94633 93119</a><br /><a href={`mailto:${shop.email}`}>{shop.email}</a></p><dl className="shop-timetable" aria-label={t("Opening hours (IST)", "खुलने का समय (IST)")}>
                {Object.entries(shop.hours ?? {}).map(([day, intervals]) => (
                  <div key={day} className="flex gap-3">
                    <dt>{({Mon:t("Monday","सोमवार"),Tue:t("Tuesday","मंगलवार"),Wed:t("Wednesday","बुधवार"),Thu:t("Thursday","गुरुवार"),Fri:t("Friday","शुक्रवार"),Sat:t("Saturday","शनिवार"),Sun:t("Sunday","रविवार")} as Record<string,string>)[day]}</dt>
                    <dd>{intervals?.map(pair => pair.map(v => {const [h,m]=v.split(":"); return (Number(h)%12||12)+":"+m+" "+(Number(h)<12?"AM":"PM");}).join(" – ")).join(", ") || t("Closed","बंद")}</dd>
                  </div>
                ))}
              </dl>
              <HoursBadge locale={locale} />
              {!hasPhone && (
                <p className="setup-note">
                  {t(
                    "Contact details are awaiting owner verification.",
                    "संपर्क जानकारी की मालिक से पुष्टि बाकी है।",
                  )}
                </p>
              )}
              <div className="actions">
                <a
                  className="button brass"
                  data-event="call_click"
                  href={callHref}
                >
                  {hasPhone ? "+91 98553 67929" : t("Call 98553 67929", "कॉल 98553 67929")} ↗
                </a>
                {shop.secondaryPhone && (
  <a
    className="button brass"
    data-event="call_click"
    href={`tel:${shop.secondaryPhone}`}
  >
    {t("Call 94633 93119", "कॉल 94633 93119")} ↗
  </a>
)}
                {shop.secondaryPhone && (
  <a
    className="button outline"
    href={whatsapp(defaultMessage, "919463393119")}
    data-event="whatsapp_click"
  >
    WhatsApp 94633 93119 <span aria-hidden>↗</span>
  </a>
)}
                
                <a
                  className="button outline"
                  data-event="directions_click"
                  href={shop.directions}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("Get directions", "रास्ता देखें")} ↗
                </a>
              </div>
            </div>
          </div>
          <Image className="contact-shop" src="/Bhim-Lock-And-Keys/images/shop-sign.webp" alt={t("Real shop sign and entrance of Bhim Lock and Keys", "भीम लॉक एंड कीज़ का असली बोर्ड और प्रवेश द्वार")} width={1200} height={680} sizes="90vw" />
          <div className="contact-grid">
            <div className="map">
              <iframe
                title={t(
                  "Google Map — Sector 22, Chandigarh",
                  "Google मानचित्र — सेक्टर 22, चंडीगढ़",
                )}
                src={
                  shop.mapsEmbed ||
                  "https://www.google.com/maps?q=Sector+22+Chandigarh&output=embed"
                }
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <p className="small">
                {shop.mapsEmbed
                  ? t(
                      "Confirm opening hours before visiting.",
                      "आने से पहले समय पूछें।",
                    )
                  : t(
                      "Area map only. Exact shop pin awaits owner verification.",
                      "यह क्षेत्र का मानचित्र है। दुकान के सटीक स्थान की पुष्टि बाकी है।",
                    )}
              </p>
            </div>
            <Inquiry locale={locale} />
          </div>
        </section>
      </main>
      <footer className="section footer">
        <a className="brand" href="#">
          BHIM <small>LOCK AND KEYS</small>
        </a>
        <span>
          {t(
            "Small keys. Everyday possibilities.",
            "छोटी चाबियां। रोज़ की संभावनाएं।",
          )}
        </span>
        <div>
          <a href="/privacy">{t("Privacy", "गोपनीयता")}</a>
          <a href="/terms">{t("Terms", "शर्तें")}</a>
          <a href="#main">{t("Back to top", "ऊपर जाएं")} ↑</a>
        </div>
      </footer>
      <nav
        className="mobile-bar"
        aria-label={t("Quick contact", "तुरंत संपर्क")}
      >
        <a data-event="call_click" href={callHref}>
          ↗ {t("Call", "कॉल")}
        </a>
        <a data-event="call_click" href={`tel:${shop.secondaryPhone}`}>
  ↗ {t("Call 94633", "कॉल 94633")}
</a>
        <a data-event="whatsapp_click" href={whatsapp(defaultMessage)}>
          WhatsApp
        </a>
        <a data-event="directions_click" href={shop.directions}>
          ⌖ {t("Directions", "रास्ता")}
        </a>
      </nav>
    </>
  );
}
