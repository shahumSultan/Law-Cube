"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/use-theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle, mounted } = useTheme();

  /* Avoid hydration mismatch — render a neutral placeholder until mounted */
  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg border border-slate-200 bg-white ${className}`} />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all duration-200 cursor-pointer ${
        isDark
          ? "bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700 hover:border-slate-600"
          : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700"
      } ${className}`}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
