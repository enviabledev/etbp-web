"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { BookingProvider } from "@/contexts/BookingContext";
import { ToastProvider } from "@/components/ui/Toast";
import { setQueryClient } from "@/lib/firebase";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          retry: 1,
          staleTime: 30 * 1000,
        },
      },
    });
    setQueryClient(qc);
    return qc;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}
      >
        <ToastProvider>
          <AuthProvider>
            <BookingProvider>{children}</BookingProvider>
          </AuthProvider>
        </ToastProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}
