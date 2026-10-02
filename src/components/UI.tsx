import { useEffect, useRef, type ReactNode } from "react";
import { X, Search, CalendarDays, ChevronDown, Download } from "lucide-react";
import { useApp } from "../context/AppContext";
import { money } from "../utils/currency";
export function Badge({
  children,
  kind,
}: {
  children: ReactNode;
  kind?: string;
}) {
  const label = String(children);
  const cls =
    kind ||
    (/Cancelled|Error/.test(label)
      ? "red"
      : /Outstanding|outstanding|Pending|review/.test(label)
        ? "amber"
        : /Confirmed|Paid|Connected|Synced|Settled|Active|Completed/.test(label)
          ? "green"
          : "neutral");
  return <span className={`badge ${cls}`}>{children}</span>;
}
export function PMS({ provider }: { provider: string }) {
  return (
    <span className={`pms ${provider}`}>
      <span className="pms-mark">{provider === "guesty" ? "g" : "gp"}</span>
      {provider === "guesty" ? "Guesty" : "GuestPro"}
    </span>
  );
}
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-actions">{actions}</div>
    </header>
  );
}
export function Button({
  children,
  onClick,
  primary = false,
  disabled = false,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button ${primary ? "primary" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="select-wrap">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} />
    </label>
  );
}
export function MonthFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="month-filter">
      <CalendarDays size={16} />
      <Select
        label="Month"
        value={value}
        onChange={onChange}
        options={[
          { value: "2026-07", label: "July 2026" },
          { value: "2026-06", label: "June 2026" },
          { value: "2026-08", label: "August 2026" },
          { value: "", label: "All months" },
        ]}
      />
    </div>
  );
}
export function PropertyFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { properties } = useApp();
  return (
    <Select
      label="Property"
      value={value}
      onChange={onChange}
      options={[
        { value: "", label: "All properties" },
        ...properties.map((p) => ({ value: p.id, label: p.name })),
      ]}
    />
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search reservations…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="search-box">
      <Search size={17} />
      <span className="sr-only">{placeholder}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button aria-label="Clear search" onClick={() => onChange("")}>
          <X size={14} />
        </button>
      )}
    </label>
  );
}
export function Empty({
  children = "No results match your filters.",
}: {
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Search size={24} />
      <h3>No results found</h3>
      <p>{children}</p>
    </div>
  );
}
export function Metrics({
  items,
}: {
  items: {
    label: string;
    value: number;
    count?: boolean;
    note?: string;
    accent?: boolean;
  }[];
}) {
  return (
    <div className="metrics">
      {items.map((item) => (
        <div
          className={`metric ${item.accent ? "accent" : ""}`}
          key={item.label}
        >
          <span>{item.label}</span>
          <strong>{item.count ? item.value : money(item.value)}</strong>
          {item.note && <small>{item.note}</small>}
        </div>
      ))}
    </div>
  );
}
export function Modal({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className="modal"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button onClick={onClick}>
      <Download size={16} />
      Export Excel
    </Button>
  );
}
export function Toast() {
  const { toast, setToast } = useApp();
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast, setToast]);
  return toast ? (
    <div role="status" className="toast">
      <span className="toast-check">✓</span>
      {toast}
      <button onClick={() => setToast("")} aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  ) : null;
}
