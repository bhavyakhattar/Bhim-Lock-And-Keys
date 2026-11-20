import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import Analytics from "@/components/Analytics";
import { siteURL } from "@/lib/shop";
import "./globals.css";
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  style: ["normal", "italic"],
});
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f5ef",
};
export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: {
    default: "Bhim Lock and Keys | Sector 22, Chandigarh",
    template: "%s | Bhim Lock and Keys",
  },
  description:
    "Contact Bhim Lock and Keys in Sector 22, Chandigarh for key, car remote, lock and accessory enquiries. Share your car details or ask for a quote.",
  openGraph: {
    title: "Small key. A world of access.",
    description: "Bhim Lock and Keys · Sector 22, Chandigarh",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/images/og.png",
        width: 1200,
        height: 630,
        alt: "Bhim Lock and Keys — Sector 22, Chandigarh",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${fraunces.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
