import { useState, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import type { CommissionSnapshot, CommissionOverride, Reservation } from "../types";
import { money, percent } from "../utils/currency";
import { calculateFinancials, roundMoney, validateCommissionOverride } from "../utils/financial";
import { Button, Field, Modal } from "./UI";

export function ReservationCommissionForm({ reservation, onClose }: {
  reservation: Reservation;
  onClose: () => void;
}) {
  const { rules, saveReservationCommission } = useApp();
  const current = calculateFinancials(reservation, rules);
  const saved = reservation.commissionOverride;
  const [method, setMethod] = useState<CommissionOverride["method"] | "master">(saved?.method ?? "percent");
  const [error, setError] = useState("");
  const unit = method === "percent" ? "%" : "IDR";
  const percentages = current.commission?.method === "percent" ? current.commission : undefined;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const reason = String(data.get("reason") ?? "").trim();
    if (!reason) return setError("Enter a reason for this change.");
    let next: CommissionOverride | undefined;
    if (method !== "master") {
      const tlt = Number(data.get("tlt"));
      const agent = Number(data.get("agent"));
      next = method === "percent"
        ? { method, tlt: tlt / 100, agent: agent / 100 }
        : { method, tlt: roundMoney(tlt), agent: roundMoney(agent) };
      const validation = validateCommissionOverride(next, current.bookingValue);
      if (validation) return setError(validation);
      if (saved?.method === next.method && saved.tlt === next.tlt && saved.agent === next.agent) {
        return setError("Change at least one commission value before saving.");
      }
    }
    saveReservationCommission(reservation.id, next, reason);
    onClose();
  }

  return (
    <Modal title="Edit reservation commission" subtitle={reservation.guestName} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-body">
          <Field label="Commission method">
            <select value={method} onChange={(event) => {
              setMethod(event.target.value as typeof method);
              setError("");
            }}>
              <option value="percent">Percentage of booking value</option>
              <option value="amount">Fixed amount (IDR)</option>
              {saved && <option value="master">Use master rule</option>}
            </select>
          </Field>
          {method !== "master" && (
            <div key={method} className="form-grid">
              <Field label={`TLT commission (${unit})`}>
                <input name="tlt" type="number" min="0" step="0.01" required
                  defaultValue={method === "percent" ? (percentages && roundMoney(percentages.tlt * 100)) : current.tltCommission} />
              </Field>
              <Field label={`Agent commission (${unit})`}>
                <input name="agent" type="number" min="0" step="0.01" required
                  defaultValue={method === "percent" ? (percentages && roundMoney(percentages.agent * 100)) : current.agentCommission} />
              </Field>
            </div>
          )}
          <div className="commission-reason">
            <Field label="Reason for change">
              <textarea name="reason" required maxLength={500} rows={3} />
            </Field>
          </div>
          <p className="form-hint">
            Owner payable is recalculated for this reservation. The change is added to its commission history.
          </p>
          {error && <p role="alert" className="form-error">{error}</p>}
        </div>
        <div className="form-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button primary type="submit">Save commission</Button>
        </div>
      </form>
    </Modal>
  );
}

const timestamp = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta",
});

function CommissionValues({ label, snapshot }: { label: string; snapshot: CommissionSnapshot }) {
  const settings = snapshot.settings;
  const source = snapshot.source === "manual" ? "Manual override" : "Master rule";
  return (
    <div>
      <strong>{label} · {settings ? source : "No applicable rule"}</strong>
      {settings && (
        <dl className="commission-history-values">
          <div><dt>TLT commission</dt><dd>{money(snapshot.tltCommission)}{settings.method === "percent" && ` · ${percent(settings.tlt)}`}</dd></div>
          <div><dt>Agent commission</dt><dd>{money(snapshot.agentCommission)}{settings.method === "percent" && ` · ${percent(settings.agent)}`}</dd></div>
          <div><dt>Owner payable</dt><dd>{money(snapshot.ownerPayable)}</dd></div>
        </dl>
      )}
    </div>
  );
}

export function ReservationCommissionHistory({ history = [] }: { history?: Reservation["commissionHistory"] }) {
  if (!history.length) return null;
  return (
    <section className="panel" aria-labelledby="commission-history-title">
      <div className="panel-heading"><h2 id="commission-history-title">Commission history</h2></div>
      <ol className="commission-history">
        {history.slice().reverse().map((change) => (
          <li key={change.id}>
            <p className="muted subtle">
              <time dateTime={change.changedAt}>{timestamp.format(new Date(change.changedAt))} WIB</time> · {change.changedBy}
            </p>
            <p className="commission-change-reason">{change.reason}</p>
            <div className="commission-change-values">
              <CommissionValues label="Before" snapshot={change.before} />
              <CommissionValues label="After" snapshot={change.after} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
