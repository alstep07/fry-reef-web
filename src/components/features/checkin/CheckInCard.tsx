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
  } = useOnchainCheckIn(address);

  const lastCheckIn = lastCheckInTimestamp
    ? new Date(lastCheckInTimestamp * 1000).toISOString()
    : null;

  return (
    <CardShell>
      {!isConnected ? (
        <CheckInEmptyState />
      ) : (
        <>
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
                    <span className="font-semibold text-baseBlue">
                      {currentMonthStreak} days
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Best BM Streak:</span>
                    <span className="font-semibold text-baseBlue">
                      {bestMonthStreak} days
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
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <CheckInButton
                  onCheckIn={checkIn}
                  isCheckedIn={checkedInToday}
                  disabled={isWriting || isLoading}
                />
              </div>
              {error && (
                <p className="mt-2 text-xs text-red-400">
                  Error: {error instanceof Error ? error.message : "Transaction failed"}
                </p>
              )}
              {isSuccess && (
                <p className="mt-2 text-xs text-green-400">
                  ✓ Check-in successful! Transaction confirmed on Base.
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Check-ins are stored onchain on Base Sepolia. Your streak and
                total count are permanently recorded on the blockchain.
              </p>
            </>
          )}
        </>
      )}
    </CardShell>
  );
}

