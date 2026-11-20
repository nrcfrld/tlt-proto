import type { ManagedProperty } from "../types";
const names = [
  "Villa Sayang",
  "Villa Coral",
  "Seaview Private Villas",
  "Villa Tanjung",
  "Villa Tranquilla",
  "Beach Tonic",
  "Villa Pantai",
  "Villa Celagi",
  "Villa Kasih",
  "Laguna Biru",
  "Villa Ocean Blue",
  "Gecko Villa & Bungalows",
];
const owners = [
  "Made Wirawan",
  "Sarah Bennett",
  "Andrew Collins",
  "Putu Adnyana",
  "Michael & Jane Foster",
  "David Mitchell",
  "Komang Dewi",
  "Emma Richardson",
  "Wayan Sudana",
  "Olivia Hart",
  "James Sullivan",
  "Ketut Arimbawa",
];
export const properties: ManagedProperty[] = names.map((name, i) => ({
  id: name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-$/, ""),
  name,
  pmsProvider: i === 5 || i === 7 || i > 8 ? "guestpro" : "guesty",
  externalId:
    i === 4
      ? "GST-19291"
      : i === 7
        ? "GP-2911"
        : i === 5
          ? "GP-8212"
          : `${i === 5 || i === 7 || i > 8 ? "GP" : "GST"}-${18282 + i * 317}`,
  owner: owners[i],
  syncStatus: i === 11 ? "Error" : "Synced",
}));
