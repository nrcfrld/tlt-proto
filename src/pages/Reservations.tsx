import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { bookingSources } from "../types";
import { matchesFinancialStatus, summarize } from "../utils/financial";
import { money } from "../utils/currency";
import {
  Button,
  MonthFilter,
  PageHeader,
  PropertyFilter,
  SearchBox,
  Select,
  ExportButton,
} from "../components/UI";
import { ReservationTable } from "../components/ReservationTable";
export default function Reservations() {
  const { reservations, rules, notify } = useApp();
  const [params] = useSearchParams();
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState("2026-07");
  const [property, setProperty] = useState("");
  const [source, setSource] = useState("");
  const [pms, setPms] = useState("");
  const [status, setStatus] = useState("");
  const [financial, setFinancial] = useState(params.get("financial") || "");
  const [advanced, setAdvanced] = useState(true);
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
        description="One financial view of every booking, across both PMS platforms."
        actions={
          <ExportButton
            onClick={() =>
              notify("Reservations exported successfully · prototype export")
            }
          />
        }
      />
      <div className="filter-toolbar">
        <div className="filter-group">
          <SearchBox value={search} onChange={setSearch} />
          <MonthFilter value={month} onChange={setMonth} />
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
          <Select
            label="PMS"
            value={pms}
            onChange={setPms}
            options={[
              { value: "", label: "All PMS" },
              { value: "guesty", label: "Guesty" },
              { value: "guestpro", label: "GuestPro" },
            ]}
          />
          <Select
            label="Reservation status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "", label: "All reservation statuses" },
              ...[
                "Confirmed",
                "Completed",
                "Cancelled",
                "Cancelled - Full Refund",
              ].map((s) => ({ value: s, label: s })),
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
        <ReservationTable rows={rows} />
        <div className="table-bottom">
          <span>
            Showing {rows.length} of {reservations.length} reservations
          </span>
          <span>Click a reservation to review its financials</span>
        </div>
      </section>
      <div className="workspace-footnote">
        Full-refund bookings carry zero financial value. Reservations without a
        rule are excluded from calculated commission and owner totals.
      </div>
    </>
  );
}
