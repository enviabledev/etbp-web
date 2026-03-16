"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Clock, TrendingUp, Loader2 } from "lucide-react";
import { usePopularRoutes } from "@/hooks/queries/useRoutes";
import { formatCurrency, formatDuration } from "@/lib/utils";

export default function PopularRoutes() {
  const router = useRouter();
  const { data: routes, isLoading, error } = usePopularRoutes();

  const handleRouteClick = (originCode: string, destCode: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    router.push(`/search?origin=${originCode}&destination=${destCode}&date=${dateStr}`);
  };

  if (error) return null;

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1E293B] mb-3">Popular Routes</h2>
          <p className="text-gray-500 max-w-lg mx-auto">Most booked routes by our travelers</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#0057FF]" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routes?.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleRouteClick(
                  item.route.origin_terminal.code,
                  item.route.destination_terminal.code
                )}
                className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 text-left transition-all hover:border-[#0057FF]/30 hover:shadow-lg"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg font-semibold text-[#1E293B]">{item.route.origin_terminal.city}</span>
                  <ArrowRight className="h-4 w-4 text-[#0057FF] flex-shrink-0" />
                  <span className="text-lg font-semibold text-[#1E293B]">{item.route.destination_terminal.city}</span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  {item.route.estimated_duration_minutes && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatDuration(item.route.estimated_duration_minutes)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>{item.booking_count.toLocaleString()} bookings</span>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xl font-bold text-[#0057FF]">{formatCurrency(item.route.base_price)}</span>
                  <span className="text-xs font-medium text-[#0057FF] opacity-0 group-hover:opacity-100 transition-opacity">View trips &rarr;</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
