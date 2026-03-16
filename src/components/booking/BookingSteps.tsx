"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

const steps = [
  { label: "Seats", path: "/trips/" },
  { label: "Passengers", path: "/booking/passengers" },
  { label: "Review", path: "/booking/review" },
  { label: "Confirmation", path: "/booking/confirmation" },
];

export default function BookingSteps() {
  const pathname = usePathname();

  const currentIndex = steps.findIndex((s) => pathname.startsWith(s.path));

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => {
            const isCompleted = i < currentIndex;
            const isCurrent = i === currentIndex;

            return (
              <div key={step.label} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isCompleted
                        ? "bg-[#0057FF] text-white"
                        : isCurrent
                        ? "bg-[#0057FF] text-white ring-2 ring-[#0057FF]/30"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {isCompleted ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`text-sm font-medium hidden sm:inline ${
                      isCurrent
                        ? "text-[#0057FF]"
                        : isCompleted
                        ? "text-[#1E293B]"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-3 h-px w-8 sm:w-16 ${
                      i < currentIndex ? "bg-[#0057FF]" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
