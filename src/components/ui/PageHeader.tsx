"use client";

import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">
            {title}
          </h1>
          <span className="rounded-full bg-baseBlue/20 px-2.5 py-0.5 text-xs font-medium text-baseBlue border border-baseBlue/30">
            Beta
          </span>
        </div>
        <p className="max-w-xl text-xs text-slate-400 sm:text-sm">
          {description}
        </p>
      </div>
      {action && <div className="flex justify-start sm:justify-end">{action}</div>}
    </header>
  );
}

