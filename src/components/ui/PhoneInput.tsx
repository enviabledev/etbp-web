"use client";

import { useState, useEffect, useRef } from "react";

const COUNTRIES = [
  { code: "NG", dial: "+234", flag: "\u{1F1F3}\u{1F1EC}", name: "Nigeria" },
  { code: "GH", dial: "+233", flag: "\u{1F1EC}\u{1F1ED}", name: "Ghana" },
  { code: "KE", dial: "+254", flag: "\u{1F1F0}\u{1F1EA}", name: "Kenya" },
  { code: "ZA", dial: "+27", flag: "\u{1F1FF}\u{1F1E6}", name: "South Africa" },
  { code: "CM", dial: "+237", flag: "\u{1F1E8}\u{1F1F2}", name: "Cameroon" },
  { code: "GB", dial: "+44", flag: "\u{1F1EC}\u{1F1E7}", name: "United Kingdom" },
  { code: "US", dial: "+1", flag: "\u{1F1FA}\u{1F1F8}", name: "United States" },
];

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  id?: string;
}

export default function PhoneInput({
  value,
  onChange,
  disabled,
  error,
  label,
  required,
  id,
}: PhoneInputProps) {
  const [country, setCountry] = useState(COUNTRIES[0]);
  const [localNumber, setLocalNumber] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Parse existing value on mount
  useEffect(() => {
    if (initialized.current || !value) return;
    initialized.current = true;
    for (const c of COUNTRIES) {
      if (value.startsWith(c.dial)) {
        setCountry(c);
        setLocalNumber(value.slice(c.dial.length));
        return;
      }
    }
    // Fallback: if value starts with 0, assume Nigeria
    if (value.startsWith("0")) {
      setCountry(COUNTRIES[0]);
      setLocalNumber(value.slice(1));
    } else {
      setLocalNumber(value);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLocalChange = (raw: string) => {
    // Strip non-digits
    let digits = raw.replace(/\D/g, "");
    // Strip leading 0 (Nigerian convention)
    if (digits.startsWith("0")) digits = digits.slice(1);
    setLocalNumber(digits);
    onChange(digits ? `${country.dial}${digits}` : "");
  };

  const handleCountrySelect = (c: typeof COUNTRIES[0]) => {
    setCountry(c);
    setDropdownOpen(false);
    onChange(localNumber ? `${c.dial}${localNumber}` : "");
  };

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#1E293B] mb-1">
          {label}
          {required && <span className="text-[#DC2626] ml-0.5">*</span>}
        </label>
      )}
      <div className="flex">
        {/* Country selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => !disabled && setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-1 h-full rounded-l-lg border border-r-0 bg-gray-50 px-3 py-3 text-sm ${
              error
                ? "border-red-300"
                : "border-gray-200 focus:border-[#0057FF]"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-100"}`}
          >
            <span className="text-base">{country.flag}</span>
            <span className="text-gray-600 text-xs">{country.dial}</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-1 max-h-64 overflow-y-auto">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={`flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-gray-50 ${
                    c.code === country.code ? "bg-blue-50 text-[#0057FF]" : "text-[#1E293B]"
                  }`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 text-left">{c.name}</span>
                  <span className="text-gray-400 text-xs">{c.dial}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Number input */}
        <input
          id={id}
          type="tel"
          value={localNumber}
          onChange={(e) => handleLocalChange(e.target.value)}
          disabled={disabled}
          placeholder="8012345678"
          className={`flex-1 rounded-r-lg border bg-gray-50 px-4 py-3 text-sm text-[#1E293B] placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-1 ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500"
              : "border-gray-200 focus:border-[#0057FF] focus:ring-[#0057FF]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
