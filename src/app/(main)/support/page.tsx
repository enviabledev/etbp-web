"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  HelpCircle,
  Send,
  MessageSquare,
  Loader2,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/Toast";

// ── FAQ Data ─────────────────────────────────────────────────

const FAQ_ITEMS = [
  {
    category: "Booking",
    questions: [
      {
        q: "How do I book a trip?",
        a: "Search for your desired route on the homepage, select a trip, choose your seats, fill in passenger details, and proceed to payment. You will receive a confirmation email with your e-ticket.",
      },
      {
        q: "Can I book for multiple passengers?",
        a: "Yes! During the booking process, you can add multiple passengers and select individual seats for each one.",
      },
      {
        q: "How early should I arrive at the terminal?",
        a: "We recommend arriving at least 30 minutes before your scheduled departure time to allow for check-in and boarding.",
      },
    ],
  },
  {
    category: "Cancellation & Refunds",
    questions: [
      {
        q: "What is the cancellation policy?",
        a: "Cancellations made more than 24 hours before departure receive a 90% refund. Cancellations between 12-24 hours before departure receive a 50% refund. No refund is available for cancellations less than 12 hours before departure.",
      },
      {
        q: "How long does a refund take?",
        a: "Refunds to your wallet are processed instantly. Refunds to your bank account or card may take 3-5 business days depending on your bank.",
      },
    ],
  },
  {
    category: "Payment",
    questions: [
      {
        q: "What payment methods are accepted?",
        a: "We accept card payments (Visa, Mastercard), bank transfers, and wallet payments. You can top up your ETBP wallet at any time.",
      },
      {
        q: "Is my payment information secure?",
        a: "Absolutely. We use Paystack for payment processing, which is PCI DSS compliant. We never store your card details on our servers.",
      },
    ],
  },
  {
    category: "Luggage",
    questions: [
      {
        q: "How much luggage can I bring?",
        a: "Each passenger is allowed one piece of luggage (up to 23kg) and one carry-on bag. Additional luggage may incur extra charges at the terminal.",
      },
      {
        q: "Are there restricted items?",
        a: "Yes. Flammable materials, firearms, explosives, and other hazardous items are strictly prohibited. Please contact support if you have questions about specific items.",
      },
    ],
  },
];

// ── Components ───────────────────────────────────────────────

function AccordionItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="text-sm font-medium text-[#1E293B] pr-4">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 shrink-0 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <div className="pb-4 pr-8">
          <p className="text-sm text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function SupportPage() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!category || !subject.trim() || !description.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/v1/support", {
        category,
        subject: subject.trim(),
        description: description.trim(),
      });
      toast.success(
        "Support ticket submitted successfully. We will get back to you shortly."
      );
      setCategory("");
      setSubject("");
      setDescription("");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          "Failed to submit ticket. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-[#1E293B] placeholder-gray-400 focus:border-[#0057FF] focus:ring-1 focus:ring-[#0057FF] focus:outline-none transition-colors";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-[#0057FF] flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1E293B]">
              Help & Support
            </h1>
            <p className="text-sm text-gray-500">
              Find answers or submit a support ticket
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-[#1E293B] mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((section) => (
              <div
                key={section.category}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden"
              >
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-[#1E293B]">
                    {section.category}
                  </p>
                </div>
                <div className="px-5">
                  {section.questions.map((item, idx) => (
                    <AccordionItem
                      key={idx}
                      question={item.q}
                      answer={item.a}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Ticket */}
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5 text-[#0057FF]" />
            <h2 className="text-lg font-semibold text-[#1E293B]">
              Submit a Ticket
            </h2>
          </div>

          {!isAuthenticated ? (
            <div className="text-center py-8">
              <LogIn className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-4">Please log in to submit a support ticket.</p>
              <Link href="/login?redirect=/support" className="text-sm font-medium text-[#0057FF] hover:underline">
                Log in
              </Link>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">Select a category</option>
                <option value="booking">Booking</option>
                <option value="payment">Payment</option>
                <option value="vehicle">Vehicle</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                placeholder="Brief summary of your issue"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                placeholder="Please describe your issue in detail..."
                className={cn(inputClass, "resize-none")}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0057FF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0046CC] transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
