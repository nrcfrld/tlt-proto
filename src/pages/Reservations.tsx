import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, SlidersHorizontal, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { bookingSources, reservationStatuses } from "../types";
import { matchesFinancialStatus, summarize } from "../utils/financial";
import { money } from "../utils/currency";
import {
  Button,
  MonthFilter,
  OriginFilter,
  PageHeader,
  PropertyFilter,
  SearchBox,
  Select,
  ExportButton,
} from "../components/UI";
import { ReservationTable } from "../components/ReservationTable";
import { ManualReservationForm } from "../components/ManualBookingForms";
export default function Reservations() {
  const { reservations, reservationMonths, rules, notify } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(() => {
    const selected = params.get("month");
    return selected && reservationMonths.includes(selected) ? selected : "2026-07";
  });
  const [property, setProperty] = useState("");
  const [source, setSource] = useState("");
  const [pms, setPms] = useState(params.get("origin") === "manual" ? "manual" : "");
  const [status, setStatus] = useState("");
  const [financial, setFinancial] = useState(params.get("financial") || "");
  const [advanced, setAdvanced] = useState(true);
  const [manualOpen, setManualOpen] = useState(false);
  const rows = reservations.filter(
    (r) =>
      (!month || r.checkIn.startsWith(month)) &&
      (!property || r.propertyId === property) &&
      (!source || r.source === source) &&
      (!pms || r.pmsProvider === pms) &&
      (!status || r.status === status) &&
      matchesFinancialStatus(r, rules, financial) &&
      `${r.guestName} ${r.externalId} ${r.propertyId}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const s = summarize(rows, rules);
  const reset = () => {
    setSearch("");
    setMonth("2026-07");
    setProperty("");
    setSource("");
    setPms("");
    setStatus("");
    setFinancial("");
  };
  return (
    <>
      <PageHeader
        title="Reservations"
        description="Review PMS bookings and reservations entered by your team."
        actions={
          <>
            <ExportButton
              onClick={() =>
                notify("Reservations exported successfully · prototype export")
              }
            />
            <Button primary onClick={() => setManualOpen(true)}>
              <Plus size={16} /> Add manual reservation
            </Button>
          </>
        }
      />
      <div className="filter-toolbar">
        <div className="filter-group">
          <SearchBox value={search} onChange={setSearch} />
          <MonthFilter value={month} onChange={setMonth} additionalMonths={reservationMonths} />
          <PropertyFilter value={property} onChange={setProperty} />
        </div>
        <Button onClick={() => setAdvanced(!advanced)}>
          <SlidersHorizontal size={15} />
          Filters
        </Button>
      </div>
      {advanced && (
        <div className="secondary-filters">
          <Select
            label="Booking source"
            value={source}
            onChange={setSource}
            options={[
              { value: "", label: "All sources" },
              ...bookingSources.map((s) => ({ value: s, label: s })),
            ]}
          />
          <OriginFilter value={pms} onChange={setPms} />
          <Select
            label="Reservation status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "", label: "All reservation statuses" },
              ...reservationStatuses.map((s) => ({ value: s, label: s })),
            ]}
          />
          <Select
            label="Financial status"
            value={financial}
            onChange={setFinancial}
            options={[
              { value: "", label: "All financial statuses" },
              ...[
                "Needs review",
                "Guest outstanding",
                "Owner outstanding",
                "Settled",
              ].map((s) => ({ value: s, label: s })),
            ]}
          />
          <button className="text-link clear-filters" onClick={reset}>
            <X size={13} />
            Reset filters
          </button>
        </div>
      )}
      <section className="panel">
        <div className="table-caption">
          <div>
            <strong>{rows.length} reservations</strong>
            <span>Check-in month · {month || "All months"}</span>
          </div>
          <span>
            Booking value <strong>{money(s.booking)}</strong>
          </span>
        </div>
        <ReservationTable rows={rows} showRemarks />
        <div className="table-bottom">
          <span>
            Showing {rows.length} of {reservations.length} reservations
          </span>
          <span>Click a reservation to review its financials</span>
        </div>
      </section>
      <div className="workspace-footnote">
        Full-refund bookings carry zero financial value. Calculated commission
        and owner totals require a matching rule or manual override.
      </div>
      {manualOpen && (
        <ManualReservationForm
          onClose={() => setManualOpen(false)}
          onSave={(id) => navigate(`/reservations/${id}`)}
        />
      )}
    </>
  );
}
