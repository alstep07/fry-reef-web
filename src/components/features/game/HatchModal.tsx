"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Rarity, RARITY_CONFIG, getFishImage } from "@/constants/gameConfig";
import { useComposeCast } from "@coinbase/onchainkit/minikit";
import { sdk } from "@farcaster/miniapp-sdk";

interface HatchModalProps {
  isOpen: boolean;
  rarity: Rarity | null;
  fishId: number | null;
  onClose: () => void;
  onGoToReef: () => void;
}

export function HatchModal({ isOpen, rarity, fishId, onClose, onGoToReef }: HatchModalProps) {
  const { composeCast } = useComposeCast();
  
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
      <div className="relative z-10 mx-4 w-full max-w-xs sm:max-w-sm animate-[scaleIn_0.3s_ease-out] rounded-2xl border border-white/10 bg-linear-to-b from-slate-800/90 to-slate-900/90 p-4 sm:p-6 text-center shadow-2xl backdrop-blur-md">
        {/* Confetti effect for rare+ */}
        {rarity !== Rarity.Common && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="absolute -top-4 left-1/2 h-24 w-24 sm:h-32 sm:w-32 -translate-x-1/2 animate-pulse rounded-full blur-xl sm:blur-3xl"
              style={{ backgroundColor: `${config.color}40` }}
            />
          </div>
        )}

        {/* Title */}
        <h2 className="mb-1.5 sm:mb-2 text-xl sm:text-2xl font-bold text-white">
          🎉 Congratulations!
        </h2>
        <p className="mb-4 sm:mb-6 text-xs sm:text-sm text-slate-400">
          Your egg has hatched into a new fish!
        </p>

        {/* Fish Image */}
        <div className="relative mx-auto mb-3 sm:mb-4 h-28 w-28 sm:h-40 sm:w-40">
          {/* Glow */}
          <div
            className="absolute inset-0 animate-pulse rounded-full blur-lg sm:blur-2xl"
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
          className="mb-1.5 sm:mb-2 inline-block rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider"
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
          <p className="mb-4 sm:mb-6 text-[10px] sm:text-xs text-slate-500">Fish #{fishId}</p>
        )}

        {/* Share Button - Base/Farcaster native composer */}
        <button
          onClick={async () => {
            const text = `🐟 Just hatched a ${config.name} fish in FryReef!\n\nBuild your underwater reef on Base 🌊`;
            const appUrl = 'https://fry-reef.vercel.app';
            
            // Check if in mini app context
            const isInMiniApp = await sdk.isInMiniApp();
            
            if (isInMiniApp && composeCast) {
              // Use Base/Farcaster native composer
              composeCast({
                text: text,
                embeds: [appUrl]
              });
            } else if (navigator.share) {
              // Fallback to native share API
              try {
                await navigator.share({
                  title: 'FryReef',
                  text: text,
                  url: appUrl
                });
              } catch (err) {
                // User cancelled share
              }
            } else {
              // Fallback: copy to clipboard
              const fullText = `${text}\n\n${appUrl}`;
              await navigator.clipboard.writeText(fullText);
            }
          }}
          className="mb-3 sm:mb-4 w-full cursor-pointer rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-purple-300 transition hover:bg-purple-500/20 flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>

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
            Go to Reef 🐠
          </button>
        </div>
      </div>
    </div>
  );
}

