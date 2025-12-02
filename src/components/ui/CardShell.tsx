"use client";

import { ReactNode } from "react";

interface CardShellProps {
  children: ReactNode;
  className?: string;
}

export function CardShell({ children, className = "" }: CardShellProps) {
  return (
    <section
      className={`relative mt-6 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-slate-900/5 via-slate-800/4 to-slate-900/6 text-sm text-slate-200 shadow-[0_24px_80px_rgba(15,23,42,0.25)] backdrop-blur-md sm:mt-8 ${className}`}
    >
      {/* clean glass blur layer - less blur */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl backdrop-blur-sm" />
      {/* subtle liquid glass gradients with Base blue accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,82,255,0.03),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(229,233,255,0.02),transparent_60%)] opacity-60" />
      {/* clean border glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/3 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" />
      {/* content */}
      <div className="relative z-10 flex flex-col h-full p-6 sm:p-8">{children}</div>
    </section>
  );
}

