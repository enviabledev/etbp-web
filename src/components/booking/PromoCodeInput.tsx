"use client";

import React, { useState } from "react";
import { useApplyPromo } from "@/hooks/queries/useBookings";
import { useBooking } from "@/contexts/BookingContext";
import { formatCurrency } from "@/lib/utils";
import { Tag, Loader2, X } from "lucide-react";

interface PromoCodeInputProps {
  tripId: string;
  amount: number;
}

export default function PromoCodeInput({
  tripId,
  amount,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const { promoCode, promoDiscount, setPromo } = useBooking();
  const applyPromo = useApplyPromo();

  const handleApply = async () => {
    if (!code.trim()) return;

    try {
      const result = await applyPromo.mutateAsync({
        code: code.trim().toUpperCase(),
        trip_id: tripId,
        amount,
      });
      if (result.valid) {
        setPromo(code.trim().toUpperCase(), result.discount);
      } else {
        // Show the reason via the error display below
        applyPromo.reset();
        throw new Error(result.reason || "Promo code is not valid");
      }
    } catch {
      // Error is handled via applyPromo.error
    }
  };

  const handleRemove = () => {
    setCode("");
    setPromo("", 0);
    applyPromo.reset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  // Already applied
  if (promoCode && promoDiscount > 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#059669]" />
            <span className="text-sm font-medium text-[#059669]">
              Promo code &quot;{promoCode}&quot; applied!
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 hover:bg-green-100 rounded transition-colors"
            aria-label="Remove promo code"
          >
            <X className="w-4 h-4 text-[#059669]" />
          </button>
        </div>
        <p className="text-sm text-[#059669] mt-1 ml-6">
          You save {formatCurrency(promoDiscount)}
        </p>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-[#1E293B] mb-2">
        Promo Code
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            placeholder="Enter promo code"
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm text-[#1E293B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0057FF] focus:border-transparent transition-all"
          />
        </div>
        <button
          onClick={handleApply}
          disabled={!code.trim() || applyPromo.isPending}
          className="px-5 py-2.5 bg-[#1E293B] text-white text-sm font-medium rounded-lg hover:bg-[#334155] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {applyPromo.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Apply"
          )}
        </button>
      </div>

      {applyPromo.isError && (
        <p className="text-sm text-[#DC2626] mt-2">
          {(applyPromo.error as any)?.response?.data?.detail ||
            (applyPromo.error as any)?.message ||
            "Invalid promo code. Please try again."}
        </p>
      )}
    </div>
  );
}
