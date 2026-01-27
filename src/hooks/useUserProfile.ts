"use client";

import { useState, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export function useUserProfile() {
  const [profile, setProfile] = useState<{
    username?: string;
    displayName?: string;
    pfpUrl?: string;
    fid?: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get user context from mini app SDK
        const context = await sdk.context;
        
        if (context?.user) {
          setProfile({
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
            fid: context.user.fid,
          });
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  return { profile, isLoading };
}
