"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I start playing?",
    answer:
      "Connect your wallet and claim your Starter Pack! You'll receive 1 Egg, 2 Pearl Shards, and 100 Spawn Dust to begin your underwater adventure. Your reef starts with capacity for 3 fish.",
  },
  {
    question: "What are Pearl Shards?",
    answer:
      "Pearl Shards 💎 are used to incubate eggs and expand your reef capacity. You need 1 Pearl Shard to start incubation. Earn them by completing a 7-day check-in streak, merging fish, or from the Starter Pack.",
  },
  {
    question: "What is Spawn Dust?",
    answer:
      "Spawn Dust ✨ is produced by your fish daily. Different rarity fish produce different amounts: Common (6/day), Rare (12/day), Epic (18/day), Legendary (32/day), Mythic (48/day). Use 100 Spawn Dust to lay a new egg from any fish.",
  },
  {
    question: "How does egg incubation work?",
    answer:
      "Go to the Nest tab, select an egg, and click 'Incubate' (costs 1 Pearl Shard). After 24 hours, your egg will be ready to hatch into a fish with a random rarity! Make sure you have space in your reef before hatching.",
  },
  {
    question: "What are the fish rarities?",
    answer:
      "There are 5 rarities: Common (50% chance), Rare (28%), Epic (14%), Legendary (6%), and Mythic (2%). Rarer fish produce more Spawn Dust per day and give better rewards when merged or released.",
  },
  {
    question: "How do I get more eggs?",
    answer:
      "There are two ways: 1) Lay eggs - collect 100 Spawn Dust from your fish and use 'Lay Egg' in the Reef tab (24h cooldown per fish). 2) Merge fish - merging higher rarity fish rewards bonus eggs.",
  },
  {
    question: "What is the daily check-in?",
    answer:
      "Visit the Tasks tab daily and click 'Check-in' to build your streak. Complete a 7-day streak to earn 1 Pearl Shard. The streak resets if you miss a day!",
  },
  {
    question: "What is Reef Capacity?",
    answer:
      "Reef Capacity limits how many fish you can have. You start with 3 slots. Expand your reef using Pearl Shards - costs increase with each expansion (1, 2, 4, 8, 16 Pearl Shards). You can also release fish to free up space.",
  },
  {
    question: "How does fish merging work?",
    answer:
      "In the Evolution tab, select 2 fish of the same rarity to merge them into one higher-rarity fish. Costs: Common→Rare (50 dust), Rare→Epic (100 dust), Epic→Legendary (200 dust), Legendary→Mythic (400 dust). You also receive Pearl Shards and bonus eggs as rewards!",
  },
  {
    question: "How do I release fish?",
    answer:
      "Click the Release button in the Reef tab to enter release mode. Select fish you want to release and confirm. Released fish are permanently burned, but you receive Spawn Dust: Common (50), Rare (100), Epic (250), Legendary (500), Mythic (1000).",
  },
  {
    question: "Which network does FryReef use?",
    answer:
      "FryReef runs on Base Mainnet. Make sure your wallet is connected to Base network. The app will prompt you to switch if needed.",
  },
  {
    question: "Will there be a token?",
    answer:
      "Yes! The $FR token is planned for future release. It will be the core currency of the FryReef ecosystem, used for premium fish breeding, marketplace transactions, staking rewards, governance voting, and exclusive in-game features. Early players and active participants may receive $FR token allocation based on their activity, fish collection, and engagement.",
  },
];

function FAQItem({ item, isOpen, onClick }: { item: FAQItem; isOpen: boolean; onClick: () => void }) {
  return (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={onClick}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left transition hover:text-baseBlue"
      >
        <span className="text-sm font-medium text-slate-200">{item.question}</span>
        <span
          className={`flex-shrink-0 text-lg text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          isOpen ? "grid-rows-[1fr] pb-4" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-slate-400">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-sm">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Frequently Asked Questions
      </h2>
      <div>
        {faqData.map((item, index) => (
          <FAQItem
            key={index}
            item={item}
            isOpen={openIndex === index}
            onClick={() => toggleItem(index)}
          />
        ))}
      </div>
    </div>
  );
}
