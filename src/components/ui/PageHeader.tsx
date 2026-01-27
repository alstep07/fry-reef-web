"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { MobileHeader } from "./MobileHeader";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
          <Image
            src="/images/common/logo.png"
            alt="FryReef Logo"
            width={40}
            height={40}
            className="mt-1 w-8 h-8 sm:w-10 sm:h-10"
            priority
          />
          <h1 className="text-xl font-semibold text-white sm:text-3xl">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
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

