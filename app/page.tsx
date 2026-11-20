import Experience from "@/components/Experience";
import { shop, siteURL, hasPhone } from "@/lib/shop";
export const dynamic = "force-static";
export const metadata = { alternates: { canonical: "/" } };
export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Locksmith",
    name: shop.name,
    email: shop.email,
    description: "A 35-year-old key and locksmith business in Sector 22 D, Chandigarh.",
    url: siteURL,
    image: `${siteURL}/images/og.png`,
    ...(hasPhone ? { telephone: [shop.phone, shop.secondaryPhone] } : {}),
    address: {
      "@type": "PostalAddress",
      ...(shop.streetAddress ? { streetAddress: shop.streetAddress } : {}),
      addressLocality: "Chandigarh",
      addressRegion: "Chandigarh",
      addressCountry: "IN",
    },
    areaServed: "Sector 22, Chandigarh",
    ...(shop.hours
      ? {
          openingHoursSpecification: Object.entries(shop.hours).flatMap(
            ([day, intervals]) =>
              (intervals || []).map(([opens, closes]) => ({
                "@type": "OpeningHoursSpecification",
                dayOfWeek: (
                  {
                    Mon: "Monday",
                    Tue: "Tuesday",
                    Wed: "Wednesday",
                    Thu: "Thursday",
                    Fri: "Friday",
                    Sat: "Saturday",
                    Sun: "Sunday",
                  } as Record<string, string>
                )[day],
                opens,
                closes,
              })),
          ),
        }
      : {}),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\u003c"),
        }}
      />
      <Experience />
    </>
  );
}
