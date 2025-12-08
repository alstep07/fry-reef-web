"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Rarity, RARITY_CONFIG, getFishImage } from "@/constants/gameConfig";

interface MergeSuccessModalProps {
  isOpen: boolean;
  newRarity: Rarity;
  onClose: () => void;
  onGoToReef: () => void;
}

export function MergeSuccessModal({
  isOpen,
  newRarity,
  onClose,
  onGoToReef,
}: MergeSuccessModalProps) {
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

  const config = RARITY_CONFIG[newRarity];
  const fishImage = getFishImage(newRarity);

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
          🎉 Merge Successful!
        </h2>

        {/* New Fish */}
        <div className="mb-3 sm:mb-4">
          <p className="mb-2 text-sm text-slate-400">Your new fish:</p>
          <div className="relative mx-auto h-24 w-24 sm:h-32 sm:w-32">
            <Image
              src={fishImage}
              alt={config.name}
              fill
              className="object-contain drop-shadow-lg"
            />
          </div>
          <div
            className="mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
            style={{
              backgroundColor: `${config.color}20`,
              color: config.color,
            }}
          >
            {config.name}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Stay Here
          </button>
          <button
            onClick={onGoToReef}
            className="flex-1 cursor-pointer rounded-xl bg-baseBlue px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white shadow-lg transition hover:bg-baseBlue/80"
          >
            Go to Reef
          </button>
        </div>
      </div>
    </div>
  );
}

