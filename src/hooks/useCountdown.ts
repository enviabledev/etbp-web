"use client";

import { useState, useEffect } from "react";

interface CountdownResult {
  timeLeft: { hours: number; minutes: number; seconds: number } | null;
  isExpired: boolean;
  isUrgent: boolean; // under 30 min
  isCritical: boolean; // under 5 min
  formatted: string;
  shortFormatted: string;
}

export function useCountdown(deadline: string | null | undefined): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<CountdownResult["timeLeft"]>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    if (!deadline) return;

    function tick() {
      const diff = new Date(deadline!).getTime() - Date.now();
      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft(null);
        setIsUrgent(false);
        setIsCritical(false);
      } else {
        setTimeLeft({
          hours: Math.floor(diff / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
        setIsUrgent(diff < 1800000); // 30 min
        setIsCritical(diff < 300000); // 5 min
        setIsExpired(false);
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  let formatted = "";
  let shortFormatted = "";
  if (isExpired) {
    formatted = "Expired";
    shortFormatted = "Expired";
  } else if (timeLeft) {
    const { hours, minutes, seconds } = timeLeft;
    if (hours > 0) {
      formatted = `${hours}h ${minutes}m ${seconds}s remaining`;
      shortFormatted = `Expires in ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      formatted = `${minutes}m ${seconds}s remaining`;
      shortFormatted = `Expires in ${minutes}m`;
    } else {
      formatted = `${seconds}s remaining`;
      shortFormatted = `Expires in ${seconds}s`;
    }
  }

  return { timeLeft, isExpired, isUrgent, isCritical, formatted, shortFormatted };
}
