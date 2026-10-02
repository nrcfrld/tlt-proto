import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Info, FileSpreadsheet } from "lucide-react";
import { useApp } from "../context/AppContext";
import { bookingSources } from "../types";
import { summarize } from "../utils/financial";
import { money } from "../utils/currency";
import {
  ExportButton,
  Metrics,
  MonthFilter,
  PageHeader,
  PropertyFilter,
  Select,
} from "../components/UI";
import { ReservationTable } from "../components/ReservationTable";
const types = [
  "Monthly Financial Report",
  "Property Report",
  "Owner Report",
  "Channel Report",
  "Commission Report",
];
export default function Reports() {
  const { properties, reservations, rules, notify } = useApp();
  const [params] = useSearchParams();
  const [type, setType] = useState(types[0]);
  const [month, setMonth] = useState("2026-07");
  const [property, setProperty] = useState(params.get("property") || "");
  const [owner, setOwner] = useState("");
  const [pms, setPms] = useState("");
  const [source, setSource] = useState("");
  const rows = reservations.filter((r) => {
    const p = properties.find((p) => p.id === r.propertyId)!;
    return (
      (!month || r.checkIn.startsWith(month)) &&
      (!property || r.propertyId === property) &&
      (!owner || p.owner === owner) &&
      (!pms || r.pmsProvider === pms) &&
      (!source || r.source === source)
    );
  });
  const s = summarize(rows, rules);
  const groupLabel =
    type === "Owner Report"
      ? "Owner"
      : type === "Channel Report"
        ? "Booking source"
        : type === "Commission Report"
          ? "Applied commission rule"
          : "Property";
  const groups = Array.from(
    new Set(
      rows.map((r) =>
        type === "Owner Report"
          ? properties.find((p) => p.id === r.propertyId)!.owner
          : type === "Channel Report"
            ? r.source
            : type === "Commission Report"
              ? `${properties.find((p) => p.id === r.propertyId)!.name} + ${r.source}`
              : properties.find((p) => p.id === r.propertyId)!.name,
      ),
    ),
  ).map((label) => ({
    label,
    rows: rows.filter(
      (r) =>
        label ===
        (type === "Owner Report"
          ? properties.find((p) => p.id === r.propertyId)!.owner
          : type === "Channel Report"
            ? r.source
            : type === "Commission Report"
              ? `${properties.find((p) => p.id === r.propertyId)!.name} + ${r.source}`
              : properties.find((p) => p.id === r.propertyId)!.name),
    ),
  }));
  return (
    <>
      <PageHeader
        title="Reports"
        description="Consolidated financial reporting for your entire portfolio."
        actions={
          <ExportButton
            onClick={() =>
              notify("Report exported successfully · prototype export")
            }
          />
        }
      />
      <div className="report-types" role="group" aria-label="Report type">
        {types.map((t) => (
          <button
            key={t}
            className={t === type ? "selected" : ""}
            onClick={() => setType(t)}
          >
            {t.replace(" Report", "")}
          </button>
        ))}
      </div>
      <div className="filter-toolbar">
        <div className="filter-group">
          <MonthFilter value={month} onChange={setMonth} />
          <PropertyFilter value={property} onChange={setProperty} />
          <Select
            label="Owner"
            value={owner}
            onChange={setOwner}
            options={[
              { value: "", label: "All owners" },
              ...properties.map((p) => ({ value: p.owner, label: p.owner })),
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
            label="Booking source"
            value={source}
            onChange={setSource}
            options={[
              { value: "", label: "All sources" },
              ...bookingSources.map((s) => ({ value: s, label: s })),
            ]}
          />
        </div>
      </div>
      <div className="report-heading">
        <FileSpreadsheet size={18} />
        <h2>{type}</h2>
        <span>{rows.length} reservations · USD</span>
      </div>
      <Metrics
        items={[
          { label: "Total booking", value: s.booking },
          { label: "TLT commission", value: s.tlt, accent: true },
          { label: "Agent commission", value: s.agent },
          { label: "Owner payable", value: s.owner },
          { label: "Guest outstanding", value: s.guestOutstanding },
          { label: "Owner outstanding", value: s.ownerOutstanding },
        ]}
      />
      {s.review > 0 && (
        <div className="report-warning">
          <Info size={15} />
          {s.review} reservations need financial review. Missing-rule amounts
          are excluded from commissions and owner totals.
          {s.ownerCredit > 0 &&
            ` Owner overpayment credits: ${money(s.ownerCredit)}.`}
        </div>
      )}
      {type !== types[0] && groups.length > 0 && (
        <section className="panel spaced-panel">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>{groupLabel}</th>
                  <th className="num">Bookings</th>
                  <th className="num">Booking value</th>
                  <th className="num">TLT commission</th>
                  <th className="num">Agent commission</th>
                  <th className="num">Owner payable</th>
                  <th className="num">Owner outstanding</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const total = summarize(g.rows, rules);
                  return (
                    <tr key={g.label}>
                      <td>{g.label}</td>
                      <td className="num">{g.rows.length}</td>
                      <td className="num">{money(total.booking)}</td>
                      <td className="num">{money(total.tlt)}</td>
                      <td className="num">{money(total.agent)}</td>
                      <td className="num">{money(total.owner)}</td>
                      <td className="num">{money(total.ownerOutstanding)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <section className="panel">
        <div className="panel-heading">
          <h2>Reservation detail</h2>
          <span className="muted subtle">
            Check-in month · {month || "All months"}
          </span>
        </div>
        <ReservationTable rows={rows} />
      </section>
      <div className="workspace-footnote">
        Prototype export confirms the action; XLSX generation can be added
        later. Additional services are tracked separately from booking
        financials.
      </div>
    </>
  );
}
