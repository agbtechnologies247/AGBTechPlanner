import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Industries — AGB Tech Planner",
  description:
    "AGB Tech Planner supports 100+ industries across B2B and B2C. Find your vertical and start planning today.",
};

const B2B_INDUSTRIES = {
  "Core & Traditional": [
    "Manufacturing", "Wholesale Distribution", "Logistics & Supply Chain",
    "Industrial Equipment", "Construction & Infrastructure", "Chemicals & Petrochemicals",
    "Mining & Metals", "Oil & Gas Services", "Automotive Components", "Textiles & Apparel Manufacturing",
  ],
  "Technology & Digital": [
    "SaaS", "IT Services & Consulting", "Cloud Computing Services", "Cybersecurity Services",
    "Data Analytics & BI", "AI & Machine Learning Solutions", "DevOps & Infrastructure Services",
    "ERP & CRM Solutions", "FinTech Infrastructure", "API & Integration Platforms",
  ],
  "Financial & Professional Services": [
    "Accounting & Auditing Firms", "Legal Services", "HR & Recruitment Services",
    "Payroll Processing", "Management Consulting", "Business Process Outsourcing (BPO)",
    "KPO (Knowledge Process Outsourcing)", "Corporate Training & L&D",
    "Risk & Compliance Services", "Investment & Advisory Services",
  ],
  "Marketing & Sales Enablement": [
    "Digital Marketing Agencies", "Advertising Agencies", "PR & Communications Firms",
    "Market Research Firms", "Lead Generation Services", "Sales Enablement Platforms",
  ],
  "Healthcare & Pharma": [
    "Medical Equipment Suppliers", "Pharmaceutical Manufacturing",
    "Healthcare IT Solutions", "Diagnostic Labs (B2B services)",
  ],
  "Retail & Commerce Support": [
    "E-commerce Enablement Platforms", "Payment Gateways & Processing",
    "Inventory & Warehouse Management", "Packaging Solutions", "Retail Tech (POS systems)",
  ],
  "Specialized & Emerging": [
    "Renewable Energy Solutions", "Waste Management & Recycling",
    "AgriTech & Farm Solutions", "Facility Management Services", "Security & Surveillance Solutions",
  ],
};

const B2C_INDUSTRIES = {
  "Retail & Consumer Goods": [
    "Supermarkets & Grocery Stores", "Fashion Retail", "Electronics Retail",
    "Furniture Stores", "Home Decor Stores", "Bookstores", "Toy Stores",
    "Pet Stores", "Sports Goods Retail", "Jewelry Retail",
  ],
  "Food & Hospitality": [
    "Restaurants", "Cafes & Coffee Shops", "Food Delivery Platforms",
    "Cloud Kitchens", "Catering Services", "Bakeries", "Ice Cream Parlors",
  ],
  "Personal Services": [
    "Salons & Spas", "Fitness Centers & Gyms", "Yoga Studios",
    "Personal Coaching", "Event Planning Services", "Photography Services",
  ],
  "Healthcare & Wellness": [
    "Hospitals", "Clinics", "Diagnostic Centers", "Pharmacies", "Mental Health Services",
  ],
  "Education & Learning": [
    "Schools", "Colleges", "Coaching Classes", "Online Learning Platforms", "Skill Development Institutes",
  ],
  "Entertainment & Lifestyle": [
    "Movie Theaters", "Gaming Centers", "Streaming Platforms", "Travel Agencies", "Tour Operators",
  ],
  "Financial & Utility": [
    "Retail Banking", "Insurance Providers", "Stock Trading Platforms", "Wallets & UPI Apps",
  ],
  "D2C Brands": [
    "Apparel Brands", "Footwear Brands", "Skincare Brands", "Haircare Brands",
    "Cosmetics Brands", "Organic Beauty Products", "Men's Grooming Brands",
    "Packaged Snacks Brands", "Health Foods", "Organic Food Brands", "Beverage Brands",
    "Nutraceutical Brands", "Home Decor Brands", "Furniture D2C Brands",
    "Bedding & Mattress Brands", "Baby Care Products", "Kids Toys",
    "Pet Food Brands", "Consumer Electronics Brands", "Smart Devices (IoT)",
    "Eco-friendly Products", "Handmade / Artisan Products", "Customized Gifts",
    "Online Courses", "Creator Merch Brands", "Subscription Content Platforms",
    "Jewelry D2C Brands", "Eyewear Brands", "Watch Brands", "Stationery Brands",
  ],
};

