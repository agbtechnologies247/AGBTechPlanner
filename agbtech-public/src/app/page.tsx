import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB Tech Planner — Smart Task Management for Every Team",
  description:
    "Organize projects, assign tasks, and hit deadlines across 100+ industry verticals. Web + Desktop. Free to start.",
};

const FEATURES = [
  {
    icon: "🗂️",
    title: "Kanban Boards",
    desc: "Drag-and-drop tasks between customizable buckets. Visual clarity at every stage.",
  },
  {
    icon: "👥",
    title: "Multi-User Teams",
    desc: "Invite members, assign roles, and collaborate in real time across all plans.",
  },
  {
    icon: "📊",
    title: "Live Dashboard",
    desc: "Completion rates, priority charts, and overdue alerts — at a glance.",
  },
  {
    icon: "☀️",
    title: "My Day View",
    desc: "Focus on what matters today. Personal task view with due-date prioritization.",
  },
  {
    icon: "✅",
    title: "Checklists & Labels",
    desc: "Break tasks into steps. Tag with labels for instant filtering and tracking.",
  },
  {
    icon: "💻",
    title: "Desktop App",
    desc: "Download the Electron app and work offline. Your data stays with you.",
  },
];

const INDUSTRIES_PREVIEW = [
  "Manufacturing", "SaaS", "Logistics", "Healthcare IT", "Legal Services",
  "Retail", "Construction", "Digital Marketing", "Fintech", "EdTech",
  "AgriTech", "E-commerce", "Cybersecurity", "Oil & Gas", "Pharma",
];

const TESTIMONIALS = [
  {
    name: "Mahesh Lakhe",
    role: "Lead Engineer, AGB Tech",
    text: "Finally a planner that doesn't get in our way. Our sprint reviews are 40% faster.",
  },
  {
    name: "Rushabh Korde",
    role: "Product Manager",
    text: "The Kanban + My Day combo is perfect. I can context-switch between projects instantly.",
  },
  {
    name: "Omkar Vani",
    role: "Operations Lead",
    text: "We run 12 concurrent plans. The member management saves us hours every week.",
  },
];

