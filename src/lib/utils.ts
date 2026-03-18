/**
 * Format a number as Nigerian Naira (or any currency).
 * formatCurrency(12500) → "₦12,500"
 */
export function formatCurrency(
  amount: number,
  currency: string = "NGN"
): string {
  const symbols: Record<string, string> = { NGN: "\u20A6", USD: "$", GBP: "\u00A3", EUR: "\u20AC" };
  const symbol = symbols[currency] || currency + " ";
  return `${symbol}${amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

/**
 * Format an ISO date string to a human-readable date.
 * formatDate("2026-03-15") → "15 Mar 2026"
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/**
 * Format a time string (HH:mm or HH:mm:ss) to 12-hour format.
 * formatTime("08:00") → "8:00 AM"
 * formatTime("14:30") → "2:30 PM"
 */
export function formatTime(timeStr: string): string {
  const [hourStr, minuteStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${ampm}`;
}

/**
 * Format duration in minutes to a human-readable string.
 * formatDuration(150) → "2h 30m"
 * formatDuration(45)  → "45m"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Conditionally join CSS class names.
 * cn("foo", false && "bar", "baz") → "foo baz"
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Mapping of entity statuses to Tailwind colour classes for badges.
 */
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  // Trip statuses
  scheduled:  { bg: "bg-blue-100",   text: "text-blue-700" },
  boarding:   { bg: "bg-amber-100",  text: "text-amber-700" },
  departed:   { bg: "bg-indigo-100", text: "text-indigo-700" },
  en_route:   { bg: "bg-purple-100", text: "text-purple-700" },
  arrived:    { bg: "bg-teal-100",   text: "text-teal-700" },
  completed:  { bg: "bg-green-100",  text: "text-green-700" },
  cancelled:  { bg: "bg-red-100",    text: "text-red-700" },
  delayed:    { bg: "bg-orange-100", text: "text-orange-700" },

  // Booking statuses
  pending:    { bg: "bg-yellow-100", text: "text-yellow-700" },
  confirmed:  { bg: "bg-green-100",  text: "text-green-700" },
  expired:    { bg: "bg-gray-100",   text: "text-gray-700" },
  refunded:   { bg: "bg-pink-100",   text: "text-pink-700" },

  // Payment statuses
  processing: { bg: "bg-blue-100",   text: "text-blue-700" },
  failed:     { bg: "bg-red-100",    text: "text-red-700" },

  // Seat statuses
  available:   { bg: "bg-green-100",  text: "text-green-700" },
  booked:      { bg: "bg-gray-200",   text: "text-gray-600" },
  locked:      { bg: "bg-amber-100",  text: "text-amber-700" },
  maintenance: { bg: "bg-red-50",     text: "text-red-600" },

  // Fallback
  default: { bg: "bg-gray-100", text: "text-gray-700" },
};
