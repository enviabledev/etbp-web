"use client";

import React, { useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useBooking } from "@/contexts/BookingContext";
import { formatCurrency, formatDate, formatTime, formatDuration, cn } from "@/lib/utils";
import type { TripSearchResult, SeatMapResponse } from "@/types";
import SeatMap from "@/components/booking/SeatMap";
import SeatLegend from "@/components/booking/SeatLegend";
import BookingSummary from "@/components/booking/BookingSummary";
import {
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = params.id as string;
  const { isAuthenticated } = useAuth();
  const booking = useBooking();

  const maxPassengers = searchParams.get("passengers")
    ? parseInt(searchParams.get("passengers")!, 10)
    : 0; // 0 = unlimited

  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [lockError, setLockError] = useState<string | null>(null);
  const [isLocking, setIsLocking] = useState(false);

  // Fetch trip detail
  const {
    data: trip,
    isLoading: tripLoading,
    error: tripError,
  } = useQuery<TripSearchResult>({
    queryKey: ["trips", tripId],
    queryFn: async () => {
      // Get basic trip detail (has seats but no nested route)
      const { data: tripData } = await api.get(`/api/v1/trips/${tripId}`);
      // Search for this trip to get the full route/vehicle_type info
      const { data: searchResults } = await api.get("/api/v1/routes/search", {
        params: { date: tripData.departure_date, passengers: 1 },
      });
      // Find this specific trip in search results
      const rich = (searchResults as TripSearchResult[])?.find(
        (t: TripSearchResult) => t.id === tripId
      );
      if (rich) return rich;
      // Fallback: return basic trip with safe defaults
      return {
        ...tripData,
        route: tripData.route || { name: "—", code: "", origin_terminal: { name: "", city: "—", state: "" }, destination_terminal: { name: "", city: "—", state: "" }, distance_km: null, estimated_duration_minutes: null, base_price: tripData.price || 0, currency: "NGN" },
        vehicle_type: tripData.vehicle_type || { name: "Standard", seat_capacity: tripData.total_seats || 0, amenities: [] },
        estimated_duration_minutes: tripData.estimated_duration_minutes || null,
      };
    },
  });

  // Fetch seat map
  const {
    data: seatMap,
    isLoading: seatsLoading,
    error: seatsError,
  } = useQuery<SeatMapResponse>({
    queryKey: ["trips", tripId, "seats"],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/trips/${tripId}/seats`);
      return data;
    },
  });

  const seats = seatMap?.seats ?? [];
  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));

  const handleSeatToggle = useCallback(
    (seatId: string) => {
      setSelectedSeatIds((prev) => {
        if (prev.includes(seatId)) {
          return prev.filter((id) => id !== seatId);
        }
        // Enforce max passengers limit
        if (maxPassengers > 0 && prev.length >= maxPassengers) {
          return prev;
        }
        return [...prev, seatId];
      });
      setLockError(null);
    },
    [maxPassengers]
  );

  const handleContinue = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/trips/${tripId}`);
      return;
    }

    if (selectedSeatIds.length === 0) return;

    setIsLocking(true);
    setLockError(null);

    try {
      const { data } = await api.post(`/api/v1/trips/${tripId}/seats/lock`, {
        seat_ids: selectedSeatIds,
      });

      // Save to BookingContext
      booking.setTrip(trip!);
      booking.clearSeats();
      selectedSeats.forEach((seat) => booking.addSeat(seat));
      booking.setLockExpiry(data.expires_at || data.lock_expires_at);

      router.push("/booking/passengers");
    } catch (err: any) {
      if (err.response?.status === 409) {
        setLockError("Some seats are no longer available. Please select different seats.");
      } else {
        setLockError(
          err.response?.data?.detail || "Failed to lock seats. Please try again."
        );
      }
    } finally {
      setIsLocking(false);
    }
  };

  // Loading state
  if (tripLoading || seatsLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0057FF] animate-spin" />
          <p className="text-sm text-gray-500">Loading trip details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (tripError || seatsError || !trip) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-[#DC2626] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#1E293B] mb-2">
            Trip Not Found
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            We couldn&apos;t load this trip. It may no longer be available.
          </p>
          <button
            onClick={() => router.push("/search")}
            className="px-5 py-2.5 bg-[#0057FF] text-white text-sm font-medium rounded-lg hover:bg-[#0046cc] transition-colors"
          >
            Search Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Trip Summary Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4 md:gap-8">
            {/* Route */}
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0057FF]" />
              <span className="text-sm font-semibold text-[#1E293B]">
                {trip.route?.origin_terminal?.city || "—"}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-[#1E293B]">
                {trip.route?.destination_terminal?.city || "—"}
              </span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {formatDate(trip.departure_date)}
              </span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {formatTime(trip.departure_time)}
              </span>
            </div>

            {/* Duration */}
            {trip.estimated_duration_minutes && trip.estimated_duration_minutes > 0 && (
              <span className="text-sm text-gray-500">
                ~{formatDuration(trip.estimated_duration_minutes)}
              </span>
            )}

            {/* Price */}
            <span className="text-sm font-bold text-[#0057FF] ml-auto">
              From {formatCurrency(trip.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Seat Map */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-[#1E293B] mb-1">
                Select Your Seats
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {maxPassengers > 0
                  ? `Select up to ${maxPassengers} seat${maxPassengers > 1 ? "s" : ""}`
                  : "Click on available seats to select them"}
              </p>

              {/* Legend */}
              <div className="mb-6">
                <SeatLegend />
              </div>

              {/* Seat Map */}
              <div className="flex justify-center">
                <SeatMap
                  seats={seats}
                  selectedSeatIds={selectedSeatIds}
                  onSeatToggle={handleSeatToggle}
                />
              </div>

              {/* Seat Info */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  {seatMap?.available_seats} of {seatMap?.total_seats} seats
                  available
                </p>
              </div>
            </div>

            {/* Error */}
            {lockError && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
                <p className="text-sm text-[#DC2626]">{lockError}</p>
              </div>
            )}
          </div>

          {/* Right: Summary Sidebar */}
          <div className="w-full lg:w-80">
            <BookingSummary trip={trip} selectedSeats={selectedSeats} />

            {/* Continue Button */}
            <button
              onClick={handleContinue}
              disabled={selectedSeatIds.length === 0 || isLocking}
              className={cn(
                "w-full mt-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150",
                "flex items-center justify-center gap-2",
                selectedSeatIds.length > 0
                  ? "bg-[#0057FF] text-white hover:bg-[#0046cc] active:bg-[#003bb3]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              )}
            >
              {isLocking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Locking Seats...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {!isAuthenticated && (
              <p className="text-xs text-gray-500 text-center mt-2">
                You&apos;ll need to log in to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
