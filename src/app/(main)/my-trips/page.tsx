"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plane } from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import BookingCard from "@/components/trips/BookingCard";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import type { BookingDetail } from "@/types";

type Tab = "upcoming" | "past";

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-5 w-48 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 w-24 bg-gray-200 rounded" />
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="h-6 w-24 bg-gray-200 rounded" />
        <div className="h-9 w-28 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

function MyTripsContent() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [bookings, setBookings] = useState<BookingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchBookings(upcoming: boolean) {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/api/v1/bookings", {
        params: { upcoming },
      });
      const items = data.items ?? data;
      setBookings(Array.isArray(items) ? items : []);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || "Failed to load bookings."
      );
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings(tab === "upcoming");
  }, [tab]);

  function handleCancelled() {
    fetchBookings(tab === "upcoming");
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-6">My Trips</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit mb-8">
          {(["upcoming", "past"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-5 py-2 rounded-md text-sm font-medium transition-colors capitalize",
                tab === t
                  ? "bg-white text-[#0057FF] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchBookings(tab === "upcoming")}
              className="text-sm font-medium text-[#0057FF] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Plane className="h-8 w-8 text-[#0057FF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
              {tab === "upcoming"
                ? "No upcoming trips"
                : "No past trips"}
            </h3>
            <p className="text-gray-500 mb-6">
              {tab === "upcoming"
                ? "You don't have any upcoming trips booked yet."
                : "You haven't completed any trips yet."}
            </p>
            {tab === "upcoming" && (
              <Link
                href="/"
                className="inline-flex items-center rounded-lg bg-[#0057FF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0046CC] transition-colors"
              >
                Book a Trip
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onCancelled={handleCancelled}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyTripsPage() {
  return (
    <AuthGuard>
      <MyTripsContent />
    </AuthGuard>
  );
}
