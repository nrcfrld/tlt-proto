import { expect, test } from "bun:test";
import { properties } from "../data/properties";
import { reservations } from "../data/reservations";
import type { Reservation } from "../types";
import { monthDateRange, isCalendarDate } from "./dates";
import { propertyReceipts, reservationReportRows } from "./reservationReports";

const [property, otherProperty] = properties;
const july = monthDateRange("2026-07");
const booking: Reservation = {
  ...reservations[0],
  propertyId: property.id,
  checkIn: "2026-08-04",
  totalBooking: 3_000_000,
  guestPayments: [
    { id: "deposit", kind: "Deposit", amount: 1_000_000, paidAt: "2026-07-01", note: "" },
    { id: "balance", kind: "Balance", amount: 1_500_000, paidAt: "2026-07-31", note: "" },
    { id: "scheduled", kind: "Balance", amount: 500_000, invoiceDate: "2026-07-05", note: "" },
  ],
  ownerPayments: [
    { id: "owner-1", amount: 600_000, paidAt: "2026-07-10", note: "" },
    { id: "owner-2", amount: 200_000, paidAt: "2026-07-10", note: "" },
    { id: "owner-later", amount: 100_000, paidAt: "2026-08-03", note: "" },
  ],
};

test("payment filters return one reservation with its matching payment entries only", () => {
  expect(reservationReportRows([booking], "check-in", july)).toEqual([]);
  const [guest] = reservationReportRows([booking], "guest-payment", july);
  expect(guest.reservation).toBe(booking);
  expect(guest.payments.map(({ id }) => id)).toEqual(["deposit", "balance"]);
  const ownerRows = reservationReportRows([booking], "owner-payment", { from: "2026-07-10", to: "2026-07-10" });
  expect(ownerRows).toHaveLength(1);
  expect(ownerRows[0].payments.map(({ id }) => id)).toEqual(["owner-1", "owner-2"]);
});

test("property receipts include only dated guest money within the period", () => {
  const includedProperties = [property, otherProperty];
  expect(propertyReceipts(includedProperties, [booking], july)).toEqual([
    { property, amount: 2_500_000 },
    { property: otherProperty, amount: 0 },
  ]);
  expect(propertyReceipts([property], [booking], { from: "2026-07-31", to: "" })[0].amount).toBe(1_500_000);
  expect(propertyReceipts([property], [booking], { from: "", to: "2026-07-01" })[0].amount).toBe(1_000_000);
});

test("monthly presets include the last day, including leap day", () => {
  expect(monthDateRange("2024-02")).toEqual({ from: "2024-02-01", to: "2024-02-29" });
  expect(monthDateRange("2026-12")).toEqual({ from: "2026-12-01", to: "2026-12-31" });
  expect(isCalendarDate("2026-02-29")).toBe(false);
});
