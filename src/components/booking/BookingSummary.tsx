import React from "react";
import type { Seat, TripSearchResult } from "@/types";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { MapPin, Calendar, Clock, Bus } from "lucide-react";

interface BookingSummaryProps {
  trip: TripSearchResult;
  selectedSeats: Seat[];
  promoCode?: string | null;
  promoDiscount?: number;
}

export default function BookingSummary({
  trip,
  selectedSeats,
  promoCode,
  promoDiscount = 0,
}: BookingSummaryProps) {
  const subtotal = selectedSeats.reduce(
    (sum, seat) => sum + trip.price * (1 + seat.price_modifier),
    0
  );
  const total = Math.max(0, subtotal - promoDiscount);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-4">
      <h3 className="text-lg font-bold text-[#1E293B] mb-4">
        Booking Summary
      </h3>

      {/* Route */}
      <div className="flex items-start gap-3 mb-3">
        <MapPin className="w-4 h-4 text-[#0057FF] mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-[#1E293B]">
            {trip.route?.origin_terminal?.city || "—"}
          </p>
          <div className="w-px h-3 bg-gray-300 ml-1.5 my-0.5" />
          <p className="text-sm font-medium text-[#1E293B]">
            {trip.route?.destination_terminal?.city || "—"}
          </p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-3 mb-2">
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          {formatDate(trip.departure_date)}
        </p>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-600">
          {formatTime(trip.departure_time)}
        </p>
      </div>

      {/* Vehicle Type */}
      <div className="flex items-center gap-3 mb-4">
        <Bus className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <p className="text-sm text-gray-600">{trip.vehicle_type?.name || "Standard"}</p>
      </div>

      <hr className="border-gray-100 mb-4" />

      {/* Selected Seats */}
      <div className="mb-4">
        <p className="text-sm font-medium text-[#1E293B] mb-2">
          Selected Seats ({selectedSeats.length})
        </p>
        {selectedSeats.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No seats selected</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <span
                key={seat.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#0057FF] border border-blue-200"
              >
                {seat.seat_number}
                {seat.price_modifier > 0 && (
                  <span className="ml-1 text-[10px] text-blue-400">
                    +{Math.round(seat.price_modifier * 100)}%
                  </span>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <hr className="border-gray-100 mb-4" />

      {/* Price Breakdown */}
      <div className="space-y-2 mb-4">
        {selectedSeats.map((seat) => {
          const seatPrice = trip.price * (1 + seat.price_modifier);
          return (
            <div
              key={seat.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-600">
                Seat {seat.seat_number}
                {seat.seat_type !== "standard" && (
                  <span className="text-xs text-gray-400 ml-1">
                    ({seat.seat_type})
                  </span>
                )}
              </span>
              <span className="text-[#1E293B]">
                {formatCurrency(seatPrice)}
              </span>
            </div>
          );
        })}

        {promoCode && promoDiscount > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#059669]">
              Promo ({promoCode})
            </span>
            <span className="text-[#059669]">
              -{formatCurrency(promoDiscount)}
            </span>
          </div>
        )}
      </div>

      <hr className="border-gray-100 mb-3" />

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-[#1E293B]">Total</span>
        <span className="text-xl font-bold text-[#0057FF]">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
