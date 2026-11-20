import { Link } from "react-router-dom";
import { money } from "../utils/currency";
import type { propertyReceipts } from "../utils/reservationReports";
import { Empty } from "./UI";

export function PropertyReceiptsReport({ rows, period }: {
  rows: ReturnType<typeof propertyReceipts>;
  period: string;
}) {
  return (
    <section className="panel spaced-panel" aria-labelledby="property-receipts-title">
      <div className="panel-heading">
        <div>
          <h2 id="property-receipts-title">Dana masuk per properti</h2>
          <p>Total pembayaran guest yang tercatat diterima, sebelum potongan.</p>
        </div>
        <span className="muted subtle">Guest payment date · {period}</span>
      </div>
      {rows.length ? (
        <div className="table-scroll" role="region" tabIndex={0} aria-label="Dana masuk per properti">
          <table>
            <thead>
              <tr>
                <th scope="col">Property</th>
                <th scope="col" className="num">Dana masuk (IDR)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ property, amount }) => (
                <tr key={property.id}>
                  <td>
                    <Link className="text-link" to={`/properties/${property.id}`}>{property.name}</Link>
                  </td>
                  <td className="num">{money(amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <Empty>No properties match the selected filters.</Empty>}
    </section>
  );
}
