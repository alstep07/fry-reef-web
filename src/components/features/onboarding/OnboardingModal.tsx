"use client";

import { useState } from "react";
import { RESOURCE_CONFIG, Resource, STARTER_PACK, DAILY_CHECKIN } from "@/constants/gameConfig";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  highlight?: string; // Tab to highlight, if any
}

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSkip: () => void;
}

export function OnboardingModal({ isOpen, onClose, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to FryReef",
      description: "Breed, merge, and evolve fish NFTs on Base",
      content: (
        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            FryReef is an on-chain idle game where you collect, breed, and merge fish NFTs to build your underwater reef.
          </p>
          <div className="text-center text-4xl sm:text-5xl">🐟</div>
        </div>
      ),
    },
    {
      id: "starter-pack",
      title: "Claim Your Starter Pack 🎁",
      description: "Your journey begins with free resources",
      content: (
        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base text-slate-300">
            When you claim the starter pack, you'll receive:
          </p>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 sm:p-4">
              <span className="text-2xl sm:text-3xl">🟠</span>
              <div>
                <p className="font-semibold text-white text-sm sm:text-base">
                  {STARTER_PACK.eggs} Egg
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Incubate to hatch your first fish
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 sm:p-4">
              <span className="text-2xl sm:text-3xl">{RESOURCE_CONFIG[Resource.PearlShard].icon}</span>
              <div>
                <p className="font-semibold text-white text-sm sm:text-base">
                  {STARTER_PACK.pearlShards} Pearl Shards
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Use to incubate eggs into fish
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3 sm:p-4">
              <span className="text-2xl sm:text-3xl">{RESOURCE_CONFIG[Resource.SpawnDust].icon}</span>
              <div>
                <p className="font-semibold text-white text-sm sm:text-base">
                  {STARTER_PACK.spawnDust} Spawn Dust
                </p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Use to breed new eggs from fish
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      highlight: "none",
    },
    {
      id: "nest",
      title: "Nest Tab: Hatch Your Fish",
      description: "Incubate eggs and manage your collection",
      content: (
        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base text-slate-300">
            In the <span className="font-semibold text-baseBlue">Nest tab</span>, you can:
          </p>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">📋</span>
              <div>
                <p className="font-semibold text-white">View your eggs</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  See how long until they hatch
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">⏱️</span>
              <div>
                <p className="font-semibold text-white">Incubate new eggs</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Costs 1 Pearl Shard, takes 24 hours to hatch
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">🐟</span>
              <div>
                <p className="font-semibold text-white">Collect hatched fish</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Random rarity from Common to Mythic
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      highlight: "nest",
    },
    {
      id: "reef",
      title: "Reef Tab: Breed Your Fish",
      description: "Watch your fish produce resources",
      content: (
        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base text-slate-300">
            In the <span className="font-semibold text-baseBlue">Reef tab</span>, you manage your collection:
          </p>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">✨</span>
              <div>
                <p className="font-semibold text-white">Fish produce Spawn Dust</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Passively generated based on rarity. Common: 6/day, Rare: 12/day, etc.
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">🟠</span>
              <div>
                <p className="font-semibold text-white">Lay eggs from fish</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Costs 100 Spawn Dust per egg (1 per fish per day)
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">🎯</span>
              <div>
                <p className="font-semibold text-white">Expand reef capacity</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Use Pearl Shards to hold more fish
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      highlight: "reef",
    },
    {
      id: "evolution",
      title: "Evolution Tab: Merge Fish",
      description: "Combine fish to get rarer ones",
      content: (
        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base text-slate-300">
            In the <span className="font-semibold text-baseBlue">Evolution tab</span>, merge identical fish:
          </p>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">➕</span>
              <div>
                <p className="font-semibold text-white">Combine 2 same-rarity fish</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Get 1 higher rarity fish + Pearl Shards + bonus eggs
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">💎</span>
              <div>
                <p className="font-semibold text-white">Higher rarity = better rewards</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Mythic fish produce 48 Spawn Dust/day vs 6 for Common
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      highlight: "evolution",
    },
    {
      id: "checkin",
      title: "Tasks Tab: Activities",
      description: "Build streaks and earn rewards",
      content: (
        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base text-slate-300">
            In the <span className="font-semibold text-baseBlue">Tasks tab</span>, check in daily:
          </p>
          <div className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">🔥</span>
              <div>
                <p className="font-semibold text-white">Build a streak</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Check in every day to keep your streak alive
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">💎</span>
              <div>
                <p className="font-semibold text-white">Earn Pearl Shards</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Every {DAILY_CHECKIN.streakForReward} days, claim 1 Pearl Shard reward
                </p>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <p className="font-semibold text-white">Miss a day = reset</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Streak resets if you miss a check-in
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
      highlight: "checkin",
    },
    {
      id: "ready",
      title: "You're Ready to Play!",
      description: "Let's get started",
      content: (
        <div className="space-y-4 sm:space-y-6">
          <p className="text-sm sm:text-base text-slate-300">
            Here's your action plan:
          </p>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-baseBlue/10 border border-baseBlue/30 p-3 sm:p-4">
              <span className="font-semibold text-baseBlue text-lg">1</span>
              <div>
                <p className="font-semibold text-white text-sm sm:text-base">Claim starter pack</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Get your first egg + resources
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-baseBlue/10 border border-baseBlue/30 p-3 sm:p-4">
              <span className="font-semibold text-baseBlue text-lg">2</span>
              <div>
                <p className="font-semibold text-white text-sm sm:text-base">Incubate your egg in Nest</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Wait 24 hours, then collect your first fish
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-baseBlue/10 border border-baseBlue/30 p-3 sm:p-4">
              <span className="font-semibold text-baseBlue text-lg">3</span>
              <div>
                <p className="font-semibold text-white text-sm sm:text-base">Check in daily</p>
                <p className="text-xs sm:text-sm text-slate-400">
                  Build your streak and earn rewards
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 text-center pt-2">
            Have fun building your reef! 🌊
          </p>
        </div>
      ),
    },
  ];

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md sm:max-w-lg rounded-2xl border border-white/10 bg-linear-to-b from-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl">
        {/* Progress indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex justify-between items-center gap-2 mb-3">
            <span className="text-xs sm:text-sm font-medium text-slate-400">
              Step {currentStep + 1} of {steps.length}
            </span>
            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-baseBlue to-cyan-400 transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div>
          <h2 className="mb-2 text-2xl sm:text-3xl font-bold text-white">{step.title}</h2>
          <p className="mb-6 sm:mb-8 text-sm sm:text-base text-slate-400">{step.description}</p>
          
          <div className="mb-8">
            {step.content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={isFirstStep}
            className="flex-1 rounded-full border border-white/20 px-4 py-2.5 sm:py-3 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            Back
          </button>
          
          <button
            onClick={onSkip}
            className="flex-1 rounded-full border border-white/20 px-4 py-2.5 sm:py-3 text-sm font-medium text-slate-400 transition hover:text-white cursor-pointer hover:bg-white/5"
          >
            Skip
          </button>

          <button
            onClick={() => {
              if (isLastStep) {
                onClose();
              } else {
                setCurrentStep(currentStep + 1);
              }
            }}
            className="flex-1 rounded-full bg-linear-to-r from-baseBlue to-cyan-400 px-4 py-2.5 sm:py-3 text-sm font-medium text-white transition hover:shadow-lg hover:shadow-baseBlue/50 cursor-pointer"
          >
            {isLastStep ? "Play" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
