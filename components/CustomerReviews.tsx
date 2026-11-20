import Image from "next/image";
import reviews from "@/content/customer-reviews.json";
import type { Locale } from "@/lib/shop";
export default function CustomerReviews({ locale }: { locale: Locale }) {
  return <section className="section supplied-reviews" id="customer-reviews">
    <p className="eyebrow">CUSTOMER REVIEWS / ग्राहक समीक्षाएं</p>
    <h2>{locale === "en" ? "Shared by our visitors." : "ग्राहकों की अपनी राय।"}</h2>
    <p className="review-source">{locale === "en" ? "Google review screenshots supplied by the shop owner. These are saved screenshots, not a live rating feed." : "दुकान के मालिक द्वारा भेजे गए Google समीक्षा स्क्रीनशॉट। ये सहेजे गए स्क्रीनशॉट हैं, लाइव रेटिंग नहीं।"}</p>
    <div className="reviews-grid">{reviews.map(review => <figure className="supplied-review" key={review.author}>
      <figcaption>{review.author}</figcaption>
      <a href={review.image} target="_blank" rel="noopener noreferrer" aria-label={`${locale === "en" ? "Open full review screenshot from" : "पूरी समीक्षा देखें:"} ${review.author}`}>
        <Image src={review.image} width={600} height={1000} sizes="(max-width:700px) 88vw, 30vw" alt={`${locale === "en" ? "Owner-supplied Google review screenshot from" : "Google समीक्षा स्क्रीनशॉट:"} ${review.author}`} />
      </a>
    </figure>)}</div>
  </section>;
}
