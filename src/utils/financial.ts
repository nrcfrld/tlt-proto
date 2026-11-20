import type {
  CommissionRule,
  CommissionOverride,
  CommissionSnapshot,
  CommissionChange,
  FinancialCalculation,
  Reservation,
} from "../types";
export const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;
/** Provisional prototype policy: booking less independently rounded TLT and agent commissions.
 * Full refunds carry no revenue or payable; unresolved rules are excluded from commission totals.
 * Cancellation without a full refund retains imported value and requires financial review.
 * Services are tracked separately and do not enter the unvalidated owner-payable formula.
 */
export function calculateFinancials(
  r: Reservation,
  rules: CommissionRule[],
): FinancialCalculation {
  const candidates = rules.filter(
    (x) =>
      x.enabled &&
      x.propertyId === r.propertyId &&
      x.source === r.source &&
      x.effectiveFrom <= r.checkIn &&
      x.effectiveUntil >= r.checkIn,
  );
  const rule = candidates.length === 1 ? candidates[0] : undefined;
  const bookingValue =
    r.status === "Cancelled - Full Refund" ? 0 : r.totalBooking;
  const commission: CommissionOverride | undefined = r.commissionOverride ?? (rule
    ? { method: "percent", tlt: rule.tltCommissionRate, agent: rule.agentCommissionRate }
    : undefined);
  let tltCommission = 0;
  let agentCommission = 0;
  if (commission && bookingValue > 0) {
    if (commission.method === "amount") {
      tltCommission = commission.tlt;
      agentCommission = commission.agent;
    } else {
      tltCommission = roundMoney(bookingValue * commission.tlt);
      agentCommission = roundMoney(bookingValue * commission.agent);
      if (r.commissionOverride) {
        agentCommission = Math.min(agentCommission, roundMoney(bookingValue - tltCommission));
      }
    }
  }
  const ownerPayable =
    commission || !bookingValue
      ? roundMoney(bookingValue - tltCommission - agentCommission)
      : 0;
  const ownerPaid = roundMoney(
    r.ownerPayments.reduce((s, p) => s + p.amount, 0),
  );
  return {
    bookingValue,
    tltCommission,
    agentCommission,
    ownerPayable,
    ownerPaid,
    ownerOutstanding: commission
      ? Math.max(0, roundMoney(ownerPayable - ownerPaid))
      : 0,
    ownerCredit: commission ? Math.max(0, roundMoney(ownerPaid - ownerPayable)) : 0,
    guestOutstanding: roundMoney(
      r.guestPayments
        .filter((p) => !p.paidAt)
        .reduce((s, p) => s + p.amount, 0),
    ),
    rule,
    commission,
    needsReview:
      (!commission && bookingValue > 0) ||
      r.status === "Cancelled" ||
      (!!commission && ownerPaid > ownerPayable),
  };
}

export function validateCommissionOverride(override: CommissionOverride, bookingValue: number) {
  if (!Number.isFinite(override.tlt) || !Number.isFinite(override.agent) || override.tlt < 0 || override.agent < 0) {
    return "Enter nonnegative values for both commissions.";
  }
  const total = override.tlt + override.agent;
  if (override.method === "percent" && total > 1 + Number.EPSILON) {
    return "Combined commissions cannot exceed 100%.";
  }
  if (override.method === "amount" && roundMoney(total) > bookingValue) {
    return "Combined commissions cannot exceed the booking value.";
  }
}

function commissionSnapshot(reservation: Reservation, rules: CommissionRule[]): CommissionSnapshot {
  const f = calculateFinancials(reservation, rules);
  return {
    source: reservation.commissionOverride ? "manual" : f.rule ? "master" : "unresolved",
    settings: f.commission ? { ...f.commission } : undefined,
    tltCommission: f.tltCommission,
    agentCommission: f.agentCommission,
    ownerPayable: f.ownerPayable,
  };
}

export function changeReservationCommission(
  reservation: Reservation,
  rules: CommissionRule[],
  override: CommissionOverride | undefined,
  details: Pick<CommissionChange, "id" | "changedAt" | "changedBy" | "reason">,
): Reservation {
  const before = reservation.commissionOverride;
  if (
    before?.method === override?.method && before?.tlt === override?.tlt && before?.agent === override?.agent
  ) return reservation;
  const next = { ...reservation, commissionOverride: override };
  return {
    ...next,
    commissionHistory: [
      ...(reservation.commissionHistory ?? []),
      { ...details, before: commissionSnapshot(reservation, rules), after: commissionSnapshot(next, rules) },
    ],
  };
}
export function summarize(
  reservations: Reservation[],
  rules: CommissionRule[],
) {
  return reservations.reduce(
    (s, r) => {
      const f = calculateFinancials(r, rules);
      return {
        booking: s.booking + f.bookingValue,
        tlt: s.tlt + f.tltCommission,
        agent: s.agent + f.agentCommission,
        owner: s.owner + f.ownerPayable,
        guestOutstanding: s.guestOutstanding + f.guestOutstanding,
        ownerOutstanding: s.ownerOutstanding + f.ownerOutstanding,
        review: s.review + Number(f.needsReview),
        ownerCredit: s.ownerCredit + f.ownerCredit,
      };
    },
    {
      booking: 0,
      tlt: 0,
      agent: 0,
      owner: 0,
      guestOutstanding: 0,
      ownerOutstanding: 0,
      review: 0,
      ownerCredit: 0,
    },
  );
}
export const financialStatus = (r: Reservation, rules: CommissionRule[]) => {
  const f = calculateFinancials(r, rules);
  return f.needsReview
    ? "Needs review"
    : f.guestOutstanding > 0
      ? "Guest outstanding"
      : f.ownerOutstanding > 0
        ? "Owner outstanding"
        : "Settled";
};
export function validateRule(
  rule: CommissionRule,
  rules: CommissionRule[],
): string | undefined {
  if (
    !Number.isFinite(rule.tltCommissionRate) ||
    !Number.isFinite(rule.agentCommissionRate) ||
    rule.tltCommissionRate < 0 ||
    rule.agentCommissionRate < 0 ||
    rule.tltCommissionRate + rule.agentCommissionRate > 1
  )
    return "Commission rates must be nonnegative and total no more than 100%.";
  if (rule.effectiveFrom > rule.effectiveUntil)
    return "Effective until must be on or after effective from.";
  if (
    rule.enabled &&
    rules.some(
      (r) =>
        r.id !== rule.id &&
        r.enabled &&
        r.propertyId === rule.propertyId &&
        r.source === rule.source &&
        r.effectiveFrom <= rule.effectiveUntil &&
        r.effectiveUntil >= rule.effectiveFrom,
    )
  )
    return "An active rule already covers these dates for this property and source. Edit that rule or choose different dates.";
}

export function matchesFinancialStatus(
  r: Reservation,
  rules: CommissionRule[],
  status: string,
) {
  const f = calculateFinancials(r, rules);
  return (
    !status ||
    (status === "Needs review"
      ? f.needsReview
      : status === "Guest outstanding"
        ? f.guestOutstanding > 0
        : status === "Owner outstanding"
          ? f.ownerOutstanding > 0
          : !f.needsReview &&
            f.guestOutstanding === 0 &&
            f.ownerOutstanding === 0)
  );
}
