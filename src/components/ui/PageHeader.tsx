"use client";

import { ReactNode } from "react";
import { MobileHeader } from "./MobileHeader";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-6 sm:mb-10">
      {/* Mobile: stacked layout */}
      <div className="flex items-center justify-between gap-2 relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-xl font-semibold text-white sm:text-3xl">
            {title}
          </h1>
          <span className="rounded-full bg-baseBlue/20 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-baseBlue border border-baseBlue/30">
            Beta
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MobileHeader />
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-400 sm:text-sm sm:mt-2">
        {description}
      </p>
    </header>
  );
}

