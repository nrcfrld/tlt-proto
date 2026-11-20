import { describe, expect, test } from "bun:test";
import { calculateFinancials, changeReservationCommission, summarize, validateCommissionOverride, validateRule } from "./financial";
import { reservations } from "../data/reservations";
import { commissionRules } from "../data/commissionRules";
const demo = reservations[0];
describe("provisional commission and settlement policy", () => {
  test("Villa Tranquilla Agent split matches the client Excel example", () => {
    // Replay the original numeric example to validate the split, without assuming an FX rate.
    const sample = {
      ...demo,
      propertyId: "villa-tranquilla",
      source: "Agent" as const,
      checkIn: "2026-01-03",
      checkOut: "2026-01-10",
      totalBooking: 6426,
      ownerPayments: [],
      guestPayments: [],
    };
    const f = calculateFinancials(sample, commissionRules);
    expect(f.rule?.tltCommissionRate).toBe(0.125);
    expect(f.rule?.agentCommissionRate).toBe(0.125);
    expect(f.tltCommission).toBe(803.25);
    expect(f.agentCommission).toBe(803.25);
    expect(f.ownerPayable).toBe(4819.5);
    expect(f.ownerOutstanding).toBe(4819.5);
    expect(f.needsReview).toBe(false);
  });
  test("primary scenario matches the auditable monetary breakdown", () => {
    const f = calculateFinancials(demo, commissionRules);
    expect(f.tltCommission).toBe(8_500_000);
    expect(f.agentCommission).toBe(14_152_500);
    expect(f.ownerPayable).toBe(62_347_500);
    expect(f.ownerPaid).toBe(50_000_000);
    expect(f.ownerOutstanding).toBe(12_347_500);
    expect(f.guestOutstanding).toBe(60_000_000);
  });
  test("payment additions propagate to consolidated outstanding totals", () => {
    const after = {
      ...demo,
      ownerPayments: [
        ...demo.ownerPayments,
        {
          id: "new",
          amount: 12_347_500,
          paidAt: "2026-07-21",
          note: "Final payment",
        },
      ],
    };
    expect(calculateFinancials(after, commissionRules).ownerOutstanding).toBe(
      0,
    );
    expect(summarize([after], commissionRules).ownerOutstanding).toBe(0);
  });
  test("rule edits recalculate every relevant monetary output", () => {
    const original = calculateFinancials(demo, commissionRules);
    const edited = commissionRules.map((r) =>
      r.id === original.rule?.id ? { ...r, tltCommissionRate: 0.12 } : r,
    );
    const f = calculateFinancials(demo, edited);
    expect(f.tltCommission).toBe(10_200_000);
    expect(f.ownerPayable).toBe(60_647_500);
  });
  test("full refunds contribute no revenue, commissions or payable", () => {
    for (const r of reservations.filter(
      (r) => r.status === "Cancelled - Full Refund",
    )) {
      const f = calculateFinancials(r, commissionRules);
      expect(f.bookingValue).toBe(0);
      expect(f.ownerPayable).toBe(0);
      expect(f.tltCommission).toBe(0);
      expect(f.guestOutstanding).toBe(0);
    }
  });
  test("missing or conflicting rules do not silently assume a payable", () => {
    expect(calculateFinancials(demo, []).needsReview).toBe(true);
    expect(calculateFinancials(demo, []).rule).toBeUndefined();
    const match = calculateFinancials(demo, commissionRules).rule!;
    expect(
      calculateFinancials(demo, [match, { ...match, id: "duplicate" }])
        .ownerPayable,
    ).toBe(0);
  });
  test("rule changes flag overpaid owners for review in consolidated reports", () => {
    const match = calculateFinancials(demo, commissionRules).rule!;
    const edited = commissionRules.map((r) =>
      r.id === match.id ? { ...r, tltCommissionRate: 0.6 } : r,
    );
    const f = calculateFinancials(demo, edited);
    expect(f.ownerCredit).toBe(30_152_500);
    expect(f.needsReview).toBe(true);
    expect(summarize([demo], edited).ownerCredit).toBe(30_152_500);
    expect(summarize([demo], edited).review).toBe(1);
  });
  test("rules are selected using inclusive effective dates", () => {
    const match = calculateFinancials(demo, commissionRules).rule!;
    expect(
      calculateFinancials(demo, [
        { ...match, effectiveFrom: demo.checkIn, effectiveUntil: demo.checkIn },
      ]).rule,
    ).toBeDefined();
    expect(
      calculateFinancials(demo, [{ ...match, effectiveUntil: "2026-07-03" }])
        .needsReview,
    ).toBe(true);
  });
  test("negative, excessive, reversed-date and overlapping rates are rejected", () => {
    const rule = commissionRules[0];
    expect(
      validateRule({ ...rule, tltCommissionRate: -0.1 }, []),
    ).toBeDefined();
    expect(
      validateRule(
        { ...rule, tltCommissionRate: 0.9, agentCommissionRate: 0.2 },
        [],
      ),
    ).toBeDefined();
    expect(
      validateRule({ ...rule, effectiveUntil: "2025-01-01" }, []),
    ).toBeDefined();
    expect(validateRule({ ...rule, id: "new" }, commissionRules)).toBeDefined();
    expect(validateRule(rule, commissionRules)).toBeUndefined();
  });

  test("a reservation override supersedes the master rule and appends immutable before and after values", () => {
    const details = { id: "change-1", changedAt: "2026-11-20T04:20:00Z", changedBy: "Demo admin", reason: "Confirmed agent agreement" };
    const overridden = changeReservationCommission(demo, commissionRules, { method: "percent", tlt: 0.12, agent: 0.08 }, details);
    const f = calculateFinancials(overridden, commissionRules);
    expect(f.tltCommission).toBe(10_200_000);
    expect(f.agentCommission).toBe(6_800_000);
    expect(f.ownerPayable).toBe(68_000_000);
    expect(calculateFinancials(overridden, []).ownerOutstanding).toBe(18_000_000);
    expect(summarize([overridden], commissionRules).owner).toBe(68_000_000);
    expect(calculateFinancials(demo, commissionRules).tltCommission).toBe(8_500_000);
    expect(overridden.commissionHistory?.[0]).toMatchObject({
      ...details,
      before: { source: "master", tltCommission: 8_500_000, ownerPayable: 62_347_500 },
      after: { source: "manual", tltCommission: 10_200_000, ownerPayable: 68_000_000 },
    });
    expect(changeReservationCommission(overridden, commissionRules, overridden.commissionOverride, details)).toBe(overridden);
    const restored = changeReservationCommission(overridden, commissionRules, undefined, { ...details, id: "restore-1", reason: "Use standard commission" });
    expect(calculateFinancials(restored, commissionRules).ownerPayable).toBe(62_347_500);
    expect(restored.commissionHistory).toHaveLength(2);
    expect(restored.commissionHistory?.[0]).toEqual(overridden.commissionHistory?.[0]);
    expect(restored.commissionHistory?.[1].after.source).toBe("master");
  });

  test("fixed overrides preserve owner overpayment review and full refunds", () => {
    const override = { method: "amount", tlt: 36_000_000, agent: 2_000_000 } as const;
    expect(validateCommissionOverride(override, demo.totalBooking)).toBeUndefined();
    expect(validateCommissionOverride({ ...override, tlt: -1 }, demo.totalBooking)).toBeDefined();
    expect(validateCommissionOverride({ ...override, tlt: demo.totalBooking }, demo.totalBooking)).toBeDefined();
    expect(validateCommissionOverride({ method: "percent", tlt: 0.6, agent: 0.5 }, demo.totalBooking)).toBeDefined();
    const booking = { ...demo, commissionOverride: override };
    expect(calculateFinancials(booking, [])).toMatchObject({ ownerPayable: 47_000_000, ownerCredit: 3_000_000, needsReview: true });
    expect(calculateFinancials({ ...booking, status: "Cancelled - Full Refund", ownerPayments: [] }, [])).toMatchObject({
      tltCommission: 0, agentCommission: 0, ownerPayable: 0,
    });
  });
});
