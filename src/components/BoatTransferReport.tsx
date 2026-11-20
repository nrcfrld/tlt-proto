import { BoatOrderTable } from "./BoatOrderTable";
import { money } from "../utils/currency";
import { summarizeBoatTransfers, type BoatTransferRow } from "../utils/boatTransfers";

export function BoatTransferReport({ rows, period }: { rows: BoatTransferRow[]; period: string }) {
  const totals = summarizeBoatTransfers(rows);
  return (
    <section className="panel spaced-panel" aria-labelledby="boat-report-title">
      <div className="panel-heading">
        <div>
          <h2 id="boat-report-title">Boat transfer report</h2>
          <p>Separate from accommodation revenue, commissions and owner payable.</p>
        </div>
        <span className="muted subtle">Service date · {period}</span>
      </div>
      <div className="table-caption boat-report-totals">
        <strong>{rows.length} boat transfer{rows.length === 1 ? "" : "s"}</strong>
        <span>Confirmed value <strong>{money(totals.confirmed)}</strong></span>
        <span>Pending value <strong>{money(totals.pending)}</strong></span>
      </div>
      <BoatOrderTable rows={rows} />
      <div className="table-bottom">
        <span>Confirmed and pending values are shown separately. {totals.cancelled} cancelled transfers excluded from both totals.</span>
      </div>
    </section>
  );
}
