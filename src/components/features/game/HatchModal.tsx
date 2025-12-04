"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Rarity, RARITY_CONFIG, getFishImage } from "@/constants/gameConfig";

interface HatchModalProps {
  isOpen: boolean;
  rarity: Rarity | null;
  fishId: number | null;
  onClose: () => void;
  onGoToReef: () => void;
}

export function HatchModal({ isOpen, rarity, fishId, onClose, onGoToReef }: HatchModalProps) {
  // Close on escape key
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

  if (!isOpen || !rarity) return null;

  const config = RARITY_CONFIG[rarity];
  const fishImage = getFishImage(rarity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 mx-4 w-full max-w-sm animate-[scaleIn_0.3s_ease-out] rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-6 text-center shadow-2xl backdrop-blur-md">
        {/* Confetti effect for rare+ */}
        {rarity !== Rarity.Common && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -top-4 left-1/2 h-32 w-32 -translate-x-1/2 animate-pulse rounded-full blur-3xl"
              style={{ backgroundColor: `${config.color}40` }}
            />
          </div>
        )}

        {/* Title */}
        <h2 className="mb-2 text-2xl font-bold text-white">
          🎉 Congratulations!
        </h2>
        <p className="mb-6 text-sm text-slate-400">
          Your egg has hatched into a new fish!
        </p>

        {/* Fish Image */}
        <div className="relative mx-auto mb-4 h-40 w-40">
          {/* Glow */}
          <div
            className="absolute inset-0 animate-pulse rounded-full blur-2xl"
            style={{ backgroundColor: `${config.color}30` }}
          />
          <Image
            src={fishImage}
            alt={`${config.name} fish`}
            fill
            className="object-contain drop-shadow-lg"
          />
        </div>

        {/* Rarity Badge */}
        <div
          className="mb-2 inline-block rounded-full px-4 py-1.5 text-sm font-bold uppercase tracking-wider"
          style={{
            backgroundColor: `${config.color}20`,
            color: config.color,
            boxShadow: `0 0 20px ${config.color}40`,
          }}
        >
          {config.name}
        </div>

        {/* Fish ID */}
        {fishId !== null && (
          <p className="mb-6 text-xs text-slate-500">Fish #{fishId}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Stay Here
          </button>
          <button
            onClick={onGoToReef}
            className="flex-1 cursor-pointer rounded-xl bg-baseBlue px-4 py-3 text-sm font-medium text-white shadow-lg transition hover:bg-baseBlue/80"
          >
            Go to Reef 🐠
          </button>
        </div>
      </div>
    </div>
  );
}

