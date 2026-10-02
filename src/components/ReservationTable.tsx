import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { calculateFinancials } from "../utils/financial";
import { money, percent } from "../utils/currency";
import { shortDate } from "../utils/dates";
import type { Reservation } from "../types";
import { Badge, Empty, PMS } from "./UI";
export function ReservationTable({
  rows,
  compact = false,
}: {
  rows: Reservation[];
  compact?: boolean;
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
            <th>Source / PMS</th>
            <th className="num">Total booking</th>
            <th className="num">TLT commission</th>
            {!compact && <th className="num">Agent commission</th>}
            <th className="num">Owner payable</th>
            <th>Status</th>
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
                    {r.unit}
                    <span className="cell-sub ref">{r.externalId}</span>
                  </td>
                )}
                <td className="nowrap">
                  {shortDate(r.checkIn)} — {shortDate(r.checkOut)}
                  <span className="cell-sub">{r.nights} nights</span>
                </td>
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
                  {f.rule ? money(f.tltCommission) : "—"}
                  <span className="cell-sub">
                    {f.rule
                      ? percent(f.rule.tltCommissionRate)
                      : "No active rule"}
                  </span>
                </td>
                {!compact && (
                  <td className="num">
                    {f.rule ? money(f.agentCommission) : "—"}
                    <span className="cell-sub">
                      {f.rule
                        ? percent(f.rule.agentCommissionRate)
                        : "Needs review"}
                    </span>
                  </td>
                )}
                <td className="num owner-value">
                  {f.rule || !f.bookingValue ? money(f.ownerPayable) : "—"}
                </td>
                <td>
                  <Badge>{r.status}</Badge>
                  {f.needsReview && (
                    <span className="cell-sub review-text">
                      Financial review
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
