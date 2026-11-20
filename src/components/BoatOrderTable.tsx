import { Pencil } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, Empty } from "./UI";
import { money } from "../utils/currency";
import { date } from "../utils/dates";
import type { BoatTransferRow } from "../utils/boatTransfers";

export function BoatOrderTable({
  rows,
  onEdit,
}: {
  rows: BoatTransferRow[];
  onEdit?: (row: BoatTransferRow) => void;
}) {
  if (!rows.length) return <Empty>No boat orders match the selected filters.</Empty>;

  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Boat order table">
      <table className="boat-order-table">
        <thead>
          <tr>
            <th scope="col">Service date</th>
            <th scope="col">Guest / reservation</th>
            <th scope="col">Boat company</th>
            <th scope="col">Departure</th>
            <th scope="col">Return</th>
            <th scope="col">Passengers</th>
            <th scope="col" className="num">Amount (IDR)</th>
            <th scope="col">Status</th>
            {onEdit && <th scope="col">Edit</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { service } = row;
            const guest = row.kind === "linked" ? row.reservation.guestName : row.service.guestName;
            return (
              <tr key={service.id}>
                <td>{date(service.date)}</td>
                <td className="boat-order-guest">
                  {row.kind === "linked" ? (
                    <>
                      <Link className="text-link" to={`/reservations/${row.reservation.id}`}>{guest}</Link>
                      <span className="cell-sub">{row.property.name} · {row.reservation.externalId}</span>
                    </>
                  ) : (
                    <>
                      <strong>{guest}</strong>
                      <span className="cell-sub">Boat only</span>
                    </>
                  )}
                </td>
                <td className="boat-order-company">{service.boatCompany || "—"}</td>
                <td>{service.departureTime || "—"}</td>
                <td>{service.returnTime || "—"}</td>
                <td>
                  {service.adultQty} adults
                  <span className="cell-sub">{service.childrenQty} children · {service.focQty} FOC</span>
                </td>
                <td className="num">{money(service.amount)}</td>
                <td><Badge>{service.status}</Badge></td>
                {onEdit && (
                  <td>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Edit boat order for ${guest}`}
                      onClick={() => onEdit(row)}
                    >
                      <Pencil size={14} />
                    </button>
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
