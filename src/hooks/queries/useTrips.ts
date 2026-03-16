import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Seat } from "@/types";

export function useTripSeats(tripId: string | undefined) {
  return useQuery<Seat[]>({
    queryKey: ["trips", tripId, "seats"],
    queryFn: async () => {
      const response = await api.get(`/api/v1/trips/${tripId}/seats`);
      return response.data?.seats ?? response.data;
    },
    enabled: !!tripId,
    staleTime: 15_000,
  });
}

export interface LockSeatsPayload {
  tripId: string;
  seat_ids: string[];
}

export function useLockSeats() {
  return useMutation<any, Error, LockSeatsPayload>({
    mutationFn: async ({ tripId, seat_ids }) => {
      const response = await api.post(
        `/api/v1/trips/${tripId}/seats/lock`,
        { seat_ids }
      );
      return response.data;
    },
  });
}
