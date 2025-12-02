"use client";

import { useAccount } from "wagmi";
import { useOnchainCheckIn } from "@/hooks/useOnchainCheckIn";
import { CardShell } from "@/components/ui/CardShell";
import { CheckInButton } from "./CheckInButton";
import { CheckInInfo } from "./CheckInInfo";
import { CheckInEmptyState } from "./CheckInEmptyState";

export function CheckInCard() {
  const { address, isConnected } = useAccount();
  const {
    lastCheckInTimestamp,
    totalCount,
    currentMonthStreak,
    bestMonthStreak,
    checkedInToday,
    isLoading,
    isWriting,
    checkIn,
    error,
    isSuccess,
    isOnCorrectNetwork,
    switchToBaseSepolia,
  } = useOnchainCheckIn(address);

  const lastCheckIn = lastCheckInTimestamp
    ? new Date(lastCheckInTimestamp * 1000).toISOString()
    : null;

  return (
    <CardShell>
      {!isConnected ? (
        <CheckInEmptyState />
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">
              Daily BM
            </h2>
            {address && (
              <>
                <CheckInInfo address={address} lastCheckIn={lastCheckIn} />
                {totalCount > 0 && (
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Current BM Streak:</span>
                      <span className="font-semibold text-slate-200">
                        {currentMonthStreak} day(s)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Best BM Streak:</span>
                      <span className="font-semibold text-slate-200">
                        {bestMonthStreak} day(s)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Total Check-ins:</span>
                      <span className="font-semibold text-slate-200">
                        {totalCount}
                      </span>
                    </div>
                  </div>
                )}
                {!isOnCorrectNetwork && (
                  <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                    <p className="mb-2 text-sm font-medium text-yellow-400">
                      ⚠️ Wrong Network
                    </p>
                    <p className="mb-3 text-xs text-yellow-300/80">
                      Please switch to Base Sepolia to use check-in feature. Your
                      data is stored on Base Sepolia testnet.
                    </p>
                    <button
                      onClick={switchToBaseSepolia}
                      className="rounded-full bg-yellow-500/20 px-4 py-2 text-xs font-medium text-yellow-300 transition hover:bg-yellow-500/30"
                    >
                      Switch to Base Sepolia
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          {address && (
            <div className="mt-auto pt-4">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <CheckInButton
                  onCheckIn={checkIn}
                  isCheckedIn={checkedInToday}
                  disabled={(!error && isWriting) || isLoading || !isOnCorrectNetwork}
                />
              </div>
              {error && (
                <p className="mt-2 text-center text-xs text-red-400">
                  Transaction failed. Please try again.
                </p>
              )}
              {isSuccess && (
                <p className="mt-2 text-center text-xs text-green-400">
                  ✓ Check-in successful! Transaction confirmed on Base Sepolia.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </CardShell>
  );
}

