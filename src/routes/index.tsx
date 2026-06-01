import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: ScammerPage,
  head: () => ({
    meta: [
      { title: "scammer" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function ScammerPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        color: "#ff2d2d",
        fontFamily: "system-ui, sans-serif",
        textAlign: "center",
        padding: "1rem",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1.6rem, 6vw, 3.5rem)",
          fontWeight: 900,
          letterSpacing: "0.04em",
          textShadow: "0 0 24px rgba(255,45,45,0.7)",
          animation: "scammerPulse 1.2s ease-in-out infinite",
          margin: 0,
        }}
      >
        scammer +91 92136 52743
      </h1>
      <style>{`
        @keyframes scammerPulse {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.75; }
        }
      `}</style>
    </main>
  );
}
