"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Calendar, Users, ArrowRight } from "lucide-react";
import { useTerminalSearch } from "@/hooks/queries/useTerminals";
import type { Terminal } from "@/types";

interface AutocompleteFieldProps {
  label: string;
  placeholder: string;
  value: string;
  displayValue: string;
  onSelect: (terminal: Terminal) => void;
  icon: React.ReactNode;
}

function AutocompleteField({
  label,
  placeholder,
  value,
  displayValue,
  onSelect,
  icon,
}: AutocompleteFieldProps) {
  const [query, setQuery] = useState(displayValue);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { data: terminals, isLoading } = useTerminalSearch(focused ? query : "");

  useEffect(() => {
    setQuery(displayValue);
  }, [displayValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
        if (!value) setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
  };

  const handleSelect = (terminal: Terminal) => {
    onSelect(terminal);
    setQuery(`${terminal.name} - ${terminal.city}`);
    setOpen(false);
  };

  return (
    <div className="relative flex-1 min-w-0" ref={wrapperRef}>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {icon}
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
            if (query) setQuery("");
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm text-[#1E293B] placeholder:text-gray-400 focus:border-[#0057FF] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0057FF]"
        />
      </div>
      {open && focused && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg max-h-60 overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-3 text-sm text-gray-400">Searching...</div>
          )}
          {!isLoading && terminals && terminals.length === 0 && query.length > 0 && (
            <div className="px-4 py-3 text-sm text-gray-400">No terminals found</div>
          )}
          {!isLoading && terminals && terminals.length === 0 && query.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400">Type to search terminals</div>
          )}
          {terminals?.map((terminal) => (
            <button
              key={terminal.id}
              type="button"
              onClick={() => handleSelect(terminal)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50"
            >
              <MapPin className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#1E293B]">{terminal.name}</p>
                <p className="text-xs text-gray-500">{terminal.city}, {terminal.state}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HeroSearch() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [originDisplay, setOriginDisplay] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationDisplay, setDestinationDisplay] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("1");

  const today = new Date().toISOString().split("T")[0];

  const handleOriginSelect = useCallback((terminal: Terminal) => {
    setOrigin(terminal.code);
    setOriginDisplay(`${terminal.name} - ${terminal.city}`);
  }, []);

  const handleDestinationSelect = useCallback((terminal: Terminal) => {
    setDestination(terminal.code);
    setDestinationDisplay(`${terminal.name} - ${terminal.city}`);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination || !date) return;
    const params = new URLSearchParams({
      origin,
      destination,
      date,
      passengers,
    });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0057FF] to-[#003CB3] py-16 sm:py-20 lg:py-28">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/20" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/10" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            Travel made easy.
            <br />
            Book your bus in minutes.
          </h1>
          <p className="text-lg text-blue-100 max-w-xl mx-auto">
            Search from 100+ routes across Nigeria
          </p>
        </div>

        {/* Search form card */}
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <AutocompleteField
                label="From"
                placeholder="Departure terminal"
                value={origin}
                displayValue={originDisplay}
                onSelect={handleOriginSelect}
                icon={<MapPin className="h-4 w-4 text-gray-400" />}
              />

              {/* Swap icon — decorative */}
              <div className="hidden lg:flex items-center justify-center pb-1">
                <ArrowRight className="h-5 w-5 text-gray-300" />
              </div>

              <AutocompleteField
                label="To"
                placeholder="Arrival terminal"
                value={destination}
                displayValue={destinationDisplay}
                onSelect={handleDestinationSelect}
                icon={<MapPin className="h-4 w-4 text-gray-400" />}
              />

              {/* Date */}
              <div className="flex-1 min-w-0 lg:max-w-[170px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm text-[#1E293B] focus:border-[#0057FF] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0057FF]"
                  />
                </div>
              </div>

              {/* Passengers */}
              <div className="flex-1 min-w-0 lg:max-w-[130px]">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Passengers
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    value={passengers}
                    onChange={(e) => setPassengers(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-8 text-sm text-[#1E293B] focus:border-[#0057FF] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0057FF]"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={String(n)}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!origin || !destination || !date}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#0057FF] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0047D6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors lg:self-end"
              >
                <Search className="h-4 w-4" />
                Search Trips
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
