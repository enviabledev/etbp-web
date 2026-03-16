"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** A single skeleton line / block. */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse-soft rounded bg-gray-200",
        className
      )}
    />
  );
}

/** A skeleton shaped like a card. */
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white p-5 space-y-4", className)}>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-3">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

/** A skeleton shaped like a trip search result card. */
export function TripCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border border-gray-100 bg-white p-5 space-y-4", className)}>
      {/* Route header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Time / duration row */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-px w-16" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-px w-16" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-14 rounded" />
          <Skeleton className="h-6 w-14 rounded" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
