"use client";

import Link from "next/link";
import { MapPin, ArrowLeft, Navigation } from "lucide-react";

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        {/* Illustration */}
        <div className="mx-auto w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center mb-8">
          <div className="relative">
            <MapPin className="h-14 w-14 text-[#0057FF]" />
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#0057FF] rounded-full flex items-center justify-center">
              <Navigation className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#1E293B] mb-3">
          Live Trip Tracking
        </h1>

        {/* Coming soon badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-[#D97706] animate-pulse" />
          <span className="text-sm font-medium text-[#D97706]">
            Coming Soon
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
          This feature will be available in Phase 2. You will be able to track
          your trip in real-time, see estimated arrival times, and get
          notifications along the way.
        </p>

        {/* Planned features */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 max-w-sm mx-auto mb-8 text-left">
          <p className="text-sm font-semibold text-[#1E293B] mb-3">
            Planned Features
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0057FF]" />
              Real-time GPS tracking on map
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0057FF]" />
              Estimated time of arrival
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0057FF]" />
              Push notifications for stops
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0057FF]" />
              Share trip progress with others
            </li>
          </ul>
        </div>

        {/* Back button */}
        <Link
          href="/my-trips"
          className="inline-flex items-center gap-2 rounded-lg bg-[#0057FF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0046CC] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Trips
        </Link>
      </div>
    </div>
  );
}
