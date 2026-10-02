import { properties } from "./properties";
import { bookingSources } from "../types";
import type { Reservation } from "../types";
const guests = [
  "Clair Maguire",
  "Oliver Thompson",
  "Amelia Davis",
  "Noah Williams",
  "Isla Anderson",
  "Ethan Wilson",
  "Sophie Chen",
  "Lucas Martin",
  "Mia Robinson",
  "Liam Walker",
  "Charlotte Lewis",
  "Henry Clark",
  "Grace Taylor",
  "Jack Harrison",
  "Ella Cooper",
  "Leo Murphy",
  "Ava Brooks",
  "Oscar Hughes",
  "Lily Parker",
  "Thomas Reed",
  "Zoe Mitchell",
  "Felix Turner",
  "Ruby Morgan",
  "Daniel Scott",
  "Freya Campbell",
  "Hugo Evans",
  "Chloe Wright",
  "Arthur Hill",
  "Nora Phillips",
  "Max Collins",
  "Alice Green",
  "Sebastian King",
  "Eva Adams",
  "William Bell",
  "Florence Baker",
  "George Ross",
];
export const reservations: Reservation[] = guests.map((guestName, i) => {
  const property = properties[i === 0 ? 4 : (i - 1) % 12];
  const day = i === 0 ? 4 : 1 + ((i * 3) % 24);
  const nights = i === 0 ? 7 : 3 + (i % 5);
  const iso = (d: number) => `2026-07-${String(d).padStart(2, "0")}`;
  const totalBooking =
    i === 0
      ? 8524.03
      : Math.round((2450 + ((i * 773) % 8700) + (i % 4) * 0.25) * 100) / 100;
  const deposit = i === 0 ? 2500 : Math.round(totalBooking * 0.3 * 100) / 100;
  const status =
    i === 12 || i === 25
      ? "Cancelled - Full Refund"
      : i === 8 || i === 19 || i === 31
        ? "Cancelled"
        : i % 3 === 0
          ? "Completed"
          : "Confirmed";
  const fullRefund = status === "Cancelled - Full Refund";
  return {
    id: i === 0 ? "clair-maguire" : `res-${String(i + 1).padStart(3, "0")}`,
    externalId:
      i === 0
        ? "GST-TRQ-260704"
        : `${property.pmsProvider === "guesty" ? "GST" : "GP"}-${260700 + i}`,
    propertyId: property.id,
    pmsProvider: property.pmsProvider,
    guestName,
    unit:
      i === 0
        ? "Entire villa"
        : i % 3 === 0
          ? "Entire villa"
          : `Villa ${(i % 3) + 1}`,
    checkIn: iso(day),
    checkOut: iso(day + nights),
    nights,
    source:
      i === 0 ? "Booking.com" : bookingSources[(i + Math.floor(i / 12)) % 7],
    totalBooking,
    status,
    guestPayments: [
      {
        id: `dep-${i}`,
        kind: "Deposit",
        amount: fullRefund ? 0 : deposit,
        invoiceDate: "2026-06-12",
        paidAt: "2026-06-14",
        note: fullRefund ? "Refunded in full" : "Deposit received",
      },
      {
        id: `bal-${i}`,
        kind: "Balance",
        amount: fullRefund
          ? 0
          : Math.round((totalBooking - deposit) * 100) / 100,
        paidAt: i !== 0 && i % 4 !== 0 ? "2026-07-02" : undefined,
        note: fullRefund
          ? "Refunded in full"
          : i === 0
            ? "Awaiting bank transfer"
            : "",
      },
    ],
    ownerPayments:
      i === 0
        ? [
            {
              id: "op-1",
              amount: 3000,
              paidAt: "2026-07-12",
              note: "First owner payment",
            },
            {
              id: "op-2",
              amount: 2000,
              paidAt: "2026-07-20",
              note: "Second owner payment",
            },
          ]
        : fullRefund || i % 5 === 0
          ? []
          : [
              {
                id: `op-${i}-1`,
                amount:
                  Math.round(totalBooking * (i % 3 === 0 ? 0.4 : 0.5) * 100) /
                  100,
                paidAt: "2026-07-18",
                note: "Owner settlement",
              },
            ],
  };
});
