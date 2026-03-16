import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Wallet } from "@/types";

export function useWallet() {
  return useQuery<Wallet>({
    queryKey: ["wallet", "balance"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/payments/wallet/balance");
      return data;
    },
    staleTime: 30 * 1000,
    retry: false,
  });
}
