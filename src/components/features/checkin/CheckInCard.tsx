"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useDailyCheckIn } from "@/hooks/useDailyCheckIn";
import { saveCheckIn } from "@/utils/checkin";
import { CardShell } from "@/components/ui/CardShell";
import { CheckInButton } from "./CheckInButton";
import { CheckInInfo } from "./CheckInInfo";
import { CheckInEmptyState } from "./CheckInEmptyState";

export function CheckInCard() {
  const { address, isConnected } = useAccount();
  const [version, setVersion] = useState(0);
  const { lastCheckIn, todayCheckedIn } = useDailyCheckIn(address, version);

  const handleCheckIn = () => {
    if (!address) return;
    saveCheckIn(address);
    setVersion((v) => v + 1);
  };

  return (
    <CardShell>
      {!isConnected ? (
        <CheckInEmptyState />
      ) : (
        <>
          <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">
            Daily Check-in
          </h2>
          {address && (
            <>
              <CheckInInfo address={address} lastCheckIn={lastCheckIn} />
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <CheckInButton
                  onCheckIn={handleCheckIn}
                  isCheckedIn={todayCheckedIn}
                />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                This is a prototype. Check-ins are stored locally for now;
                we&apos;ll move this onchain and attach badges/NFTs in future
                iterations.
              </p>
            </>
          )}
        </>
      )}
    </CardShell>
  );
}

