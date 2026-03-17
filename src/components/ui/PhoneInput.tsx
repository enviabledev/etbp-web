"use client";

import { useState, useEffect, useRef, useMemo } from "react";

const flag = (code: string) =>
  String.fromCodePoint(...Array.from(code.toUpperCase()).map(c => c.charCodeAt(0) - 65 + 0x1F1E6));

const COUNTRIES = [
  { code: "NG", dial: "+234", name: "Nigeria" },
  { code: "AF", dial: "+93", name: "Afghanistan" },
  { code: "AL", dial: "+355", name: "Albania" },
  { code: "DZ", dial: "+213", name: "Algeria" },
  { code: "AD", dial: "+376", name: "Andorra" },
  { code: "AO", dial: "+244", name: "Angola" },
  { code: "AR", dial: "+54", name: "Argentina" },
  { code: "AM", dial: "+374", name: "Armenia" },
  { code: "AU", dial: "+61", name: "Australia" },
  { code: "AT", dial: "+43", name: "Austria" },
  { code: "AZ", dial: "+994", name: "Azerbaijan" },
  { code: "BS", dial: "+1242", name: "Bahamas" },
  { code: "BH", dial: "+973", name: "Bahrain" },
  { code: "BD", dial: "+880", name: "Bangladesh" },
  { code: "BB", dial: "+1246", name: "Barbados" },
  { code: "BY", dial: "+375", name: "Belarus" },
  { code: "BE", dial: "+32", name: "Belgium" },
  { code: "BZ", dial: "+501", name: "Belize" },
  { code: "BJ", dial: "+229", name: "Benin" },
  { code: "BT", dial: "+975", name: "Bhutan" },
  { code: "BO", dial: "+591", name: "Bolivia" },
  { code: "BA", dial: "+387", name: "Bosnia and Herzegovina" },
  { code: "BW", dial: "+267", name: "Botswana" },
  { code: "BR", dial: "+55", name: "Brazil" },
  { code: "BN", dial: "+673", name: "Brunei" },
  { code: "BG", dial: "+359", name: "Bulgaria" },
  { code: "BF", dial: "+226", name: "Burkina Faso" },
  { code: "BI", dial: "+257", name: "Burundi" },
  { code: "KH", dial: "+855", name: "Cambodia" },
  { code: "CM", dial: "+237", name: "Cameroon" },
  { code: "CA", dial: "+1", name: "Canada" },
  { code: "CV", dial: "+238", name: "Cape Verde" },
  { code: "CF", dial: "+236", name: "Central African Republic" },
  { code: "TD", dial: "+235", name: "Chad" },
  { code: "CL", dial: "+56", name: "Chile" },
  { code: "CN", dial: "+86", name: "China" },
  { code: "CO", dial: "+57", name: "Colombia" },
  { code: "KM", dial: "+269", name: "Comoros" },
  { code: "CD", dial: "+243", name: "Congo (DRC)" },
  { code: "CG", dial: "+242", name: "Congo (Republic)" },
  { code: "CR", dial: "+506", name: "Costa Rica" },
  { code: "HR", dial: "+385", name: "Croatia" },
  { code: "CU", dial: "+53", name: "Cuba" },
  { code: "CY", dial: "+357", name: "Cyprus" },
  { code: "CZ", dial: "+420", name: "Czech Republic" },
  { code: "DK", dial: "+45", name: "Denmark" },
  { code: "DJ", dial: "+253", name: "Djibouti" },
  { code: "DO", dial: "+1809", name: "Dominican Republic" },
  { code: "EC", dial: "+593", name: "Ecuador" },
  { code: "EG", dial: "+20", name: "Egypt" },
  { code: "SV", dial: "+503", name: "El Salvador" },
  { code: "GQ", dial: "+240", name: "Equatorial Guinea" },
  { code: "ER", dial: "+291", name: "Eritrea" },
  { code: "EE", dial: "+372", name: "Estonia" },
  { code: "SZ", dial: "+268", name: "Eswatini" },
  { code: "ET", dial: "+251", name: "Ethiopia" },
  { code: "FJ", dial: "+679", name: "Fiji" },
  { code: "FI", dial: "+358", name: "Finland" },
  { code: "FR", dial: "+33", name: "France" },
  { code: "GA", dial: "+241", name: "Gabon" },
  { code: "GM", dial: "+220", name: "Gambia" },
  { code: "GE", dial: "+995", name: "Georgia" },
  { code: "DE", dial: "+49", name: "Germany" },
  { code: "GH", dial: "+233", name: "Ghana" },
  { code: "GR", dial: "+30", name: "Greece" },
  { code: "GT", dial: "+502", name: "Guatemala" },
  { code: "GN", dial: "+224", name: "Guinea" },
  { code: "GW", dial: "+245", name: "Guinea-Bissau" },
  { code: "GY", dial: "+592", name: "Guyana" },
  { code: "HT", dial: "+509", name: "Haiti" },
  { code: "HN", dial: "+504", name: "Honduras" },
  { code: "HK", dial: "+852", name: "Hong Kong" },
  { code: "HU", dial: "+36", name: "Hungary" },
  { code: "IS", dial: "+354", name: "Iceland" },
  { code: "IN", dial: "+91", name: "India" },
  { code: "ID", dial: "+62", name: "Indonesia" },
  { code: "IR", dial: "+98", name: "Iran" },
  { code: "IQ", dial: "+964", name: "Iraq" },
  { code: "IE", dial: "+353", name: "Ireland" },
  { code: "IL", dial: "+972", name: "Israel" },
  { code: "IT", dial: "+39", name: "Italy" },
  { code: "CI", dial: "+225", name: "Ivory Coast" },
  { code: "JM", dial: "+1876", name: "Jamaica" },
  { code: "JP", dial: "+81", name: "Japan" },
  { code: "JO", dial: "+962", name: "Jordan" },
  { code: "KZ", dial: "+7", name: "Kazakhstan" },
  { code: "KE", dial: "+254", name: "Kenya" },
  { code: "KW", dial: "+965", name: "Kuwait" },
  { code: "KG", dial: "+996", name: "Kyrgyzstan" },
  { code: "LA", dial: "+856", name: "Laos" },
  { code: "LV", dial: "+371", name: "Latvia" },
  { code: "LB", dial: "+961", name: "Lebanon" },
  { code: "LS", dial: "+266", name: "Lesotho" },
  { code: "LR", dial: "+231", name: "Liberia" },
  { code: "LY", dial: "+218", name: "Libya" },
  { code: "LI", dial: "+423", name: "Liechtenstein" },
  { code: "LT", dial: "+370", name: "Lithuania" },
  { code: "LU", dial: "+352", name: "Luxembourg" },
  { code: "MO", dial: "+853", name: "Macau" },
  { code: "MG", dial: "+261", name: "Madagascar" },
  { code: "MW", dial: "+265", name: "Malawi" },
  { code: "MY", dial: "+60", name: "Malaysia" },
  { code: "MV", dial: "+960", name: "Maldives" },
  { code: "ML", dial: "+223", name: "Mali" },
  { code: "MT", dial: "+356", name: "Malta" },
  { code: "MR", dial: "+222", name: "Mauritania" },
  { code: "MU", dial: "+230", name: "Mauritius" },
  { code: "MX", dial: "+52", name: "Mexico" },
  { code: "MD", dial: "+373", name: "Moldova" },
  { code: "MC", dial: "+377", name: "Monaco" },
  { code: "MN", dial: "+976", name: "Mongolia" },
  { code: "ME", dial: "+382", name: "Montenegro" },
  { code: "MA", dial: "+212", name: "Morocco" },
  { code: "MZ", dial: "+258", name: "Mozambique" },
  { code: "MM", dial: "+95", name: "Myanmar" },
  { code: "NA", dial: "+264", name: "Namibia" },
  { code: "NP", dial: "+977", name: "Nepal" },
  { code: "NL", dial: "+31", name: "Netherlands" },
  { code: "NZ", dial: "+64", name: "New Zealand" },
  { code: "NI", dial: "+505", name: "Nicaragua" },
  { code: "NE", dial: "+227", name: "Niger" },
  { code: "KP", dial: "+850", name: "North Korea" },
  { code: "MK", dial: "+389", name: "North Macedonia" },
  { code: "NO", dial: "+47", name: "Norway" },
  { code: "OM", dial: "+968", name: "Oman" },
  { code: "PK", dial: "+92", name: "Pakistan" },
  { code: "PS", dial: "+970", name: "Palestine" },
  { code: "PA", dial: "+507", name: "Panama" },
  { code: "PG", dial: "+675", name: "Papua New Guinea" },
  { code: "PY", dial: "+595", name: "Paraguay" },
  { code: "PE", dial: "+51", name: "Peru" },
  { code: "PH", dial: "+63", name: "Philippines" },
  { code: "PL", dial: "+48", name: "Poland" },
  { code: "PT", dial: "+351", name: "Portugal" },
  { code: "QA", dial: "+974", name: "Qatar" },
  { code: "RO", dial: "+40", name: "Romania" },
  { code: "RU", dial: "+7", name: "Russia" },
  { code: "RW", dial: "+250", name: "Rwanda" },
  { code: "SA", dial: "+966", name: "Saudi Arabia" },
  { code: "SN", dial: "+221", name: "Senegal" },
  { code: "RS", dial: "+381", name: "Serbia" },
  { code: "SC", dial: "+248", name: "Seychelles" },
  { code: "SL", dial: "+232", name: "Sierra Leone" },
  { code: "SG", dial: "+65", name: "Singapore" },
  { code: "SK", dial: "+421", name: "Slovakia" },
  { code: "SI", dial: "+386", name: "Slovenia" },
  { code: "SO", dial: "+252", name: "Somalia" },
  { code: "ZA", dial: "+27", name: "South Africa" },
  { code: "KR", dial: "+82", name: "South Korea" },
  { code: "SS", dial: "+211", name: "South Sudan" },
  { code: "ES", dial: "+34", name: "Spain" },
  { code: "LK", dial: "+94", name: "Sri Lanka" },
  { code: "SD", dial: "+249", name: "Sudan" },
  { code: "SR", dial: "+597", name: "Suriname" },
  { code: "SE", dial: "+46", name: "Sweden" },
  { code: "CH", dial: "+41", name: "Switzerland" },
  { code: "SY", dial: "+963", name: "Syria" },
  { code: "TW", dial: "+886", name: "Taiwan" },
  { code: "TJ", dial: "+992", name: "Tajikistan" },
  { code: "TZ", dial: "+255", name: "Tanzania" },
  { code: "TH", dial: "+66", name: "Thailand" },
  { code: "TG", dial: "+228", name: "Togo" },
  { code: "TT", dial: "+1868", name: "Trinidad and Tobago" },
  { code: "TN", dial: "+216", name: "Tunisia" },
  { code: "TR", dial: "+90", name: "Turkey" },
  { code: "TM", dial: "+993", name: "Turkmenistan" },
  { code: "UG", dial: "+256", name: "Uganda" },
  { code: "UA", dial: "+380", name: "Ukraine" },
  { code: "AE", dial: "+971", name: "United Arab Emirates" },
  { code: "GB", dial: "+44", name: "United Kingdom" },
  { code: "US", dial: "+1", name: "United States" },
  { code: "UY", dial: "+598", name: "Uruguay" },
  { code: "UZ", dial: "+998", name: "Uzbekistan" },
  { code: "VE", dial: "+58", name: "Venezuela" },
  { code: "VN", dial: "+84", name: "Vietnam" },
  { code: "YE", dial: "+967", name: "Yemen" },
  { code: "ZM", dial: "+260", name: "Zambia" },
  { code: "ZW", dial: "+263", name: "Zimbabwe" },
].map(c => ({ ...c, flag: flag(c.code) }));

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
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const initialized = useRef(false);

  const filteredCountries = useMemo(() => {
    if (!search) return COUNTRIES;
    const q = search.toLowerCase();
    return COUNTRIES.filter(c => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q));
  }, [search]);

  // Parse existing value on mount
  useEffect(() => {
    if (initialized.current || !value) return;
    initialized.current = true;
    // Match longest dial code first
    let matched: typeof COUNTRIES[0] | null = null;
    let matchLen = 0;
    for (const c of COUNTRIES) {
      if (value.startsWith(c.dial) && c.dial.length > matchLen) {
        matched = c;
        matchLen = c.dial.length;
      }
    }
    if (matched) {
      setCountry(matched);
      setLocalNumber(value.slice(matchLen));
      return;
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
            onClick={() => {
              if (disabled) return;
              setDropdownOpen(!dropdownOpen);
              setSearch("");
              setTimeout(() => searchRef.current?.focus(), 100);
            }}
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
            <div className="absolute top-full left-0 z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg max-h-80 flex flex-col">
              <div className="p-2 border-b border-gray-100">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country..."
                  className="w-full px-3 py-1.5 text-sm rounded-md border border-gray-200 focus:outline-none focus:border-[#0057FF]"
                />
              </div>
              <div className="overflow-y-auto py-1">
              {filteredCountries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { handleCountrySelect(c); setSearch(""); }}
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
