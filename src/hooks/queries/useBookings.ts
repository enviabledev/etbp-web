import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Booking,
  BookingDetail,
  BookingStatus,
  PaginatedResponse,
  Payment,
} from "@/types";

// ── Types ───────────────────────────────────────────────────

interface CreateBookingPayload {
  trip_id: string;
  seat_ids: string[];
  passengers: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    seat_id: string;
  }[];
  contact_email: string;
  contact_phone: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  payment_method: string;
}

interface ApplyPromoPayload {
  booking_reference: string;
  promo_code: string;
}

interface ApplyPromoResponse {
  discount: number;
  message: string;
}

interface InitiatePaymentPayload {
  booking_reference: string;
  payment_method: string;
  callback_url: string;
}

interface InitiatePaymentResponse {
  authorization_url: string;
  reference: string;
  access_code: string;
}

interface PayWithWalletPayload {
  booking_reference: string;
}

interface PayWithWalletResponse {
  payment: Payment;
  message: string;
}

// ── Queries ─────────────────────────────────────────────────

export function useMyBookings(status?: BookingStatus) {
  return useQuery<PaginatedResponse<Booking>>({
    queryKey: ["bookings", "mine", status],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      const { data } = await api.get("/api/v1/bookings", { params });
      return data;
    },
  });
}

export function useBookingDetail(ref: string | null) {
  return useQuery<BookingDetail>({
    queryKey: ["bookings", "detail", ref],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/bookings/${ref}`);
      return data;
    },
    enabled: !!ref,
  });
}

// ── Mutations ───────────────────────────────────────────────

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation<BookingDetail, Error, CreateBookingPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/api/v1/bookings", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation<Booking, Error, string>({
    mutationFn: async (ref) => {
      const { data } = await api.put(`/api/v1/bookings/${ref}/cancel`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

export function useApplyPromo() {
  return useMutation<ApplyPromoResponse, Error, ApplyPromoPayload>({
    mutationFn: async ({ booking_reference, promo_code }) => {
      const { data } = await api.post(
        `/api/v1/bookings/${booking_reference}/apply-promo`,
        { promo_code }
      );
      return data;
    },
  });
}

export function useInitiatePayment() {
  return useMutation<InitiatePaymentResponse, Error, InitiatePaymentPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post("/api/v1/payments/initiate", payload);
      return data;
    },
  });
}

export function usePayWithWallet() {
  const queryClient = useQueryClient();

  return useMutation<PayWithWalletResponse, Error, PayWithWalletPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post(
        "/api/v1/payments/pay-with-wallet",
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
  });
}
