"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

interface LiquidGlassButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary";
}

export function LiquidGlassButton({
  children,
  variant = "primary",
  className = "",
  disabled,
  ...props
}: LiquidGlassButtonProps) {
  const baseClasses =
    "relative inline-flex min-w-[160px] items-center justify-center overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:scale-100";

  const variantClasses = {
    primary:
      "bg-baseBlue shadow-[0_16px_40px_rgba(0,82,255,0.4)] hover:shadow-[0_20px_60px_rgba(0,82,255,0.6)] hover:bg-[#0058ff] disabled:bg-slate-600 disabled:shadow-none",
    secondary:
      "bg-slate-700 shadow-[0_16px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] disabled:bg-slate-600",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {/* Base brand blue gradient overlay */}
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.3),transparent_60%),radial-gradient(circle_at_bottom,rgba(229,233,255,0.2),transparent_60%)] opacity-90 mix-blend-overlay" />
      {/* Base blue glow */}
      <span className="pointer-events-none absolute inset-0 rounded-full bg-baseBlue/20 blur-xl" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}

