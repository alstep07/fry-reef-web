"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useCallback } from "react";

type Tab = "checkin" | "nest" | "reef" | "evolution";

interface MobileBottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function MobileBottomNav({ activeTab, onTabChange }: MobileBottomNavProps) {
  const tabs = [
    { id: "checkin" as Tab, label: "Tasks", icon: "📅" },
    { id: "reef" as Tab, label: "Reef", icon: "🐟" },
    { id: "nest" as Tab, label: "Nest", icon: "🟠" },
    { id: "evolution" as Tab, label: "Evolution", icon: "🧬" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden border-t border-white/5 bg-black/80 backdrop-blur-sm z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-3 px-2 text-center transition ${
              activeTab === tab.id
                ? "text-baseBlue border-t-2 border-baseBlue"
                : "text-slate-400 border-t-2 border-transparent hover:text-slate-300"
            }`}
            title={tab.label}
          >
            <span className="text-xl mb-0.5">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
