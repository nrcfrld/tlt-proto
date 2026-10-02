# TLT Back Office

High-fidelity, frontend-only financial operations prototype for The Lembongan Traveller.

## Run locally

```sh
bun install
bun run dev
```

Open the Vite URL printed in the terminal. Build with `bun run build`; verify the financial engine with `bun test`.

## Primary demo

1. Open **Reservations → Clair Maguire** at Villa Tranquilla (or `/reservations/clair-maguire`).
2. Inspect the $8,524.03 booking, $852.40 TLT commission, $1,419.25 agent commission and $6,252.38 owner payable.
3. Follow **View rule**, edit the percentages, and return to see the calculation update.
4. Record another owner payment. The initial $5,000 paid leaves $1,252.38 remaining. Additional payments update all reports immediately.
5. Edit the existing Boat Transfer or add another service. Open Additional services to see the consolidated record.
6. Open Reports; filter by property, owner, PMS, source or month. Select a report type to see grouped financial totals. Export Excel shows a prototype confirmation.
7. Open Integrations and use Sync now for the one-second simulated sync.

## Scope and data

- 12 property mappings, 36 July 2026 reservations, 8 Boat Transfers, both Guesty and GuestPro, 7 booking sources.
- Three cancellations and two full refunds. Missing rules are deliberately represented for financial review.
- Locally mocked data only. No backend, database, API requests or authentication service.
- React Context keeps rules, reservations, guest and owner payments, services and mock integration state together. Refresh resets demo state.
- UI currency is USD. All demo names and amounts are illustrative.

## Architecture

`src/types` defines platform-neutral domain types. `src/data` holds each mock data family. `src/context/AppContext.tsx` owns shared local state. `src/utils/financial.ts` is the central policy boundary; all pages use it rather than hardcoding calculated results. `src/components/Forms.tsx` provides validated payment, service and rule forms. `src/pages` contains the routed views.

Commission selection matches property, source and inclusive check-in dates. Overlapping active rules are rejected. Each commission is rounded to cents, then subtracted from booking value. Disabling a rule displays unresolved amounts and excludes them from commission and owner totals. Full refunds carry zero booking revenue and payable. Other cancellations retain imported value and require review before owner payments can be recorded. Service amounts are kept separate because their settlement treatment has not been validated.

Guest deposit and balance meanings, cancellation treatment and the owner-payable formula are **provisional prototype assumptions**, documented in Settings. Unlimited owner payment records are supported; overpayment entry is prevented. If a later rule change creates an overpayment, the detail displays a review credit.

## Verification

Eight financial policy tests cover the exact primary scenario, payment aggregation, rule edits, effective dates, full refunds, missing/conflicting rules, overpayment review and validation. Browser verification covers navigation, filtering, owner payment recording, service editing/addition, rule changes, reports and simulated sync. Desktop and narrow layouts use table scrolling and accessible modal dialogs.
