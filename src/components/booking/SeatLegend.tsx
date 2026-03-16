import React from "react";

interface LegendItem {
  label: string;
  bgClass: string;
  borderClass: string;
}

const items: LegendItem[] = [
  {
    label: "Available",
    bgClass: "bg-white",
    borderClass: "border-gray-300",
  },
  {
    label: "Selected",
    bgClass: "bg-[#0057FF]",
    borderClass: "border-[#0057FF]",
  },
  {
    label: "Booked",
    bgClass: "bg-[#374151]",
    borderClass: "border-[#374151]",
  },
  {
    label: "Locked",
    bgClass: "bg-[#D97706]",
    borderClass: "border-[#D97706]",
  },
];

export default function SeatLegend() {
  return (
    <div className="flex items-center gap-6 flex-wrap">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded border-2 ${item.bgClass} ${item.borderClass}`}
          />
          <span className="text-sm text-gray-600">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
