import { NextResponse } from "next/server";
export const revalidate = 86400;
export const dynamic = "force-static";
type GoogleReview = {
  authorAttribution?: { displayName?: string; uri?: string };
  rating?: number;
  text?: { text?: string };
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
};
const safeURL = (url: unknown) =>
  typeof url === "string" && url.startsWith("https://") ? url : "";
export async function GET() {
  const key = process.env.GOOGLE_PLACES_API_KEY,
    id = process.env.GOOGLE_PLACE_ID;
  if (!key || !id) return NextResponse.json(null);
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`,
      {
        headers: {
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "rating,userRatingCount,reviews,googleMapsUri",
        },
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) return NextResponse.json(null);
    const data = await res.json();
    if (typeof data.rating !== "number" || !data.userRatingCount)
      return NextResponse.json(null);
    return NextResponse.json({
      rating: data.rating,
      count: data.userRatingCount,
      uri: safeURL(data.googleMapsUri),
      reviews: (data.reviews || [])
        .slice(0, 3)
        .map((r: GoogleReview) => ({
          author: r.authorAttribution?.displayName || "Google user",
          authorUri: safeURL(r.authorAttribution?.uri),
          rating: r.rating || 0,
          text: r.text?.text || "",
          time: r.relativePublishTimeDescription || "",
          uri: safeURL(r.googleMapsUri),
        })),
    });
  } catch {
    return NextResponse.json(null);
  }
}
