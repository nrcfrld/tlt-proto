export type PMSProvider = "guesty" | "guestpro";
export const bookingSources = [
  "TLT",
  "Owner",
  "Property Website",
  "Booking.com",
  "Airbnb",
  "Agent",
  "BFV",
] as const;
export type BookingSource = (typeof bookingSources)[number];
export type ReservationStatus =
  "Confirmed" | "Completed" | "Cancelled" | "Cancelled - Full Refund";
export interface Property {
  id: string;
  name: string;
  pmsProvider: PMSProvider;
  externalId: string;
  owner: string;
  syncStatus: "Synced" | "Error";
}
export interface GuestPayment {
  id: string;
  kind: "Deposit" | "Balance";
  amount: number;
  invoiceDate?: string;
  paidAt?: string;
  note: string;
}
export interface OwnerPayment {
  id: string;
  amount: number;
  paidAt: string;
  note: string;
}
export interface AdditionalService {
  id: string;
  reservationId: string;
  type: string;
  date: string;
  adultQty: number;
  childrenQty: number;
  focQty: number;
  amount: number;
  notes: string;
  status: "Confirmed" | "Pending" | "Cancelled";
}
export interface Reservation {
  id: string;
  externalId: string;
  pmsProvider: PMSProvider;
  propertyId: string;
  unit: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  source: BookingSource;
  totalBooking: number;
  status: ReservationStatus;
  guestPayments: GuestPayment[];
  ownerPayments: OwnerPayment[];
}
export interface CommissionRule {
  id: string;
  propertyId: string;
  source: BookingSource;
  tltCommissionRate: number;
  agentCommissionRate: number;
  effectiveFrom: string;
  effectiveUntil: string;
  enabled: boolean;
}
export interface FinancialCalculation {
  bookingValue: number;
  tltCommission: number;
  agentCommission: number;
  ownerPayable: number;
  ownerPaid: number;
  ownerOutstanding: number;
  ownerCredit: number;
  guestOutstanding: number;
  rule?: CommissionRule;
  needsReview: boolean;
}
export interface Integration {
  id: PMSProvider;
  name: string;
  propertyCount: number;
  lastSync: string;
  status: "Connected" | "Syncing" | "Error";
}
