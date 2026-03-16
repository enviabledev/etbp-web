"use client";

import React, { useMemo } from "react";
import type { Seat } from "@/types";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  seats: Seat[];
  selectedSeatIds: string[];
  onSeatToggle: (seatId: string) => void;
}

export default function SeatMap({
  seats,
  selectedSeatIds,
  onSeatToggle,
}: SeatMapProps) {
  // Build grid dimensions from seat data
  const { maxRow, maxCol, seatGrid, aisleAfterCol } = useMemo(() => {
    let mRow = 0;
    let mCol = 0;
    const grid = new Map<string, Seat>();

    for (const seat of seats) {
      if (seat.seat_row > mRow) mRow = seat.seat_row;
      if (seat.seat_column > mCol) mCol = seat.seat_column;
      grid.set(`${seat.seat_row}-${seat.seat_column}`, seat);
    }

    // Detect aisle gap: find the largest gap between consecutive occupied columns
    const occupiedCols = new Set<number>();
    for (const seat of seats) {
      occupiedCols.add(seat.seat_column);
    }
    const sortedCols = Array.from(occupiedCols).sort((a, b) => a - b);
    let aisleCol = 2; // default: aisle after column 2
    let maxGap = 0;
    for (let i = 0; i < sortedCols.length - 1; i++) {
      const gap = sortedCols[i + 1] - sortedCols[i];
      if (gap > maxGap) {
        maxGap = gap;
        aisleCol = sortedCols[i];
      }
    }

    return {
      maxRow: mRow,
      maxCol: mCol,
      seatGrid: grid,
      aisleAfterCol: maxGap > 1 ? aisleCol : 2,
    };
  }, [seats]);

  const getSeatStyle = (seat: Seat) => {
    const isSelected = selectedSeatIds.includes(seat.id);

    if (isSelected) {
      return "bg-[#0057FF] text-white border-[#0057FF] cursor-pointer hover:bg-[#0046cc]";
    }

    switch (seat.status) {
      case "available":
        return "bg-white text-gray-700 border-gray-300 cursor-pointer hover:border-[#0057FF] hover:bg-blue-50";
      case "booked":
        return "bg-[#374151] text-gray-400 border-[#374151] cursor-not-allowed opacity-70";
      case "locked":
        return "bg-[#D97706] text-white border-[#D97706] cursor-not-allowed opacity-80";
      case "maintenance":
        return "bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-50";
      default:
        return "bg-white text-gray-700 border-gray-300";
    }
  };

  const isClickable = (seat: Seat) => {
    return (
      seat.status === "available" || selectedSeatIds.includes(seat.id)
    );
  };

  const handleClick = (seat: Seat) => {
    if (isClickable(seat)) {
      onSeatToggle(seat.id);
    }
  };

  // Render rows
  const rows: React.ReactNode[] = [];
  for (let row = 1; row <= maxRow; row++) {
    const cells: React.ReactNode[] = [];

    for (let col = 1; col <= maxCol; col++) {
      // Insert aisle gap
      if (col === aisleAfterCol + 1) {
        cells.push(
          <div key={`aisle-${row}`} className="w-8 flex-shrink-0" />
        );
      }

      const seat = seatGrid.get(`${row}-${col}`);

      if (seat) {
        cells.push(
          <button
            key={seat.id}
            type="button"
            onClick={() => handleClick(seat)}
            disabled={!isClickable(seat)}
            title={`Seat ${seat.seat_number} - ${seat.seat_type || "standard"} (${seat.status})`}
            aria-label={`Seat ${seat.seat_number}, ${seat.status}${selectedSeatIds.includes(seat.id) ? ", selected" : ""}`}
            className={cn(
              "w-10 h-10 rounded-lg border-2 text-xs font-semibold",
              "flex items-center justify-center transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-[#0057FF] focus:ring-offset-1",
              getSeatStyle(seat)
            )}
          >
            {seat.seat_number}
          </button>
        );
      } else {
        // Empty cell where no seat exists
        cells.push(<div key={`empty-${row}-${col}`} className="w-10 h-10" />);
      }
    }

    rows.push(
      <div key={`row-${row}`} className="flex items-center gap-2">
        <span className="w-6 text-xs text-gray-400 text-right font-mono">
          {row}
        </span>
        {cells}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Front indicator */}
      <div className="flex items-center justify-center mb-2">
        <div className="bg-gray-200 text-gray-500 text-xs font-medium px-8 py-1.5 rounded-t-xl">
          Front
        </div>
      </div>

      {/* Seat grid */}
      <div className="flex flex-col gap-2 items-center">{rows}</div>

      {/* Back indicator */}
      <div className="flex items-center justify-center mt-2">
        <div className="bg-gray-100 text-gray-400 text-xs px-8 py-1 rounded-b-xl">
          Back
        </div>
      </div>
    </div>
  );
}
