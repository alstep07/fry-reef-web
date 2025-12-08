"use client";

import { useEffect } from "react";

interface LayEggModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToNest: () => void;
}

export function LayEggModal({ isOpen, onClose, onGoToNest }: LayEggModalProps) {
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
          Икринка успешно отложена
        </h2>

        {/* Egg Icon */}
        <div className="relative mx-auto mb-3 sm:mb-4 h-28 w-28 sm:h-40 sm:w-40 flex items-center justify-center">
          <div className="text-6xl sm:text-8xl">🟠</div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            Остаться здесь
          </button>
          <button
            onClick={onGoToNest}
            className="flex-1 cursor-pointer rounded-xl bg-baseBlue px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white shadow-lg transition hover:bg-baseBlue/80"
          >
            Перейти в Nest
          </button>
        </div>
      </div>
    </div>
  );
}

