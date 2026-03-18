"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AuthGuard from "@/components/layout/AuthGuard";
import ETicket from "@/components/trips/ETicket";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useBookingDetail, useCancelBooking } from "@/hooks/queries/useBookings";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft, Calendar, Clock, Users, Mail, Phone, AlertTriangle, XCircle, MapPin, DollarSign, Timer,
} from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";

export default function BookingDetailPage() {
  const { ref } = useParams<{ ref: string }>();
  const toast = useToast();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { data: booking, isLoading } = useBookingDetail(ref);
  const cancelMutation = useCancelBooking();

  const showDeadline = !isLoading && booking?.status === "pending" && booking?.payment_method_hint === "pay_at_terminal" && booking?.payment_deadline;
  const countdown = useCountdown(showDeadline ? booking!.payment_deadline : null);

  if (isLoading) return <AuthGuard><div className="max-w-4xl mx-auto px-4 py-8"><LoadingSpinner /></div></AuthGuard>;
  if (!booking) return <AuthGuard><div className="max-w-4xl mx-auto px-4 py-16 text-center"><p className="text-gray-500">Booking not found</p></div></AuthGuard>;

  const isCancellable = ["confirmed", "pending"].includes(booking.status);

  const handleCancel = () => {
    cancelMutation.mutate(
      { ref, reason: cancelReason || undefined },
      {
        onSuccess: (data: any) => {
          setShowCancel(false);
          toast.success( `Booking cancelled. Refund: ${formatCurrency(data.refund_amount || 0)} (${data.refund_percentage || 0}%)`);
        },
        onError: () => toast.error( "Failed to cancel booking"),
      }
    );
  };

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/my-trips" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to My Trips
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking {booking.reference}</h1>
            <div className="mt-2"><Badge status={booking.status} /></div>
          </div>
          {isCancellable && (
            <Button variant="danger" onClick={() => setShowCancel(true)}>
              <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
            </Button>
          )}
        </div>

        {showDeadline && (
          <div className={`rounded-xl border p-5 mb-6 ${countdown.isExpired ? "bg-gray-50 border-gray-200" : countdown.isUrgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center gap-2 mb-2">
              <Timer className={`h-5 w-5 ${countdown.isExpired ? "text-gray-500" : countdown.isUrgent ? "text-red-600" : "text-amber-700"}`} />
              <span className={`text-sm font-semibold ${countdown.isExpired ? "text-gray-600" : countdown.isUrgent ? "text-red-700" : "text-amber-800"}`}>
                {countdown.isExpired ? "This booking has expired" : countdown.isCritical ? "Hurry! Your booking expires soon" : "Pay at terminal before your booking expires"}
              </span>
            </div>
            {!countdown.isExpired && (
              <p className={`text-2xl font-bold tabular-nums ${countdown.isUrgent ? "text-red-700" : "text-amber-900"} ${countdown.isCritical ? "animate-pulse" : ""}`}>
                {countdown.formatted}
              </p>
            )}
            {!countdown.isExpired && booking.trip?.route?.origin_terminal?.name && (
              <p className={`text-sm mt-2 ${countdown.isUrgent ? "text-red-600" : "text-amber-700"}`}>
                <MapPin className="h-3.5 w-3.5 inline mr-1" />
                Pay at {booking.trip.route.origin_terminal.name}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Trip Information</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /><div><p className="text-gray-500">Date</p><p className="font-medium">{booking.trip?.departure_date ? formatDate(booking.trip.departure_date) : "—"}</p></div></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-gray-400" /><div><p className="text-gray-500">Time</p><p className="font-medium">{booking.trip?.departure_time?.slice(0, 5) || "—"}</p></div></div>
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /><div><p className="text-gray-500">Route</p><p className="font-medium">{booking.trip?.route?.origin_terminal?.city ?? "—"} → {booking.trip?.route?.destination_terminal?.city ?? "—"}</p></div></div>
                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-gray-400" /><div><p className="text-gray-500">Amount</p><p className="font-medium">{formatCurrency(booking.total_amount)}</p></div></div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-400" /><div><p className="text-gray-500">Passengers</p><p className="font-medium">{booking.passenger_count}</p></div></div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Passengers</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b"><tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Gender</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Checked In</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {booking.passengers?.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-medium">{p.first_name} {p.last_name}</td>
                        <td className="px-4 py-3 capitalize">{p.gender || "—"}</td>
                        <td className="px-4 py-3">{p.phone || "—"}</td>
                        <td className="px-4 py-3"><Badge status={p.checked_in ? "checked_in" : "pending"} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Contact</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /><span>{booking.contact_email || "—"}</span></div>
                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /><span>{booking.contact_phone || "—"}</span></div>
              </div>
            </div>

            {booking.status === "cancelled" && booking.cancellation_reason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="font-semibold text-red-800 mb-2">Cancellation</h2>
                <p className="text-sm text-red-700">{booking.cancellation_reason}</p>
              </div>
            )}
          </div>

          <div><ETicket booking={booking} /></div>
        </div>

        {showCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowCancel(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-full bg-red-50"><AlertTriangle className="h-6 w-6 text-red-500" /></div>
                <div><h3 className="text-lg font-semibold">Cancel Booking</h3><p className="text-sm text-gray-500">This cannot be undone.</p></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm">
                <p className="font-medium text-amber-800 mb-2">Refund Policy:</p>
                <ul className="text-amber-700 space-y-1 text-xs">
                  <li>&gt;24h before departure: <strong>90% refund</strong></li>
                  <li>12-24h: <strong>50% refund</strong></li>
                  <li>&lt;12h: <strong>No refund</strong></li>
                </ul>
              </div>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason (optional)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-4" rows={3} />
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowCancel(false)}>Keep Booking</Button>
                <Button variant="danger" onClick={handleCancel} loading={cancelMutation.isPending}>Cancel Booking</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
