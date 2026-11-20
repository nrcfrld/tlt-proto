import { reservations } from "./reservations";
import type { AdditionalService } from "../types";
const serviceTypes = ["Boat Transfer", "Airport Transfer", "Private Tour", "Extra Bed"];
export const additionalServices: AdditionalService[] = reservations
  .filter((r, i) => !r.status.startsWith("Cancelled") && i % 3 === 0)
  .map((r, i) => {
    const type = i === 0 || i % 2 === 0 ? "Boat Transfer" : serviceTypes[1 + (i % 3)];
    const adults = 2 + (i % 3);
    const children = i === 0 ? 1 : i % 2;
    return {
      id: `service-${i + 1}`,
      reservationId: r.id,
      type,
      date: r.checkIn,
      adultQty: adults,
      childrenQty: children,
      focQty: i % 11 === 7 ? 1 : 0,
      // Illustrative IDR prices; no exchange rate is assumed.
      amount: i === 0 ? 1_500_000 : type === "Boat Transfer" ? adults * 600_000 + children * 300_000 : type === "Airport Transfer" ? 750_000 : type === "Private Tour" ? 1_800_000 + adults * 250_000 : 350_000 * r.nights,
      boatCompany: type === "Boat Transfer" ? ["Rocky", "Setia"][i % 2] : undefined,
      departureTime: type === "Boat Transfer" ? "13:30" : undefined,
      returnTime: type === "Boat Transfer" ? "12:30" : undefined,
      notes: type === "Boat Transfer" ? "Sanur → Lembongan · arrival transfer" : type === "Airport Transfer" ? "Airport pickup and harbour connection" : type === "Private Tour" ? "Island sightseeing with local guide" : "Additional bed for the stay",
      status: i % 13 === 6 ? "Cancelled" : i % 5 === 3 ? "Pending" : "Confirmed",
    };
  });
