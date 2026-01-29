"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ThemeToggle } from "./ThemeToggle";
import { APP_VERSION } from "@/constants/appVersion";

export function BurgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { isConnected } = useAccount();
  const { profile } = useUserProfile();

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside as any);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside as any);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Burger button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="text-slate-400 hover:text-white transition p-2 ьд-фг"
        aria-label="Toggle menu"
      >
        <svg
          className={`w-6 h-6 transition-transform ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Menu overlay */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-16 right-4 w-80 bg-slate-900/95 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl z-50 overflow-hidden"
        >
          {/* User Profile / Wallet */}
          <div className="p-4 border-b border-white/10">
            {isConnected && profile?.username ? (
              <div className="flex items-center gap-3">
                {profile.pfpUrl && (
                  <img
                    src={profile.pfpUrl}
                    alt={profile.displayName || profile.username}
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-base font-medium text-white">
                    {profile.displayName || profile.username}
                  </span>
                  {profile.username && profile.displayName && (
                    <span className="text-sm text-slate-400">@{profile.username}</span>
                  )}
                </div>
              </div>
            ) : (
              <ConnectButton
                showBalance={false}
                chainStatus="none"
                accountStatus={{ smallScreen: "full", largeScreen: "full" }}
              />
            )}
          </div>

          {/* Menu Links */}
          <div className="py-2">
            <Link
              href="/faq"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              FAQ
            </Link>
            <a
              href="https://opensea.io/collection/fryreef-fish-774329671"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 90 90">
                <path d="M45 0C20.151 0 0 20.151 0 45s20.151 45 45 45 45-20.151 45-45S69.849 0 45 0zm23.071 48.064L48.214 71.929c-.357.357-.928.357-1.286 0L27.071 52.071c-.357-.357-.357-.928 0-1.286L46.929 31.929c.357-.357.928-.357 1.286 0l19.857 19.857c.357.357.357.928 0 1.286v-.008z"/>
              </svg>
              Marketplace
            </a>
            <a
              href="https://www.notion.so/FryReef-Roadmap-2bdde4de81e4804c9b87ea83d0a730d5"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              Whitepaper
            </a>
            <a
              href="https://x.com/ReefFry"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              X (Twitter)
            </a>
          </div>

          {/* Theme Toggle */}
          <div className="p-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-sm text-slate-400">Theme</span>
            <ThemeToggle />
          </div>

          {/* Version */}
          <div className="px-4 py-3 border-t border-white/10 bg-white/5">
            <p className="text-xs text-slate-600 font-mono text-center">
              v{APP_VERSION}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
