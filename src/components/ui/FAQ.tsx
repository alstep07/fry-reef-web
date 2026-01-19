"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is FryReef?",
    answer:
      "FryReef is an on-chain idle game on Base where you collect, breed, and evolve fish NFTs. Hatch eggs, grow your reef, merge fish to higher rarities, and earn resources passively.",
  },
  {
    question: "How do I start?",
    answer:
      "Connect wallet → Claim Starter Pack (free, 1 Egg + 2 Pearl Shards + 100 Spawn Dust) → Incubate egg → Hatch your first fish!",
  },
  {
    question: "How do I get fish?",
    answer:
      "3 ways: 1) Hatch eggs in Nest tab. 2) Merge 2 same-rarity fish to get 1 higher rarity. 3) Starter Pack gives your first egg.",
  },
  {
    question: "Where do I get Pearl Shards 💎?",
    answer:
      "Sources: Starter Pack (2), 7-day check-in streak (1), merging fish (1-3 depending on rarity). Used for: incubating eggs (1) and expanding reef capacity.",
  },
  {
    question: "Where do I get Spawn Dust ✨?",
    answer:
      "Your fish produce it passively: Common 6/day, Rare 12/day, Epic 18/day, Legendary 32/day, Mythic 48/day. Also earned by releasing fish. Used to lay eggs (100) and merge fish.",
  },
  {
    question: "Fish rarities?",
    answer:
      "5 tiers: Common (50%), Rare (28%), Epic (14%), Legendary (6%), Mythic (2%). Higher rarity = more Spawn Dust/day + better merge/release rewards.",
  },
  {
    question: "How does breeding work?",
    answer:
      "Each fish can lay 1 egg per 24h (costs 100 Spawn Dust). Then incubate the egg (1 Pearl Shard, 24h wait) and hatch to get a new fish with random rarity.",
  },
  {
    question: "How does merging work?",
    answer:
      "Evolution tab: combine 2 fish of same rarity → get 1 fish of next rarity + Pearl Shards + bonus eggs. Costs Spawn Dust (50/100/200/400 by tier).",
  },
  {
    question: "What is Reef Capacity?",
    answer:
      "Max fish you can own. Starts at 3. Expand with Pearl Shards (cost doubles each time: 1→2→4→8→16). Or release fish to free space.",
  },
  {
    question: "What's the daily check-in?",
    answer:
      "Tasks tab → Check-in daily → 7-day streak = 1 Pearl Shard. Miss a day = streak resets.",
  },
  {
    question: "Network?",
    answer:
      "Base Mainnet. App auto-prompts to switch network if needed.",
  },
  {
    question: "Future token?",
    answer:
      "$FR token planned. Will be used for marketplace, staking, governance. Early active players may receive allocation based on activity.",
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
