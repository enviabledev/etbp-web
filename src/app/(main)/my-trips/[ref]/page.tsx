"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import AuthGuard from "@/components/layout/AuthGuard";
import AddToCalendarButton from "@/components/booking/AddToCalendarButton";

const RouteMap = dynamic(() => import("@/components/booking/RouteMap"), { ssr: false });
import ETicket from "@/components/trips/ETicket";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useBookingDetail, useCancelBooking, useCancelPreview, useTransferBooking, useAddLuggage, useBookingReview, useSubmitReview } from "@/hooks/queries/useBookings";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft, Calendar, Clock, Users, Mail, Phone, AlertTriangle, XCircle, MapPin, DollarSign, Timer, RefreshCw, Send, Package, Star,
} from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";

export default function BookingDetailPage() {
  const { ref } = useParams<{ ref: string }>();
  const toast = useToast();
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [showLuggage, setShowLuggage] = useState(false);
  const [transferPhone, setTransferPhone] = useState("");
  const [transferName, setTransferName] = useState("");
  const [transferEmail, setTransferEmail] = useState("");
  const [luggageQty, setLuggageQty] = useState(1);
  const [luggageMethod, setLuggageMethod] = useState("wallet");

  const { data: booking, isLoading } = useBookingDetail(ref);
  const cancelMutation = useCancelBooking();
  const cancelPreview = useCancelPreview(ref);
  const transferMutation = useTransferBooking();
  const luggageMutation = useAddLuggage();
  const { data: addons } = useQuery({
    queryKey: ["booking-addons", ref],
    queryFn: async () => { const { data } = await api.get(`/api/v1/bookings/${ref}/addons`); return data; },
    enabled: !!ref && !!booking,
  });
  const { data: existingReview } = useBookingReview(ref);
  const submitReview = useSubmitReview();
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [driverRating, setDriverRating] = useState(0);
  const [busRating, setBusRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [comfortRating, setComfortRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAnonymous, setReviewAnonymous] = useState(false);

  const showDeadline = !isLoading && booking?.status === "pending" && booking?.payment_method_hint === "pay_at_terminal" && booking?.payment_deadline;
  const countdown = useCountdown(showDeadline ? booking!.payment_deadline : null);

  if (isLoading) return <AuthGuard><div className="max-w-4xl mx-auto px-4 py-8"><LoadingSpinner /></div></AuthGuard>;
  if (!booking) return <AuthGuard><div className="max-w-4xl mx-auto px-4 py-16 text-center"><p className="text-gray-500">Booking not found</p></div></AuthGuard>;

  const isCancellable = ["confirmed", "pending"].includes(booking.status);
  const isConfirmed = booking.status === "confirmed";
  const tripInFuture = booking.trip ? new Date(`${booking.trip.departure_date}T${booking.trip.departure_time}`) > new Date() : false;
  const canReschedule = isConfirmed && tripInFuture;
  const hoursUntil = booking.trip ? (new Date(`${booking.trip.departure_date}T${booking.trip.departure_time}`).getTime() - Date.now()) / 3600000 : 0;
  const canTransfer = isConfirmed && hoursUntil > 2 && !booking.transferred_from_user_id;
  const canAddLuggage = (isConfirmed || booking.status === "checked_in") && tripInFuture;

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
          <div className="flex items-center gap-3">
            {(booking.status === "confirmed" || booking.status === "checked_in") && booking.trip && (
              <AddToCalendarButton
                bookingRef={booking.booking_reference || booking.reference}
                tripDate={booking.trip.departure_date}
                tripTime={booking.trip.departure_time}
                routeName={booking.trip.route?.name}
              />
            )}
            {isCancellable && (
              <Button variant="danger" onClick={() => { setShowCancel(true); cancelPreview.refetch(); }}>
                <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
              </Button>
            )}
          </div>
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

            {/* Route Map */}
            {booking.trip?.route?.origin_terminal?.latitude && booking.trip?.route?.destination_terminal?.latitude && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Route Map</h2>
                <RouteMap
                  origin={booking.trip.route.origin_terminal as any}
                  destination={booking.trip.route.destination_terminal as any}
                  distanceKm={null}
                  durationMinutes={null}
                />
              </div>
            )}

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

            {addons && addons.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Add-ons</h2>
                {addons.map((addon: Record<string, string | number>, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">{addon.quantity} Extra Bag{(addon.quantity as number) > 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(addon.total_price as number)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${addon.status === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                        {addon.status === "paid" ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {booking.status === "cancelled" && booking.cancellation_reason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h2 className="font-semibold text-red-800 mb-2">Cancellation</h2>
                <p className="text-sm text-red-700">{booking.cancellation_reason}</p>
              </div>
            )}
          </div>

          <div><ETicket booking={booking} /></div>
        </div>

        {/* Actions */}
        {(canReschedule || canTransfer || canAddLuggage) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h2 className="font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="flex flex-wrap gap-3">
              {canReschedule && (
                <Link href={`/my-trips/${ref}/reschedule`}>
                  <Button variant="secondary"><RefreshCw className="h-4 w-4 mr-2" /> Reschedule</Button>
                </Link>
              )}
              {canTransfer && (
                <Button variant="secondary" onClick={() => setShowTransfer(true)}>
                  <Send className="h-4 w-4 mr-2" /> Transfer Ticket
                </Button>
              )}
              {canAddLuggage && (
                <Button variant="secondary" onClick={() => setShowLuggage(true)}>
                  <Package className="h-4 w-4 mr-2" /> Add Extra Luggage
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Review */}
        {(booking.status === "completed" || (booking.status === "checked_in" && booking.trip?.status === "completed")) && !existingReview && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mt-6">
            <h2 className="font-semibold text-amber-900 mb-2">Rate Your Trip</h2>
            <p className="text-sm text-amber-700 mb-4">How was your experience? Your feedback helps us improve.</p>
            <Button onClick={() => setShowReview(true)}>
              <Star className="h-4 w-4 mr-2" /> Write a Review
            </Button>
          </div>
        )}

        {existingReview && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
            <h2 className="font-semibold text-gray-900 mb-3">Your Review</h2>
            <div className="flex items-center gap-1 mb-2">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`h-5 w-5 ${s <= existingReview.overall_rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
              ))}
            </div>
            {existingReview.comment && <p className="text-sm text-gray-600">{existingReview.comment}</p>}
            {existingReview.admin_response && (
              <div className="mt-3 bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-700">Response from Enviable Transport:</p>
                <p className="text-sm text-blue-600">{existingReview.admin_response}</p>
              </div>
            )}
          </div>
        )}

        {showCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowCancel(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 rounded-full bg-red-50"><AlertTriangle className="h-6 w-6 text-red-500" /></div>
                <div><h3 className="text-lg font-semibold">Cancel Booking</h3><p className="text-sm text-gray-500">This cannot be undone.</p></div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm">
                {cancelPreview.isFetching ? (
                  <p className="text-amber-700">Loading refund details...</p>
                ) : cancelPreview.data ? (
                  <>
                    <p className="font-medium text-amber-800 mb-2">Refund Details:</p>
                    <div className="text-amber-700 space-y-1 text-xs">
                      <p>Booking amount: <strong>{formatCurrency(cancelPreview.data.total_amount)}</strong></p>
                      <p>Refund percentage: <strong>{cancelPreview.data.refund_percentage}%</strong></p>
                      <p>Refund amount: <strong>{formatCurrency(cancelPreview.data.refund_amount)}</strong></p>
                      {cancelPreview.data.reason && <p className="mt-1 text-amber-600">{cancelPreview.data.reason}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-amber-800 mb-2">Refund Policy:</p>
                    <ul className="text-amber-700 space-y-1 text-xs">
                      <li>&gt;24h before departure: <strong>90% refund</strong></li>
                      <li>12-24h: <strong>50% refund</strong></li>
                      <li>&lt;12h: <strong>No refund</strong></li>
                    </ul>
                  </>
                )}
              </div>
              <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Reason (optional)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm mb-4" rows={3} />
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setShowCancel(false)}>Keep Booking</Button>
                <Button variant="danger" onClick={handleCancel} loading={cancelMutation.isPending}>Cancel Booking</Button>
              </div>
            </div>
          </div>
        )}

        {showTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowTransfer(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Transfer Ticket</h3>
              <p className="text-sm text-gray-500 mb-4">Transfer this booking to another person. This cannot be undone.</p>
              <div className="space-y-3">
                <input value={transferName} onChange={e => setTransferName(e.target.value)} placeholder="Recipient full name" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <input value={transferPhone} onChange={e => setTransferPhone(e.target.value)} placeholder="Recipient phone (e.g., +234...)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <input value={transferEmail} onChange={e => setTransferEmail(e.target.value)} placeholder="Recipient email (optional)" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowTransfer(false)}>Cancel</Button>
                <Button
                  loading={transferMutation.isPending}
                  onClick={() => {
                    if (!transferName.trim() || !transferPhone.trim()) { toast.error("Name and phone are required"); return; }
                    transferMutation.mutate(
                      { ref, recipient_name: transferName, recipient_phone: transferPhone, recipient_email: transferEmail || undefined },
                      {
                        onSuccess: () => { setShowTransfer(false); toast.success("Booking transferred successfully"); },
                        onError: (e: any) => toast.error(e?.response?.data?.detail || "Transfer failed"),
                      }
                    );
                  }}
                >
                  Transfer
                </Button>
              </div>
            </div>
          </div>
        )}

        {showLuggage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowLuggage(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Add Extra Luggage</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of extra bags</label>
                  <select value={luggageQty} onChange={e => setLuggageQty(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} bag{n > 1 ? "s" : ""}</option>)}
                  </select>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">Price per bag: <span className="font-bold">{formatCurrency(2000)}</span></p>
                  <p className="text-lg font-bold text-gray-900 mt-1">Total: {formatCurrency(2000 * luggageQty)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment method</label>
                  <div className="flex gap-3">
                    {["wallet", "card"].map(m => (
                      <label key={m} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer text-sm ${luggageMethod === m ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}>
                        <input type="radio" name="luggage_method" value={m} checked={luggageMethod === m} onChange={() => setLuggageMethod(m)} className="accent-blue-600" />
                        {m === "wallet" ? "Wallet" : "Card"}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowLuggage(false)}>Cancel</Button>
                <Button
                  loading={luggageMutation.isPending}
                  onClick={() => {
                    luggageMutation.mutate(
                      {
                        ref,
                        quantity: luggageQty,
                        payment_method: luggageMethod,
                        ...(luggageMethod === "card" ? { callback_url: `${window.location.origin}/my-trips/${ref}` } : {}),
                      },
                      {
                        onSuccess: (data) => {
                          if (luggageMethod === "card" && data?.payment_url) {
                            window.location.href = data.payment_url;
                          } else {
                            setShowLuggage(false);
                            toast.success("Extra luggage added!");
                          }
                        },
                        onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to add luggage"),
                      }
                    );
                  }}
                >
                  Add Luggage
                </Button>
              </div>
            </div>
          </div>
        )}

        {showReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowReview(false)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Rate Your Trip</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating *</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReviewRating(s)} className="p-1">
                        <Star className={`h-8 w-8 ${s <= reviewRating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Driver", value: driverRating, set: setDriverRating },
                    { label: "Bus Condition", value: busRating, set: setBusRating },
                    { label: "Punctuality", value: punctualityRating, set: setPunctualityRating },
                    { label: "Comfort", value: comfortRating, set: setComfortRating },
                  ].map(cat => (
                    <div key={cat.label}>
                      <p className="text-xs text-gray-500 mb-1">{cat.label}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <button key={s} onClick={() => cat.set(s)} className="p-0.5">
                            <Star className={`h-4 w-4 ${s <= cat.value ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value.slice(0, 500))} placeholder="Tell us about your experience (optional)" rows={3} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" />
                <p className="text-xs text-gray-400">{reviewComment.length}/500</p>

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={reviewAnonymous} onChange={e => setReviewAnonymous(e.target.checked)} className="rounded" />
                  Submit anonymously
                </label>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="secondary" onClick={() => setShowReview(false)}>Cancel</Button>
                <Button
                  disabled={reviewRating === 0}
                  loading={submitReview.isPending}
                  onClick={() => {
                    submitReview.mutate({
                      ref, overall_rating: reviewRating,
                      driver_rating: driverRating || undefined,
                      bus_condition_rating: busRating || undefined,
                      punctuality_rating: punctualityRating || undefined,
                      comfort_rating: comfortRating || undefined,
                      comment: reviewComment || undefined,
                      is_anonymous: reviewAnonymous,
                    }, {
                      onSuccess: () => { setShowReview(false); toast.success("Review submitted!"); },
                      onError: (e: any) => toast.error(e?.response?.data?.detail || "Failed to submit review"),
                    });
                  }}
                >
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
