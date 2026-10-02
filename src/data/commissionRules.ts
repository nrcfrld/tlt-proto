import { reservations } from "./reservations";
import type { CommissionRule } from "../types";
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
  const special =
    reservation.propertyId === "villa-tranquilla" &&
    reservation.source === "Booking.com";
  const tlt =
    reservation.source === "Owner"
      ? 0
      : reservation.source === "BFV"
        ? 0.125
        : reservation.source === "Booking.com"
          ? 0.1
          : 0.2;
  const agent =
    reservation.source === "BFV"
      ? 0.125
      : reservation.source === "Booking.com"
        ? 0.1665
        : reservation.source === "Airbnb"
          ? 0.15
          : reservation.source === "Agent"
            ? 0.1
            : 0;
  commissionRules.push({
    id: `rule-${commissionRules.length + 1}`,
    propertyId: reservation.propertyId,
    source: reservation.source,
    tltCommissionRate: special ? 0.1 : tlt,
    agentCommissionRate: special ? 0.1665 : agent,
    effectiveFrom: "2026-01-01",
    effectiveUntil: "2026-12-31",
    enabled: true,
  });
}
// One imported reservation deliberately has no applicable rule for the review workflow.
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
