import { expect, test } from "bun:test";
import { boatTransferRows, summarizeBoatTransfers } from "./boatTransfers";
import { reservations } from "../data/reservations";
import { properties } from "../data/properties";
import { commissionRules } from "../data/commissionRules";
import { calculateFinancials } from "./financial";
import { monthDateRange } from "./dates";
import type { AdditionalService, BoatOnlyOrder } from "../types";

const reservation = reservations[0];
const property = properties.find((p) => p.id === reservation.propertyId)!;
const service: AdditionalService = {
  id: "boat", reservationId: reservation.id, type: "Boat Transfer",
  date: "2026-08-01", adultQty: 2, childrenQty: 1, focQty: 0,
  amount: 1_500_000, status: "Confirmed", notes: "",
  boatCompany: "Rocky", departureTime: "13:30", returnTime: "12:30",
};

test("boat report uses service dates and applies linked reservation filters", () => {
  const filters = { range: { from: service.date, to: service.date }, property: property.id, owner: property.owner, pms: reservation.pmsProvider, source: reservation.source };
  expect(boatTransferRows([service], [], [reservation], [property], filters)).toHaveLength(1);
  for (const mismatch of [
    { range: { from: "", to: "2026-07-31" } }, { property: "other" }, { owner: "other" },
    { pms: "guestpro" }, { source: "Owner" },
  ]) {
    expect(boatTransferRows([service], [], [reservation], [property], { ...filters, ...mismatch })).toHaveLength(0);
  }
  expect(boatTransferRows([service], [], [reservation], [property])).toHaveLength(1);
  expect(boatTransferRows([{ ...service, type: "Airport Transfer" }], [], [reservation], [property])).toHaveLength(0);
});

test("pending and cancelled boat values stay separate and do not change owner financials", () => {
  const before = calculateFinancials(reservation, commissionRules);
  const services: AdditionalService[] = [
    service,
    { ...service, id: "pending", status: "Pending", amount: 750_000 },
    { ...service, id: "cancelled", status: "Cancelled", amount: 2_000_000 },
  ];
  const rows = boatTransferRows(services, [], [reservation], [property]);
  expect(summarizeBoatTransfers(rows)).toEqual({ confirmed: 1_500_000, pending: 750_000, cancelled: 1 });
  const edited = boatTransferRows([{ ...service, amount: 1_750_000 }], [], [reservation], [property]);
  expect(summarizeBoatTransfers(edited).confirmed).toBe(1_750_000);
  expect(calculateFinancials(reservation, commissionRules)).toEqual(before);
  expect(summarizeBoatTransfers([])).toEqual({ confirmed: 0, pending: 0, cancelled: 0 });
});

test("boat-only orders appear by service month and are excluded by reservation filters", () => {
  const order: BoatOnlyOrder = {
    id: "standalone", guestName: "Boat guest", date: "2026-08-02",
    adultQty: 1, childrenQty: 0, focQty: 0, amount: 600_000, status: "Pending", notes: "",
  };
  const orders: BoatOnlyOrder[] = [
    order,
    { ...order, id: "cancelled", status: "Cancelled", amount: 1_200_000 },
    { ...order, id: "september", date: "2026-09-01" },
  ];
  const range = monthDateRange("2026-08");
  const rows = boatTransferRows([service], orders, [reservation], [property], { range });
  expect(rows.map(({ kind, service }) => [kind, service.id])).toEqual([
    ["linked", "boat"],
    ["standalone", "standalone"],
    ["standalone", "cancelled"],
  ]);
  expect(summarizeBoatTransfers(rows)).toEqual({ confirmed: 1_500_000, pending: 600_000, cancelled: 1 });
  for (const filter of [
    { property: property.id },
    { owner: property.owner },
    { pms: reservation.pmsProvider },
    { source: reservation.source },
  ]) {
    expect(boatTransferRows([service], orders, [reservation], [property], { range, ...filter }).map((row) => row.kind))
      .toEqual(["linked"]);
  }
});
