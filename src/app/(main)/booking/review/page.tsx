"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/contexts/BookingContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateBooking, useInitiatePayment, usePayWithWallet } from "@/hooks/queries/useBookings";
import { useToast } from "@/components/ui/Toast";
import BookingSummary from "@/components/booking/BookingSummary";
import PromoCodeInput from "@/components/booking/PromoCodeInput";
import PaymentMethodSelect from "@/components/booking/PaymentMethodSelect";
import CountdownTimer from "@/components/booking/CountdownTimer";
import Button from "@/components/ui/Button";
import BookingSteps from "@/components/booking/BookingSteps";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { ArrowLeft, Shield } from "lucide-react";

export default function BookingReviewPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const {
    selectedTrip, selectedSeats, passengers, contactInfo, paymentMethod, lockExpiresAt, promoDiscount,
    setPaymentMethod, setBookingRef, reset,
  } = useBooking();

  const createBooking = useCreateBooking();
  const initiatePayment = useInitiatePayment();
  const payWithWallet = usePayWithWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!selectedTrip || selectedSeats.length === 0) {
    router.push("/");
    return null;
  }

  // Check if seat reservation has expired
  if (lockExpiresAt && new Date(lockExpiresAt).getTime() < Date.now()) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Session Expired</h2>
        <p className="text-gray-500 mb-6">Your seat reservation has expired. Please start a new search.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => { reset(); router.push("/"); }}>Search Again</Button>
        </div>
      </div>
    );
  }

  const baseTotal = selectedSeats.reduce(
    (sum, s) => sum + (selectedTrip.price || 0) + (s.price_modifier || 0),
    0
  );
  const total = baseTotal - (promoDiscount || 0);

  const handleConfirmAndPay = async () => {
    if (!paymentMethod) {
      toast.error( "Please select a payment method");
      return;
    }
    if (!passengers || passengers.length === 0) {
      toast.error( "Passenger details are missing");
      router.push("/booking/passengers");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create booking (always create fresh — never reuse stale references)
      const bookingData = {
        trip_id: selectedTrip.id,
        passengers: passengers.map((p: any, idx: number) => ({
          seat_id: selectedSeats[idx]?.id,
          first_name: p.first_name,
          last_name: p.last_name,
          gender: p.gender || undefined,
          phone: p.phone || undefined,
          is_primary: idx === 0,
        })),
        contact_email: contactInfo?.email || user?.email,
        contact_phone: contactInfo?.phone || user?.phone,
        emergency_contact_name: contactInfo?.emergency_name || undefined,
        emergency_contact_phone: contactInfo?.emergency_phone || undefined,
        payment_method: paymentMethod,
      };

      const booking: any = await createBooking.mutateAsync(bookingData as any);
      const ref = booking.reference || booking.booking_reference;
      setBookingRef(ref!);

      // Step 2: Process payment
      if (paymentMethod === "card") {
        const payment: any = await initiatePayment.mutateAsync({
          booking_reference: ref!,
          method: "card",
          callback_url: `${window.location.origin}/booking/payment?booking_ref=${encodeURIComponent(ref!)}`,
        });
        // Redirect to Paystack
        if (payment.authorization_url) {
          window.location.href = payment.authorization_url;
        }
      } else if (paymentMethod === "wallet") {
        await payWithWallet.mutateAsync({ booking_reference: ref! });
        toast.success( "Payment successful!");
        router.push(`/booking/confirmation?ref=${ref}`);
      } else {
        // Pay at terminal — booking stays pending
        toast.info( "Booking created. Please pay at the terminal before departure.");
        router.push(`/booking/confirmation?ref=${ref}`);
      }
    } catch (err: any) {
      toast.error( err?.response?.data?.detail || "Failed to process booking");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
    <BookingSteps />
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => router.push("/booking/passengers")} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to passenger details
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">Review & Pay</h1>

      {lockExpiresAt && (
        <div className="mb-6">
          <CountdownTimer expiresAt={lockExpiresAt} onExpired={() => { toast.error( "Seat reservation expired"); router.push("/"); }} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Trip Details</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Route</span><p className="font-medium">{selectedTrip.route?.name || "—"}</p></div>
              <div><span className="text-gray-500">Date</span><p className="font-medium">{formatDate(selectedTrip.departure_date)}</p></div>
              <div><span className="text-gray-500">Departure</span><p className="font-medium">{formatTime(selectedTrip.departure_time)}</p></div>
              <div><span className="text-gray-500">Vehicle</span><p className="font-medium">{selectedTrip.vehicle_type?.name || "Standard"}</p></div>
            </div>
          </div>

          {/* Passengers */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Passengers</h2>
            <div className="divide-y divide-gray-100">
              {passengers?.map((p: any, i: number) => (
                <div key={i} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-500">Seat {selectedSeats[i]?.seat_number || "—"}</p>
                  </div>
                  {i === 0 && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full h-fit">Primary</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Promo Code */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Promo Code</h2>
            <PromoCodeInput tripId={selectedTrip.id} amount={baseTotal} />
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Payment Method</h2>
            <PaymentMethodSelect
              selected={paymentMethod}
              onSelect={(method) => setPaymentMethod(method)}
              totalAmount={total}
            />
          </div>

          {/* Confirm Button */}
          <div className="flex items-center gap-4">
            <Button onClick={handleConfirmAndPay} loading={isProcessing} className="flex-1" size="lg">
              {paymentMethod === "card" ? `Pay ${formatCurrency(total)}` : paymentMethod === "wallet" ? `Pay from Wallet` : "Confirm Booking"}
            </Button>
          </div>
          <p className="flex items-center gap-2 text-xs text-gray-500 mt-2">
            <Shield className="h-4 w-4" /> Your payment is secured with 256-bit encryption
          </p>
        </div>

        {/* Summary Sidebar */}
        <div>
          <BookingSummary
            trip={selectedTrip}
            selectedSeats={selectedSeats}
            promoDiscount={promoDiscount}
          />
        </div>
      </div>
    </div>
    </>
  );
}
