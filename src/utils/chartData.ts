import type { CommissionRule, Reservation } from "../types";
import { calculateFinancials, roundMoney } from "./financial";

export type ChartMetric = "booking" | "tlt" | "owner" | "reservations";
export interface PeriodBucket {
  key: string;
  label: string;
  booking: number;
  tlt: number;
  owner: number;
  reservations: number;
}

/** Recognize booking financials on check-in, consistently with the reporting filters. */
export function periodBuckets(
  reservations: Reservation[],
  rules: CommissionRule[],
  period: "monthly" | "daily",
  selection: string,
): PeriodBucket[] {
  const [year, month = 1] = selection.split("-").map(Number);
  const count =
    period === "monthly" ? 12 : new Date(Date.UTC(year, month, 0)).getUTCDate();
  const buckets = Array.from({ length: count }, (_, i): PeriodBucket => {
    const key =
      period === "monthly"
        ? `${year}-${String(i + 1).padStart(2, "0")}`
        : `${selection}-${String(i + 1).padStart(2, "0")}`;
    return {
      key,
      label:
        period === "monthly"
          ? new Intl.DateTimeFormat("en-US", {
              month: "short",
              timeZone: "UTC",
            }).format(new Date(Date.UTC(year, i, 1)))
          : String(i + 1).padStart(2, "0"),
      booking: 0,
      tlt: 0,
      owner: 0,
      reservations: 0,
    };
  });
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const r of reservations) {
    const bucket = byKey.get(r.checkIn.slice(0, period === "monthly" ? 7 : 10));
    if (!bucket) continue;
    const f = calculateFinancials(r, rules);
    bucket.booking = roundMoney(bucket.booking + f.bookingValue);
    bucket.tlt = roundMoney(bucket.tlt + f.tltCommission);
    bucket.owner = roundMoney(bucket.owner + f.ownerPayable);
    bucket.reservations += 1;
  }
  return buckets;
}
