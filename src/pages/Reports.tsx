import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Info, FileSpreadsheet } from "lucide-react";
import { useApp } from "../context/AppContext";
import { bookingSources } from "../types";
import { summarize } from "../utils/financial";
import { money } from "../utils/currency";
import { describeDateRange, isCalendarDate, monthDateRange, type DateRange } from "../utils/dates";
import { propertyReceipts, reservationReportRows, type ReportDateBasis } from "../utils/reservationReports";
import {
  ExportButton,
  Metrics,
  MonthFilter,
  OriginFilter,
  PageHeader,
  PropertyFilter,
  Select,
} from "../components/UI";
import { ReservationTable } from "../components/ReservationTable";
import { BoatTransferReport } from "../components/BoatTransferReport";
import { PropertyReceiptsReport } from "../components/PropertyReceiptsReport";
import { boatTransferRows } from "../utils/boatTransfers";
const types = [
  "Monthly Financial Report",
  "Property Report",
  "Owner Report",
  "Channel Report",
  "Commission Report",
];
const dateBasisOptions: { value: ReportDateBasis; label: string }[] = [
  { value: "check-in", label: "Check-in date" },
  { value: "guest-payment", label: "Guest payment date" },
  { value: "owner-payment", label: "Owner payment date" },
];

export default function Reports() {
  const { properties, reservations, reservationMonths, rules, services, boatOnlyOrders, notify } = useApp();
  const [params] = useSearchParams();
  const [type, setType] = useState(types[0]);
  const [month, setMonth] = useState(() => {
    const selected = params.get("month");
    return selected && reservationMonths.includes(selected) ? selected : "2026-07";
  });
  const [range, setRange] = useState(() => monthDateRange(month));
  const [basis, setBasis] = useState<ReportDateBasis>("check-in");
  const [property, setProperty] = useState(params.get("property") || "");
  const [owner, setOwner] = useState("");
  const [pms, setPms] = useState("");
  const [source, setSource] = useState("");
  const rangeError = (range.from && !isCalendarDate(range.from)) || (range.to && !isCalendarDate(range.to))
    ? "Enter valid dates."
    : range.from && range.to && range.from > range.to
      ? "To date must be on or after From date."
      : "";
  const period = rangeError ? "" : describeDateRange(range);
  const basisLabel = dateBasisOptions.find((option) => option.value === basis)?.label;
  const matchingProperties = properties.filter((p) =>
    (!property || p.id === property) && (!owner || p.owner === owner) && (!pms || p.pmsProvider === pms),
  );
  const propertyIds = new Set(matchingProperties.map((p) => p.id));
  const eligibleReservations = reservations.filter((r) =>
    propertyIds.has(r.propertyId) && (!pms || r.pmsProvider === pms) && (!source || r.source === source),
  );
  const reportRows = rangeError ? [] : reservationReportRows(eligibleReservations, basis, range);
  const rows = reportRows.map(({ reservation }) => reservation);
  const paymentColumn = basis === "check-in" ? undefined : {
    label: basis === "guest-payment" ? "Guest payments in period" : "Owner payments in period",
    byReservation: new Map(reportRows.map(({ reservation, payments }) => [reservation.id, payments])),
  };
  const receipts = rangeError ? [] : propertyReceipts(matchingProperties, eligibleReservations, range);
  const s = summarize(rows, rules);
  const boats = rangeError ? [] : boatTransferRows(services, boatOnlyOrders, reservations, properties, { range, property, owner, pms, source });
  const boatMonths = [...services.filter((s) => s.type === "Boat Transfer"), ...boatOnlyOrders]
    .map((order) => order.date.slice(0, 7));
  const paymentMonths = reservations.flatMap((reservation) => [...reservation.guestPayments, ...reservation.ownerPayments]
    .flatMap(({ paidAt }) => paidAt ? [paidAt.slice(0, 7)] : []));

  function selectMonth(value: string) {
    setMonth(value);
    if (value !== "custom") setRange(value ? monthDateRange(value) : { from: "", to: "" });
  }

  function updateDate(bound: keyof DateRange, value: string) {
    const next = { ...range, [bound]: value };
    setRange(next);
    setMonth(next.from || next.to ? "custom" : "");
  }
  const groupLabel =
    type === "Owner Report"
      ? "Owner"
      : type === "Channel Report"
        ? "Booking source"
        : type === "Commission Report"
          ? "Commission source"
          : "Property";
  const groupName = (r: (typeof rows)[number]) => {
    const property = properties.find((p) => p.id === r.propertyId)!;
    if (type === "Owner Report") return property.owner || "No owner recorded";
    if (type === "Channel Report") return r.source;
    if (type === "Commission Report") {
      return `${property.name} + ${r.source}${r.commissionOverride ? " · Manual override" : ""}`;
    }
    return property.name;
  };
  const groupsByLabel = new Map<string, typeof rows>();
  for (const row of rows) {
    const label = groupName(row);
    const group = groupsByLabel.get(label);
    if (group) group.push(row);
    else groupsByLabel.set(label, [row]);
  }
  const groups = [...groupsByLabel].map(([label, rows]) => ({ label, rows }));
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
      <div className="filter-toolbar report-filters">
        <div className="filter-group" role="group" aria-label="Date filters">
          <Select
            label="Date basis"
            value={basis}
            onChange={(value) => setBasis(value as ReportDateBasis)}
            options={dateBasisOptions}
          />
          <MonthFilter
            value={month}
            onChange={selectMonth}
            additionalMonths={[...reservationMonths, ...paymentMonths, ...boatMonths]}
            allowCustomRange
          />
          {(["from", "to"] as const).map((bound) => (
            <label key={bound} className="inline-date report-date-field">
              <span>{bound === "from" ? "From" : "To"}</span>
              <input
                type="date"
                min="0001-01-01"
                max="9999-12-31"
                value={range[bound]}
                onInput={(event) => updateDate(bound, event.currentTarget.value)}
                aria-invalid={rangeError ? true : undefined}
                aria-describedby={rangeError ? "report-date-error" : undefined}
              />
            </label>
          ))}
        </div>
        <div className="filter-group">
          <PropertyFilter value={property} onChange={setProperty} />
          <Select
            label="Owner"
            value={owner}
            onChange={setOwner}
            options={[
              { value: "", label: "All owners" },
              ...[...new Set(properties.map((p) => p.owner).filter(Boolean))]
                .map((name) => ({ value: name, label: name })),
            ]}
          />
          <OriginFilter value={pms} onChange={setPms} />
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
      {rangeError ? (
        <p className="report-warning" id="report-date-error" role="alert">{rangeError}</p>
      ) : (
        <>
          <div className="report-heading">
            <FileSpreadsheet size={18} />
            <h2>{type}</h2>
            <span>{rows.length} reservations · IDR</span>
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
              {s.review} reservations need financial review. Calculated commissions and owner totals
              require a matching rule or manual override.
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
          <PropertyReceiptsReport rows={receipts} period={period} />
          <section className="panel spaced-panel" aria-labelledby="report-reservation-details">
            <div className="panel-heading">
              <h2 id="report-reservation-details">Reservation detail</h2>
              <span className="muted subtle">
                {basisLabel} · {period}
              </span>
            </div>
            <ReservationTable rows={rows} paymentColumn={paymentColumn} />
          </section>
          <BoatTransferReport rows={boats} period={period} />
          <div className="workspace-footnote">
            Prototype export confirms the action; XLSX generation can be added
            later. Booking figures and outstanding amounts reflect the full reservations in the results.
          </div>
        </>
      )}
    </>
  );
}
