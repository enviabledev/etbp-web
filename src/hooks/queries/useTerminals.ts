import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { Terminal } from "@/types";
import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function useTerminalSearch(search: string) {
  const debouncedSearch = useDebounce(search, 300);

  return useQuery<Terminal[]>({
    queryKey: ["terminals", "search", debouncedSearch],
    queryFn: async () => {
      const response = await api.get("/api/v1/terminals", {
        params: { search: debouncedSearch },
      });
      return response.data?.results ?? response.data;
    },
    enabled: debouncedSearch.length > 0,
    staleTime: 60_000,
  });
}
