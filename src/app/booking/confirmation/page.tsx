"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBooking } from "@/contexts/BookingContext";
import { useBookingDetail } from "@/hooks/queries/useBookings";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import api from "@/lib/api";
import {
  CheckCircle2,
  Copy,
  Check,
  Download,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Loader2,
  User,
  Armchair,
  Bus,
} from "lucide-react";

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const booking = useBooking();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Get booking reference from context or URL
  const ref = booking.bookingReference || searchParams.get("ref") || null;

  const { data: bookingDetail, isLoading } = useBookingDetail(ref);

  // Clear booking context on mount (booking is complete)
  useEffect(() => {
    if (ref && bookingDetail) {
      booking.reset();
    }
    // Only run once when we have the detail
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingDetail]);

  const handleCopyRef = async () => {
    if (!ref) return;
    try {
      await navigator.clipboard.writeText(ref);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = ref;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTicket = async () => {
    if (!ref) return;
    setDownloading(true);
    try {
      const response = await api.get(`/api/v1/bookings/${ref}/ticket`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ETBP-Ticket-${ref}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download ticket. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Loading
  if (isLoading || (!bookingDetail && ref)) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#0057FF] animate-spin" />
          <p className="text-sm text-gray-500">Loading booking details...</p>
        </div>
      </div>
    );
  }

  // No reference
  if (!ref) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <h2 className="text-lg font-bold text-[#1E293B] mb-2">
            No Booking Found
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            We couldn&apos;t find a booking reference. Please check your trips.
          </p>
          <a
            href="/my-trips"
            className="inline-block px-6 py-2.5 bg-[#0057FF] text-white text-sm font-medium rounded-lg hover:bg-[#0046cc] transition-colors"
          >
            View My Trips
          </a>
        </div>
      </div>
    );
  }

  const detail = bookingDetail;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-[#059669]" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E293B] mb-1">
            Booking Confirmed!
          </h1>
          <p className="text-sm text-gray-600">
            Your trip has been booked successfully.
            {detail?.status === "pending" &&
              " Please complete your payment at the terminal."}
          </p>
        </div>

        {/* Booking Reference */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            Booking Reference
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-bold text-[#1E293B] tracking-wider font-mono">
              {ref}
            </span>
            <button
              onClick={handleCopyRef}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Copy reference"
            >
              {copied ? (
                <Check className="w-5 h-5 text-[#059669]" />
              ) : (
                <Copy className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {copied && (
            <p className="text-xs text-[#059669] mt-1">Copied to clipboard</p>
          )}
        </div>

        {/* Booking Summary */}
        {detail && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="text-base font-semibold text-[#1E293B] mb-4">
              Trip Details
            </h3>

            {/* Route */}
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-4 h-4 text-[#0057FF] flex-shrink-0" />
              <span className="text-sm font-medium text-[#1E293B]">
                {detail.trip.route.origin_terminal.city}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-[#1E293B]">
                {detail.trip.route.destination_terminal.city}
              </span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center gap-6 mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formatDate(detail.trip.departure_date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formatTime(detail.trip.departure_time)}
                </span>
              </div>
            </div>

            {/* Vehicle */}
            <div className="flex items-center gap-2 mb-4">
              <Bus className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                {detail.trip.vehicle_type.name}
              </span>
            </div>

            <hr className="border-gray-100 mb-4" />

            {/* Passengers */}
            <h4 className="text-sm font-semibold text-[#1E293B] mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0057FF]" />
              Passengers ({detail.passenger_count})
            </h4>
            <div className="space-y-2 mb-4">
              {detail.passengers.map((passenger, _i) => (
                <div
                  key={passenger.id}
                  className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg"
                >
                  <span className="text-sm text-[#1E293B]">
                    {passenger.first_name} {passenger.last_name}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Armchair className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-sm font-medium text-[#1E293B]">
                      {passenger.seat_number}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <hr className="border-gray-100 mb-4" />

            {/* Payment Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-[#1E293B]">
                  {formatCurrency(detail.total_amount + detail.promo_discount)}
                </span>
              </div>
              {detail.promo_discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#059669]">
                    Promo ({detail.promo_code})
                  </span>
                  <span className="text-[#059669]">
                    -{formatCurrency(detail.promo_discount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-base font-bold text-[#1E293B]">
                  Total
                </span>
                <span className="text-lg font-bold text-[#0057FF]">
                  {formatCurrency(detail.total_amount, detail.currency)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Payment method</span>
                <span className="capitalize">{detail.payment_method}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadTicket}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#0057FF] text-white text-sm font-semibold rounded-xl hover:bg-[#0046cc] transition-colors disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download E-Ticket
          </button>

          <button
            onClick={() => router.push("/my-trips")}
            className="flex-1 px-5 py-3 border border-gray-300 text-sm font-semibold text-[#1E293B] rounded-xl hover:bg-gray-50 transition-colors"
          >
            View My Trips
          </button>

          <button
            onClick={() => router.push("/")}
            className="flex-1 px-5 py-3 border border-gray-300 text-sm font-semibold text-[#1E293B] rounded-xl hover:bg-gray-50 transition-colors"
          >
            Book Another Trip
          </button>
        </div>
      </div>
    </div>
  );
}
