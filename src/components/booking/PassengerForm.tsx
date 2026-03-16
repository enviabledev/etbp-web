"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";

interface PassengerFormData {
  first_name: string;
  last_name: string;
  gender: "male" | "female" | "other";
  phone: string;
}

interface PassengerFormProps {
  index: number;
  seatNumber: string;
  defaultValues?: Partial<PassengerFormData>;
  onChange: (data: PassengerFormData) => void;
}

export default function PassengerForm({
  index,
  seatNumber,
  defaultValues,
  onChange,
}: PassengerFormProps) {
  const { user } = useAuth();
  const isPrimary = index === 0;

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PassengerFormData>({
    defaultValues: {
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      gender: defaultValues?.gender || "male",
      phone: defaultValues?.phone || "",
    },
  });

  // Auto-fill primary passenger from user profile
  useEffect(() => {
    if (isPrimary && user && !defaultValues?.first_name) {
      setValue("first_name", user.first_name);
      setValue("last_name", user.last_name);
      setValue("phone", user.phone || "");
    }
  }, [isPrimary, user, defaultValues, setValue]);

  // Watch all fields and notify parent on change
  const watchedValues = watch();
  useEffect(() => {
    const { first_name, last_name, gender, phone } = watchedValues;
    if (first_name && last_name) {
      onChange({ first_name, last_name, gender, phone });
    }
  }, [
    watchedValues.first_name,
    watchedValues.last_name,
    watchedValues.gender,
    watchedValues.phone,
    onChange,
  ]);

  const inputClasses =
    "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-[#1E293B] " +
    "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0057FF] focus:border-transparent " +
    "transition-all duration-150";

  const labelClasses = "block text-sm font-medium text-[#1E293B] mb-1";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#1E293B]">
          {isPrimary ? "Primary Passenger" : `Passenger ${index + 1}`}
        </h3>
        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Seat {seatNumber}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label htmlFor={`passenger-${index}-first-name`} className={labelClasses}>
            First Name <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id={`passenger-${index}-first-name`}
            type="text"
            placeholder="Enter first name"
            className={inputClasses}
            {...register("first_name", { required: "First name is required" })}
          />
          {errors.first_name && (
            <p className="text-xs text-[#DC2626] mt-1">
              {errors.first_name.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor={`passenger-${index}-last-name`} className={labelClasses}>
            Last Name <span className="text-[#DC2626]">*</span>
          </label>
          <input
            id={`passenger-${index}-last-name`}
            type="text"
            placeholder="Enter last name"
            className={inputClasses}
            {...register("last_name", { required: "Last name is required" })}
          />
          {errors.last_name && (
            <p className="text-xs text-[#DC2626] mt-1">
              {errors.last_name.message}
            </p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor={`passenger-${index}-gender`} className={labelClasses}>
            Gender
          </label>
          <select
            id={`passenger-${index}-gender`}
            className={inputClasses}
            {...register("gender")}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label htmlFor={`passenger-${index}-phone`} className={labelClasses}>
            Phone Number
          </label>
          <input
            id={`passenger-${index}-phone`}
            type="tel"
            placeholder="e.g. 08012345678"
            className={inputClasses}
            {...register("phone")}
          />
        </div>
      </div>
    </div>
  );
}
