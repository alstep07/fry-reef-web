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
      "Connect your wallet and claim your Starter Pack! You'll receive 1 Egg, 2 Pearl Shards, and 50 Spawn Dust to begin your underwater adventure.",
  },
  {
    question: "What are Pearl Shards?",
    answer:
      "Pearl Shards 🫧 are used to incubate eggs. You need 1 Pearl Shard to start incubation. Earn them by completing a 7-day check-in streak or from the Starter Pack.",
  },
  {
    question: "What is Spawn Dust?",
    answer:
      "Spawn Dust ✨ is produced by your fish daily. Different rarity fish produce different amounts: Common (6/day), Rare (12/day), Epic (18/day), Legendary (32/day), Mythic (48/day). Use 100 Spawn Dust to lay a new egg.",
  },
  {
    question: "How does egg incubation work?",
    answer:
      "Go to the Nest tab, select an egg, and click 'Incubate' (costs 1 Pearl Shard). After 24 hours, your egg will be ready to hatch into a fish with a random rarity!",
  },
  {
    question: "What are the fish rarities?",
    answer:
      "There are 5 rarities: Common (50% chance), Rare (28%), Epic (14%), Legendary (6%), and Mythic (2%). Rarer fish produce more Spawn Dust per day.",
  },
  {
    question: "How do I get more eggs?",
    answer:
      "Collect 100 Spawn Dust from your fish and use 'Lay Egg' feature in the Reef tab. The more fish you have, the faster you accumulate Spawn Dust!",
  },
  {
    question: "What is the daily check-in?",
    answer:
      "Visit the Tasks tab daily and click 'Check-in' to build your streak. Complete a 7-day streak to earn 1 Pearl Shard. The streak resets if you miss a day!",
  },
  {
    question: "Which network does FryReef use?",
    answer:
      "FryReef runs on Base Sepolia testnet. Make sure your wallet is connected to this network. The app will prompt you to switch if needed.",
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

