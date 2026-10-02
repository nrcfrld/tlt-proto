import { reservations } from "./reservations";
import type { AdditionalService } from "../types";
export const additionalServices: AdditionalService[] = reservations
  .filter((_, i) => i % 5 === 0)
  .map((r, i) => ({
    id: `service-${i + 1}`,
    reservationId: r.id,
    type: "Boat Transfer",
    date: r.checkIn,
    adultQty: 2,
    childrenQty: i === 0 ? 1 : i % 2,
    focQty: 0,
    amount: i === 0 ? 150 : 120 + i * 15,
    notes:
      i === 0 ? "Sanur → Lembongan · arrival transfer" : "Arrival transfer",
    status: i === 3 ? "Pending" : "Confirmed",
  }));
