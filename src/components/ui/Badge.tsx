"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
  children?: React.ReactNode;
}

export default function Badge({ status, className, children }: BadgeProps) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.default;
  const displayText = children || status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        colors.bg,
        colors.text,
        className
      )}
    >
      {displayText}
    </span>
  );
}
