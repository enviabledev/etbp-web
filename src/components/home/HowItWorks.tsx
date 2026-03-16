import { Search, Ticket, Bus } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search",
    description: "Find your route",
    detail: "Enter your origin, destination, and travel date to discover available trips.",
  },
  {
    icon: Ticket,
    title: "Book",
    description: "Choose seats & pay",
    detail: "Select your preferred seats and complete payment securely online.",
  },
  {
    icon: Bus,
    title: "Travel",
    description: "Board & enjoy your trip",
    detail: "Show your e-ticket at the terminal, board your bus, and enjoy the ride.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-[#F8FAFC] py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-3">
            How It Works
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Book your next trip in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              {/* Connector line — between cards on desktop */}
              {index < steps.length - 1 && (
                <div className="hidden sm:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-80px)] h-[2px] bg-gray-200" />
              )}

              {/* Icon circle */}
              <div className="relative z-10 mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0057FF]/10">
                <step.icon className="h-8 w-8 text-[#0057FF]" />
              </div>

              {/* Step number badge */}
              <div className="absolute top-0 right-[calc(50%-48px)] flex h-6 w-6 items-center justify-center rounded-full bg-[#0057FF] text-xs font-bold text-white">
                {index + 1}
              </div>

              <h3 className="text-lg font-semibold text-[#1E293B] mb-1">{step.title}</h3>
              <p className="text-sm font-medium text-[#0057FF] mb-2">{step.description}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
