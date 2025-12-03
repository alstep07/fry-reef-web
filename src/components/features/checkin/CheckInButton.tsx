"use client";

import { Button } from "@/components/ui/Button";

interface CheckInButtonProps {
  onCheckIn: () => void;
  isCheckedIn: boolean;
  disabled?: boolean;
}

export function CheckInButton({
  onCheckIn,
  isCheckedIn,
  disabled = false,
}: CheckInButtonProps) {
  return (
    <Button
      onClick={onCheckIn}
      disabled={disabled || isCheckedIn}
      variant="primary"
    >
      {isCheckedIn ? "You are based" : "Say BM"}
    </Button>
  );
}

