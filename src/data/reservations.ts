import { properties } from "./properties";
import { bookingSources } from "../types";
import { defaultCommissionRates } from "../utils/commissionRates";
import { roundMoney } from "../utils/financial";
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
const primaryExamples: Reservation[] = guests.map((guestName, i) => {
  const property = properties[i === 0 ? 4 : (i - 1) % 12];
  const day = i === 0 ? 4 : 1 + ((i * 3) % 24);
  const nights = i === 0 ? 7 : 3 + (i % 5);
  const iso = (d: number) => `2026-07-${String(d).padStart(2, "0")}`;
  const totalBooking =
    i === 0
      ? 85_000_000
      : 24_500_000 + ((i * 7_730_000) % 87_000_000) + (i % 4) * 2500;
  const deposit = i === 0 ? 25_000_000 : roundMoney(totalBooking * 0.3);
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
              amount: 30_000_000,
              paidAt: "2026-07-12",
              note: "First owner payment",
            },
            {
              id: "op-2",
              amount: 20_000_000,
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


// Fixed, reproducible demo portfolio. Monthly volume and nightly rates vary to
// illustrate a full annual cycle. Prices are synthetic IDR inputs, not FX conversions.
const monthlyVolumes = [36, 40, 48, 52, 60, 64, 72, 68, 56, 48, 40, 64];
const seasonalRates = [0.82, 0.85, 0.93, 1.02, 1.1, 1.18, 1.3, 1.34, 1.15, 1.02, 0.9, 1.25];
const firstNames = ["Alex", "Emma", "James", "Sofia", "Benjamin", "Olivia", "Hannah", "Daniel", "Yuki", "Luca", "Mei", "Arjun", "Isabella", "Finn", "Chloe", "Samuel", "Nina", "Theo", "Layla", "Jasper", "Elena", "Louis", "Amara", "Owen"];
const lastNames = ["Bennett", "Wilson", "Tan", "Patel", "Moreau", "Jensen", "Walker", "Nguyen", "Schmidt", "Rossi", "Lee", "Morgan", "Santos", "Anderson", "Taylor", "Clarke", "Kim", "Bakker", "Dubois", "Harris", "Chen", "Murphy", "Sato", "Reed", "Singh", "Martin", "Evans"];
const dateOffset = (monthIndex: number, day: number, offset = 0) =>
  new Date(Date.UTC(2026, monthIndex, day + offset)).toISOString().slice(0, 10);
const annualExamples: Reservation[] = [];
for (let m = 0; m < 12; m++) {
  const existing = m === 6 ? primaryExamples.length : 0;
  const count = monthlyVolumes[m] - existing;
  const days = new Date(Date.UTC(2026, m + 1, 0)).getUTCDate();
  for (let j = 0; j < count; j++) {
    const seed = m * 101 + j;
    const propertyIndex = (j + m * 5) % properties.length;
    const property = properties[propertyIndex];
    const day = 1 + ((j * 11 + m * 3) % days);
    const nights = 3 + (seed % 6);
    const source = bookingSources[(j + Math.floor(j / 12) + m) % bookingSources.length];
    const rates = defaultCommissionRates(source, property.id);
    const totalBooking = roundMoney(nights * (2_800_000 + propertyIndex * 450_000) * seasonalRates[m] * (0.88 + (seed % 9) * 0.035));
    const ownerPayable = roundMoney(totalBooking - roundMoney(totalBooking * rates.tltCommissionRate) - roundMoney(totalBooking * rates.agentCommissionRate));
    const status: Reservation["status"] = j % 23 === 5 ? "Cancelled - Full Refund" : j % 17 === 7 ? "Cancelled" : seed % 4 === 0 ? "Confirmed" : "Completed";
    const refunded = status === "Cancelled - Full Refund";
    const cancelled = status.startsWith("Cancelled");
    const deposit = refunded ? 0 : roundMoney(totalBooking * 0.3);
    const balance = refunded ? 0 : roundMoney(totalBooking - deposit);
    const balancePaid = !refunded && seed % 5 !== 0;
    const id = `res-2026-${String(m + 1).padStart(2, "0")}-${String(j + 1).padStart(3, "0")}`;
    const ownerPayments: Reservation["ownerPayments"] = [];
    if (!cancelled && balancePaid && seed % 5 !== 1) {
      const first = roundMoney(ownerPayable * (seed % 3 === 0 ? 0.4 : 0.5));
      ownerPayments.push({ id: `${id}-owner-1`, amount: first, paidAt: dateOffset(m, day, nights + 2), note: "First owner settlement" });
      if (seed % 3 !== 1) {
        const second = seed % 3 === 0 ? roundMoney(ownerPayable * 0.3) : roundMoney(ownerPayable - first);
        ownerPayments.push({ id: `${id}-owner-2`, amount: second, paidAt: dateOffset(m, day, nights + 9), note: seed % 3 === 2 ? "Final owner settlement" : "Second owner settlement" });
      }
    }
    annualExamples.push({
      id,
      externalId: `${property.pmsProvider === "guesty" ? "GST" : "GP"}-26${String(m + 1).padStart(2, "0")}-${String(j + 1).padStart(3, "0")}`,
      propertyId: property.id,
      pmsProvider: property.pmsProvider,
      guestName: `${firstNames[seed % firstNames.length]} ${lastNames[(Math.floor(seed / firstNames.length) + j * 7) % lastNames.length]}`,
      unit: j % 3 === 0 ? "Entire villa" : `Villa ${(j % 3) + 1}`,
      checkIn: dateOffset(m, day), checkOut: dateOffset(m, day, nights), nights,
      source, totalBooking, status,
      guestPayments: [
        { id: `${id}-deposit`, kind: "Deposit", amount: deposit, invoiceDate: dateOffset(m, day, -35), paidAt: dateOffset(m, day, -30), note: refunded ? "Refunded in full" : "Deposit received" },
        { id: `${id}-balance`, kind: "Balance", amount: balance, invoiceDate: dateOffset(m, day, -10), paidAt: refunded ? dateOffset(m, day, -5) : balancePaid ? dateOffset(m, day, -3) : undefined, note: refunded ? "Refunded in full" : balancePaid ? "Balance received" : "Awaiting guest balance" },
      ],
      ownerPayments,
    });
  }
}
// Keep the primary client walkthrough first, with stable IDs and exact amounts.
export const reservations: Reservation[] = [...primaryExamples, ...annualExamples];
