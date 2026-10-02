import { useState, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import {
  bookingSources,
  type AdditionalService,
  type CommissionRule,
  type Reservation,
} from "../types";
import {
  calculateFinancials,
  roundMoney,
  validateRule,
} from "../utils/financial";
import { createId } from "../utils/id";
import { money } from "../utils/currency";
import { Button, Field, Modal } from "./UI";
export function RuleForm({
  rule,
  onClose,
}: {
  rule?: CommissionRule;
  onClose: () => void;
}) {
  const { properties, rules, saveRule } = useApp();
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const d = new FormData(event.currentTarget);
    const next: CommissionRule = {
      id: rule?.id || createId(),
      propertyId: String(d.get("property")),
      source: String(d.get("source")) as CommissionRule["source"],
      tltCommissionRate: Number(d.get("tlt")) / 100,
      agentCommissionRate: Number(d.get("agent")) / 100,
      effectiveFrom: String(d.get("from")),
      effectiveUntil: String(d.get("until")),
      enabled: rule?.enabled ?? true,
    };
    const error = validateRule(next, rules);
    if (error) {
      setError(error);
      return;
    }
    saveRule(next);
    onClose();
  };
  return (
    <Modal
      title={rule ? "Edit commission rule" : "Add commission rule"}
      subtitle="Rates apply to the total booking value."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="form-body">
          <div className="form-grid">
            <Field label="Property">
              <select
                name="property"
                defaultValue={rule?.propertyId || properties[0].id}
              >
                {properties.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Booking source">
              <select name="source" defaultValue={rule?.source || "TLT"}>
                {bookingSources.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="TLT commission (%)">
              <input
                name="tlt"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                defaultValue={
                  rule ? roundMoney(rule.tltCommissionRate * 100) : 20
                }
              />
            </Field>
            <Field label="Agent commission (%)">
              <input
                name="agent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                defaultValue={
                  rule ? roundMoney(rule.agentCommissionRate * 100) : 0
                }
              />
            </Field>
            <Field label="Effective from">
              <input
                name="from"
                type="date"
                required
                defaultValue={rule?.effectiveFrom || "2026-01-01"}
              />
            </Field>
            <Field label="Effective until">
              <input
                name="until"
                type="date"
                required
                defaultValue={rule?.effectiveUntil || "2026-12-31"}
              />
            </Field>
          </div>
          <p className="form-hint">
            Saving immediately recalculates matching reservations and reports.
            Overlapping active rules are not allowed.
          </p>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
        </div>
        <div className="form-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button primary type="submit">
            Save rule
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function PaymentForm({
  reservation,
  onClose,
}: {
  reservation: Reservation;
  onClose: () => void;
}) {
  const { rules, recordOwnerPayment } = useApp();
  const f = calculateFinancials(reservation, rules);
  const [error, setError] = useState("");
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const d = new FormData(event.currentTarget);
    const amount = roundMoney(Number(d.get("amount")));
    if (!f.rule || f.needsReview) {
      setError("Resolve the financial review before recording a payment.");
      return;
    }
    if (
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > f.ownerOutstanding
    ) {
      setError(
        `Enter an amount greater than zero and no more than ${money(f.ownerOutstanding)}.`,
      );
      return;
    }
    recordOwnerPayment(reservation.id, {
      id: createId(),
      amount,
      paidAt: String(d.get("date")),
      note: String(d.get("note")).trim(),
    });
    onClose();
  };
  return (
    <Modal
      title="Record owner payment"
      subtitle={`${reservation.guestName} · ${money(f.ownerOutstanding)} remaining`}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="form-body">
          <div className="form-grid">
            <Field label="Payment date">
              <input
                name="date"
                type="date"
                defaultValue="2026-07-21"
                required
              />
            </Field>
            <Field label="Amount (USD)">
              <input
                name="amount"
                type="number"
                min="0.01"
                max={f.ownerOutstanding}
                step="0.01"
                placeholder="0.00"
                required
                autoFocus
              />
            </Field>
          </div>
          <Field label="Note">
            <textarea
              name="note"
              placeholder="Bank reference or settlement note"
              maxLength={500}
            />
          </Field>
          <p className="form-hint">
            This payment is recorded against this reservation’s owner
            settlement.
          </p>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
        </div>
        <div className="form-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button primary type="submit">
            Record payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function ServiceForm({
  reservation,
  service,
  onClose,
}: {
  reservation?: Reservation;
  service?: AdditionalService;
  onClose: () => void;
}) {
  const { reservations, properties, saveService } = useApp();
  const [reservationId, setReservationId] = useState(
    reservation?.id || service?.reservationId || reservations[0].id,
  );
  const [type, setType] = useState(service?.type || "Boat Transfer");
  const [error, setError] = useState("");
  const selected = reservations.find((r) => r.id === reservationId)!;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const d = new FormData(event.currentTarget);
    const quantities = ["adults", "children", "foc"].map((k) =>
      Number(d.get(k)),
    );
    const amount = roundMoney(Number(d.get("amount")));
    if (
      quantities.some((n) => !Number.isInteger(n) || n < 0) ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      setError(
        "Quantities must be whole numbers, and amount cannot be negative.",
      );
      return;
    }
    saveService({
      id: service?.id || createId(),
      reservationId,
      type: type === "Other" ? String(d.get("customType")).trim() : type,
      date: String(d.get("date")),
      adultQty: quantities[0],
      childrenQty: quantities[1],
      focQty: quantities[2],
      amount,
      notes: String(d.get("notes")),
      status: String(d.get("status")) as AdditionalService["status"],
    });
    onClose();
  };
  return (
    <Modal
      title={service ? "Edit additional service" : "Add additional service"}
      subtitle="Track services alongside the reservation."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="form-body">
          {!reservation && (
            <Field label="Reservation">
              <select
                name="reservation"
                value={reservationId}
                onChange={(e) => setReservationId(e.target.value)}
              >
                {reservations.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.guestName} ·{" "}
                    {properties.find((p) => p.id === r.propertyId)?.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="form-grid">
            <Field label="Service type">
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {[
                  "Boat Transfer",
                  "Airport Transfer",
                  "Private Driver",
                  "Other",
                  ...(service &&
                  ![
                    "Boat Transfer",
                    "Airport Transfer",
                    "Private Driver",
                    "Other",
                  ].includes(service.type)
                    ? [service.type]
                    : []),
                ].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Service date">
              <input
                key={reservationId}
                name="date"
                type="date"
                required
                defaultValue={service?.date || selected.checkIn}
              />
            </Field>
          </div>
          {type === "Other" && (
            <Field label="Service name">
              <input
                name="customType"
                required
                maxLength={80}
                placeholder="Enter service name"
              />
            </Field>
          )}
          <div className="form-grid quantities">
            <Field label="Adults">
              <input
                name="adults"
                type="number"
                min="0"
                step="1"
                defaultValue={service?.adultQty ?? 2}
                required
              />
            </Field>
            <Field label="Children">
              <input
                name="children"
                type="number"
                min="0"
                step="1"
                defaultValue={service?.childrenQty ?? 0}
                required
              />
            </Field>
            <Field label="FOC (free of charge)">
              <input
                name="foc"
                type="number"
                min="0"
                step="1"
                defaultValue={service?.focQty ?? 0}
                required
              />
            </Field>
          </div>
          <div className="form-grid">
            <Field label="Amount (USD)">
              <input
                name="amount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={service?.amount}
                placeholder="0.00"
                required
              />
            </Field>
            <Field label="Status">
              <select
                name="status"
                defaultValue={service?.status || "Confirmed"}
              >
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Cancelled</option>
              </select>
            </Field>
          </div>
          <Field label="Notes">
            <textarea
              name="notes"
              defaultValue={service?.notes}
              placeholder="Transfer details, supplier or pickup notes"
              maxLength={500}
            />
          </Field>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
        </div>
        <div className="form-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button primary type="submit">
            Save service
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function GuestPaymentForm({
  reservation,
  paymentId,
  onClose,
}: {
  reservation: Reservation;
  paymentId: string;
  onClose: () => void;
}) {
  const { markGuestPaid } = useApp();
  const p = reservation.guestPayments.find((p) => p.id === paymentId)!;
  return (
    <Modal
      title={`Record guest ${p.kind.toLowerCase()}`}
      subtitle={`${money(p.amount)} · ${reservation.guestName}`}
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          markGuestPaid(
            reservation.id,
            paymentId,
            String(new FormData(e.currentTarget).get("date")),
          );
          onClose();
        }}
      >
        <div className="form-body">
          <Field label="Paid date">
            <input name="date" type="date" defaultValue="2026-07-21" required />
          </Field>
          <p className="form-hint">
            The entire scheduled {p.kind.toLowerCase()} will be marked as paid.
          </p>
        </div>
        <div className="form-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button primary type="submit">
            Confirm payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
