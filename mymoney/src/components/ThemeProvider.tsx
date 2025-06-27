"use client";
import { useEffect, useState } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    function applyTheme() {
      const theme = localStorage.getItem("theme") || "dark";
      document.body.setAttribute("data-theme", theme);
    }
    applyTheme();
    setMounted(true);
    window.addEventListener("storage", applyTheme);
    return () => {
      window.removeEventListener("storage", applyTheme);
    };
  }, []);

  if (!mounted) return null;
  return <>{children}</>;
} 