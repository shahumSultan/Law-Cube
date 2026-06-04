"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body style={{ fontFamily: "monospace", padding: "2rem", background: "#0f172a", color: "#f1f5f9" }}>
        <h1 style={{ color: "#f87171", marginBottom: "1rem" }}>Runtime Error</h1>
        <pre style={{ background: "#1e293b", padding: "1rem", borderRadius: "8px", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", color: "#fbbf24", marginBottom: "1rem" }}>
          {error?.message || "Unknown error"}
        </pre>
        {error?.stack && (
          <pre style={{ background: "#1e293b", padding: "1rem", borderRadius: "8px", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all", color: "#94a3b8", fontSize: "0.75rem" }}>
            {error.stack}
          </pre>
        )}
        {error?.digest && <p style={{ color: "#64748b", marginTop: "1rem" }}>Digest: {error.digest}</p>}
        <button onClick={reset} style={{ marginTop: "1rem", padding: "0.5rem 1rem", background: "#1e3a8a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
