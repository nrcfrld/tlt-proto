import { expect, test } from "bun:test";
import { reservations } from "./reservations";
import { properties } from "./properties";
import { commissionRules } from "./commissionRules";
import { additionalServices } from "./additionalServices";
import { calculateFinancials, financialStatus, roundMoney } from "../utils/financial";

test("annual demo has all properties, daily activity and services in every month", () => {
  for (let month = 1; month <= 12; month++) {
    const prefix = `2026-${String(month).padStart(2, "0")}`;
    const rows = reservations.filter((r) => r.checkIn.startsWith(prefix));
    expect(rows.length).toBeGreaterThanOrEqual(36);
    expect(new Set(rows.map((r) => r.propertyId)).size).toBe(properties.length);
    expect(new Set(rows.map((r) => r.checkIn)).size).toBe(new Date(Date.UTC(2026, month, 0)).getUTCDate());
    expect(additionalServices.some((s) => s.date.startsWith(prefix))).toBe(true);
    expect(rows.some((r) => r.status === "Cancelled - Full Refund")).toBe(true);
    expect(rows.some((r) => financialStatus(r, commissionRules) === "Settled")).toBe(true);
    expect(rows.some((r) => financialStatus(r, commissionRules) === "Guest outstanding")).toBe(true);
    expect(rows.some((r) => financialStatus(r, commissionRules) === "Owner outstanding")).toBe(true);
  }
});

test("demo references, calendar dates and monetary balances remain consistent", () => {
  expect(new Set(reservations.map((r) => r.id)).size).toBe(reservations.length);
  expect(new Set(reservations.map((r) => r.externalId)).size).toBe(reservations.length);
  const ids = new Set(reservations.map((r) => r.id));
  expect(additionalServices.every((s) => ids.has(s.reservationId))).toBe(true);
  for (const r of reservations) {
    expect(new Date(r.checkIn).toISOString().slice(0, 10)).toBe(r.checkIn);
    expect(new Date(r.checkOut).toISOString().slice(0, 10)).toBe(r.checkOut);
    expect((Date.parse(r.checkOut) - Date.parse(r.checkIn)) / 86400000).toBe(r.nights);
    expect(roundMoney(r.guestPayments.reduce((s, p) => s + p.amount, 0))).toBe(r.status === "Cancelled - Full Refund" ? 0 : r.totalBooking);
    expect(calculateFinancials(r, commissionRules).ownerCredit).toBe(0);
  }
});
