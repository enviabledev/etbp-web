"use client";

import { useState } from "react";
import { Download, Ticket } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { formatDate, formatTime } from "@/lib/utils";
import api from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import type { BookingDetail } from "@/types";

interface ETicketProps {
  booking: BookingDetail;
}

export default function ETicket({ booking }: ETicketProps) {
  const toast = useToast();
  const [downloading, setDownloading] = useState(false);

  const booking_reference = booking.booking_reference || booking.reference;
  const { trip, passengers } = booking;
  const origin = trip?.route?.origin_terminal;
  const destination = trip?.route?.destination_terminal;

  // Placeholder QR data text
  const qrCodeData = `ETBP-${booking_reference}`;

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      const response = await api.get(
        `/api/v1/bookings/${booking_reference}/ticket`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ETBP-Ticket-${booking_reference}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Ticket downloaded successfully.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail || "Failed to download ticket. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Blue header bar */}
      <div className="bg-[#0057FF] px-6 py-4 flex items-center gap-3">
        <Ticket className="h-6 w-6 text-white" />
        <h3 className="text-lg font-bold text-white">E-Ticket</h3>
      </div>

      <div className="p-6">
        {/* Booking reference */}
        <div className="text-center mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            Booking Reference
          </p>
          <p className="text-3xl font-bold font-mono text-[#1E293B] tracking-widest">
            {booking_reference}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <QRCodeSVG value={qrCodeData} size={160} />
          </div>
        </div>

        {/* Passenger details */}
        <div className="space-y-4">
          {passengers.map((passenger, index) => (
            <div
              key={passenger.id}
              className="rounded-lg border border-gray-100 bg-gray-50 p-4"
            >
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                Passenger {index + 1}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-semibold text-[#1E293B]">
                    {passenger.first_name} {passenger.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Seat</p>
                  <p className="font-semibold text-[#1E293B]">
                    {passenger.seat_number}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Route and time info */}
        <div className="mt-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">From</p>
              <p className="font-semibold text-[#1E293B]">{origin?.city || "—"}</p>
              <p className="text-xs text-gray-400">{origin?.name || ""}</p>
            </div>
            <div>
              <p className="text-gray-500">To</p>
              <p className="font-semibold text-[#1E293B]">{destination?.city || "—"}</p>
              <p className="text-xs text-gray-400">{destination?.name || ""}</p>
            </div>
            <div>
              <p className="text-gray-500">Date</p>
              <p className="font-semibold text-[#1E293B]">
                {trip ? formatDate(trip.departure_date) : "—"}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Time</p>
              <p className="font-semibold text-[#1E293B]">
                {trip ? formatTime(trip.departure_time) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg border-2 border-[#0057FF] px-4 py-3 text-sm font-semibold text-[#0057FF] hover:bg-[#0057FF] hover:text-white transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {downloading ? "Downloading..." : "Download PDF"}
        </button>
      </div>
    </div>
  );
}
