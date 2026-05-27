import { useEffect } from "react";

const T = {
  bg: "#0A0F1E", surface: "#111827", card: "#1A2235",
  border: "#1E2D45", accent: "#00D4FF",
  text: "#F0F4FF", textMid: "#8A9BC4", textDim: "#4A5880",
};

// Vite SPA equivalent of Next's `next/script` with FAQPage JSON-LD:
// imperatively manage a single <script type="application/ld+json"> in <head>,
// keyed by a stable id so re-mounts don't duplicate it.
function useFaqSchema(id, faqs) {
  useEffect(() => {
    if (!faqs?.length) return;
    const tagId = `faq-jsonld-${id}`;
    let el = document.getElementById(tagId);
    if (!el) {
      el = document.createElement("script");
      el.type = "application/ld+json";
      el.id = tagId;
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
    return () => {
      const stale = document.getElementById(tagId);
      if (stale) stale.remove();
    };
  }, [id, faqs]);
}

export default function FAQSection({ id = "faq", title = "Frequently asked questions", faqs }) {
  useFaqSchema(id, faqs);

  if (!faqs?.length) return null;

  return (
    <section style={{ padding: "80px 0", background: T.surface, borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px" }}>
        <h2 style={{
          fontFamily: "Sora, 'DM Sans', sans-serif",
          fontSize: "clamp(26px, 4vw, 38px)",
          fontWeight: 900,
          letterSpacing: -0.8,
          color: T.text,
          marginBottom: 32,
          textAlign: "center",
        }}>
          {title}
        </h2>
        <div>
          {faqs.map((f, i) => (
            <div key={i} style={{
              borderBottom: `1px solid ${T.border}`,
              padding: "22px 0",
            }}>
              <h2 style={{
                fontFamily: "Sora, 'DM Sans', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: T.text,
                marginBottom: 10,
                lineHeight: 1.4,
              }}>
                {f.question}
              </h2>
              <p style={{
                color: T.textMid,
                fontSize: 15,
                lineHeight: 1.7,
              }}>
                {f.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
