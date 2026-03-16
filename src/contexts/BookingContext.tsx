"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { TripSearchResult, Seat } from "@/types";

// ── State shape ──────────────────────────────────────────────

export interface PassengerInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  seat_number: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
}

interface BookingState {
  selectedTrip: TripSearchResult | null;
  selectedSeats: Seat[];
  passengers: PassengerInfo[];
  contactInfo: ContactInfo | null;
  promoCode: string | null;
  promoDiscount: number;
  paymentMethod: string | null;
  bookingReference: string | null;
  lockExpiresAt: string | null;
}

const INITIAL_STATE: BookingState = {
  selectedTrip: null,
  selectedSeats: [],
  passengers: [],
  contactInfo: null,
  promoCode: null,
  promoDiscount: 0,
  paymentMethod: null,
  bookingReference: null,
  lockExpiresAt: null,
};

// ── Actions ──────────────────────────────────────────────────

type BookingAction =
  | { type: "SET_TRIP"; payload: TripSearchResult }
  | { type: "ADD_SEAT"; payload: Seat }
  | { type: "REMOVE_SEAT"; payload: string } // seat id
  | { type: "CLEAR_SEATS" }
  | { type: "SET_PASSENGERS"; payload: PassengerInfo[] }
  | { type: "SET_CONTACT_INFO"; payload: ContactInfo }
  | { type: "SET_PROMO"; payload: { code: string; discount: number } }
  | { type: "SET_PAYMENT_METHOD"; payload: string }
  | { type: "SET_BOOKING_REF"; payload: string }
  | { type: "SET_LOCK_EXPIRY"; payload: string }
  | { type: "RESET" }
  | { type: "HYDRATE"; payload: BookingState };

function bookingReducer(
  state: BookingState,
  action: BookingAction
): BookingState {
  switch (action.type) {
    case "SET_TRIP":
      return { ...INITIAL_STATE, selectedTrip: action.payload };
    case "ADD_SEAT":
      if (state.selectedSeats.some((s) => s.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        selectedSeats: [...state.selectedSeats, action.payload],
      };
    case "REMOVE_SEAT":
      return {
        ...state,
        selectedSeats: state.selectedSeats.filter(
          (s) => s.id !== action.payload
        ),
      };
    case "CLEAR_SEATS":
      return { ...state, selectedSeats: [], passengers: [] };
    case "SET_PASSENGERS":
      return { ...state, passengers: action.payload };
    case "SET_CONTACT_INFO":
      return { ...state, contactInfo: action.payload };
    case "SET_PROMO":
      return {
        ...state,
        promoCode: action.payload.code,
        promoDiscount: action.payload.discount,
      };
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.payload };
    case "SET_BOOKING_REF":
      return { ...state, bookingReference: action.payload };
    case "SET_LOCK_EXPIRY":
      return { ...state, lockExpiresAt: action.payload };
    case "RESET":
      return INITIAL_STATE;
    case "HYDRATE":
      return action.payload;
    default:
      return state;
  }
}

// ── Context value ────────────────────────────────────────────

interface BookingContextValue extends BookingState {
  setTrip: (trip: TripSearchResult) => void;
  addSeat: (seat: Seat) => void;
  removeSeat: (seatId: string) => void;
  clearSeats: () => void;
  setPassengers: (passengers: PassengerInfo[]) => void;
  setContactInfo: (info: ContactInfo) => void;
  setPromo: (code: string, discount: number) => void;
  setPaymentMethod: (method: string) => void;
  setBookingRef: (ref: string) => void;
  setLockExpiry: (expiry: string) => void;
  reset: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

const STORAGE_KEY = "etbp_booking_state";

// ── Provider ─────────────────────────────────────────────────

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, INITIAL_STATE);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: BookingState = JSON.parse(stored);
        dispatch({ type: "HYDRATE", payload: parsed });
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Persist to sessionStorage on every state change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  const setTrip = useCallback(
    (trip: TripSearchResult) => dispatch({ type: "SET_TRIP", payload: trip }),
    []
  );
  const addSeat = useCallback(
    (seat: Seat) => dispatch({ type: "ADD_SEAT", payload: seat }),
    []
  );
  const removeSeat = useCallback(
    (seatId: string) => dispatch({ type: "REMOVE_SEAT", payload: seatId }),
    []
  );
  const clearSeats = useCallback(
    () => dispatch({ type: "CLEAR_SEATS" }),
    []
  );
  const setPassengers = useCallback(
    (passengers: PassengerInfo[]) =>
      dispatch({ type: "SET_PASSENGERS", payload: passengers }),
    []
  );
  const setContactInfo = useCallback(
    (info: ContactInfo) =>
      dispatch({ type: "SET_CONTACT_INFO", payload: info }),
    []
  );
  const setPromo = useCallback(
    (code: string, discount: number) =>
      dispatch({ type: "SET_PROMO", payload: { code, discount } }),
    []
  );
  const setPaymentMethod = useCallback(
    (method: string) =>
      dispatch({ type: "SET_PAYMENT_METHOD", payload: method }),
    []
  );
  const setBookingRef = useCallback(
    (ref: string) => dispatch({ type: "SET_BOOKING_REF", payload: ref }),
    []
  );
  const setLockExpiry = useCallback(
    (expiry: string) =>
      dispatch({ type: "SET_LOCK_EXPIRY", payload: expiry }),
    []
  );
  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const value = useMemo<BookingContextValue>(
    () => ({
      ...state,
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
    }),
    [
      state,
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
    ]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return ctx;
}