export default function HomePage() {
  return (
    <div style={{ paddingTop: 64 }}>
      {/* HERO */}
      <section
        style={{
          minHeight: "92vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background blobs */}
        <div
          className="glow-blob"
          style={{
            width: 600,
            height: 600,
            background: "#6366f1",
            top: "5%",
            left: "15%",
            opacity: 0.12,
          }}
        />
        <div
          className="glow-blob"
          style={{
            width: 400,
            height: 400,
            background: "#a855f7",
            top: "20%",
            right: "10%",
            opacity: 0.1,
          }}
        />

        <div style={{ maxWidth: 760, zIndex: 1, position: "relative" }}>
          <div className="badge" style={{ marginBottom: 24 }}>
            ✦ Now with Desktop App Support
          </div>

          <h1
            style={{
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
              letterSpacing: "-0.03em",
            }}
          >
            Task Management{" "}
            <span className="gradient-text">Built for Every</span>
            <br />
            Industry
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              color: "var(--text-muted)",
              marginBottom: 40,
              lineHeight: 1.7,
              maxWidth: 580,
              margin: "0 auto 40px",
            }}
          >
            From manufacturing floors to SaaS pipelines — AGB Tech Planner
            keeps your teams aligned, your tasks moving, and your deadlines
            honest.
          </p>

          <div
            style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}
          >
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ fontSize: "1rem", padding: "16px 32px" }}
            >
              Start Planning Free →
            </a>
            <Link href="/download" className="btn-secondary" style={{ fontSize: "1rem", padding: "16px 32px" }}>
              ↓ Download Desktop App
            </Link>
          </div>

          {/* Social proof numbers */}
          <div
            style={{
              display: "flex",
              gap: 48,
              justifyContent: "center",
              marginTop: 64,
              flexWrap: "wrap",
            }}
          >
            {[
              { val: "100+", label: "Industry Templates" },
              { val: "∞", label: "Tasks & Projects" },
              { val: "5+", label: "Team Members" },
              { val: "0$", label: "To Get Started" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "2.2rem",
                    fontWeight: 800,
                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {s.val}
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 4 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APP PREVIEW MOCKUP */}
      <section style={{ padding: "0 24px 96px", maxWidth: 1100, margin: "0 auto" }}>
        <div
          className="glass-card animate-pulse-glow"
          style={{
            padding: 4,
            background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.1))",
            borderRadius: 20,
          }}
        >
          <div
            style={{
              background: "var(--bg-card)",
              borderRadius: 17,
              overflow: "hidden",
              height: 420,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {/* Mock app UI */}
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "linear-gradient(180deg, #0e1320 0%, #080b14 100%)",
                padding: 24,
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: 16,
              }}
            >
              {/* Sidebar mock */}
              <div style={{ borderRight: "1px solid var(--border)", paddingRight: 16 }}>
                <div
                  style={{
                    height: 28,
                    marginBottom: 20,
                    width: "70%",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Image src="/logo.png" alt="Logo" width={60} height={28} style={{ objectFit: "contain" }} />
                </div>
                {["Dashboard", "My Day", "My Tasks", "Plan A", "Plan B"].map((item, i) => (
                  <div
                    key={item}
                    style={{
                      height: 32,
                      borderRadius: 8,
                      background: i === 0 ? "rgba(99,102,241,0.25)" : "transparent",
                      border: i === 0 ? "1px solid rgba(99,102,241,0.2)" : "none",
                      marginBottom: 6,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 12px",
                      fontSize: "0.75rem",
                      color: i === 0 ? "#818cf8" : "var(--text-muted)",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Main area mock */}
              <div style={{ overflow: "hidden" }}>
                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  {["To Do", "In Progress", "Done"].map((col, ci) => (
                    <div key={col} style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                          marginBottom: 8,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {col}
                      </div>
                      {[1, 2, 3].slice(0, ci === 1 ? 2 : 3).map((t) => (
                        <div
                          key={t}
                          className="glass-card"
                          style={{
                            padding: "10px 12px",
                            marginBottom: 8,
                            borderRadius: 10,
                          }}
                        >
                          <div
                            style={{
                              height: 10,
                              borderRadius: 4,
                              background: "rgba(255,255,255,0.08)",
                              marginBottom: 8,
                              width: `${60 + t * 10}%`,
                            }}
                          />
                          <div style={{ display: "flex", gap: 6 }}>
                            <div
                              style={{
                                height: 18,
                                width: 50,
                                borderRadius: 100,
                                background:
                                  ci === 0
                                    ? "rgba(99,102,241,0.2)"
                                    : ci === 1
                                    ? "rgba(245,158,11,0.2)"
                                    : "rgba(16,185,129,0.2)",
                                fontSize: "0.6rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: ci === 0 ? "#818cf8" : ci === 1 ? "#f59e0b" : "#10b981",
                              }}
                            >
                              {ci === 0 ? "Low" : ci === 1 ? "High" : "Done"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="badge" style={{ marginBottom: 16 }}>✦ Features</div>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            Everything your team needs
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem", maxWidth: 500, margin: "0 auto" }}>
            Built for speed, designed for clarity. No bloat — just the features that matter.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-card" style={{ padding: 32 }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: "1.1rem" }}>{f.title}</h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Link href="/features" className="btn-secondary">
            See all features →
          </Link>
        </div>
      </section>

      {/* INDUSTRIES STRIP */}
      <section
        style={{
          padding: "80px 24px",
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="badge" style={{ marginBottom: 16 }}>✦ 100+ Industries</div>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            One Planner. <span className="gradient-text">Every Industry.</span>
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 40 }}>
            From oil rigs to yoga studios — AGB Planner has templates and workflows for every vertical.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {INDUSTRIES_PREVIEW.map((ind) => (
              <span
                key={ind}
                style={{
                  padding: "8px 16px",
                  borderRadius: 100,
                  border: "1px solid var(--border)",
                  background: "rgba(255,255,255,0.03)",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  transition: "all 0.2s",
                }}
              >
                {ind}
              </span>
            ))}
            <Link
              href="/industries"
              style={{
                padding: "8px 16px",
                borderRadius: 100,
                background: "rgba(99,102,241,0.12)",
                border: "1px solid rgba(99,102,241,0.25)",
                color: "#818cf8",
                fontSize: "0.85rem",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              View all 100+ →
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="badge" style={{ marginBottom: 16 }}>✦ Team Reviews</div>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            Loved by the team
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
          }}
        >
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="glass-card" style={{ padding: 32 }}>
              <p
                style={{
                  color: "var(--text)",
                  fontStyle: "italic",
                  lineHeight: 1.7,
                  marginBottom: 24,
                  fontSize: "0.95rem",
                }}
              >
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: "linear-gradient(135deg,#6366f1,#a855f7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "white",
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{t.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "96px 24px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="glow-blob"
          style={{
            width: 500,
            height: 500,
            background: "#6366f1",
            top: "-20%",
            left: "30%",
            opacity: 0.1,
          }}
        />
        <div style={{ maxWidth: 600, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 800,
              marginBottom: 20,
              letterSpacing: "-0.02em",
            }}
          >
            Ready to <span className="gradient-text">ship faster?</span>
          </h2>
          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.05rem",
              marginBottom: 40,
              lineHeight: 1.7,
            }}
          >
            Start organizing your team&apos;s work today. No credit card required.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ fontSize: "1rem", padding: "16px 36px" }}
            >
              Launch Free App →
            </a>
            <Link href="/download" className="btn-secondary" style={{ fontSize: "1rem", padding: "16px 32px" }}>
              Download Desktop
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
