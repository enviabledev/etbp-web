"use client";

export const dynamic = "force-dynamic";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/search/SearchBar";
import TripCard from "@/components/search/TripCard";
import { useSearchTrips, type SearchTripsParams } from "@/hooks/queries/useRoutes";
import { Loader2, SearchX, ArrowUpDown } from "lucide-react";

type SortOption = "cheapest" | "earliest";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<SortOption>("cheapest");

  const origin = searchParams.get("origin") ?? "";
  const destination = searchParams.get("destination") ?? "";
  const date = searchParams.get("date") ?? "";
  const passengers = searchParams.get("passengers") ?? "1";

  const params: SearchTripsParams | null =
    origin && destination && date
      ? { origin, destination, date, passengers }
      : null;

  const { data: trips, isLoading, error } = useSearchTrips(params);

  const sortedTrips = useMemo(() => {
    if (!trips) return [];
    const sorted = [...trips];
    if (sortBy === "cheapest") {
      sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (sortBy === "earliest") {
      sorted.sort((a, b) =>
        (a.departure_time ?? "").localeCompare(b.departure_time ?? "")
      );
    }
    return sorted;
  }, [trips, sortBy]);

  const hasParams = !!params;

  return (
    <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-6">
      {/* Search bar */}
      <div className="mb-6">
        <SearchBar />
      </div>

      {/* Results header */}
      {hasParams && !isLoading && trips && trips.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {trips.length} trip{trips.length !== 1 ? "s" : ""} found
          </p>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-[#1E293B] focus:border-[#0057FF] focus:outline-none focus:ring-1 focus:ring-[#0057FF]"
            >
              <option value="cheapest">Cheapest first</option>
              <option value="earliest">Earliest first</option>
            </select>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 sm:min-w-[200px]">
                  <div className="space-y-2">
                    <div className="h-6 w-16 rounded bg-gray-200" />
                    <div className="h-3 w-20 rounded bg-gray-100" />
                  </div>
                  <div className="h-4 w-4 rounded bg-gray-100" />
                  <div className="space-y-2">
                    <div className="h-6 w-16 rounded bg-gray-200" />
                    <div className="h-3 w-20 rounded bg-gray-100" />
                  </div>
                </div>
                <div className="flex-1 sm:px-4">
                  <div className="h-4 w-40 rounded bg-gray-200 mb-2" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 rounded-full bg-gray-100" />
                    <div className="h-5 w-12 rounded-full bg-gray-100" />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="h-7 w-24 rounded bg-gray-200" />
                  <div className="h-10 w-20 rounded-lg bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <SearchX className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
            Something went wrong
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            We couldn&apos;t load the search results. Please try again.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && hasParams && trips && trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <SearchX className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
            No trips found for this route and date
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Try adjusting your search criteria or selecting a different date.
          </p>
        </div>
      )}

      {/* No search yet */}
      {!hasParams && !isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <SearchX className="h-8 w-8 text-[#0057FF]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1E293B] mb-2">
            Search for trips
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Enter your origin, destination, and travel date to find available trips.
          </p>
        </div>
      )}

      {/* Trip cards */}
      {!isLoading && !error && sortedTrips.length > 0 && (
        <div className="space-y-3">
          {sortedTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#0057FF]" />
            </div>
          }
        >
          <SearchResultsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
