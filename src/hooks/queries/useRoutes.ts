import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { PopularRoute, Trip } from "@/types";

export function usePopularRoutes() {
  return useQuery<PopularRoute[]>({
    queryKey: ["routes", "popular"],
    queryFn: async () => {
      const response = await api.get("/api/v1/routes/popular");
      return response.data?.results ?? response.data;
    },
    staleTime: 5 * 60_000,
  });
}

export interface SearchTripsParams {
  origin: string;
  destination: string;
  date: string;
  passengers: string;
}

export function useSearchTrips(params: SearchTripsParams | null) {
  return useQuery<Trip[]>({
    queryKey: ["routes", "search", params],
    queryFn: async () => {
      if (!params) return [];
      const response = await api.get("/api/v1/routes/search", {
        params: {
          origin: params.origin,
          destination: params.destination,
          date: params.date,
          passengers: params.passengers,
        },
      });
      return response.data?.results ?? response.data;
    },
    enabled:
      !!params &&
      !!params.origin &&
      !!params.destination &&
      !!params.date,
    staleTime: 30_000,
  });
}
