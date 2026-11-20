import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { useApp } from "../context/AppContext";
import { money } from "../utils/currency";
import { date } from "../utils/dates";
import type { AdditionalService } from "../types";
import {
  Badge,
  Button,
  Empty,
  MonthFilter,
  PageHeader,
  PropertyFilter,
  Select,
} from "../components/UI";
import { ServiceForm } from "../components/Forms";
export default function AdditionalServices() {
  const { services, reservations, properties } = useApp();
  const [month, setMonth] = useState("2026-07");
  const [serviceDate, setServiceDate] = useState("");
  const [property, setProperty] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<AdditionalService>();
  const [open, setOpen] = useState(false);
  const rows = services.filter((s) => {
    const r = reservations.find((r) => r.id === s.reservationId)!;
    return (
      (!month || s.date.startsWith(month)) &&
      (!serviceDate || s.date === serviceDate) &&
      (!property || r.propertyId === property) &&
      (!type || s.type === type) &&
      (!status || s.status === status)
    );
  });
  return (
    <>
      <PageHeader
        title="Additional services"
        description="Transfers and other guest services managed directly by TLT."
        actions={
          <Button
            primary
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
          >
            <Plus size={16} />
            Add service
          </Button>
        }
      />
      <div className="filter-toolbar">
        <div className="filter-group">
          <MonthFilter value={month} onChange={setMonth} />
          <label className="inline-date">
            <span>Service date</span>
            <input
              aria-label="Service date filter"
              type="date"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
            />
          </label>
          <PropertyFilter value={property} onChange={setProperty} />
          <Select
            label="Service type"
            value={type}
            onChange={setType}
            options={[
              { value: "", label: "All service types" },
              ...Array.from(new Set(services.map((s) => s.type))).map((s) => ({
                value: s,
                label: s,
              })),
            ]}
          />
          <Select
            label="Service status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "", label: "All statuses" },
              ...["Confirmed", "Pending", "Cancelled"].map((s) => ({
                value: s,
                label: s,
              })),
            ]}
          />
        </div>
      </div>
      <section className="panel">
        <div className="table-caption">
          <strong>{rows.length} services</strong>
          <span>
            Service value{" "}
            <strong>
              {money(
                rows
                  .filter((s) => s.status !== "Cancelled")
                  .reduce((sum, s) => sum + s.amount, 0),
              )}
            </strong>
          </span>
        </div>
        {rows.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reservation / guest</th>
                  <th>Property</th>
                  <th>Service</th>
                  <th>Boat company</th>
                  <th>Departure</th>
                  <th>Return</th>
                  <th className="num">Adults</th>
                  <th className="num">Children</th>
                  <th className="num">FOC</th>
                  <th className="num">Amount</th>
                  <th>Status</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const r = reservations.find((r) => r.id === s.reservationId)!;
                  return (
                    <tr key={s.id}>
                      <td>{date(s.date)}</td>
                      <td>
                        <Link
                          className="text-link"
                          to={`/reservations/${r.id}`}
                        >
                          {r.guestName}
                        </Link>
                        <span className="cell-sub">{r.externalId}</span>
                      </td>
                      <td>
                        {properties.find((p) => p.id === r.propertyId)?.name}
                      </td>
                      <td>
                        <strong>{s.type}</strong>
                        <span className="cell-sub truncated" title={s.notes}>
                          {s.notes}
                        </span>
                      </td>
                      <td>{s.type === "Boat Transfer" ? s.boatCompany || "—" : "—"}</td>
                      <td>{s.type === "Boat Transfer" ? s.departureTime || "—" : "—"}</td>
                      <td>{s.type === "Boat Transfer" ? s.returnTime || "—" : "—"}</td>
                      <td className="num">{s.adultQty}</td>
                      <td className="num">{s.childrenQty}</td>
                      <td className="num">{s.focQty}</td>
                      <td className="num">{money(s.amount)}</td>
                      <td>
                        <Badge>{s.status}</Badge>
                      </td>
                      <td>
                        <button
                          className="icon-button"
                          aria-label={`Edit ${s.type} for ${r.guestName}`}
                          onClick={() => {
                            setEditing(s);
                            setOpen(true);
                          }}
                        >
                          <Pencil size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty />
        )}
        <div className="table-bottom">
          <span>Amounts are tracked separately from booking revenue.</span>
          <span>FOC = free of charge</span>
        </div>
      </section>
      {open && <ServiceForm service={editing} onClose={() => setOpen(false)} />}
    </>
  );
}
