import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Plus,
  Ship,
  Pencil,
  CircleCheck,
  Info,
  ExternalLink,
  Wallet,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { calculateFinancials } from "../utils/financial";
import { money, percent } from "../utils/currency";
import { date } from "../utils/dates";
import { Badge, Button, Field, PMS } from "../components/UI";
import {
  GuestPaymentForm,
  PaymentForm,
  ServiceForm,
} from "../components/Forms";
import type { AdditionalService } from "../types";
import { ReservationCommissionForm, ReservationCommissionHistory } from "../components/ReservationCommission";

function ReservationRemarks({
  reservationId,
  remarks = "",
}: {
  reservationId: string;
  remarks?: string;
}) {
  const { saveReservationRemarks } = useApp();
  const [draft, setDraft] = useState(remarks);
  const cleaned = draft.trim();

  return (
    <form
      className="reservation-remarks"
      onSubmit={(event) => {
        event.preventDefault();
        if (cleaned === remarks) return;
        saveReservationRemarks(reservationId, cleaned);
        setDraft(cleaned);
      }}
    >
      <Field label="Remarks">
        <textarea
          name="remarks"
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a note about this reservation"
        />
      </Field>
      <Button type="submit" className="small" disabled={cleaned === remarks}>
        Save remarks
      </Button>
    </form>
  );
}

