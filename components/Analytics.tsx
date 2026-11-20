"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
export function track(name: string, params: Record<string, string> = {}) {
  window.gtag?.("event", name, params);
}
export default function Analytics() {
  const id = process.env.NEXT_PUBLIC_GA_ID;
  const [consent, setConsent] = useState<string | null>("pending");
  useEffect(() => {
    try {
      setConsent(localStorage.getItem("bhim-analytics"));
    } catch {
      setConsent("no");
    }
    const handler = (e: MouseEvent) => {
      const a = (e.target as Element).closest<HTMLAnchorElement>(
        "a[data-event]",
      );
      if (a && a.getAttribute("href") !== "#contact")
        track(a.dataset.event!, {
          placement: a.closest("nav") ? "navigation" : "page",
        });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  const choose = (value: string) => {
    setConsent(value);
    try {
      localStorage.setItem("bhim-analytics", value);
    } catch {}
  };
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return null;
  return (
    <>
      {consent === null && (
        <div
          className="analytics-consent"
          role="region"
          aria-label="Analytics choice"
        >
          <p>
            Allow anonymous usage analytics? / उपयोग के आंकड़ों की अनुमति दें?
          </p>
          <a href="/privacy">Privacy / गोपनीयता</a>
          <div>
            <button onClick={() => choose("yes")}>Allow / हां</button>
            <button onClick={() => choose("no")}>No thanks / नहीं</button>
          </div>
        </div>
      )}
      {consent === "yes" && (
        <>
          <Script
            id="ga-init"
            strategy="afterInteractive"
          >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config',${JSON.stringify(id)},{send_page_view:true});`}</Script>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
            strategy="afterInteractive"
          />
        </>
      )}
    </>
  );
}
