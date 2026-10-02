import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { calculateFinancials, summarize } from "../utils/financial";
import { money } from "../utils/currency";
import { date } from "../utils/dates";
import type { Reservation } from "../types";
import {
  Badge,
  Button,
  Empty,
  Metrics,
  MonthFilter,
  PageHeader,
  PropertyFilter,
  Select,
} from "../components/UI";
import { PaymentForm } from "../components/Forms";
export default function OwnerPayments() {
  const { reservations, properties, rules } = useApp();
  const [property, setProperty] = useState("");
  const [month, setMonth] = useState("2026-07");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Reservation>();
  const rows = reservations
    .filter(
      (r) =>
        (!property || r.propertyId === property) &&
        (!month || r.checkIn.startsWith(month)),
    )
    .filter((r) => {
      const f = calculateFinancials(r, rules);
      return (
        !status ||
        (status === "Outstanding"
          ? f.ownerOutstanding > 0
          : status === "Settled"
            ? f.ownerOutstanding === 0 && !f.needsReview
            : f.needsReview)
      );
    });
  const s = summarize(rows, rules);
  return (
    <>
      <PageHeader
        title="Owner payments"
        description="Track settlements by reservation, with a complete payment history."
      />
      <div className="filter-toolbar">
        <div className="filter-group">
          <MonthFilter value={month} onChange={setMonth} />
          <PropertyFilter value={property} onChange={setProperty} />
          <Select
            label="Settlement status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "", label: "All settlements" },
              { value: "Outstanding", label: "Outstanding" },
              { value: "Settled", label: "Settled" },
              { value: "Needs review", label: "Needs review" },
            ]}
          />
        </div>
      </div>
      <Metrics
        items={[
          { label: "Owner payable", value: s.owner },
          {
            label: "Total paid to owners",
            value: rows.reduce(
              (sum, r) => sum + calculateFinancials(r, rules).ownerPaid,
              0,
            ),
          },
          {
            label: "Remaining payable",
            value: s.ownerOutstanding,
            accent: true,
          },
          ...(s.ownerCredit > 0
            ? [{ label: "Overpayment credit · review", value: s.ownerCredit }]
            : []),
        ]}
      />
      <section className="panel">
        {rows.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Owner / property</th>
                  <th>Reservation</th>
                  <th className="num">Owner payable</th>
                  <th className="num">Total paid</th>
                  <th className="num">Remaining</th>
                  <th>Last payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const f = calculateFinancials(r, rules);
                  const p = properties.find((p) => p.id === r.propertyId)!;
                  const last = [...r.ownerPayments].sort((a, b) =>
                    b.paidAt.localeCompare(a.paidAt),
                  )[0];
                  return (
                    <tr key={r.id}>
                      <td>
                        <strong>{p.owner}</strong>
                        <span className="cell-sub">{p.name}</span>
                      </td>
                      <td>
                        <Link
                          className="text-link"
                          to={`/reservations/${r.id}`}
                        >
                          {r.guestName}
                        </Link>
                        <span className="cell-sub">{r.externalId}</span>
                      </td>
                      <td className="num">
                        {f.rule ? money(f.ownerPayable) : "—"}
                      </td>
                      <td className="num">
                        {money(f.ownerPaid)}
                        <span className="cell-sub">
                          {r.ownerPayments.length} payments
                        </span>
                      </td>
                      <td className="num owner-value">
                        {f.rule ? money(f.ownerOutstanding) : "—"}
                        {f.ownerCredit > 0 && (
                          <span className="cell-sub review-text">
                            Credit {money(f.ownerCredit)} · review
                          </span>
                        )}
                      </td>
                      <td>{date(last?.paidAt)}</td>
                      <td>
                        <Badge>
                          {f.needsReview
                            ? "Needs review"
                            : f.ownerOutstanding > 0
                              ? "Outstanding"
                              : "Settled"}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          className="small"
                          disabled={f.needsReview || f.ownerOutstanding <= 0}
                          onClick={() => setEditing(r)}
                        >
                          <Plus size={13} />
                          Record
                        </Button>
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
      </section>
      <div className="workspace-footnote">
        Settlement filters use the reservation check-in month. No limit on the
        number of owner payments.
      </div>
      {editing && (
        <PaymentForm
          reservation={editing}
          onClose={() => setEditing(undefined)}
        />
      )}
    </>
  );
}
