"use client";

import { useRouter } from "next/navigation";
import { Clock, ArrowRight, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
// Trip type from search results (TripSearchResult)

interface TripCardProps {
  trip: any;
}

function addDuration(departureTime: string, durationMinutes: number): string {
  const [hours, minutes] = departureTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const arrHours = Math.floor(totalMinutes / 60) % 24;
  const arrMinutes = totalMinutes % 60;
  return `${String(arrHours).padStart(2, "0")}:${String(arrMinutes).padStart(2, "0")}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export default function TripCard({ trip }: TripCardProps) {
  const router = useRouter();

  const departureTime = trip.departure_time?.slice(0, 5) ?? "--:--";
  const durationMinutes = trip.duration_minutes ?? 0;
  const arrivalTime = addDuration(departureTime, durationMinutes);
  const seatsLeft = trip.available_seats ?? 0;

  const handleSelect = () => {
    router.push(`/trips/${trip.id}`);
  };

  return (
    <div
      onClick={handleSelect}
      className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-4 sm:p-5 transition-all hover:border-[#0057FF]/30 hover:shadow-lg"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left — times */}
        <div className="flex items-center gap-4 sm:min-w-[200px]">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1E293B]">{departureTime}</p>
            <p className="text-xs text-gray-500 mt-0.5">{trip.origin_terminal ?? trip.origin_name}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ArrowRight className="h-4 w-4 text-gray-300" />
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3 w-3" />
              <span>{formatDuration(durationMinutes)}</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#1E293B]">{arrivalTime}</p>
            <p className="text-xs text-gray-500 mt-0.5">{trip.destination_terminal ?? trip.destination_name}</p>
          </div>
        </div>

        {/* Center — route & bus info */}
        <div className="flex-1 sm:px-4">
          <p className="text-sm font-medium text-[#1E293B] mb-2">
            {trip.route_name ?? `${trip.origin_name} → ${trip.destination_name}`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {trip.bus_type && (
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#0057FF]">
                {trip.bus_type}
              </span>
            )}
            {trip.amenities?.map((amenity: string) => (
              <span
                key={amenity}
                className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
              >
                {amenity}
              </span>
            ))}
          </div>
          {seatsLeft > 0 && seatsLeft < 5 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="font-medium">
                Only {seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} left
              </span>
            </div>
          )}
        </div>

        {/* Right — price & button */}
        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center sm:min-w-[140px]">
          <p className="text-2xl font-bold text-[#1E293B]">
            {formatCurrency(trip.price)}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSelect();
            }}
            className="rounded-lg bg-[#0057FF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0047D6] transition-colors"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
