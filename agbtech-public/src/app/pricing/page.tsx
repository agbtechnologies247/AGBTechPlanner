import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — AGB Tech Planner",
  description: "Simple, transparent pricing. Start free — forever.",
};

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    color: "#6b7280",
    highlight: false,
    features: [
      "Up to 3 Plans",
      "Up to 5 Team Members",
      "Kanban Boards",
      "My Day View",
      "Checklists & Labels",
      "CSV Export",
      "Dark Mode",
    ],
    cta: "Get Started Free",
    ctaHref: "http://localhost:5173",
    external: true,
  },
  {
    name: "Team",
    price: "₹999",
    period: "per month",
    color: "#6366f1",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited Plans",
      "Unlimited Members",
      "Everything in Starter",
      "Priority Support",
      "Advanced Analytics",
      "Role Permissions",
      "Comment Threads",
      "Desktop App Access",
    ],
    cta: "Start Free Trial",
    ctaHref: "http://localhost:5173",
    external: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    color: "#a855f7",
    highlight: false,
    features: [
      "Everything in Team",
      "SSO / SAML Auth",
      "On-Premise Deploy",
      "Dedicated Support",
      "Custom Integrations",
      "SLA Guarantees",
      "Audit Logs",
      "White-labeling",
    ],
    cta: "Contact Sales",
    ctaHref: "mailto:support@agbtechnologies.com",
    external: false,
  },
];

export default function PricingPage() {
  return (
    <div style={{ paddingTop: 64 }}>
      {/* Header */}
      <section
        style={{
          padding: "80px 24px 64px",
          textAlign: "center",
          background: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="badge" style={{ marginBottom: 16 }}>✦ Pricing</div>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            marginBottom: 20,
            letterSpacing: "-0.03em",
          }}
        >
          Simple, <span className="gradient-text">transparent pricing</span>
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: 480, margin: "0 auto" }}>
          Start free, upgrade when you grow. No hidden fees. Cancel anytime.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="section">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            maxWidth: 960,
            margin: "0 auto",
            alignItems: "start",
          }}
        >
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className="glass-card"
              style={{
                padding: "36px 28px",
                position: "relative",
                border: plan.highlight
                  ? `1px solid ${plan.color}55`
                  : "1px solid var(--border)",
                boxShadow: plan.highlight
                  ? `0 0 48px ${plan.color}22`
                  : "none",
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: -12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: `linear-gradient(135deg, #6366f1, #a855f7)`,
                    color: "white",
                    padding: "4px 16px",
                    borderRadius: 100,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: plan.color, marginBottom: 16 }}>
                {plan.name}
              </h2>

              <div style={{ marginBottom: 24 }}>
                <span
                  style={{
                    fontSize: "2.8rem",
                    fontWeight: 800,
                    color: "var(--text)",
                  }}
                >
                  {plan.price}
                </span>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginLeft: 6 }}>
                  {plan.period}
                </span>
              </div>

              <div style={{ height: 1, background: "var(--border)", marginBottom: 24 }} />

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px", display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      color: "var(--text-muted)",
                      fontSize: "0.88rem",
                    }}
                  >
                    <span style={{ color: plan.color, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaHref}
                target={plan.external ? "_blank" : undefined}
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 10,
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  background: plan.highlight
                    ? `linear-gradient(135deg, ${plan.color}, #a855f7)`
                    : "transparent",
                  border: plan.highlight ? "none" : `1px solid var(--border)`,
                  color: plan.highlight ? "white" : "var(--text)",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 640, margin: "80px auto 0", textAlign: "center" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: 32 }}>
            Common Questions
          </h2>
          {[
            {
              q: "Is the free plan really free?",
              a: "Yes, permanently. No credit card required. Create up to 3 plans with 5 team members.",
            },
            {
              q: "Can I run it locally?",
              a: "Absolutely — that's the whole point. AGB Planner runs with a local database. Your data never leaves your machine unless you want it to.",
            },
            {
              q: "What is the desktop app?",
              a: "An Electron-based desktop wrapper that bundles the entire app + local server so you can use it offline, without a browser.",
            },
          ].map((faq) => (
            <div
              key={faq.q}
              className="glass-card"
              style={{ padding: 24, marginBottom: 16, textAlign: "left" }}
            >
              <div style={{ fontWeight: 600, marginBottom: 8, fontSize: "0.95rem" }}>{faq.q}</div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.7 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
