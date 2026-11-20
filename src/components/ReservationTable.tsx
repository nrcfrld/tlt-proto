import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { calculateFinancials, financialStatus } from "../utils/financial";
import { money, percent } from "../utils/currency";
import { date, shortDate } from "../utils/dates";
import type { ReportPayment } from "../utils/reservationReports";
import type { Reservation } from "../types";
import { Badge, Empty, PMS } from "./UI";
export function ReservationTable({
  rows,
  compact = false,
  showRemarks = false,
  paymentColumn,
}: {
  rows: Reservation[];
  compact?: boolean;
  showRemarks?: boolean;
  paymentColumn?: { label: string; byReservation: ReadonlyMap<string, ReportPayment[]> };
}) {
  const { properties, rules } = useApp();
  const navigate = useNavigate();
  return !rows.length ? (
    <Empty />
  ) : (
    <div className="table-scroll">
      <table className={`reservation-table ${compact ? "compact" : ""}`}>
        <thead>
          <tr>
            <th>Property / guest</th>
            {!compact && <th>Unit / booking ref</th>}
            <th>Stay dates</th>
            {paymentColumn && <th scope="col">{paymentColumn.label}</th>}
            <th>Source / origin</th>
            <th className="num">Total booking</th>
            <th className="num">TLT commission</th>
            {!compact && <th className="num">Agent commission</th>}
            <th className="num">Owner payable</th>
            <th>Reservation status</th>
            <th>Financial status</th>
            {showRemarks && <th scope="col">Remarks</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const f = calculateFinancials(r, rules);
            return (
              <tr key={r.id} onClick={() => navigate(`/reservations/${r.id}`)}>
                <td>
                  <Link className="table-title" to={`/reservations/${r.id}`}>
                    {properties.find((p) => p.id === r.propertyId)?.name}
                  </Link>
                  <span className="cell-sub">{r.guestName}</span>
                </td>
                {!compact && (
                  <td>
                    {r.unit || "—"}
                    <span className="cell-sub ref">{r.externalId}</span>
                  </td>
                )}
                <td className="nowrap">
                  {shortDate(r.checkIn)} — {shortDate(r.checkOut)}
                  <span className="cell-sub">{r.nights} nights</span>
                </td>
                {paymentColumn && (
                  <td>
                    {paymentColumn.byReservation.get(r.id)?.map((payment) => (
                      <div key={payment.id} className="report-payment-entry">
                        {money(payment.amount)}
                        <span className="cell-sub">
                          {date(payment.paidAt)}{payment.kind ? ` · ${payment.kind}` : ""}
                        </span>
                      </div>
                    ))}
                  </td>
                )}
                <td>
                  {r.source}
                  <span className="cell-sub">
                    <PMS provider={r.pmsProvider} />
                  </span>
                </td>
                <td className="num">
                  {money(f.bookingValue)}
                  {!f.bookingValue && (
                    <span className="cell-sub">Full refund</span>
                  )}
                </td>
                <td className="num">
                  {f.commission ? money(f.tltCommission) : "—"}
                  <span className="cell-sub">
                    {r.commissionOverride
                      ? "Manual override"
                      : f.rule ? percent(f.rule.tltCommissionRate) : "No active rule"}
                  </span>
                </td>
                {!compact && (
                  <td className="num">
                    {f.commission ? money(f.agentCommission) : "—"}
                    <span className="cell-sub">
                      {f.commission?.method === "percent"
                        ? percent(f.commission.agent)
                        : f.commission ? "Fixed amount" : "Needs review"}
                    </span>
                  </td>
                )}
                <td className="num owner-value">
                  {f.commission || !f.bookingValue ? money(f.ownerPayable) : "—"}
                </td>
                <td>
                  <Badge>{r.status}</Badge>
                </td>
                <td>
                  <Badge>{financialStatus(r, rules)}</Badge>
                </td>
                {showRemarks && (
                  <td>
                    <span className="reservation-remarks-preview truncated" title={r.remarks || undefined}>
                      {r.remarks || "—"}
                    </span>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
