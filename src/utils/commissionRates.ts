import type { BookingSource } from "../types";

/** Shared prototype rates used by mock settlements and editable rule seeds. */
export function defaultCommissionRates(source: BookingSource, propertyId?: string) {
  // Client Excel example: 25% total commission, split equally between TLT and agent.
  if (propertyId === "villa-tranquilla" && source === "Agent") {
    return { tltCommissionRate: 0.125, agentCommissionRate: 0.125 };
  }
  return {
    tltCommissionRate:
      source === "Owner" ? 0 : source === "BFV" ? 0.125 : source === "Booking.com" ? 0.1 : 0.2,
    agentCommissionRate:
      source === "BFV" ? 0.125 : source === "Booking.com" ? 0.1665 : source === "Airbnb" ? 0.15 : source === "Agent" ? 0.1 : 0,
  };
}
