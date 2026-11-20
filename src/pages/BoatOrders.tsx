import { useState } from "react";
import { Plus } from "lucide-react";
import { BoatOrderTable } from "../components/BoatOrderTable";
import { ServiceForm } from "../components/Forms";
import { Button, MonthFilter, PageHeader, Select } from "../components/UI";
import { useApp } from "../context/AppContext";
import { serviceStatuses } from "../types";
import { boatTransferRows, summarizeBoatTransfers, type BoatTransferRow } from "../utils/boatTransfers";
import { money } from "../utils/currency";

export default function BoatOrders() {
  const { services, boatOnlyOrders, reservations, properties } = useApp();
  const [month, setMonth] = useState("");
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [form, setForm] = useState<"new" | BoatTransferRow>();
  const orders = boatTransferRows(services, boatOnlyOrders, reservations, properties);
  const rows = orders.filter((row) =>
    (!month || row.service.date.slice(0, 7) === month) &&
    (!kind || row.kind === kind) &&
    (!status || row.service.status === status),
  ).reverse();
  const totals = summarizeBoatTransfers(rows);
  const editing = form === "new" ? undefined : form;

  return (
    <>
      <PageHeader
        title="Boat Order"
        description="Record boat orders with or without an accommodation reservation."
        actions={
          <Button primary onClick={() => setForm("new")}>
            <Plus size={16} /> Add boat order
          </Button>
        }
      />
      <div className="filter-toolbar">
        <div className="filter-group">
          <MonthFilter value={month} onChange={setMonth} additionalMonths={orders.map(({ service }) => service.date.slice(0, 7))} />
          <Select
            label="Order type"
            value={kind}
            onChange={setKind}
            options={[
              { value: "", label: "All order types" },
              { value: "standalone", label: "Boat only" },
              { value: "linked", label: "Linked reservation" },
            ]}
          />
          <Select
            label="Status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "", label: "All statuses" },
              ...serviceStatuses.map((value) => ({ value, label: value })),
            ]}
          />
        </div>
      </div>
      <section className="panel" aria-label="Boat orders">
        <div className="table-caption boat-report-totals">
          <strong>{rows.length} boat {rows.length === 1 ? "order" : "orders"}</strong>
          <span>Confirmed value <strong>{money(totals.confirmed)}</strong></span>
          <span>Pending value <strong>{money(totals.pending)}</strong></span>
        </div>
        <BoatOrderTable rows={rows} onEdit={setForm} />
        <div className="table-bottom">
          <span>FOC = free of charge</span>
        </div>
      </section>
      {form && (editing?.kind === "standalone" ? (
        <ServiceForm mode="boat-order" boatOnly={editing.service} onClose={() => setForm(undefined)} />
      ) : (
        <ServiceForm mode="boat-order" service={editing?.service} onClose={() => setForm(undefined)} />
      ))}
    </>
  );
}
