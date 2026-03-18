import type { QueryClient } from "@tanstack/react-query";

export function handlePushRefresh(queryClient: QueryClient, dataType: string) {
  switch (dataType) {
    case "booking_confirmed":
    case "booking_cancelled":
    case "payment_reminder":
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      break;
    case "trip_departed":
    case "trip_arrived":
    case "trip_status_changed":
    case "checked_in":
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      break;
    case "wallet_credited":
    case "wallet_debited":
      queryClient.invalidateQueries({ queryKey: ["wallet"] });
      break;
    case "review_prompt":
    case "review_response":
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking-review"] });
      break;
    default:
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      break;
  }
}
