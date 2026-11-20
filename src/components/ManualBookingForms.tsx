import { useId, useState, type FormEvent } from "react";
import { useApp } from "../context/AppContext";
import { bookingSources, reservationStatuses, type BookingSource, type ManualProperty, type ReservationStatus } from "../types";
import { roundMoney } from "../utils/financial";
import { createId } from "../utils/id";
import { Button, Field, Modal } from "./UI";

function textField(data: FormData, name: string) {
  return String(data.get(name) ?? "").trim();
}

function propertyFromForm(data: FormData): ManualProperty | undefined {
  const name = textField(data, "propertyName");
  return name ? {
    id: createId(),
    name,
    owner: textField(data, "propertyOwner"),
    pmsProvider: "manual",
  } : undefined;
}

function ManualPropertyFields() {
  return (
    <div className="form-grid">
      <Field label="Property name">
        <input name="propertyName" maxLength={120} required />
      </Field>
      <Field label="Owner (optional)">
        <input name="propertyOwner" maxLength={120} />
      </Field>
    </div>
  );
}

export function ManualPropertyForm({ onClose, onSave }: {
  onClose: () => void;
  onSave: (propertyId: string) => void;
}) {
  const { addManualProperty } = useApp();
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const property = propertyFromForm(new FormData(event.currentTarget));
    if (!property) {
      setError("Enter the property name.");
      return;
    }
    addManualProperty(property);
    onSave(property.id);
  }

  return (
    <Modal title="Add non-managed property" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-body">
          <ManualPropertyFields />
          {error && <p role="alert" className="form-error">{error}</p>}
        </div>
        <div className="form-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" primary>Save property</Button>
        </div>
      </form>
    </Modal>
  );
}

export function ManualReservationForm({ propertyId, onClose, onSave }: {
  propertyId?: string;
  onClose: () => void;
  onSave: (reservationId: string) => void;
}) {
  const { properties, addManualReservation } = useApp();
  const manualProperties = properties.filter((property) => property.pmsProvider === "manual");
  const [selection, setSelection] = useState(propertyId ?? "");
  const [error, setError] = useState("");
  const propertyHintId = useId();
  const showPropertyHint = manualProperties.length === 0 && selection === "";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const guestName = textField(data, "guestName");
    const checkIn = textField(data, "checkIn");
    const checkOut = textField(data, "checkOut");
    const nights = (Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000;
    const totalBooking = roundMoney(Number(data.get("totalBooking")));
    const source = textField(data, "source") as BookingSource;
    const status = textField(data, "status") as ReservationStatus;
    if (!guestName) return setError("Enter the guest name.");
    if (!Number.isInteger(nights) || nights < 1) return setError("Check-out must be after check-in.");
    if (!Number.isFinite(totalBooking) || totalBooking < 0) return setError("Enter a valid booking amount.");
    if (!bookingSources.includes(source) || !reservationStatuses.includes(status)) {
      return setError("Select the booking source and status.");
    }

    const newProperty = selection === "new" ? propertyFromForm(data) : undefined;
    const property = newProperty ?? manualProperties.find((item) => item.id === selection);
    if (!property) return setError(selection === "new" ? "Enter the property name." : "Select a non-managed property.");

    const id = createId();
    addManualReservation({
      id,
      externalId: textField(data, "reference") || `MAN-${id.slice(0, 12).toUpperCase()}`,
      pmsProvider: "manual",
      propertyId: property.id,
      guestName,
      unit: textField(data, "unit"),
      checkIn,
      checkOut,
      nights,
      source,
      totalBooking,
      status,
      remarks: textField(data, "remarks"),
      guestPayments: totalBooking > 0 && status !== "Cancelled - Full Refund"
        ? [{ id: `${id}-balance`, kind: "Balance", amount: totalBooking, note: "" }]
        : [],
      ownerPayments: [],
    }, newProperty);
    onSave(id);
  }

  return (
    <Modal title="Add manual reservation" subtitle="Record a booking for a non-managed property." onClose={onClose}>
      <form onSubmit={submit}>
        <div className="form-body manual-reservation-fields">
          <div className="manual-property-picker">
            <Field label="Non-managed property">
              <select
                required
                value={selection}
                aria-describedby={showPropertyHint ? propertyHintId : undefined}
                onChange={(event) => setSelection(event.target.value)}
              >
                <option value="" disabled>Select a property</option>
                {manualProperties.map((property) => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
                <option value="new">Create a new property</option>
              </select>
            </Field>
            {showPropertyHint && (
              <p className="form-hint" id={propertyHintId}>
                No non-managed properties yet. Choose “Create a new property” to add one.
              </p>
            )}
          </div>
          {selection === "new" && <ManualPropertyFields />}
          <div className="form-grid">
            <Field label="Guest name">
              <input name="guestName" maxLength={120} required />
            </Field>
            <Field label="Unit / villa (optional)">
              <input name="unit" maxLength={120} />
            </Field>
            <Field label="Check-in">
              <input name="checkIn" type="date" min="0100-01-01" max="9999-12-31" required />
            </Field>
            <Field label="Check-out">
              <input name="checkOut" type="date" min="0100-01-01" max="9999-12-31" required />
            </Field>
            <Field label="Booking source">
              <select name="source" defaultValue="" required>
                <option value="" disabled>Select a source</option>
                {bookingSources.map((source) => <option key={source}>{source}</option>)}
              </select>
            </Field>
            <Field label="Reservation status">
              <select name="status" defaultValue="Confirmed">
                {reservationStatuses.map((status) => <option key={status}>{status}</option>)}
              </select>
            </Field>
            <Field label="Total booking (IDR)">
              <input name="totalBooking" type="number" min="0" step="0.01" required />
            </Field>
            <Field label="Booking reference (optional)">
              <input name="reference" maxLength={80} />
            </Field>
          </div>
          <Field label="Remarks (optional)">
            <textarea name="remarks" rows={3} />
          </Field>
          {error && <p role="alert" className="form-error">{error}</p>}
        </div>
        <div className="form-actions">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" primary>Save reservation</Button>
        </div>
      </form>
    </Modal>
  );
}
