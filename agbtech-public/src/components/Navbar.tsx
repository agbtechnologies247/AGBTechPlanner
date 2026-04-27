"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(8,11,20,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 24px",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image src="/logo.png" alt="AGB Tech Logo" width={34} height={34} style={{ objectFit: "contain" }} priority />
        </div>
        <span style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>
          AGB Tech <span style={{ color: "#818cf8" }}>Planner</span>
        </span>
      </Link>

      {/* Desktop nav */}
      <div
        className="desktop-nav"
        style={{ display: "flex", alignItems: "center", gap: 32 }}
      >
        {[
          { label: "Features", href: "/features" },
          { label: "Industries", href: "/industries" },
          { label: "Pricing", href: "/pricing" },
          { label: "Download", href: "/download" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            style={{
              color: "var(--text-muted)",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            {l.label}
          </Link>
        ))}

        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ padding: "8px 20px", fontSize: "0.85rem" }}
        >
          Launch App →
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "none",
          background: "none",
          border: "none",
          color: "var(--text)",
          cursor: "pointer",
          fontSize: 24,
        }}
        className="mobile-menu-btn"
        aria-label="Toggle menu"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Mobile menu */}
      {open && (
        <div
          style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            background: "var(--bg-card)",
            borderBottom: "1px solid var(--border)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            zIndex: 99,
          }}
        >
          {[
            { label: "Features", href: "/features" },
            { label: "Industries", href: "/industries" },
            { label: "Pricing", href: "/pricing" },
            { label: "Download", href: "/download" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ color: "var(--text)", textDecoration: "none", fontWeight: 500 }}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ width: "fit-content" }}
          >
            Launch App →
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
