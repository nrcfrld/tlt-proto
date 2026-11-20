import { expect, test } from "bun:test";
import { periodBuckets } from "./chartData";
import { reservations } from "../data/reservations";
import { commissionRules } from "../data/commissionRules";
import { summarize, roundMoney } from "./financial";

test("monthly and daily totals reconcile with financial reporting including refunds", () => {
  const monthly = periodBuckets(
    reservations,
    commissionRules,
    "monthly",
    "2026",
  );
  const summary = summarize(reservations, commissionRules);
  expect(monthly).toHaveLength(12);
  expect(roundMoney(monthly.reduce((s, b) => s + b.booking, 0))).toBe(roundMoney(summary.booking));
  for (const bucket of monthly) {
    const rows = reservations.filter((r) => r.checkIn.startsWith(bucket.key));
    const expected = summarize(rows, commissionRules);
    const daily = periodBuckets(reservations, commissionRules, "daily", bucket.key);
    expect(daily).toHaveLength(new Date(Date.UTC(2026, Number(bucket.key.slice(5)), 0)).getUTCDate());
    expect(bucket.booking).toBe(roundMoney(expected.booking));
    expect(roundMoney(daily.reduce((s, d) => s + d.tlt, 0))).toBe(roundMoney(expected.tlt));
    expect(roundMoney(daily.reduce((s, d) => s + d.owner, 0))).toBe(roundMoney(expected.owner));
    expect(daily.reduce((s, d) => s + d.reservations, 0)).toBe(rows.length);
    expect(bucket.reservations).toBeGreaterThan(0);
  }
});
test("property filtering and rule edits are reflected in the chart aggregates", () => {
  const rows = reservations.filter((r) => r.propertyId === "villa-tranquilla" && r.checkIn.startsWith("2026-07"));
  const rule = commissionRules.find(
    (r) => r.propertyId === "villa-tranquilla" && r.source === "Booking.com",
  )!;
  const updated = commissionRules.map((r) =>
    r.id === rule.id ? { ...r, tltCommissionRate: 0.12 } : r,
  );
  expect(
    periodBuckets(rows, updated, "daily", "2026-07").reduce(
      (s, b) => s + b.reservations,
      0,
    ),
  ).toBe(rows.length);
  expect(periodBuckets(rows, updated, "monthly", "2026")[6].tlt).toBe(
    roundMoney(summarize(rows, updated).tlt),
  );
});
test("daily buckets include leap days and empty periods remain explicit zeros", () => {
  expect(periodBuckets([], [], "daily", "2024-02")).toHaveLength(29);
  expect(
    periodBuckets(reservations, commissionRules, "daily", "2025-06").every(
      (b) => b.booking === 0 && b.reservations === 0,
    ),
  ).toBe(true);
});
