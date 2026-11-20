export const metadata = {
  title: "Privacy",
  alternates: { canonical: "/privacy" },
};
export default function Privacy() {
  return (
    <main className="section legal">
      <a href="/">← Bhim Lock and Keys</a>
      <h1>Privacy / गोपनीयता</h1>
      <p>
        This site uses your enquiry details only to help the shop respond. /
        आपकी जानकारी दुकान को आपके अनुरोध का जवाब देने में मदद करती है।
      </p>
      <h2>Enquiries</h2>
      <p>
        The form sends your name, phone, car details, selected service and
        optional image to the shop’s email through Resend. The site does not
        maintain a customer database. Image metadata is stripped before sending.
        Do not upload identity documents, vehicle registration documents or
        sensitive personal images.
      </p>
      <p>
        Your email enquiry and attachment may remain in the owner’s mailbox and
        the delivery provider’s logs. Contact the shop to ask for access or
        deletion. // REPLACE: owner must add verified contact details, retention
        period and business-specific privacy terms before launch.
      </p>
      <h2>External services</h2>
      <p>
        WhatsApp and Google Maps open or load third-party services with their
        own privacy policies. Google reviews, when configured, come from Google
        Places. An embedded map connects to Google when loaded.
      </p>
      <h2>Analytics</h2>
      <p>
        If configured, Google Analytics loads only after you allow it. Events
        track call, WhatsApp, directions and successful enquiry interactions.
        Names, phone numbers, images and form contents are never included in
        those events. Clear this site’s browser storage to reset your choice.
      </p>
      <h2>संपर्क और डेटा</h2>
      <p>
        फ़ॉर्म की जानकारी और वैकल्पिक फोटो Resend के ज़रिए दुकान के ईमेल पर भेजे
        जाते हैं। पहचान या वाहन पंजीकरण दस्तावेज़ अपलोड न करें। जानकारी हटवाने
        के लिए दुकान से संपर्क करें। Google Analytics केवल अनुमति देने पर लोड
        होता है। WhatsApp और Google Maps की अपनी गोपनीयता नीतियां हैं।
      </p>
    </main>
  );
}
