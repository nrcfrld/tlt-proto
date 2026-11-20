import type { GuestPayment, Property, Reservation } from "../types";
import { isDateInRange, type DateRange } from "./dates";
import { roundMoney } from "./financial";

export type ReportDateBasis = "check-in" | "guest-payment" | "owner-payment";
export type ReportPayment = {
  id: string;
  paidAt: string;
  amount: number;
  kind?: GuestPayment["kind"];
};

export function reservationReportRows(reservations: Reservation[], basis: ReportDateBasis, range: DateRange) {
  return reservations.flatMap((reservation) => {
    if (basis === "check-in") {
      return isDateInRange(reservation.checkIn, range) ? [{ reservation, payments: [] }] : [];
    }
    const entries = basis === "guest-payment" ? reservation.guestPayments : reservation.ownerPayments;
    const payments: ReportPayment[] = entries.flatMap((payment) => {
      const { paidAt } = payment;
      return isDateInRange(paidAt, range) && payment.amount > 0 ? [{ ...payment, paidAt }] : [];
    });
    return payments.length ? [{ reservation, payments }] : [];
  });
}

export function propertyReceipts(properties: Property[], reservations: Reservation[], range: DateRange) {
  const amounts = new Map<string, number>();
  for (const { reservation, payments } of reservationReportRows(reservations, "guest-payment", range)) {
    const received = payments.reduce((sum, payment) => sum + payment.amount, 0);
    amounts.set(reservation.propertyId, (amounts.get(reservation.propertyId) ?? 0) + received);
  }
  return properties.map((property) => ({ property, amount: roundMoney(amounts.get(property.id) ?? 0) }));
}
