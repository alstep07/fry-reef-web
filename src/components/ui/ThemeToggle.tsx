"use client";

import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = savedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "dark" ? "light" : "dark";
      
      // Update localStorage
      localStorage.setItem("theme", newTheme);
      
      // Update DOM
      const root = document.documentElement;
      if (newTheme === "light") {
        root.classList.remove("dark");
        root.classList.add("light");
      } else {
        root.classList.add("dark");
        root.classList.remove("light");
      }
      
      return newTheme;
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 rounded-full bg-slate-700 transition-colors duration-300 hover:bg-slate-600 focus:outline-none cursor-pointer"
      aria-label="Toggle theme"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Track */}
      <div
        className={`absolute inset-0 rounded-full transition-colors duration-300 ${
          theme === "light"
            ? "bg-linear-to-r from-sky-400 to-cyan-400"
            : "bg-linear-to-r from-slate-700 to-slate-600"
        }`}
      />
      
      {/* Slider */}
      <div
        className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 transform flex items-center justify-center ${
          theme === "light" ? "translate-x-7" : "translate-x-0"
        }`}
      >
        {/* Icon inside slider */}
        <span className="text-xs">
          {theme === "dark" ? "🌙" : "☀️"}
        </span>
      </div>
    </button>
  );
}
