"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import AuthGuard from "@/components/layout/AuthGuard";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { Wallet as WalletType, WalletTransaction } from "@/types";

interface WalletData {
  wallet: WalletType;
  transactions: WalletTransaction[];
}

function TopUpModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const presets = [1000, 2000, 5000, 10000, 20000, 50000];

  async function handleTopUp() {
    const num = parseInt(amount, 10);
    if (!num || num < 100) {
      toast.error("Please enter an amount of at least 100.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/v1/payments/wallet/topup", {
        amount: num,
        callback_url: `${window.location.origin}/wallet?topup=success`,
      });
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      toast.success(
        `Top-up of ${formatCurrency(num)} initiated.`
      );
      onClose();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || "Top-up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    setAmount("");
    setAgreed(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-[#1E293B]">Top Up Wallet</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Non-refundable warning */}
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Non-Refundable</p>
              <p className="text-xs text-amber-700 mt-1">
                Wallet top-ups cannot be withdrawn or refunded to your original payment method. Funds can only be used for booking trips.
              </p>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0057FF] focus:ring-[#0057FF]"
          />
          <span className="text-sm text-gray-600">I understand that wallet top-ups are non-refundable</span>
        </label>

        {/* Amount input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
              &#8358;
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              min={100}
              className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-3 text-lg font-semibold text-[#1E293B] placeholder-gray-300 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] focus:outline-none"
            />
          </div>
        </div>

        {/* Preset amounts */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => setAmount(String(preset))}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                amount === String(preset)
                  ? "border-[#0057FF] bg-blue-50 text-[#0057FF]"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              {formatCurrency(preset)}
            </button>
          ))}
        </div>

        <button
          onClick={handleTopUp}
          disabled={loading || !amount || !agreed}
          className="w-full rounded-lg bg-[#0057FF] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0046CC] transition-colors disabled:opacity-50"
        >
          {loading ? "Processing..." : "Top Up"}
        </button>
      </div>
    </div>
  );
}

function TransactionRow({ tx }: { tx: WalletTransaction }) {
  const isCredit = tx.type === "credit";
  const Icon = isCredit ? ArrowDownLeft : ArrowUpRight;

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0">
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
          isCredit ? "bg-green-100" : "bg-red-100"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4",
            isCredit ? "text-[#059669]" : "text-[#DC2626]"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1E293B] truncate">
          {tx.description || (isCredit ? "Top Up" : "Payment")}
        </p>
        <p className="text-xs text-gray-400">
          {formatDate(tx.created_at.split("T")[0])}
        </p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "text-sm font-semibold",
            isCredit ? "text-[#059669]" : "text-[#DC2626]"
          )}
        >
          {isCredit ? "+" : "-"}
          {formatCurrency(tx.amount)}
        </p>
      </div>
    </div>
  );
}

function WalletContent() {
  const toast = useToast();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [topUpOpen, setTopUpOpen] = useState(false);

  async function fetchWallet() {
    setLoading(true);
    try {
      const [walletRes, txRes] = await Promise.allSettled([
        api.get<WalletType>("/api/v1/payments/wallet/balance"),
        api.get<WalletTransaction[]>("/api/v1/payments/wallet/transactions"),
      ]);

      const wallet =
        walletRes.status === "fulfilled"
          ? walletRes.value.data
          : {
              id: "",
              user_id: "",
              balance: 0,
              currency: "NGN",
              is_active: true,
              created_at: "",
              updated_at: "",
            };

      const transactions =
        txRes.status === "fulfilled" ? txRes.value.data : [];

      setWalletData({ wallet, transactions });
    } catch {
      toast.error("Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWallet();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0057FF]" />
      </div>
    );
  }

  const balance = walletData?.wallet.balance ?? 0;
  const currency = walletData?.wallet.currency ?? "NGN";
  const transactions = walletData?.transactions ?? [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-6">My Wallet</h1>

        {/* Balance card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#0057FF] to-[#003DC7] p-6 text-white mb-8 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-5 w-5 opacity-80" />
            <p className="text-sm opacity-80">Available Balance</p>
          </div>
          <p className="text-4xl font-bold mb-6">
            {formatCurrency(balance, currency)}
          </p>
          <button
            onClick={() => setTopUpOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-white/20 backdrop-blur-sm px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/30 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Top Up
          </button>
        </div>

        {/* Transaction history */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-[#1E293B] mb-4">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <RotateCcw className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">No transactions yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Top up your wallet to get started
              </p>
            </div>
          ) : (
            <div>
              {transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </div>
      </div>

      <TopUpModal open={topUpOpen} onClose={() => setTopUpOpen(false)} />
    </div>
  );
}

export default function WalletPage() {
  return (
    <AuthGuard>
      <WalletContent />
    </AuthGuard>
  );
}