export default function ReservationDetail() {
  const { id } = useParams();
  const { reservations, properties, rules, services } = useApp();
  const r = reservations.find((r) => r.id === id);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [editing, setEditing] = useState<AdditionalService>();
  const [guestPayment, setGuestPayment] = useState("");
  const [commissionOpen, setCommissionOpen] = useState(false);
  if (!r)
    return (
      <div className="empty">
        <h1>Reservation not found</h1>
        <Link className="text-link" to="/reservations">
          Return to reservations
        </Link>
      </div>
    );
  const p = properties.find((p) => p.id === r.propertyId)!;
  const isManual = r.pmsProvider === "manual";
  const f = calculateFinancials(r, rules);
  const ownServices = services.filter((s) => s.reservationId === r.id);
  return (
    <>
      <Link className="back-link" to={isManual ? `/reservations?month=${r.checkIn.slice(0, 7)}&origin=manual` : "/reservations"}>
        <ArrowLeft size={15} />
        {isManual ? "Back to manual reservations" : "All reservations"}
      </Link>
      <header className="reservation-heading">
        <div>
          <div className="reservation-title-line">
            <h1>{r.guestName}</h1>
            <Badge>{r.status}</Badge>
          </div>
          <p>
            {p.name}
            <span>·</span>
            {date(r.checkIn)} — {date(r.checkOut)}
            <span>·</span>
            {r.nights} nights
          </p>
        </div>
        <div className="reservation-reference">
          <PMS provider={r.pmsProvider} />
          <span>{r.externalId}</span>
        </div>
      </header>
      {f.needsReview && (
        <div className="review-banner">
          <Info size={17} />
          <div>
            <strong>Financial review required</strong>
            <p>
              {f.ownerCredit > 0
                ? "Recorded owner payments exceed the revised payable. Review the overpayment credit before further settlement."
                : !f.commission
                  ? "Set the commission for this reservation or enable a matching rule before settling the owner."
                  : "This cancelled booking retains its booking value. Confirm the refund treatment before settling the owner."}
            </p>
          </div>
          <Link
            className="text-link"
            to={`/financials/commission-rules?property=${r.propertyId}`}
          >
            Review rules
          </Link>
        </div>
      )}
      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel booking-panel">
            <div className="panel-heading">
              <h2>Booking information</h2>
              <span className="muted subtle">{isManual ? "Manual reservation" : "Imported reservation"}</span>
            </div>
            <div className="info-grid">
              {[
                ["Booking reference", r.externalId],
                ["Guest", r.guestName],
                ["Property", p.name],
                ["Unit / villa", r.unit || "—"],
                ["Check-in", date(r.checkIn)],
                ["Check-out", date(r.checkOut)],
                ["Nights", String(r.nights)],
                ["Booking source", r.source],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
              <div>
                <dt>{isManual ? "Record origin" : "PMS platform"}</dt>
                <dd>
                  <PMS provider={r.pmsProvider} />
                </dd>
              </div>
              <div>
                <dt>Reservation status</dt>
                <dd>
                  <Badge>{r.status}</Badge>
                </dd>
              </div>
              <ReservationRemarks key={r.id} reservationId={r.id} remarks={r.remarks} />
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Guest payment</h2>
                <p>Track deposits and the remaining booking balance</p>
              </div>
              <Badge>{f.guestOutstanding > 0 ? "Outstanding" : "Paid"}</Badge>
            </div>
            <div className="guest-payments">
              {r.guestPayments.map((payment) => (
                <div className="guest-payment" key={payment.id}>
                  <div className="guest-payment-title">
                    <h3>{payment.kind}</h3>
                    <Badge>{payment.paidAt ? "Paid" : "Outstanding"}</Badge>
                  </div>
                  <strong className="guest-payment-amount">
                    {money(payment.amount)}
                  </strong>
                  <dl>
                    <div>
                      <dt>Invoice date</dt>
                      <dd>{date(payment.invoiceDate)}</dd>
                    </div>
                    <div>
                      <dt>Paid date</dt>
                      <dd>{date(payment.paidAt)}</dd>
                    </div>
                  </dl>
                  {payment.note && (
                    <p className="payment-note">{payment.note}</p>
                  )}
                  {!payment.paidAt && payment.amount > 0 && (
                    <Button
                      className="small"
                      onClick={() => setGuestPayment(payment.id)}
                    >
                      Record guest payment
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="section-total">
              <span>Outstanding guest balance</span>
              <strong>{money(f.guestOutstanding)}</strong>
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Additional services</h2>
                <p>Services managed directly by TLT</p>
              </div>
              <Button
                className="small"
                onClick={() => {
                  setEditing(undefined);
                  setServiceOpen(true);
                }}
              >
                <Plus size={14} />
                Add service
              </Button>
            </div>
            {ownServices.length ? (
              ownServices.map((s) => (
                <div key={s.id} className="service-row">
                  <span className="service-icon">
                    <Ship size={21} />
                  </span>
                  <div className="service-info">
                    <div>
                      <h3>{s.type}</h3>
                      <Badge>{s.status}</Badge>
                    </div>
                    <p>
                      {s.adultQty} adults · {s.childrenQty} children ·{" "}
                      {s.focQty} FOC · {date(s.date)}
                    </p>
                    {s.notes && <small>{s.notes}</small>}
                    {s.type === "Boat Transfer" && (
                      <p>
                        Boat company: {s.boatCompany || "—"} · Departure: {s.departureTime || "—"}
                        {" "}· Return: {s.returnTime || "—"}
                      </p>
                    )}
                  </div>
                  <strong>{money(s.amount)}</strong>
                  <button
                    className="icon-button"
                    aria-label={`Edit ${s.type}`}
                    onClick={() => {
                      setEditing(s);
                      setServiceOpen(true);
                    }}
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              ))
            ) : (
              <div className="small-empty">
                No additional services recorded.
              </div>
            )}
            <div className="section-note">
              <Info size={13} />
              Service amounts are tracked separately from owner settlement.
            </div>
          </section>
        </div>
        <div className="detail-side">
          <section className="panel financial-panel">
            <div className="panel-heading">
              <h2>Financial breakdown</h2>
              {r.status === "Cancelled - Full Refund" ? <span className="currency-chip">IDR</span> : (
                <Button className="small" onClick={() => setCommissionOpen(true)}>
                  <Pencil size={14} /> Edit commission
                </Button>
              )}
            </div>
            <div className="financial-lines">
              <div>
                <span>Total booking</span>
                <strong>{money(f.bookingValue)}</strong>
              </div>
              {r.status === "Cancelled - Full Refund" && (
                <p className="refund-note">
                  Original {money(r.totalBooking)} · refunded in full
                </p>
              )}
              <div className="deduction">
                <span>
                  TLT commission{" "}
                  <small>
                    {f.commission?.method === "percent" ? percent(f.commission.tlt) : null}
                  </small>
                </span>
                <strong>{f.commission ? `−${money(f.tltCommission)}` : "—"}</strong>
              </div>
              <div className="deduction">
                <span>
                  Other agent commission{" "}
                  <small>
                    {f.commission?.method === "percent" ? percent(f.commission.agent) : null}
                  </small>
                </span>
                <strong>{f.commission ? `−${money(f.agentCommission)}` : "—"}</strong>
              </div>
              <div className="owner-total">
                <span>Total to owner</span>
                <strong>
                  {f.commission || !f.bookingValue
                    ? money(f.ownerPayable)
                    : "Needs commission"}
                </strong>
              </div>
            </div>
            <div className="applied-rule">
              <span>Commission source</span>
              <strong>
                {r.commissionOverride ? "Manual override" : f.rule ? `${p.name} + ${r.source}` : "No applicable rule"}
              </strong>
              {f.rule && !r.commissionOverride && (
                <Link
                  className="text-link"
                  to={`/financials/commission-rules?rule=${f.rule.id}&property=${r.propertyId}`}
                >
                  View rule
                  <ExternalLink size={12} />
                </Link>
              )}
            </div>
            <div className="formula-note">
              <Info size={13} />
              <p>
                Provisional formula: booking value less TLT and agent
                commissions. Subject to business validation.
              </p>
            </div>
          </section>
          <ReservationCommissionHistory history={r.commissionHistory} />
          <section className="panel settlement-panel">
            <div className="panel-heading">
              <div>
                <h2>Owner settlement</h2>
                <p>{p.owner || "No owner recorded"}</p>
              </div>
              <Wallet size={18} className="muted" />
            </div>
            <div className="settlement-summary">
              <div>
                <span>Owner payable</span>
                <strong>{f.commission ? money(f.ownerPayable) : "—"}</strong>
              </div>
              <div>
                <span>Total paid</span>
                <strong>{money(f.ownerPaid)}</strong>
              </div>
              <div className="remaining">
                <span>Remaining payable</span>
                <strong>{f.commission ? money(f.ownerOutstanding) : "—"}</strong>
              </div>
              {f.ownerCredit > 0 && (
                <div>
                  <span>Overpayment credit · review</span>
                  <strong>{money(f.ownerCredit)}</strong>
                </div>
              )}
            </div>
            <div className="payment-history">
              <h3>
                Payment history <span>{r.ownerPayments.length}</span>
              </h3>
              {r.ownerPayments.length ? (
                r.ownerPayments.map((payment, index) => (
                  <div className="history-item" key={payment.id}>
                    <span className="history-check">
                      <CircleCheck size={16} />
                    </span>
                    <div>
                      <div>
                        <strong>Payment #{index + 1}</strong>
                        <strong>{money(payment.amount)}</strong>
                      </div>
                      <span>{date(payment.paidAt)}</span>
                      <p>{payment.note || "No note recorded"}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="small-empty">No payments recorded yet.</p>
              )}
            </div>
            <div className="settlement-action">
              <Button
                primary
                className="full-width"
                disabled={!f.commission || f.needsReview || f.ownerOutstanding <= 0}
                onClick={() => setPaymentOpen(true)}
              >
                <Plus size={15} />
                {f.ownerOutstanding <= 0 && f.commission && !f.needsReview
                  ? "Fully settled"
                  : "Record payment"}
              </Button>
            </div>
          </section>
          <Link
            className="detail-report-link"
            to={`/reports?property=${r.propertyId}${isManual ? `&month=${r.checkIn.slice(0, 7)}` : ""}`}
          >
            <ArrowUpRight size={16} />
            View property financial report
          </Link>
        </div>
      </div>
      <div className="workspace-footnote">
        Mock PMS data · Financial changes remain in this demo session. Guest
        payment field meanings are subject to validation.
      </div>
      {paymentOpen && (
        <PaymentForm reservation={r} onClose={() => setPaymentOpen(false)} />
      )}{" "}
      {commissionOpen && (
        <ReservationCommissionForm reservation={r} onClose={() => setCommissionOpen(false)} />
      )}
      {serviceOpen && (
        <ServiceForm
          reservation={r}
          service={editing}
          onClose={() => setServiceOpen(false)}
        />
      )}{" "}
      {guestPayment && (
        <GuestPaymentForm
          reservation={r}
          paymentId={guestPayment}
          onClose={() => setGuestPayment("")}
        />
      )}
    </>
  );
}
