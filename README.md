# TLT Back Office

High-fidelity, frontend-only financial operations prototype for The Lembongan Traveller.

## Run locally

```sh
bun install
bun run dev
```

Open http://localhost:5187. The dedicated port fails clearly if occupied. Build with `bun run build`; verify the financial engine with `bun test`.

## Primary demo

1. Open **Reservations → Clair Maguire** at Villa Tranquilla (or `/reservations/clair-maguire`).
2. Inspect the Rp85.000.000 booking, Rp8.500.000 TLT commission, Rp14.152.500 agent commission and Rp62.347.500 owner payable.
3. Follow **View rule**, edit the percentages, and return to see the calculation update.
4. Record another owner payment. The initial Rp50.000.000 paid leaves Rp12.347.500 remaining. Additional payments update all reports immediately.
5. Edit the existing Boat Transfer or add another service. Open Additional services to see the consolidated record.
6. Open Reports; filter by property, owner, PMS, source or month. Select a report type to see grouped financial totals. Boat transfers appear in a separate section with company, departure/return times and confirmed/pending values; the month follows service date. Cancelled transfers are excluded from those totals. Export Excel shows a prototype confirmation.
7. Open Integrations and use Sync now for the one-second simulated sync.

## Scope and data

- 12 property mappings, 648 reservations across January–December 2026, 192 additional services (96 Boat Transfers, plus Airport Transfers, Private Tours and Extra Beds), both Guesty and GuestPro, 7 booking sources.
- Every month includes cancellations, full refunds, fully settled bookings, guest balances and partial/unpaid owner settlements. A disabled property/source rule deliberately demonstrates financial review.
- Locally mocked data only. No backend, database, API requests or authentication service.
- React Context keeps rules, reservations, guest and owner payments, services and mock integration state together. Refresh resets demo state.
- All displayed and entered amounts use IDR. Demo prices are synthetic IDR inputs, not conversions of the previous demo or real AUD transactions. Source currency conversion awaits an agreed exchange-rate policy. All demo names and amounts are illustrative.

## Dashboard charts

Monthly and daily bar charts show booking value, TLT commission, owner payable or reservation count. Property filters apply to both charts. Click a month to update the dashboard and daily breakdown. Hover or keyboard-focus a bar for exact amounts. Recognition follows reservation check-in date, consistent with Reports. All 12 months contain activity across all properties, and every calendar day has check-ins. Synthetic seasonal volumes and prices make annual trends visible. July remains the default month for the primary walkthrough.

## Architecture

The Villa Tranquilla + Agent demo rule follows the supplied Excel example: 12.5% TLT commission, 12.5% agent commission, and 75% payable to the owner. Other property/source rules remain illustrative and require business validation.

`src/types` defines platform-neutral domain types. `src/data` holds each mock data family. `src/context/AppContext.tsx` owns shared local state. `src/utils/financial.ts` is the central policy boundary; all pages use it rather than hardcoding calculated results. `src/components/Forms.tsx` provides validated payment, service and rule forms. `src/pages` contains the routed views.

Commission selection matches property, source and inclusive check-in dates. Overlapping active rules are rejected. Each commission is rounded to cents, then subtracted from booking value. Disabling a rule displays unresolved amounts and excludes them from commission and owner totals. Full refunds carry zero booking revenue and payable. Other cancellations retain imported value and require review before owner payments can be recorded. Service amounts are kept separate because their settlement treatment has not been validated.

Guest deposit and balance meanings, cancellation treatment and the owner-payable formula are **provisional prototype assumptions**, documented in Settings. Unlimited owner payment records are supported; overpayment entry is prevented. If a later rule change creates an overpayment, the detail displays a review credit.

## Verification

Sixteen financial, chart aggregation, boat reporting and annual data integrity tests cover the primary IDR scenario, the client Excel commission split, payment aggregation, rule edits, effective dates, full refunds, missing/conflicting rules, overpayment review, validation, service-date reporting and filters, service status totals, full-year coverage, valid dates and linked service records. Browser verification covers navigation, filtering, owner payment recording, service editing/addition, rule changes, reports and simulated sync. Desktop and narrow layouts use table scrolling and accessible modal dialogs.
