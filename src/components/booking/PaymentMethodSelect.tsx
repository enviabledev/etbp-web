"use client";

import React from "react";
import { useWallet } from "@/hooks/queries/useWallet";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Wallet, Building2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodSelectProps {
  selected: string | null;
  onSelect: (method: "card" | "wallet" | "terminal" | "corporate") => void;
  totalAmount: number;
  corporateAccount?: { company_name: string; available_credit: number } | null;
}

export default function PaymentMethodSelect({
  selected,
  onSelect,
  totalAmount,
  corporateAccount,
}: PaymentMethodSelectProps) {
  const { data: wallet, isLoading: walletLoading } = useWallet();

  const walletBalance = wallet?.balance ?? 0;
  const insufficientBalance = walletBalance < totalAmount;

  const methods = [
    {
      id: "card" as const,
      label: "Pay with Card",
      description: "Secure payment via Paystack",
      icon: CreditCard,
      disabled: false,
      extra: null,
    },
    {
      id: "wallet" as const,
      label: "Pay with Wallet",
      description: walletLoading
        ? "Loading balance..."
        : insufficientBalance
        ? `Insufficient balance (${formatCurrency(walletBalance)})`
        : `Balance: ${formatCurrency(walletBalance)}`,
      icon: Wallet,
      disabled: walletLoading || insufficientBalance,
      extra: insufficientBalance && !walletLoading ? (
        <span className="text-xs text-[#D97706]">Top up required</span>
      ) : null,
    },
    {
      id: "terminal" as const,
      label: "Pay at Terminal",
      description: "Pay cash when you arrive",
      icon: Building2,
      disabled: false,
      extra: null,
    },
    ...(corporateAccount ? [{
      id: "corporate" as const,
      label: "Bill to Company",
      description: corporateAccount.available_credit >= totalAmount
        ? `${corporateAccount.company_name} — ${formatCurrency(corporateAccount.available_credit)} available`
        : `Insufficient corporate credit (${formatCurrency(corporateAccount.available_credit)})`,
      icon: Building2,
      disabled: corporateAccount.available_credit < totalAmount,
      extra: null,
    }] : []),
  ];

  return (
    <div>
      <label className="block text-sm font-medium text-[#1E293B] mb-3">
        Payment Method
      </label>
      <div className="space-y-3">
        {methods.map((method) => {
          const isSelected = selected === method.id;
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => !method.disabled && onSelect(method.id)}
              disabled={method.disabled}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left",
                isSelected
                  ? "border-[#0057FF] bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300",
                method.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Radio indicator */}
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
                  isSelected ? "border-[#0057FF]" : "border-gray-300"
                )}
              >
                {isSelected && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0057FF]" />
                )}
              </div>

              {/* Icon */}
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-[#0057FF] text-white" : "bg-gray-100 text-gray-500"
                )}
              >
                {walletLoading && method.id === "wallet" ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              {/* Label & Description */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isSelected ? "text-[#0057FF]" : "text-[#1E293B]"
                  )}
                >
                  {method.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {method.description}
                </p>
                {method.extra}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
