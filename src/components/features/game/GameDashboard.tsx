"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useFryReef } from "@/hooks/useFryReef";
import { StarterPackCard } from "./StarterPackCard";
import { NestTab } from "./NestTab";
import { ReefTab } from "./ReefTab";
import { DAILY_CHECKIN } from "@/constants/gameConfig";

type Tab = "checkin" | "nest" | "reef";

const validTabs: Tab[] = ["checkin", "nest", "reef"];

export function GameDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { address, isConnected } = useAccount();
  
  // Get tab from URL or default to "checkin"
  const tabFromUrl = searchParams.get("tab") as Tab | null;
  const activeTab: Tab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "checkin";
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update URL when tab changes
  const setActiveTab = (tab: Tab) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "checkin") {
      params.delete("tab");
    } else {
      params.set("tab", tab);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/", { scroll: false });
  };
  const {
    currentStreak,
    totalCheckIns,
    starterPackClaimed,
    claimStarterPack,
    checkedInToday,
    checkIn,
    isLoading,
    isWriting,
    isSuccess,
    error,
    isOnCorrectNetwork,
    switchToBaseSepolia,
  } = useFryReef();

  // Timeout protection for initial load - max 5 seconds
  useEffect(() => {
    // Start timer only on mount
    timerRef.current = setTimeout(() => {
      setTimedOut(true);
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!isConnected || !address) {
    return null;
  }

  // Determine if we should show loading
  const dataLoaded = starterPackClaimed !== undefined;
  const shouldShowLoader = !timedOut && !dataLoaded && isLoading;

  // Show loading spinner while fetching initial data (with timeout protection)
  if (shouldShowLoader) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-baseBlue" />
      </div>
    );
  }

  // Show starter pack claim if not claimed
  if (!starterPackClaimed) {
    return (
      <StarterPackCard
        onClaim={claimStarterPack}
        isLoading={isWriting}
        isSuccess={isSuccess}
        error={error}
      />
    );
  }

  const tabs = [
    { id: "checkin" as Tab, label: "Tasks", icon: "📅" },
    { id: "nest" as Tab, label: "Nest", icon: "🟠" },
    { id: "reef" as Tab, label: "Reef", icon: "🐟" },
  ];

  return (
    <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
      {/* Network warning */}
      {!isOnCorrectNetwork && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 sm:p-4 text-center">
          <p className="mb-1.5 sm:mb-2 text-xs sm:text-sm font-medium text-yellow-400">
            ⚠️ Wrong Network
          </p>
          <p className="mb-2 sm:mb-3 text-[10px] sm:text-xs text-yellow-300/80">
            Please switch to Base Sepolia to play.
          </p>
          <button
            onClick={switchToBaseSepolia}
            className="cursor-pointer rounded-full bg-yellow-500/20 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-yellow-300 transition hover:bg-yellow-500/30"
          >
            Switch to Base Sepolia
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center w-full">
        <div className="flex w-full sm:inline-flex sm:w-auto rounded-full bg-white/5 p-1 sm:p-1.5 backdrop-blur-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial cursor-pointer rounded-full px-4 sm:px-5 py-2.5 sm:py-2 text-sm font-medium transition ${activeTab === tab.id
                ? "bg-baseBlue text-white shadow-lg"
                : "text-slate-400 hover:text-white"
                }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "checkin" && (
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4 sm:p-6 backdrop-blur-sm">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-white">Daily Check-in</h2>

          <div className="mb-3 sm:mb-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Streak:</span>
              <span className="font-semibold text-white">
                {currentStreak} / {DAILY_CHECKIN.streakForReward} days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Check-ins:</span>
              <span className="font-semibold text-white">{totalCheckIns}</span>
            </div>
            {currentStreak > 0 && (
              <div className="mt-2">
                <div className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${((currentStreak % DAILY_CHECKIN.streakForReward) / DAILY_CHECKIN.streakForReward) * 100}%`,
                      background: "linear-gradient(90deg, #E8D5E2 0%, #F5E6EA 30%, #FFFFFF 50%, #E0F4F8 70%, #D4E5ED 100%)",
                    }}
                  />
                </div>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-400">
                  {currentStreak % DAILY_CHECKIN.streakForReward === 0
                    ? "🎉 Claim your Pearl Shard!"
                    : `${DAILY_CHECKIN.streakForReward - (currentStreak % DAILY_CHECKIN.streakForReward)} days until next Pearl Shard`}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={checkIn}
              disabled={checkedInToday || isWriting || isLoading || !isOnCorrectNetwork}
              className="cursor-pointer rounded-full bg-baseBlue px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-slate-600 disabled:shadow-none"
            >
              {checkedInToday
                ? "✓ Checked in today"
                : isWriting || isLoading
                  ? "Checking in..."
                  : "Check-in"}
            </button>
          </div>

          {error && (
            <p className="mt-2 sm:mt-3 text-center text-[10px] sm:text-xs text-red-400">
              Transaction failed. Please try again.
            </p>
          )}
        </div>
      )}

      {activeTab === "nest" && <NestTab onGoToReef={() => setActiveTab("reef")} />}

      {activeTab === "reef" && <ReefTab />}
    </div>
  );
}

