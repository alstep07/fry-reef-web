"use client";

import { useEffect } from "react";

interface StreakRewardModalProps {
  isOpen: boolean;
  pearlShards: number;
  streak: number;
  onClose: () => void;
}

export function StreakRewardModal({
  isOpen,
  pearlShards,
  streak,
  onClose,
}: StreakRewardModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-xs sm:max-w-sm animate-[scaleIn_0.3s_ease-out] rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-4 sm:p-6 text-center shadow-2xl backdrop-blur-md">
        {/* Title */}
        <h2 className="mb-1.5 sm:mb-2 text-xl sm:text-2xl font-bold text-white">
          🎉 Streak Reward!
        </h2>

        {/* Streak Info */}
        <div className="mb-3 sm:mb-4">
          <p className="mb-2 text-sm text-slate-400">
            You've completed a {streak}-day streak!
          </p>
          <div className="inline-block rounded-full bg-white/10 px-4 py-2">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              🔥 {streak} days
            </span>
          </div>
        </div>

        {/* Reward */}
        <div className="mb-3 sm:mb-4 rounded-lg bg-white/5 p-3">
          <p className="mb-2 text-xs sm:text-sm text-slate-400">You received:</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">💎</span>
            <span className="text-lg sm:text-xl font-bold text-white">
              +{pearlShards} Pearl Shard{pearlShards > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={onClose}
          className="w-full cursor-pointer rounded-xl bg-baseBlue px-4 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-white shadow-lg transition hover:bg-baseBlue/80"
        >
          Awesome!
        </button>
      </div>
    </div>
  );
}

