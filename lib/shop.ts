import raw from "@/content/shop.json";
export type Locale = "en" | "hi";
export type Hours = Partial<Record<string, [string, string][]>>;
function schedule(input: Record<string, string[][]> | null): Hours | null {
  if (!input) return null;
  return Object.fromEntries(Object.entries(input).map(([day, pairs]) => [
    day, pairs.map((pair): [string,string] => {
      if(pair.length !== 2) throw new Error("Invalid hours for " + day);
      return [pair[0],pair[1]];
    })
  ]));
}
export const shop = {...raw, hours:schedule(raw.hours)} as Omit<
  typeof raw,
  "hours" | "hoursExceptions" | "photos"
> & {
  hours: Hours | null;
  hoursExceptions: Record<string, [string, string][]>;
  photos: { src: string; alt: { en: string; hi: string } }[];
};
export const siteURL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"; // REPLACE via environment
export const hasPhone = /^\+?[1-9]\d{9,14}$/.test(shop.phone);
export const hasWhatsApp = /^[1-9]\d{9,14}$/.test(shop.whatsapp);
export const callHref = hasPhone ? `tel:${shop.phone}` : "#contact";
export function whatsapp(message: string, number: string = shop.whatsapp) {
  return /^[1-9]\d{9,14}$/.test(number)
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : "#contact";
}
export const defaultMessage =
  "Hello Bhim Lock and Keys, I would like to enquire about a key or lock.";
