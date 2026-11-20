export const date = (iso?: string) =>
  iso
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(`${iso}T12:00:00Z`))
    : "—";
export const shortDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export interface DateRange {
  from: string;
  to: string;
}

export function monthDateRange(month: string): DateRange {
  const from = `${month}-01`;
  const end = new Date(`${from}T00:00:00Z`);
  end.setUTCMonth(end.getUTCMonth() + 1, 0);
  return { from, to: end.toISOString().slice(0, 10) };
}

export function isDateInRange(value: string | undefined, { from, to }: DateRange): value is string {
  return !!value && (!from || value >= from) && (!to || value <= to);
}

export function isCalendarDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const day = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(day.getTime()) && day.toISOString().slice(0, 10) === value;
}

export function describeDateRange({ from, to }: DateRange) {
  if (from && to) return from === to ? date(from) : `${date(from)} – ${date(to)}`;
  if (from) return `From ${date(from)}`;
  if (to) return `Through ${date(to)}`;
  return "All dates";
}
