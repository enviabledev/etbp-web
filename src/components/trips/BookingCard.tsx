"use client";

import Link from "next/link";
import { useState } from "react";
import { Calendar, Clock, Users, Hash, MapPin } from "lucide-react";
import { cn, formatCurrency, formatDate, formatTime, STATUS_COLORS } from "@/lib/utils";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { useCountdown } from "@/hooks/useCountdown";
import type { BookingDetail, BookingStatus } from "@/types";

interface BookingCardProps {
  booking: BookingDetail;
  onCancelled?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  cancelled: "Cancelled",
  completed: "Completed",
  checked_in: "Checked In",
  expired: "Expired",
  refunded: "Refunded",
};

function StatusBadge({ status }: { status: BookingStatus }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.default;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        colors.bg,
        colors.text
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function BookingCard({ booking, onCancelled }: BookingCardProps) {
  const toast = useToast();
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const bookingRef = booking.booking_reference || booking.reference;
  const status = booking.status;
  const showDeadline = status === "pending" && booking.payment_method_hint === "pay_at_terminal" && booking.payment_deadline;
  const countdown = useCountdown(showDeadline ? booking.payment_deadline : null);
  const passenger_count = booking.passenger_count;
  const total_amount = booking.total_amount;
  const currency = booking.currency;
  const trip = booking.trip;
  const origin = trip?.route?.origin_terminal?.city || "—";
  const destination = trip?.route?.destination_terminal?.city || "—";

  const isUpcoming = trip
    ? new Date(`${trip.departure_date}T${trip.departure_time}`) > new Date()
    : false;
  const isCancellable =
    isUpcoming && (status === "confirmed" || status === "pending");

  function handleCancel() {
    setShowCancelConfirm(true);
  }

  async function performCancel() {
    setShowCancelConfirm(false);
    setCancelling(true);
    try {
      await api.put(`/api/v1/bookings/${bookingRef}/cancel`, { reason: null });
      toast.success("Booking cancelled successfully.");
      onCancelled?.();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || "Failed to cancel booking. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header: Route + Status */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 text-[#1E293B]">
          <MapPin className="h-4 w-4 text-[#0057FF]" />
          <span className="font-semibold text-base">
            {origin} &rarr; {destination}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {showDeadline && (
            <span className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              countdown.isExpired ? "bg-gray-100 text-gray-600" : countdown.isUrgent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            )}>
              {countdown.shortFormatted}
            </span>
          )}
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span>{trip ? formatDate(trip.departure_date) : "—"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-gray-400" />
          <span>{trip ? formatTime(trip.departure_time) : "—"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-gray-400" />
          <span>
            {passenger_count} passenger{passenger_count !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Hash className="h-4 w-4 text-gray-400" />
          <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
            {bookingRef}
          </span>
        </div>
      </div>

      {/* Footer: Amount + Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <p className="text-lg font-bold text-[#1E293B]">
          {formatCurrency(total_amount, currency)}
        </p>

        <div className="flex items-center gap-3">
          {isCancellable && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          )}
          <Link
            href={`/my-trips/${bookingRef}`}
            className="inline-flex items-center rounded-lg bg-[#0057FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#0046CC] transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">Cancel Booking?</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to cancel this booking? Refund policy applies based on time until departure.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2 border rounded-lg text-sm">Keep Booking</button>
              <button onClick={performCancel} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Cancel Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
