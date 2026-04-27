import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Features — AGB Tech Planner",
  description: "Kanban boards, team collaboration, My Day view, dashboards, and more.",
};

const FEATURES_DEEP = [
  {
    icon: "🗂️",
    title: "Kanban Boards",
    desc: "Visualize your workflow with drag-and-drop task cards. Create unlimited buckets like 'To Do', 'In Review', 'Blocked', or anything your team needs.",
    tags: ["Drag & Drop", "Custom Buckets", "Color Coding"],
    color: "#6366f1",
  },
  {
    icon: "👥",
    title: "Multi-User Collaboration",
    desc: "Invite team members to any plan, assign tasks, set roles (admin/editor), and see who is working on what — all without leaving the app.",
    tags: ["Role Management", "Task Assignment", "Member List"],
    color: "#a855f7",
  },
  {
    icon: "📊",
    title: "Analytics Dashboard",
    desc: "Understand your team's velocity with real-time charts: tasks by priority, completion rates, overdue tracking, and per-plan progress.",
    tags: ["Bar Charts", "Progress Rings", "Overdue Alerts"],
    color: "#3b82f6",
  },
  {
    icon: "☀️",
    title: "My Day",
    desc: "Every morning, AGB Planner gives you a personal view of your tasks due today — sorted by priority so you know exactly where to start.",
    tags: ["Daily Focus", "Priority Sort", "Personal View"],
    color: "#f59e0b",
  },
  {
    icon: "✅",
    title: "Checklists & Labels",
    desc: "Break tasks into granular steps with checklists. Tag tasks with color labels for instant categorization and powerful filtering.",
    tags: ["Sub-tasks", "Color Labels", "Progress Bar"],
    color: "#10b981",
  },
  {
    icon: "💬",
    title: "Task Comments",
    desc: "Keep conversation in context. Comment directly on tasks so your team's decisions are always tied to the work.",
    tags: ["Threaded Comments", "User Avatars", "Timestamps"],
    color: "#ec4899",
  },
  {
    icon: "📥",
    title: "CSV Export",
    desc: "Export any plan to CSV with a single click — title, status, priority, bucket, due date. Perfect for reporting and audits.",
    tags: ["One-click Export", "All Fields", "Excel Compatible"],
    color: "#14b8a6",
  },
  {
    icon: "💻",
    title: "Desktop App (Electron)",
    desc: "Download AGB Planner as a native desktop app. Works offline, runs on Windows and macOS. Your data is always available.",
    tags: ["Offline Mode", "Windows", "macOS"],
    color: "#8b5cf6",
  },
  {
    icon: "🌙",
    title: "Dark Mode",
    desc: "System-aware theming with a beautiful dark mode that's easy on the eyes during long planning sessions.",
    tags: ["System Sync", "OLED-ready", "Smooth Toggle"],
    color: "#6366f1",
  },
];

export default function FeaturesPage() {
  return (
    <div style={{ paddingTop: 64 }}>
      {/* Header */}
      <section
        style={{
          padding: "80px 24px 64px",
          textAlign: "center",
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)",
        }}
      >
        <div className="badge" style={{ marginBottom: 16 }}>✦ Features</div>
        <h1
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            marginBottom: 20,
            letterSpacing: "-0.03em",
          }}
        >
          Built for how teams{" "}
          <span className="gradient-text">actually work</span>
        </h1>
        <p
          style={{
            color: "var(--text-muted)",
            maxWidth: 520,
            margin: "0 auto",
            fontSize: "1.05rem",
            lineHeight: 1.7,
          }}
        >
          No bloat. No steep learning curve. Just the features your team needs to
          plan, track, and deliver — beautifully.
        </p>
      </section>

      {/* Features grid */}
      <section className="section">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {FEATURES_DEEP.map((f) => (
            <div
              key={f.title}
              className="glass-card"
              style={{ padding: "36px 32px" }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: `${f.color}18`,
                  border: `1px solid ${f.color}33`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  marginBottom: 20,
                }}
              >
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 10 }}>
                {f.title}
              </h3>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.9rem", marginBottom: 20 }}>
                {f.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {f.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: `${f.color}12`,
                      border: `1px solid ${f.color}25`,
                      color: f.color,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 64 }}>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{ fontSize: "1rem", padding: "16px 36px" }}
          >
            Try All Features Free →
          </a>
          <div style={{ marginTop: 16 }}>
            <Link href="/download" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Or download the desktop app ↓
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
