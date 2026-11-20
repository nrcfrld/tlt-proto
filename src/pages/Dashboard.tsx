import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Building2,
  CircleAlert,
  RefreshCw,
  ChevronRight,
  Wallet,
  CreditCard,
  FileWarning,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { calculateFinancials, summarize } from "../utils/financial";
import { compactMoney, money } from "../utils/currency";
import {
  Metrics,
  MonthFilter,
  PageHeader,
  PropertyFilter,
} from "../components/UI";
import { FinancialCharts } from "../components/FinancialCharts";
import { ReservationTable } from "../components/ReservationTable";
export default function Dashboard() {
  const { reservations, reservationMonths, rules, properties } = useApp();
  const [month, setMonth] = useState("2026-07");
  const [property, setProperty] = useState("");
  const rows = reservations.filter(
    (r) =>
      (!month || r.checkIn.startsWith(month)) &&
      (!property || r.propertyId === property),
  );
  const s = summarize(rows, rules);
  const revenue = properties
    .map((p) => ({
      ...p,
      value: summarize(
        rows.filter((r) => r.propertyId === p.id),
        rules,
      ).booking,
      count: rows.filter((r) => r.propertyId === p.id).length,
    }))
    .sort((a, b) => b.value - a.value)
    .filter((p) => p.count);
  const ownerCount = rows.filter(
    (r) => calculateFinancials(r, rules).ownerOutstanding > 0,
  ).length;
  const guestCount = rows.filter(
    (r) => calculateFinancials(r, rules).guestOutstanding > 0,
  ).length;
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your portfolio’s financial performance, in one place."
        actions={
          <Link className="button" to="/reports">
            <ArrowUpRight size={16} />
            View reports
          </Link>
        }
      />
      <div className="filter-toolbar dashboard-filters">
        <div className="filter-group">
          <MonthFilter value={month} onChange={setMonth} additionalMonths={reservationMonths} />
          <PropertyFilter value={property} onChange={setProperty} />
        </div>
        <span className="muted subtle">
          <span className="live-dot" />
          Demo data · Jan–Dec 2026
        </span>
      </div>
      <Metrics
        compact
        items={[
          {
            label: "Total booking value",
            value: s.booking,
            note: `${rows.length} reservations across ${revenue.length} properties`,
          },
          {
            label: "TLT commission",
            value: s.tlt,
                note: "Calculated from rules and reservation overrides",
            accent: true,
          },
          {
            label: "Owner payable",
            value: s.owner,
            note: "After TLT and agent commissions",
          },
          {
            label: "Reservations",
            value: rows.length,
            count: true,
            note: `${rows.filter((r) => r.status.startsWith("Cancelled")).length} cancelled / refunded`,
          },
          {
            label: "Guest outstanding",
            value: s.guestOutstanding,
            note: `${guestCount} balances awaiting payment`,
          },
        ]}
      />
      <FinancialCharts
        month={month}
        property={property}
        onSelectMonth={setMonth}
      />
      <div className="dashboard-grid">
        <section className="panel revenue-panel">
          <div className="panel-heading">
            <div>
              <h2>Revenue by property</h2>
              <p>
                Booking value ·{" "}
                {month === "2026-07" ? "July 2026" : month || "All months"}
              </p>
            </div>
            <Building2 size={18} className="muted" />
          </div>
          <div className="revenue-bars">
            {revenue.slice(0, 6).map((p, i) => (
              <Link
                key={p.id}
                to={`/properties/${p.id}`}
                className="revenue-row"
              >
                <div className="revenue-name">
                  <span>{p.name}</span>
                  <span title={money(p.value)} aria-label={money(p.value)}>{compactMoney(p.value)}</span>
                </div>
                <div className="bar-track">
                  <div
                    style={{
                      width: `${(p.value / (revenue[0]?.value || 1)) * 100}%`,
                    }}
                    className={i === 0 ? "bar first" : "bar"}
                  />
                </div>
                <small>{p.count} reservations</small>
              </Link>
            ))}
            {!revenue.length && (
              <p className="muted">No booking activity for this period.</p>
            )}
          </div>
          <Link className="panel-footer" to="/properties">
            View all properties
            <ChevronRight size={16} />
          </Link>
        </section>
        <section className="panel attention-panel">
          <div className="panel-heading">
            <div>
              <h2>Needs attention</h2>
              <p>Keep settlements moving</p>
            </div>
            <CircleAlert size={18} className="amber-icon" />
          </div>
          <div className="attention-list">
            {[
              {
                icon: Wallet,
                count: ownerCount,
                title: "Owner settlements outstanding",
                caption: "Review payable amounts and record payments",
                to: "/financials/owner-payments",
              },
              {
                icon: CreditCard,
                count: guestCount,
                title: "Guest balances unpaid",
                caption: "Check deposits and remaining balances",
                to: "/reservations?financial=Guest%20outstanding",
              },
              {
                icon: FileWarning,
                count: s.review,
                title: "Reservations need financial review",
                caption: "Check cancellations and commission rules",
                to: "/reservations?financial=Needs%20review",
              },
              {
                icon: RefreshCw,
                count: 1,
                title: "Property mapping needs attention",
                caption: "Gecko Villa & Bungalows · GuestPro",
                to: "/properties/gecko-villa-bungalows",
              },
            ].map((a) => (
              <Link key={a.title} to={a.to} className="attention-item">
                <span className="attention-icon">
                  <a.icon size={18} />
                </span>
                <div>
                  <strong>
                    <span>{a.count}</span> {a.title}
                  </strong>
                  <p>{a.caption}</p>
                </div>
                <ChevronRight size={16} />
              </Link>
            ))}
          </div>
          <div className="attention-note">
            Owner amounts require a matching rule or a manual override.
          </div>
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-heading">
          <div>
            <h2>Recent reservations</h2>
            <p>Bookings from PMS platforms and manual records</p>
          </div>
          <Link className="text-link" to="/reservations">
            View all reservations
            <ChevronRight size={15} />
          </Link>
        </div>
        <ReservationTable rows={rows.slice(0, 5)} compact />
      </section>
      <div className="workspace-footnote">
        IDR · Financial calculations are provisional. Guesty and GuestPro remain
        your operational PMS.
      </div>
    </>
  );
}
