import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Download — AGB Tech Planner Desktop App",
  description:
    "Download AGB Tech Planner as a native desktop app for Windows and macOS. Powered by Electron. Works offline.",
};

const STEPS = [
  { n: "01", title: "Download the installer", desc: "Click the button for your OS below and save the .exe or .dmg file." },
  { n: "02", title: "Run the installer", desc: "Double-click the file. Windows may show a SmartScreen warning — click 'More info → Run anyway'." },
  { n: "03", title: "Launch and log in", desc: "The app opens with a built-in backend. Use your existing credentials or sign up." },
];

export default function DownloadPage() {
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
        <div className="badge" style={{ marginBottom: 16 }}>✦ Desktop App</div>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            marginBottom: 20,
            letterSpacing: "-0.03em",
          }}
        >
          AGB Planner{" "}
          <span className="gradient-text">for Desktop</span>
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            maxWidth: 520,
            margin: "0 auto 48px",
            fontSize: "1.05rem",
            lineHeight: 1.7,
          }}
        >
          A native Electron desktop app that bundles everything — the UI, the
          local database, and the backend — in one offline-capable package.
        </p>

        {/* Download buttons */}
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <div
            className="glass-card"
            style={{ padding: "28px 40px", textAlign: "center", minWidth: 220 }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🪟</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Windows</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 16 }}>
              Windows 10/11 · x64
            </div>
            <a
              href="/downloads/AGBTech_Planner_Setup.exe"
              download
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: 10,
                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none"
              }}
            >
              Download for Windows
            </a>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: 8 }}>
              v0.0.1 · Stable
            </div>
          </div>

          <div
            className="glass-card"
            style={{ padding: "28px 40px", textAlign: "center", minWidth: 220 }}
          >
            <div style={{ fontSize: 40, marginBottom: 12 }}>🍎</div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>macOS</div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: 16 }}>
              macOS 12+ · Intel & Apple Silicon
            </div>
            <div
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: 10,
                background: "linear-gradient(135deg,#6366f1,#a855f7)",
                color: "white",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer",
                opacity: 0.6,
              }}
            >
              Coming Soon
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: 8 }}>
              Build in progress
            </div>
          </div>
        </div>

        <p style={{ color: "var(--text-muted)", marginTop: 24, fontSize: "0.85rem" }}>
          In the meantime,{" "}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#818cf8" }}
          >
            use the web app →
          </a>
        </p>
      </section>

      {/* How it works */}
      <section className="section">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontWeight: 800, fontSize: "clamp(1.8rem,3.5vw,2.5rem)", letterSpacing: "-0.02em" }}>
            How to install
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 640, margin: "0 auto" }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{ display: "flex", gap: 20, alignItems: "flex-start" }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#6366f1,#a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                {s.n}
              </div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>{s.title}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.7 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech info */}
      <section
        style={{
          padding: "64px 24px",
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: 16 }}>
            Built on proven technology
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 40, fontSize: "0.95rem", lineHeight: 1.7 }}>
            The desktop app is built with Electron.js, wrapping the same React + Vite frontend
            and the local Express + PGlite backend — fully offline, no cloud required.
          </p>

          <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { name: "Electron.js", icon: "⚡", desc: "Native desktop shell" },
              { name: "React 19", icon: "⚛️", desc: "Frontend UI" },
              { name: "PGlite", icon: "🗄️", desc: "Embedded Postgres" },
              { name: "Express.js", icon: "🚀", desc: "Local API server" },
            ].map((t) => (
              <div
                key={t.name}
                className="glass-card"
                style={{ padding: "20px 24px", textAlign: "center", minWidth: 140 }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{t.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{t.name}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{t.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <Link href="/features" className="btn-secondary">
              See all features →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
