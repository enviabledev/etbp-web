"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: string;
  onExpired?: () => void;
}

export default function CountdownTimer({
  expiresAt,
  onExpired,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  });
  const [expired, setExpired] = useState(false);

  const handleExpiry = useCallback(() => {
    setExpired(true);
    onExpired?.();
  }, [onExpired]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleExpiry();
      return;
    }

    const interval = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      const secondsLeft = Math.max(0, Math.floor(diff / 1000));
      setTimeLeft(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(interval);
        handleExpiry();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, timeLeft, handleExpiry]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 60 && timeLeft > 0;

  // Expired modal
  if (expired) {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-[#DC2626]" />
            </div>
            <h3 className="text-lg font-bold text-[#1E293B] mb-2">
              Seats Released
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your seat reservation has expired. The selected seats have been
              released and are no longer held for you.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-2.5 bg-[#0057FF] text-white text-sm font-medium rounded-lg hover:bg-[#0046cc] transition-colors"
            >
              Search Again
            </a>
          </div>
        </div>

        {/* Timer bar (behind modal) */}
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#DC2626]" />
          <span className="text-sm font-medium text-[#DC2626]">
            Time expired
          </span>
        </div>
      </>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg px-4 py-2.5 flex items-center gap-2 border",
        isUrgent
          ? "bg-red-50 border-red-200"
          : "bg-amber-50 border-amber-200"
      )}
    >
      <Clock
        className={cn(
          "w-4 h-4",
          isUrgent ? "text-[#DC2626]" : "text-[#D97706]"
        )}
      />
      <span
        className={cn(
          "text-sm font-medium",
          isUrgent ? "text-[#DC2626]" : "text-[#D97706]"
        )}
      >
        Seats held for{" "}
        <span className="font-bold tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </span>
    </div>
  );
}
