"use client";

import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export function MiniAppReady() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return null;
}
