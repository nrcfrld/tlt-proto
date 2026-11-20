import { Info } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PageHeader, Badge } from "../components/UI";
export default function Settings() {
  const { reservations, properties } = useApp();
  return (
    <>
      <PageHeader
        title="Settings"
        description="Workspace defaults and assumptions for the TLT prototype."
      />
      <section className="panel settings-panel">
        <div className="panel-heading">
          <h2>Workspace defaults</h2>
          <Badge kind="neutral">Prototype</Badge>
        </div>
        <dl className="settings-list">
          <div>
            <dt>Company</dt>
            <dd>TLT · The Lembongan Traveller</dd>
          </div>
          <div>
            <dt>Reporting currency</dt>
            <dd>IDR (Rp)</dd>
          </div>
          <div>
            <dt>Default reporting month</dt>
            <dd>July 2026</dd>
          </div>
          <div>
            <dt>Demo data coverage</dt>
            <dd>January–December 2026 · synthetic annual scenarios</dd>
          </div>
          <div>
            <dt>Mock portfolio</dt>
            <dd>
              {properties.length} properties · {reservations.length}{" "}
              reservations
            </dd>
          </div>
          <div>
            <dt>Session state</dt>
            <dd>Local React state · resets on refresh</dd>
          </div>
          <div>
            <dt>PMS connections</dt>
            <dd>Simulated Guesty and GuestPro</dd>
          </div>
        </dl>
      </section>
      <section className="panel settings-panel spaced-panel">
        <div className="panel-heading">
          <h2>Prototype assumptions</h2>
          <Info size={18} className="muted" />
        </div>
        <ol className="assumptions">
          <li>
            TLT and agent commissions vary by property, source and effective
            dates.
          </li>
          <li>
            Owner payable = booking value − TLT commission − agent commission.
            Each commission is rounded to cents before deduction.
          </li>
          <li>
            Multiple owner payments are supported without an arbitrary limit.
            Recording more than the remaining payable is prevented.
          </li>
          <li>
            Deposit and balance fields track scheduled guest payments. Their
            exact business meaning is still being validated.
          </li>
          <li>
            Boat Order includes standalone orders and transfers linked to a
            reservation. The boat report groups values by service date and status.
            Boat amounts are separate from booking revenue, commissions and owner settlement.
          </li>
          <li>
            Demo amounts are illustrative IDR values. Conversion from AUD or
            another source currency requires an agreed exchange-rate policy.
          </li>
          <li>
            Full-refund reservations have zero booking financial value. Other
            cancellations retain imported value and require review.
          </li>
          <li>
            Reservations without one active matching rule show unresolved
            financials and are excluded from commission and owner totals.
          </li>
          <li>
            Guesty and GuestPro remain the operational PMS platforms. All
            integration activity is simulated.
          </li>
        </ol>
        <div className="settings-footer">
          These assumptions are provisional and should be validated at the next
          client meeting.
        </div>
      </section>
    </>
  );
}
