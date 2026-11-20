export type PMSProvider = "guesty" | "guestpro";
export type RecordOrigin = PMSProvider | "manual";
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
export const reservationStatuses = ["Confirmed", "Completed", "Cancelled", "Cancelled - Full Refund"] as const;
export type ReservationStatus = (typeof reservationStatuses)[number];
interface PropertyDetails {
  id: string;
  name: string;
  owner: string;
}
export interface ManagedProperty extends PropertyDetails {
  pmsProvider: PMSProvider;
  externalId: string;
  syncStatus: "Synced" | "Error";
}
export interface ManualProperty extends PropertyDetails {
  pmsProvider: "manual";
  externalId?: never;
  syncStatus?: never;
}
export type Property = ManagedProperty | ManualProperty;
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
export const serviceStatuses = ["Confirmed", "Pending", "Cancelled"] as const;
export interface ServiceDetails {
  id: string;
  date: string;
  adultQty: number;
  childrenQty: number;
  focQty: number;
  boatCompany?: string;
  departureTime?: string;
  returnTime?: string;
  amount: number;
  notes: string;
  status: (typeof serviceStatuses)[number];
}
export interface AdditionalService extends ServiceDetails {
  reservationId: string;
  type: string;
}
export interface BoatOnlyOrder extends ServiceDetails {
  guestName: string;
}
export interface Reservation {
  id: string;
  externalId: string;
  pmsProvider: RecordOrigin;
  propertyId: string;
  unit: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  source: BookingSource;
  totalBooking: number;
  status: ReservationStatus;
  remarks?: string;
  commissionOverride?: CommissionOverride;
  commissionHistory?: CommissionChange[];
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
export interface CommissionOverride {
  method: "percent" | "amount";
  tlt: number;
  agent: number;
}
export interface CommissionSnapshot {
  source: "manual" | "master" | "unresolved";
  settings?: CommissionOverride;
  tltCommission: number;
  agentCommission: number;
  ownerPayable: number;
}
export interface CommissionChange {
  id: string;
  changedAt: string;
  changedBy: string;
  reason: string;
  before: CommissionSnapshot;
  after: CommissionSnapshot;
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
  commission?: CommissionOverride;
  needsReview: boolean;
}
export interface Integration {
  id: PMSProvider;
  name: string;
  propertyCount: number;
  lastSync: string;
  status: "Connected" | "Syncing" | "Error";
}
