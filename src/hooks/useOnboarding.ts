import { useState, useEffect, useCallback } from "react";

const ONBOARDING_KEY = "fryreef_onboarding_completed";

export function useOnboarding() {
  const [isOnboarded, setIsOnboarded] = useState(true); // Default to true to prevent hydration issues
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem(ONBOARDING_KEY) === "true";
      setIsOnboarded(completed);
      setIsLoading(false);
    }
  }, []);

  const completeOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, "true");
      setIsOnboarded(true);
    }
  }, []);

  const skipOnboarding = useCallback(() => {
    completeOnboarding();
  }, [completeOnboarding]);

  const resetOnboarding = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ONBOARDING_KEY);
      setIsOnboarded(false);
    }
  }, []);

  return {
    isOnboarded,
    isLoading,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
  };
}
