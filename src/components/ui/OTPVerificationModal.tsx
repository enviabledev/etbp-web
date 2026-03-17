"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2, ShieldCheck } from "lucide-react";
import api from "@/lib/api";

interface OTPVerificationModalProps {
  open: boolean;
  phone: string;
  onVerified: () => void;
  onClose: () => void;
}

export default function OTPVerificationModal({
  open,
  phone,
  onVerified,
  onClose,
}: OTPVerificationModalProps) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendOTP = useCallback(async () => {
    setSending(true);
    setError("");
    try {
      await api.post("/api/v1/otp/send", { phone_number: phone });
      setSent(true);
      setCooldown(60);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to send OTP");
    } finally {
      setSending(false);
    }
  }, [phone]);

  // Send OTP when modal opens
  useEffect(() => {
    if (open && phone) {
      setDigits(["", "", "", "", "", ""]);
      setError("");
      setSent(false);
      sendOTP();
    }
  }, [open, phone, sendOTP]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    const nextEmpty = newDigits.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerify = async () => {
    const pin = digits.join("");
    if (pin.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setVerifying(true);
    setError("");
    try {
      await api.post("/api/v1/otp/verify", {
        phone_number: phone,
        pin,
      });
      onVerified();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid OTP. Please try again.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#0057FF]" />
            <h3 className="text-lg font-bold text-[#1E293B]">Verify Phone Number</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">
          {sending
            ? "Sending verification code..."
            : sent
            ? <>We sent a 6-digit code to <strong>{phone}</strong></>
            : "Preparing to send verification code..."}
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-12 text-center text-lg font-bold rounded-lg border border-gray-300 bg-gray-50 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] focus:bg-white focus:outline-none"
              disabled={verifying}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 text-center mb-4">{error}</p>
        )}

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={verifying || digits.some((d) => !d)}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0057FF] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0047D6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-3"
        >
          {verifying && <Loader2 className="h-4 w-4 animate-spin" />}
          {verifying ? "Verifying..." : "Verify"}
        </button>

        {/* Resend */}
        <p className="text-center text-sm text-gray-500">
          Didn&apos;t receive the code?{" "}
          {cooldown > 0 ? (
            <span className="text-gray-400">Resend in {cooldown}s</span>
          ) : (
            <button
              onClick={sendOTP}
              disabled={sending}
              className="font-medium text-[#0057FF] hover:underline disabled:opacity-50"
            >
              {sending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
