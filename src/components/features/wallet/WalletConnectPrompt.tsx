"use client";

import Image from "next/image";

export function WalletConnectPrompt() {
  return (
    <div className="flex flex-col items-center">
      <Image
        src="/images/fish.webp"
        alt="Connect wallet"
        width={200}
        height={200}
        className="w-64 h-64 sm:w-80 sm:h-80 object-contain"
        priority
      />
      <p className="text-center text-lg text-slate-200 max-w-md">
        Connect wallet to start your underwater adventure
      </p>
    </div>
  );
}