const CATEGORY_COLORS = [
  "#6366f1", "#a855f7", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#14b8a6",
];

function IndustrySection({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 4,
            height: 20,
            borderRadius: 2,
            background: color,
            flexShrink: 0,
          }}
        />
        <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>{title}</h3>
        <span
          style={{
            fontSize: "0.75rem",
            color: color,
            background: `${color}18`,
            border: `1px solid ${color}33`,
            padding: "2px 8px",
            borderRadius: 100,
            fontWeight: 600,
          }}
        >
          {items.length}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {items.map((ind) => (
          <span
            key={ind}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              fontSize: "0.82rem",
              transition: "all 0.2s",
              cursor: "default",
            }}
          >
            {ind}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function IndustriesPage() {
  const b2bEntries = Object.entries(B2B_INDUSTRIES);
  const b2cEntries = Object.entries(B2C_INDUSTRIES);

  return (
    <div style={{ paddingTop: 64 }}>
      {/* Header */}
      <section
        style={{
          padding: "80px 24px 64px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="badge" style={{ marginBottom: 16 }}>✦ All Industries</div>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            marginBottom: 20,
            letterSpacing: "-0.03em",
          }}
        >
          One Planner for{" "}
          <span className="gradient-text">Every Vertical</span>
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            maxWidth: 560,
            margin: "0 auto",
            fontSize: "1.05rem",
            lineHeight: 1.7,
          }}
        >
          Whether you run a factory floor or a fashion D2C brand — AGB Tech
          Planner adapts to your workflow.
        </p>

        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 48 }}>
          {[
            { val: "50+", label: "B2B Industries" },
            { val: "80+", label: "B2C Industries" },
            { val: "130+", label: "Total Verticals" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg,#6366f1,#a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.val}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: 4 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* B2B Section */}
      <section className="section">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
          }}
        >
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 100,
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(99,102,241,0.25)",
              color: "#818cf8",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
            }}
          >
            B2B INDUSTRIES
          </div>
          <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
        </div>

        {b2bEntries.map(([cat, items], i) => (
          <IndustrySection
            key={cat}
            title={cat}
            items={items}
            color={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
          />
        ))}
      </section>

      {/* B2C Section */}
      <section
        className="section"
        style={{
          paddingTop: 0,
          borderTop: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 48,
            paddingTop: 64,
          }}
        >
          <div
            style={{
              padding: "8px 20px",
              borderRadius: 100,
              background: "rgba(168,85,247,0.12)",
              border: "1px solid rgba(168,85,247,0.25)",
              color: "#c084fc",
              fontWeight: 700,
              fontSize: "0.85rem",
              letterSpacing: "0.05em",
            }}
          >
            B2C INDUSTRIES
          </div>
          <div style={{ height: 1, flex: 1, background: "var(--border)" }} />
        </div>

        {b2cEntries.map(([cat, items], i) => (
          <IndustrySection
            key={cat}
            title={cat}
            items={items}
            color={CATEGORY_COLORS[(i + 3) % CATEGORY_COLORS.length]}
          />
        ))}
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 24px",
          textAlign: "center",
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
            fontWeight: 800,
            marginBottom: 16,
            letterSpacing: "-0.02em",
          }}
        >
          Don&apos;t see your industry?
        </h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 32, fontSize: "1rem" }}>
          AGB Planner is fully customizable — build your own workflow in minutes.
        </p>
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ fontSize: "1rem", padding: "16px 36px" }}
        >
          Start Building →
        </a>
      </section>
    </div>
  );
}
