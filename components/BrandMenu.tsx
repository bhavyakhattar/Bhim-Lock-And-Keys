"use client";
import { useEffect, useRef } from "react";
import brands from "@/content/car-brands.json";
import { whatsapp, type Locale } from "@/lib/shop";
export default function BrandMenu({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) ref.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && ref.current?.open) {
        ref.current.open = false;
        ref.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", escape); };
  }, []);
  return <details className="brand-menu" ref={ref}>
    <summary>{locale === "en" ? "Keys For" : "कार की चाबियां"} <b aria-hidden="true">⌄</b></summary>
    <div className="brand-menu-panel">
      <p>{locale === "en" ? "Select your car brand" : "अपनी कार का ब्रांड चुनें"}</p>
      <ul>{brands.map(brand => <li key={brand}><a data-event="whatsapp_click" href={whatsapp(`Hello Bhim Lock and Keys, I need help with a ${brand === "Other brand" ? "car" : brand} key. Model: __. Year: __. Service needed: __. Please confirm availability and price.`)}>{brand} <span aria-hidden="true">↗</span></a></li>)}</ul>
      <small>{locale === "en" ? "Enquiries welcome. Service availability depends on your model and year." : "मॉडल और साल के अनुसार सेवा की उपलब्धता की पुष्टि दुकान से करें।"}</small>
    </div>
  </details>;
}
