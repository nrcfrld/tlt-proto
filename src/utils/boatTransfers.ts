import type { AdditionalService, BoatOnlyOrder, Property, Reservation } from "../types";
import { isDateInRange, type DateRange } from "./dates";
import { roundMoney } from "./financial";

export type BoatTransferRow =
  | { kind: "linked"; service: AdditionalService; reservation: Reservation; property: Property }
  | { kind: "standalone"; service: BoatOnlyOrder };

export interface BoatTransferFilters {
  range?: DateRange;
  property?: string;
  owner?: string;
  pms?: string;
  source?: string;
}

/** Service date owns the reporting period; reservation metadata owns the other filters. */
export function boatTransferRows(
  services: AdditionalService[],
  boatOnlyOrders: BoatOnlyOrder[],
  reservations: Reservation[],
  properties: Property[],
  filters: BoatTransferFilters = {},
): BoatTransferRow[] {
  const reservationsById = new Map(reservations.map((r) => [r.id, r]));
  const propertiesById = new Map(properties.map((p) => [p.id, p]));
  const rows = services.flatMap<BoatTransferRow>((service) => {
    if (service.type !== "Boat Transfer" || !matchesRange(service.date)) return [];
    const reservation = reservationsById.get(service.reservationId);
    const property = reservation && propertiesById.get(reservation.propertyId);
    if (!reservation || !property) return [];
    if (
      (filters.property && property.id !== filters.property) ||
      (filters.owner && property.owner !== filters.owner) ||
      (filters.pms && reservation.pmsProvider !== filters.pms) ||
      (filters.source && reservation.source !== filters.source)
    ) return [];
    return [{ kind: "linked", service, reservation, property }];
  });
  if (!filters.property && !filters.owner && !filters.pms && !filters.source) {
    for (const service of boatOnlyOrders) {
      if (matchesRange(service.date)) rows.push({ kind: "standalone", service });
    }
  }
  return rows.sort((a, b) => a.service.date.localeCompare(b.service.date));

  function matchesRange(date: string) {
    return !filters.range || isDateInRange(date, filters.range);
  }
}

export function summarizeBoatTransfers(rows: BoatTransferRow[]) {
  return {
    confirmed: roundMoney(rows.filter(({ service }) => service.status === "Confirmed").reduce((sum, { service }) => sum + service.amount, 0)),
    pending: roundMoney(rows.filter(({ service }) => service.status === "Pending").reduce((sum, { service }) => sum + service.amount, 0)),
    cancelled: rows.filter(({ service }) => service.status === "Cancelled").length,
  };
}
