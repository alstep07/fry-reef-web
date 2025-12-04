"use client";

import Image from "next/image";

export function WalletConnectPrompt() {
  return (
    <div className="flex flex-col items-center">
      <Image
        src="/images/common/coral.webp"
        alt="Connect wallet"
        width={200}
        height={200}
        className="w-48 h-48 sm:w-60 sm:h-60 object-contain"
        priority
      />
      <p className="mt-8 text-center text-xl text-slate-400 max-w-md">
        Connect wallet to start your underwater adventure
      </p>
    </div>
  );
}

