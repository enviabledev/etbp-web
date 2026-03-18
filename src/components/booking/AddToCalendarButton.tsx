"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarPlus, ChevronDown } from "lucide-react";
import api from "@/lib/api";

interface AddToCalendarProps {
  bookingRef: string;
  tripDate?: string;
  tripTime?: string;
  routeName?: string;
  durationMinutes?: number;
}

export default function AddToCalendarButton({
  bookingRef, tripDate, tripTime, routeName, durationMinutes,
}: AddToCalendarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const getDateTimes = () => {
    if (!tripDate || !tripTime) return { start: "", end: "", startIso: "", endIso: "" };
    const startDt = new Date(`${tripDate}T${tripTime}`);
    const dur = durationMinutes || 480;
    const endDt = new Date(startDt.getTime() + dur * 60000);
    const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return { start: fmt(startDt), end: fmt(endDt), startIso: startDt.toISOString(), endIso: endDt.toISOString() };
  };

  const { start, end, startIso, endIso } = getDateTimes();
  const title = `Bus Trip: ${routeName || "Trip"}`;
  const details = `Booking Ref: ${bookingRef}`;

  const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(startIso)}&enddt=${encodeURIComponent(endIso)}&body=${encodeURIComponent(details)}`;

  const downloadIcs = async () => {
    try {
      const response = await api.get(`/api/v1/bookings/${bookingRef}/calendar`, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/calendar" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `trip-${bookingRef}.ics`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // fallback
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <CalendarPlus className="h-4 w-4" /> Add to Calendar <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Google Calendar</a>
          <button onClick={downloadIcs} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
            Download .ics (Apple/Outlook)
          </button>
          <a href={outlookUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Outlook.com</a>
        </div>
      )}
    </div>
  );
}
