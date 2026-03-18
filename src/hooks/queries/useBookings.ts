import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Booking,
  BookingDetail,
  BookingStatus,
  PaginatedResponse,
} from "@/types";

// ── Types ───────────────────────────────────────────────────

interface CreateBookingPayload {
  trip_id: string;
  passengers: {
    seat_id: string;
    first_name: string;
    last_name: string;
    gender?: string;
    phone?: string;
    is_primary: boolean;
  }[];
  contact_email?: string;
  contact_phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  special_requests?: string;
  promo_code?: string;
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
  method: string;
  callback_url?: string;
}

interface InitiatePaymentResponse {
  payment_id: string;
  authorization_url: string;
  reference: string;
}

interface PayWithWalletPayload {
  booking_reference: string;
}

interface PayWithWalletResponse {
  booking_reference: string;
  amount_paid: number;
  wallet_balance: number;
  booking_status: string;
}

// ── Queries ─────────────────────────────────────────────────

export function useMyBookings(params?: { status?: BookingStatus; upcoming?: boolean }) {
  return useQuery<PaginatedResponse<Booking>>({
    queryKey: ["bookings", "mine", params],
    queryFn: async () => {
      const queryParams: Record<string, string> = {};
      if (params?.status) queryParams.status = params.status;
      if (params?.upcoming !== undefined) queryParams.upcoming = String(params.upcoming);
      const { data } = await api.get("/api/v1/bookings", { params: queryParams });
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

  return useMutation<Booking, Error, { ref: string; reason?: string }>({
    mutationFn: async ({ ref, reason }) => {
      const { data } = await api.put(`/api/v1/bookings/${ref}/cancel`, {
        reason: reason || null,
      });
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

// ── Reschedule / Transfer / Luggage ─────────────────────────

export function useRescheduleOptions(ref: string, enabled = false) {
  return useQuery({
    queryKey: ["reschedule-options", ref],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/bookings/${ref}/reschedule-options`);
      return data;
    },
    enabled,
  });
}

export function useRescheduleBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ref, ...body }: { ref: string; new_trip_id: string; new_seat_ids: string[] }) => {
      const { data } = await api.put(`/api/v1/bookings/${ref}/reschedule`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useTransferBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ref, ...body }: { ref: string; recipient_phone: string; recipient_name: string; recipient_email?: string }) => {
      const { data } = await api.post(`/api/v1/bookings/${ref}/transfer`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useAddLuggage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ref, ...body }: { ref: string; quantity: number; payment_method: string }) => {
      const { data } = await api.post(`/api/v1/bookings/${ref}/add-luggage`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

// ── Reviews ─────────────────────────────────────────────────

export function useBookingReview(ref: string) {
  return useQuery({
    queryKey: ["booking-review", ref],
    queryFn: async () => {
      const { data } = await api.get(`/api/v1/reviews/booking/${ref}`);
      return data;
    },
    enabled: !!ref,
    retry: false,
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ref, ...body }: { ref: string; overall_rating: number; driver_rating?: number; bus_condition_rating?: number; punctuality_rating?: number; comfort_rating?: number; comment?: string; is_anonymous?: boolean }) => {
      const { data } = await api.post(`/api/v1/reviews/booking/${ref}`, body);
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["booking-review", vars.ref] });
      qc.invalidateQueries({ queryKey: ["booking-detail"] });
    },
  });
}
