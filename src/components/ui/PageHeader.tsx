"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { BurgerMenu } from "./BurgerMenu";
import { WalletHeader } from "@/components/features/wallet/WalletHeader";
import { ThemeToggle } from "./ThemeToggle";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-6 sm:mb-10">
      {/* Header with Logo, Title, and Actions */}
      <div className="flex items-center justify-between gap-2">
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
        
        {/* Desktop: ThemeToggle + WalletHeader, Mobile: BurgerMenu */}
        <div className="flex items-center gap-2">
          {/* Desktop only */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <WalletHeader />
          </div>
          
          {/* Mobile only */}
          <div className="md:hidden">
            <BurgerMenu />
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-slate-400 sm:text-sm sm:mt-2">
        {description}
      </p>
    </header>
  );
}

