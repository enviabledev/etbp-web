"use client";

export const dynamic = "force-dynamic";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/api";

type PaymentStatus = "processing" | "success" | "failed";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const bookingRef = searchParams.get("booking_ref");
  const [status, setStatus] = useState<PaymentStatus>("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const pollingRef = useRef(false);

  useEffect(() => {
    if (!reference || pollingRef.current) return;
    pollingRef.current = true;

    async function verifyPayment() {
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts) {
        try {
          const { data } = await api.get(
            `/api/v1/payments/verify/${reference}`
          );

          if (data.status === "completed" || data.status === "success" || data.status === "successful") {
            setStatus("success");
            // Navigate to confirmation after a brief pause
            const ref = bookingRef || data.booking_reference || "";
            setTimeout(() => {
              router.push(`/booking/confirmation${ref ? `?ref=${ref}` : ""}`);
            }, 1500);
            return;
          }

          if (data.status === "failed") {
            setStatus("failed");
            setErrorMessage(
              data.gateway_response || "Payment failed. Please try again."
            );
            return;
          }

          // Still processing, wait and retry
          await new Promise((resolve) => setTimeout(resolve, 3000));
          attempts++;
        } catch (err: any) {
          // If 404, payment might not be processed yet; retry
          if (err.response?.status === 404 && attempts < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
            attempts++;
            continue;
          }

          setStatus("failed");
          setErrorMessage(
            err.response?.data?.detail ||
              "Could not verify payment. Please check your booking status."
          );
          return;
        }
      }

      // Max attempts reached
      setStatus("failed");
      setErrorMessage(
        "Payment verification timed out. Please check your booking status in My Trips."
      );
    }

    verifyPayment();
  }, [reference, router]);

  // No reference
  if (!reference) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-[#DC2626] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#1E293B] mb-2">
            Invalid Payment Reference
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            No payment reference was provided. Please try booking again.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 bg-[#0057FF] text-white text-sm font-medium rounded-lg hover:bg-[#0046cc] transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full text-center">
        {status === "processing" && (
          <>
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-[#0057FF] animate-spin" />
            </div>
            <h2 className="text-lg font-bold text-[#1E293B] mb-2">
              Processing Your Payment
            </h2>
            <p className="text-sm text-gray-600">
              Please wait while we verify your payment. Do not close this page.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[#0057FF] rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-2 h-2 bg-[#0057FF] rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-2 h-2 bg-[#0057FF] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[#059669]" />
            </div>
            <h2 className="text-lg font-bold text-[#1E293B] mb-2">
              Payment Successful!
            </h2>
            <p className="text-sm text-gray-600">
              Redirecting you to your booking confirmation...
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-[#DC2626]" />
            </div>
            <h2 className="text-lg font-bold text-[#1E293B] mb-2">
              Payment Failed
            </h2>
            <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex items-center justify-center gap-3">
              <a
                href="/my-trips"
                className="px-5 py-2.5 border border-gray-300 text-sm font-medium text-[#1E293B] rounded-lg hover:bg-gray-50 transition-colors"
              >
                My Trips
              </a>
              <a
                href="/"
                className="px-5 py-2.5 bg-[#0057FF] text-white text-sm font-medium rounded-lg hover:bg-[#0046cc] transition-colors"
              >
                Try Again
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
