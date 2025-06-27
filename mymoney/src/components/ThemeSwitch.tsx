"use client";
import { useEffect, useState } from "react";

export default function ThemeSwitch() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    function syncTheme() {
      const current = localStorage.getItem("theme") || "dark";
      setTheme(current);
    }
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      aria-label="Alternar tema"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      style={{
        border: "none",
        background: "none",
        outline: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 56,
        height: 28,
        padding: 0,
        margin: 0,
      }}
    >
      <div
        style={{
          width: 56,
          height: 28,
          borderRadius: 20,
          background: theme === "dark" ? "#222" : "#eee",
          display: "flex",
          alignItems: "center",
          position: "relative",
          transition: "background 0.3s",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: theme === "dark" ? 2 : 28,
            top: 2,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: theme === "dark" ? "#fff" : "#222",
            transition: "left 0.3s, background 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          {theme === "dark" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z"/><g><circle cx="17.5" cy="6.5" r="1.5" fill="#222"/></g></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 7.07l-1.41-1.41M6.34 6.34L4.93 4.93m12.02 0l-1.41 1.41M6.34 17.66l-1.41 1.41"/></svg>
          )}
        </div>
        <div style={{
          flex: 1,
          textAlign: "right",
          color: theme === "dark" ? "#fff" : "#222",
          fontSize: 16,
          marginLeft: theme === "dark" ? 28 : 0,
          marginRight: theme === "dark" ? 0 : 28,
          transition: "color 0.3s, margin 0.3s",
        }}>
          {theme === "dark" ? "" : ""}
        </div>
      </div>
    </button>
  );
} 