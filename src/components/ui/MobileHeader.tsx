"use client";

import Link from "next/link";
import { useState } from "react";
import { APP_VERSION } from "@/constants/appVersion";

export function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile menu toggle button - only visible on mobile */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden text-slate-400 hover:text-white transition p-2"
        aria-label="Toggle menu"
      >
        <svg
          className={`w-5 h-5 transition-transform ${isMenuOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div className="absolute top-12 right-4 bg-slate-900/95 backdrop-blur-sm rounded-lg border border-white/10 py-2 z-40 md:hidden">
          <Link
            href="/faq"
            onClick={() => setIsMenuOpen(false)}
            className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            FAQ
          </Link>
          <a
            href="https://www.notion.so/FryReef-Roadmap-2bdde4de81e4804c9b87ea83d0a730d5"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            Whitepaper
          </a>
          <a
            href="https://x.com/ReefFry"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsMenuOpen(false)}
            className="block px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            X (Twitter)
          </a>
          <div className="border-t border-white/5 px-4 py-2 mt-2">
            <p className="text-xs text-slate-600 font-mono">
              v{APP_VERSION}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
