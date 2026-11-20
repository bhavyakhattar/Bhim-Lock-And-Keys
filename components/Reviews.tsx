"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/shop";
type Review = {
  author: string;
  authorUri: string;
  rating: number;
  text: string;
  time: string;
  uri: string;
};
type Data = { rating: number; count: number; uri: string; reviews: Review[] };
export default function Reviews({ locale }: { locale: Locale }) {
  const [data, setData] = useState<Data | null>(null);
  const anchor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          fetch("/api/reviews", { signal: controller.signal })
            .then((r) => (r.ok ? r.json() : null))
            .then(setData)
            .catch(() => {});
        }
      },
      { rootMargin: "300px" },
    );
    if (anchor.current) observer.observe(anchor.current);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, []);
  return (
    <div ref={anchor}>
      {data && (
        <section className="section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Google Maps</p>
              <h2>
                {locale === "en" ? "Words from visitors." : "आने वालों की राय।"}
              </h2>
            </div>
            <a href={data.uri} target="_blank" rel="noopener noreferrer">
              {data.rating.toFixed(1)} / 5 · {data.count}{" "}
              {locale === "en" ? "Google reviews" : "Google समीक्षाएं"} ↗
            </a>
          </div>
          <div className="reviews-grid">
            {data.reviews.map((r, i) => (
              <article className="review" key={i}>
                <a href={r.authorUri} target="_blank" rel="noopener noreferrer">
                  {r.author}
                </a>
                <p aria-label={`${r.rating} out of 5`}>
                  {"★".repeat(Math.round(r.rating))}
                </p>
                <blockquote>{r.text}</blockquote>
                <small>{r.time}</small>
                {r.uri && (
                  <p>
                    <a href={r.uri} target="_blank" rel="noopener noreferrer">
                      {locale === "en"
                        ? "Read on Google Maps"
                        : "Google Maps पर पढ़ें"}{" "}
                      ↗
                    </a>
                  </p>
                )}
              </article>
            ))}
          </div>
          <div
            style={{
              background: "#fff",
              width: "fit-content",
              padding: 8,
              marginTop: 24,
            }}
          >
            <Image
              src="/images/powered-by-google.png"
              alt="Powered by Google"
              width={144}
              height={18}
              unoptimized
            />
          </div>
          <p className="small">
            {locale === "en"
              ? "Reviews supplied by Google Maps, sorted by relevance."
              : "Google Maps की समीक्षाएं, प्रासंगिकता के अनुसार।"}
          </p>
        </section>
      )}
    </div>
  );
}
