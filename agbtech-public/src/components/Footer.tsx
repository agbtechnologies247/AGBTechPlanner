import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--bg-card)",
        padding: "48px 24px 32px",
        marginTop: 0,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 40,
            marginBottom: 40,
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image src="/logo.png" alt="AGB Tech Logo" width={30} height={30} style={{ objectFit: "contain" }} />
              </div>
              <span style={{ fontWeight: 700, color: "var(--text)" }}>AGB Tech Planner</span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: 1.6 }}>
              Task management built for every industry — from manufacturing to SaaS.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 style={{ color: "var(--text)", fontWeight: 600, marginBottom: 16, fontSize: "0.9rem" }}>
              Product
            </h3>
            {[
              { label: "Features", href: "/features" },
              { label: "Industries", href: "/industries" },
              { label: "Pricing", href: "/pricing" },
              { label: "Download", href: "/download" },
            ].map((l) => (
              <div key={l.href} style={{ marginBottom: 8 }}>
                <Link
                  href={l.href}
                  style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          {/* App */}
          <div>
            <h3 style={{ color: "var(--text)", fontWeight: 600, marginBottom: 16, fontSize: "0.9rem" }}>
              App
            </h3>
            {[
              { label: "Launch Web App", href: "http://localhost:5173" },
              { label: "Download Desktop", href: "/download" },
            ].map((l) => (
              <div key={l.href} style={{ marginBottom: 8 }}>
                <a
                  href={l.href}
                  style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                >
                  {l.label}
                </a>
              </div>
            ))}
          </div>

          {/* Company */}
          <div>
            <h3 style={{ color: "var(--text)", fontWeight: 600, marginBottom: 16, fontSize: "0.9rem" }}>
              Company
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
              Built by{" "}
              <span style={{ color: "var(--text)" }}>AGB Technologies</span>
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: 8 }}>
              support@agbtechnologies.com
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            © {new Date().getFullYear()} AGB Technologies. All rights reserved.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
            Built with ♥ for teams that ship
          </p>
        </div>
      </div>
    </footer>
  );
}
