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
import { Badge, Button, PMS } from "../components/UI";
import {
  GuestPaymentForm,
  PaymentForm,
  ServiceForm,
} from "../components/Forms";
import type { AdditionalService } from "../types";
export default function ReservationDetail() {
  const { id } = useParams();
  const { reservations, properties, rules, services } = useApp();
  const r = reservations.find((r) => r.id === id);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [editing, setEditing] = useState<AdditionalService>();
  const [guestPayment, setGuestPayment] = useState("");
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
  const f = calculateFinancials(r, rules);
  const ownServices = services.filter((s) => s.reservationId === r.id);
  return (
    <>
      <Link className="back-link" to="/reservations">
        <ArrowLeft size={15} />
        All reservations
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
                : !f.rule
                  ? "No single active commission rule covers this property, source and check-in date. Add or enable a rule before settling the owner."
                  : "This cancelled booking retains its imported amount. Confirm the refund treatment before settling the owner."}
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
              <span className="muted subtle">Imported reservation</span>
            </div>
            <div className="info-grid">
              {[
                ["Booking reference", r.externalId],
                ["Guest", r.guestName],
                ["Property", p.name],
                ["Unit / villa", r.unit],
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
                <dt>PMS platform</dt>
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
              <span className="currency-chip">USD</span>
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
                    {f.rule ? percent(f.rule.tltCommissionRate) : "—"}
                  </small>
                </span>
                <strong>{f.rule ? `−${money(f.tltCommission)}` : "—"}</strong>
              </div>
              <div className="deduction">
                <span>
                  Other agent commission{" "}
                  <small>
                    {f.rule ? percent(f.rule.agentCommissionRate) : "—"}
                  </small>
                </span>
                <strong>{f.rule ? `−${money(f.agentCommission)}` : "—"}</strong>
              </div>
              <div className="owner-total">
                <span>Total to owner</span>
                <strong>
                  {f.rule || !f.bookingValue
                    ? money(f.ownerPayable)
                    : "Needs rule"}
                </strong>
              </div>
            </div>
            <div className="applied-rule">
              <span>Applied commission rule</span>
              <strong>
                {f.rule ? `${p.name} + ${r.source}` : "No applicable rule"}
              </strong>
              {f.rule && (
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
          <section className="panel settlement-panel">
            <div className="panel-heading">
              <div>
                <h2>Owner settlement</h2>
                <p>{p.owner}</p>
              </div>
              <Wallet size={18} className="muted" />
            </div>
            <div className="settlement-summary">
              <div>
                <span>Owner payable</span>
                <strong>{f.rule ? money(f.ownerPayable) : "—"}</strong>
              </div>
              <div>
                <span>Total paid</span>
                <strong>{money(f.ownerPaid)}</strong>
              </div>
              <div className="remaining">
                <span>Remaining payable</span>
                <strong>{f.rule ? money(f.ownerOutstanding) : "—"}</strong>
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
                disabled={!f.rule || f.needsReview || f.ownerOutstanding <= 0}
                onClick={() => setPaymentOpen(true)}
              >
                <Plus size={15} />
                {f.ownerOutstanding <= 0 && f.rule
                  ? "Fully settled"
                  : "Record payment"}
              </Button>
            </div>
          </section>
          <Link
            className="detail-report-link"
            to={`/reports?property=${r.propertyId}`}
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
