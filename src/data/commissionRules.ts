import { reservations } from "./reservations";
import type { CommissionRule } from "../types";
import { defaultCommissionRates } from "../utils/commissionRates";
export const commissionRules: CommissionRule[] = [];
for (const reservation of reservations) {
  if (
    commissionRules.some(
      (r) =>
        r.propertyId === reservation.propertyId &&
        r.source === reservation.source,
    )
  )
    continue;
  const rates = defaultCommissionRates(reservation.source, reservation.propertyId);
  commissionRules.push({
    id: `rule-${commissionRules.length + 1}`,
    propertyId: reservation.propertyId,
    source: reservation.source,
    ...rates,
    effectiveFrom: "2026-01-01",
    effectiveUntil: "2026-12-31",
    enabled: true,
  });
}
// One property/source pairing deliberately has a disabled rule for review examples.
const review = reservations[35];
const reviewRule = commissionRules.find(
  (r) => r.propertyId === review.propertyId && r.source === review.source,
);
if (reviewRule) reviewRule.enabled = false;

for (const example of [
  { propertyId: "villa-sayang", source: "TLT", tlt: 0.2, agent: 0 },
  {
    propertyId: "villa-tanjung",
    source: "Property Website",
    tlt: 0.2,
    agent: 0,
  },
  { propertyId: "villa-celagi", source: "BFV", tlt: 0.125, agent: 0.125 },
] as const) {
  if (
    !commissionRules.some(
      (r) => r.propertyId === example.propertyId && r.source === example.source,
    )
  )
    commissionRules.push({
      id: `rule-${commissionRules.length + 1}`,
      propertyId: example.propertyId,
      source: example.source,
      tltCommissionRate: example.tlt,
      agentCommissionRate: example.agent,
      effectiveFrom: "2026-01-01",
      effectiveUntil: "2026-12-31",
      enabled: true,
    });
}
