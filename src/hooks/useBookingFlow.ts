import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/contexts/BookingContext";
import type { Seat, TripSearchResult } from "@/types";
import type { PassengerInfo } from "@/contexts/BookingContext";

/**
 * Convenience hook wrapping BookingContext for the multi-step booking flow.
 * Provides high-level actions that combine context updates with navigation.
 */
export function useBookingFlow() {
  const router = useRouter();
  const booking = useBooking();

  const {
    selectedTrip,
    selectedSeats,
    passengers,
    contactInfo,
    lockExpiresAt,
    promoCode,
    promoDiscount,
    paymentMethod,
    bookingReference,
    setTrip,
    addSeat,
    removeSeat,
    clearSeats,
    setPassengers,
    setContactInfo,
    setPromo,
    setPaymentMethod,
    setBookingRef,
    setLockExpiry,
    reset,
  } = booking;

  /** Toggle a seat selection (add if not selected, remove if already selected) */
  const toggleSeat = useCallback(
    (seat: Seat) => {
      const isSelected = selectedSeats.some((s) => s.id === seat.id);
      if (isSelected) {
        removeSeat(seat.id);
      } else {
        addSeat(seat);
      }
    },
    [selectedSeats, addSeat, removeSeat]
  );

  /** Start booking flow: set trip and seats, then navigate to passengers page */
  const startBooking = useCallback(
    (trip: TripSearchResult, seats: Seat[], lockExpiry: string) => {
      setTrip(trip);
      seats.forEach((s) => addSeat(s));
      setLockExpiry(lockExpiry);
      router.push("/booking/passengers");
    },
    [setTrip, addSeat, setLockExpiry, router]
  );

  /** Save passenger info and navigate to review */
  const savePassengersAndContinue = useCallback(
    (
      passengerList: PassengerInfo[],
      contact: { email: string; phone: string }
    ) => {
      setPassengers(passengerList);
      setContactInfo(contact);
      router.push("/booking/review");
    },
    [setPassengers, setContactInfo, router]
  );

  /** Navigate to confirmation after successful payment */
  const goToConfirmation = useCallback(
    (ref?: string) => {
      if (ref) {
        setBookingRef(ref);
      }
      router.push("/booking/confirmation");
    },
    [setBookingRef, router]
  );

  /** Total amount accounting for seat price modifiers and promo discount */
  const totalAmount = useMemo(() => {
    if (!selectedTrip) return 0;
    const baseTotal = selectedSeats.reduce(
      (sum, seat) => sum + selectedTrip.price * (1 + seat.price_modifier),
      0
    );
    return Math.max(0, baseTotal - promoDiscount);
  }, [selectedTrip, selectedSeats, promoDiscount]);

  /** Base total before promo discount */
  const subtotal = useMemo(() => {
    if (!selectedTrip) return 0;
    return selectedSeats.reduce(
      (sum, seat) => sum + selectedTrip.price * (1 + seat.price_modifier),
      0
    );
  }, [selectedTrip, selectedSeats]);

  /** Whether the booking flow has valid data to proceed */
  const hasValidSelection = selectedTrip !== null && selectedSeats.length > 0;
  const hasValidPassengers =
    passengers.length === selectedSeats.length &&
    passengers.every((p) => p.first_name && p.last_name);
  const hasValidContact = contactInfo !== null;
  const isReadyToBook =
    hasValidSelection && hasValidPassengers && hasValidContact;

  return {
    // State
    selectedTrip,
    selectedSeats,
    passengers,
    contactInfo,
    lockExpiresAt,
    promoCode,
    promoDiscount,
    paymentMethod,
    bookingReference,
    totalAmount,
    subtotal,

    // Computed
    hasValidSelection,
    hasValidPassengers,
    hasValidContact,
    isReadyToBook,

    // Actions
    setTrip,
    toggleSeat,
    addSeat,
    removeSeat,
    clearSeats,
    setPassengers,
    setContactInfo,
    setPromo,
    setPaymentMethod,
    setBookingRef,
    setLockExpiry,
    reset,

    // Flow navigation
    startBooking,
    savePassengersAndContinue,
    goToConfirmation,
  };
}
