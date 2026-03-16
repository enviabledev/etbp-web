// ── User & Auth ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: "customer" | "admin" | "driver" | "agent";
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ── Terminal & Route ─────────────────────────────────────────

export interface Terminal {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  origin_terminal_id: string;
  destination_terminal_id: string;
  origin_terminal: Terminal;
  destination_terminal: Terminal;
  base_price: number;
  currency: string;
  estimated_duration_minutes: number;
  is_active: boolean;
}

export interface PopularRoute {
  route: {
    name: string;
    code: string;
    origin_terminal: Terminal;
    destination_terminal: Terminal;
    base_price: number;
    currency: string;
    estimated_duration_minutes: number;
  };
  booking_count: number;
}

// ── Vehicle ──────────────────────────────────────────────────

export interface VehicleType {
  id: string;
  name: string;
  seat_capacity: number;
  amenities: string[];
}

// ── Trip ─────────────────────────────────────────────────────

export type TripStatus =
  | "scheduled"
  | "boarding"
  | "departed"
  | "in_transit"
  | "arrived"
  | "completed"
  | "cancelled"
  | "delayed";

export interface Trip {
  id: string;
  route_id: string;
  departure_date: string;
  departure_time: string;
  status: TripStatus;
  price: number;
  available_seats: number;
  total_seats: number;
  route?: Route;
  vehicle_type?: VehicleType;
}

export interface TripSearchResult {
  id: string;
  route: {
    name: string;
    code: string;
    origin_terminal: {
      name: string;
      city: string;
    };
    destination_terminal: {
      name: string;
      city: string;
    };
  };
  vehicle_type?: {
    name: string;
    seat_capacity: number;
    amenities: string[];
  } | null;
  departure_date: string;
  departure_time: string;
  status: TripStatus;
  price: number;
  available_seats: number;
  total_seats: number;
  estimated_duration_minutes: number;
}

// ── Seat ─────────────────────────────────────────────────────

export type SeatStatus = "available" | "booked" | "locked" | "maintenance";
export type SeatType = "standard" | "premium" | "vip";

export interface Seat {
  id: string;
  seat_number: string;
  seat_row: number;
  seat_column: number;
  seat_type: SeatType;
  price_modifier: number;
  status: SeatStatus;
}

export interface SeatMapResponse {
  trip_id: string;
  total_seats: number;
  available_seats: number;
  seats: Seat[];
}

// ── Booking ──────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired"
  | "refunded";

export interface BookingPassenger {
  id: string;
  seat_id: string;
  first_name: string;
  last_name: string;
  gender: string | null;
  email?: string;
  phone: string | null;
  seat_number?: string;
  seat_type?: string;
  is_primary: boolean;
  checked_in: boolean;
  qr_code_data: string | null;
}

export interface Booking {
  id: string;
  reference: string;
  booking_reference?: string;
  user_id: string;
  trip_id: string;
  status: BookingStatus;
  total_amount: number;
  currency: string;
  passenger_count: number;
  contact_email: string;
  contact_phone: string;
  promo_code: string | null;
  promo_discount: number;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

export interface BookingTrip {
  id: string;
  departure_date: string;
  departure_time: string;
  status: string;
  price: number;
  route?: {
    id?: string;
    name?: string;
    code?: string;
    origin_terminal?: { id?: string; name?: string; code?: string; city: string; state?: string };
    destination_terminal?: { id?: string; name?: string; code?: string; city: string; state?: string };
  };
  vehicle_type?: { name: string } | null;
}

export interface BookingDetail extends Booking {
  trip: BookingTrip;
  passengers: BookingPassenger[];
  payment: Payment | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  cancellation_reason?: string | null;
  cancelled_at?: string | null;
  checked_in_at?: string | null;
  special_requests?: string | null;
}

// ── Payment ──────────────────────────────────────────────────

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method: string;
  payment_reference: string | null;
  gateway_response: string | null;
  paid_at: string | null;
  created_at: string;
}

// ── Wallet ───────────────────────────────────────────────────

export type TransactionType = "credit" | "debit";
export type TransactionStatus = "pending" | "completed" | "failed" | "reversed";

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  reference: string;
  created_at: string;
}

// ── API helpers ──────────────────────────────────────────────

export interface ApiError {
  detail: string;
  status_code: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}
