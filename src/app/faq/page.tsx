"use client";

import Link from "next/link";
import { BubbleAnimation } from "@/components/ui/BubbleAnimation";
import { FAQ } from "@/components/ui/FAQ";

export default function FAQPage() {
  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden">
      <BubbleAnimation />
      <main className="relative z-10 container mx-auto flex min-h-screen flex-col px-4 py-6 sm:px-6 sm:py-10 lg:max-w-3xl">
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <span>←</span>
            <span>Back to Game</span>
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-white">FAQ</h1>
          <p className="mt-2 text-slate-400">Everything you need to know about FryReef</p>
        </header>
        <FAQ />
      </main>
    </div>
  );
}

