import { describe, expect, test } from "bun:test";
import { calculateFinancials, summarize, validateRule } from "./financial";
import { reservations } from "../data/reservations";
import { commissionRules } from "../data/commissionRules";
const demo = reservations[0];
describe("provisional commission and settlement policy", () => {
  test("primary scenario matches the auditable monetary breakdown", () => {
    const f = calculateFinancials(demo, commissionRules);
    expect(f.tltCommission).toBe(852.4);
    expect(f.agentCommission).toBe(1419.25);
    expect(f.ownerPayable).toBe(6252.38);
    expect(f.ownerPaid).toBe(5000);
    expect(f.ownerOutstanding).toBe(1252.38);
    expect(f.guestOutstanding).toBe(6024.03);
  });
  test("payment additions propagate to consolidated outstanding totals", () => {
    const after = {
      ...demo,
      ownerPayments: [
        ...demo.ownerPayments,
        {
          id: "new",
          amount: 1252.38,
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
    expect(f.tltCommission).toBe(1022.88);
    expect(f.ownerPayable).toBe(6081.9);
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
    expect(f.ownerCredit).toBe(3009.64);
    expect(f.needsReview).toBe(true);
    expect(summarize([demo], edited).ownerCredit).toBe(3009.64);
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
});
