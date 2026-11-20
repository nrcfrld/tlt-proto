import { useEffect, useRef, useState } from "react";
import { BarChart3 } from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  periodBuckets,
  type ChartMetric,
  type PeriodBucket,
} from "../utils/chartData";
import { money, compactMoney, axisMoney } from "../utils/currency";
import { date } from "../utils/dates";
import { Select } from "./UI";

const metricLabels: Record<ChartMetric, string> = {
  booking: "Booking value",
  tlt: "TLT commission",
  owner: "Owner payable",
  reservations: "Reservations",
};
function niceMaximum(value: number) {
  if (value <= 0) return 4;
  const step = 10 ** Math.floor(Math.log10(value / 4));
  return Math.ceil(value / (step * 4)) * step * 4;
}
function axisLabel(value: number, isCount: boolean) {
  if (isCount) return String(Math.round(value));
  return axisMoney(value);
}
function PeriodChart({
  title,
  subtitle,
  buckets,
  metric,
  selectedMonth,
  onSelectMonth,
  daily = false,
}: {
  title: string;
  subtitle: string;
  buckets: PeriodBucket[];
  metric: ChartMetric;
  selectedMonth?: string;
  onSelectMonth?: (month: string) => void;
  daily?: boolean;
}) {
  const [activeKey, setActive] = useState<string>();
  const active = buckets.find((bucket) => bucket.key === activeKey);
  const isCount = metric === "reservations";
  const maximum = Math.max(...buckets.map((b) => b[metric]), 0);
  const ceiling = isCount
    ? Math.max(4, Math.ceil(maximum / 4) * 4)
    : niceMaximum(maximum);
  const chartRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(daily ? 620 : 590);
  useEffect(() => {
    const container = chartRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() =>
      setWidth(Math.max(daily ? 620 : 480, container.clientWidth - 16)),
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, [daily]);
  const height = 260;
  const left = 84,
    right = 16,
    top = 20,
    bottom = 40;
  const plotHeight = height - top - bottom;
  const slot = (width - left - right) / buckets.length;
  const barWidth = Math.max(8, slot * (daily ? 0.6 : 0.58));
  const total = buckets.reduce((s, b) => s + b[metric], 0);
  const formatted = (value: number) =>
    isCount ? `${value} reservations` : money(value);
  const tooltipLabel = (bucket: PeriodBucket) =>
    daily
      ? date(bucket.key)
      : new Intl.DateTimeFormat("en-US", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }).format(new Date(`${bucket.key}-01T12:00:00Z`));
  return (
    <section
      className={`panel period-chart ${daily ? "daily-chart" : "monthly-chart"}`}
    >
      <div className="panel-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
        <strong
          className="chart-total"
          title={isCount ? undefined : money(total)}
          aria-label={isCount ? undefined : money(total)}
        >
          {isCount ? total : compactMoney(total)}
        </strong>
      </div>
      <div className="chart-scroll" ref={chartRef}>
        <svg
          className="bar-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          role="group"
          aria-label={`${title}: ${metricLabels[metric]}. ${subtitle}`}
        >
          {[0, 1, 2, 3, 4].map((i) => {
            const y = top + plotHeight - (plotHeight * i) / 4;
            return (
              <g key={i} aria-hidden="true">
                <line
                  x1={left}
                  y1={y}
                  x2={width - right}
                  y2={y}
                  className={i === 0 ? "chart-baseline" : "chart-gridline"}
                />
                <text
                  x={left - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="chart-axis"
                >
                  {axisLabel((ceiling * i) / 4, isCount)}
                </text>
              </g>
            );
          })}
          {buckets.map((b, i) => {
            const x = left + i * slot + slot / 2;
            const barHeight = (b[metric] / ceiling) * plotHeight;
            const selected = !daily && b.key === selectedMonth;
            const highlighted = b.key === active?.key;
            return (
              <g
                key={b.key}
                className={`chart-bar-group ${onSelectMonth ? "clickable" : ""}`}
                role={onSelectMonth ? "button" : "img"}
                tabIndex={0}
                aria-label={`${tooltipLabel(b)}: ${formatted(b[metric])}${onSelectMonth ? ". Select this month." : ""}`}
                aria-pressed={onSelectMonth ? selected : undefined}
                onMouseEnter={() => setActive(b.key)}
                onMouseLeave={() => setActive(undefined)}
                onFocus={() => setActive(b.key)}
                onBlur={() => setActive(undefined)}
                onClick={() => onSelectMonth?.(b.key)}
                onKeyDown={(e) => {
                  if (onSelectMonth && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelectMonth(b.key);
                  }
                }}
              >
                <rect
                  x={x - slot / 2 + 1}
                  y={top}
                  width={slot - 2}
                  height={plotHeight + bottom - 10}
                  fill="transparent"
                  className="chart-hit-area"
                />
                {(selected || highlighted) && (
                  <rect
                    x={x - slot / 2 + 2}
                    y={top}
                    width={slot - 4}
                    height={plotHeight}
                    className="chart-bar-highlight"
                  />
                )}
                <rect
                  x={x - barWidth / 2}
                  y={top + plotHeight - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx={2}
                  className={
                    selected || highlighted ? "chart-bar active" : "chart-bar"
                  }
                />
                {(!daily || i % 3 === 0 || i === buckets.length - 1) && (
                  <text
                    x={x}
                    y={height - 15}
                    textAnchor="middle"
                    className={`chart-axis ${selected ? "selected" : ""}`}
                  >
                    {b.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="chart-reading" aria-live="polite">
        {active ? (
          <>
            <strong>{tooltipLabel(active)}</strong>
            <span>
              {formatted(active[metric])}
              {!isCount && (
                <>
                  {" "}
                  · {active.reservations} booking
                  {active.reservations === 1 ? "" : "s"}
                </>
              )}
            </span>
          </>
        ) : maximum === 0 ? (
          <span>
            No {isCount ? "reservations" : "financial value"} in this period.
            Choose another month or property.
          </span>
        ) : (
          <span>
            {onSelectMonth
              ? "Select a month to update daily activity and dashboard totals."
              : "Hover or focus a bar to see the exact daily total."}
          </span>
        )}
      </div>
    </section>
  );
}
export function FinancialCharts({
  month,
  property,
  onSelectMonth,
}: {
  month: string;
  property: string;
  onSelectMonth: (month: string) => void;
}) {
  const { reservations, rules } = useApp();
  const [metric, setMetric] = useState<ChartMetric>("booking");
  const rows = reservations.filter(
    (r) => !property || r.propertyId === property,
  );
  const latestMonth =
    reservations
      .map((r) => r.checkIn.slice(0, 7))
      .sort()
      .at(-1) || "2026-07";
  const dailyMonth = month || latestMonth;
  const year = dailyMonth.slice(0, 4);
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${dailyMonth}-01T12:00:00Z`));
  return (
    <section
      className="financial-trends"
      aria-labelledby="financial-trends-title"
    >
      <div className="trends-heading">
        <div>
          <BarChart3 size={18} />
          <h2 id="financial-trends-title">Financial activity</h2>
        </div>
        <Select
          label="Chart metric"
          value={metric}
          onChange={(v) => setMetric(v as ChartMetric)}
          options={Object.entries(metricLabels).map(([value, label]) => ({
            value,
            label,
          }))}
        />
      </div>
      <div className="trends-grid">
        <PeriodChart
          title="Monthly overview"
          subtitle={`${year} · ${metricLabels[metric]}`}
          buckets={periodBuckets(rows, rules, "monthly", year)}
          metric={metric}
          selectedMonth={month}
          onSelectMonth={onSelectMonth}
        />
        <PeriodChart
          title="Daily breakdown"
          subtitle={`${monthLabel}${!month ? " · latest activity month" : ""}`}
          buckets={periodBuckets(rows, rules, "daily", dailyMonth)}
          metric={metric}
          daily
        />
      </div>
      <p className="charts-note">
        Grouped by reservation check-in date · IDR · Synthetic demo data covers January–December 2026. Full refunds contribute no financial value.
      </p>
    </section>
  );
}
