"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Calendar, Users } from "lucide-react";
import { useTerminalSearch } from "@/hooks/queries/useTerminals";
import type { Terminal } from "@/types";

interface CompactAutocompleteProps {
  placeholder: string;
  value: string;
  displayValue: string;
  onSelect: (terminal: Terminal) => void;
}

function CompactAutocomplete({
  placeholder,
  value,
  displayValue,
  onSelect,
}: CompactAutocompleteProps) {
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

  return (
    <div className="relative flex-1 min-w-0" ref={wrapperRef}>
      <div className="relative">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setFocused(true);
            setOpen(true);
            if (query) setQuery("");
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-[#1E293B] placeholder:text-gray-400 focus:border-[#0057FF] focus:outline-none focus:ring-1 focus:ring-[#0057FF]"
        />
      </div>
      {open && focused && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white py-1 shadow-lg max-h-48 overflow-y-auto">
          {isLoading && (
            <div className="px-3 py-2 text-xs text-gray-400">Searching...</div>
          )}
          {!isLoading && terminals && terminals.length === 0 && query.length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">No terminals found</div>
          )}
          {!isLoading && terminals && terminals.length === 0 && query.length === 0 && (
            <div className="px-3 py-2 text-xs text-gray-400">Type to search</div>
          )}
          {terminals?.map((terminal) => (
            <button
              key={terminal.id}
              type="button"
              onClick={() => {
                onSelect(terminal);
                setQuery(`${terminal.name} - ${terminal.city}`);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
            >
              <MapPin className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-[#1E293B]">{terminal.name}</p>
                <p className="text-xs text-gray-500">{terminal.city}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState(searchParams.get("origin") ?? "");
  const [originDisplay, setOriginDisplay] = useState(searchParams.get("origin") ?? "");
  const [destination, setDestination] = useState(searchParams.get("destination") ?? "");
  const [destinationDisplay, setDestinationDisplay] = useState(
    searchParams.get("destination") ?? ""
  );
  const [date, setDate] = useState(searchParams.get("date") ?? "");
  const [passengers, setPassengers] = useState(searchParams.get("passengers") ?? "1");

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
    const params = new URLSearchParams({ origin, destination, date, passengers });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <CompactAutocomplete
          placeholder="From"
          value={origin}
          displayValue={originDisplay}
          onSelect={handleOriginSelect}
        />

        <CompactAutocomplete
          placeholder="To"
          value={destination}
          displayValue={destinationDisplay}
          onSelect={handleDestinationSelect}
        />

        <div className="relative md:max-w-[160px]">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-[#1E293B] focus:border-[#0057FF] focus:outline-none focus:ring-1 focus:ring-[#0057FF]"
          />
        </div>

        <div className="relative md:max-w-[110px]">
          <Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
            className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm text-[#1E293B] focus:border-[#0057FF] focus:outline-none focus:ring-1 focus:ring-[#0057FF]"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n} {n === 1 ? "passenger" : "passengers"}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!origin || !destination || !date}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#0057FF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0047D6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </form>
  );
}
