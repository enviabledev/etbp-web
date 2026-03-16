"use client";

export const dynamic = "force-dynamic";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/contexts/BookingContext";
import { useAuth } from "@/contexts/AuthContext";
import PassengerForm from "@/components/booking/PassengerForm";
import CountdownTimer from "@/components/booking/CountdownTimer";
import { ArrowLeft, ArrowRight, Users, Phone, Mail, AlertCircle } from "lucide-react";

interface PassengerFormData {
  first_name: string;
  last_name: string;
  gender: "male" | "female" | "other";
  phone: string;
}

export default function PassengersPage() {
  const router = useRouter();
  const {
    selectedTrip,
    selectedSeats,
    lockExpiresAt,
    passengers: savedPassengers,
    contactInfo: savedContact,
    setPassengers,
    setContactInfo,
  } = useBooking();
  const { user } = useAuth();

  // Redirect if no booking data
  useEffect(() => {
    if (!selectedTrip || selectedSeats.length === 0) {
      router.push("/");
    }
  }, [selectedTrip, selectedSeats, router]);

  // Passenger data state
  const [passengerData, setPassengerData] = useState<
    Record<number, PassengerFormData>
  >(() => {
    const initial: Record<number, PassengerFormData> = {};
    savedPassengers.forEach((p, i) => {
      initial[i] = {
        first_name: p.first_name,
        last_name: p.last_name,
        gender: "male",
        phone: p.phone,
      };
    });
    return initial;
  });

  // Contact fields
  const [contactEmail, setContactEmail] = useState(
    savedContact?.email || user?.email || ""
  );
  const [contactPhone, setContactPhone] = useState(
    savedContact?.phone || user?.phone || ""
  );
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  const [validationError, setValidationError] = useState<string | null>(null);

  const handlePassengerChange = useCallback(
    (index: number, data: PassengerFormData) => {
      setPassengerData((prev) => ({ ...prev, [index]: data }));
    },
    []
  );

  const handleContinue = () => {
    setValidationError(null);

    // Validate all passengers
    for (let i = 0; i < selectedSeats.length; i++) {
      const pd = passengerData[i];
      if (!pd?.first_name || !pd?.last_name) {
        setValidationError(
          `Please fill in the required fields for Passenger ${i + 1}`
        );
        return;
      }
    }

    // Validate contact info
    if (!contactEmail.trim()) {
      setValidationError("Contact email is required");
      return;
    }
    if (!contactPhone.trim()) {
      setValidationError("Contact phone is required");
      return;
    }

    // Save to context
    const passengerList = selectedSeats.map((seat, i) => ({
      first_name: passengerData[i]?.first_name || "",
      last_name: passengerData[i]?.last_name || "",
      email: contactEmail,
      phone: passengerData[i]?.phone || contactPhone,
      seat_number: seat.seat_number,
    }));

    setPassengers(passengerList);
    setContactInfo({ email: contactEmail, phone: contactPhone });

    router.push("/booking/review");
  };

  const handleExpired = () => {
    // CountdownTimer shows its own modal; no extra action needed
  };

  if (!selectedTrip || selectedSeats.length === 0) {
    return null;
  }

  const inputClasses =
    "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-[#1E293B] " +
    "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0057FF] focus:border-transparent " +
    "transition-all duration-150";

  const labelClasses = "block text-sm font-medium text-[#1E293B] mb-1";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-[#1E293B]" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#1E293B]">
                Passenger Details
              </h1>
              <p className="text-sm text-gray-500">
                Step 2 of 4 - Enter passenger information
              </p>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        {lockExpiresAt && (
          <div className="mb-6">
            <CountdownTimer
              expiresAt={lockExpiresAt}
              onExpired={handleExpired}
            />
          </div>
        )}

        {/* Passenger Forms */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-[#0057FF]" />
            <h2 className="text-base font-semibold text-[#1E293B]">
              Passengers ({selectedSeats.length})
            </h2>
          </div>

          {selectedSeats.map((seat, index) => (
            <PassengerForm
              key={seat.id}
              index={index}
              seatNumber={seat.seat_number}
              defaultValues={
                passengerData[index]
                  ? {
                      first_name: passengerData[index].first_name,
                      last_name: passengerData[index].last_name,
                      gender: passengerData[index].gender,
                      phone: passengerData[index].phone,
                    }
                  : undefined
              }
              onChange={(data) => handlePassengerChange(index, data)}
            />
          ))}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h3 className="text-base font-semibold text-[#1E293B] mb-4">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact-email" className={labelClasses}>
                <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                Email <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="your@email.com"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="contact-phone" className={labelClasses}>
                <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                Phone <span className="text-[#DC2626]">*</span>
              </label>
              <input
                id="contact-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="08012345678"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-base font-semibold text-[#1E293B] mb-4">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergency-name" className={labelClasses}>
                Full Name
              </label>
              <input
                id="emergency-name"
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Emergency contact name"
                className={inputClasses}
              />
            </div>
            <div>
              <label htmlFor="emergency-phone" className={labelClasses}>
                Phone Number
              </label>
              <input
                id="emergency-phone"
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="08012345678"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#DC2626] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#DC2626]">{validationError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-[#1E293B] transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-3 bg-[#0057FF] text-white text-sm font-semibold rounded-xl hover:bg-[#0046cc] active:bg-[#003bb3] transition-colors flex items-center gap-2"
          >
            Continue to Review
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
