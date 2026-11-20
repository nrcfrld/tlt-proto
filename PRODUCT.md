# TLT Back Office

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

User specified Bun, React, Vite, TypeScript, Tailwind CSS, React Router, Lucide React. Frontend only.

## Users

TLT finance and operations staff currently using Excel for consolidated financial workflows.

Reservations and Sales + Marketing will participate in prototype validation. Individual responsibilities and access permissions still need confirmation.

## Business Background

The Lembongan Traveller (TLT) manages properties owned by other people. TLT needs to track how each booking is divided between TLT commission, agent commission and the amount payable to the property owner, followed by actual owner payments and the remaining obligation.

Most properties use Guesty as their PMS and channel manager. According to the prospective client, the Guesty reports they currently use do not meet their commission configuration and owner-payment tracking needs. The team therefore supplements Guesty with Excel. The reason for this back office is to replace that spreadsheet-dependent financial workflow and reduce the potential for calculation and recording errors.

### Current financial workflow and gaps

- Excel combines booking information, TLT and agent commissions, the amount due to the owner, guest deposit/balance information, and owner-payment amounts, dates and notes. The sample has two sets of owner-payment columns; that does not establish a business limit of two payments.
- Boat transfers are booked through WhatsApp. Staff manually confirm availability and prices with third-party suppliers. According to the client, these services cannot be listed in their current Guesty setup, but they still need to appear in TLT's financial reports. PMS reservation data must therefore be supplemented with internal service records.
- TLT wants future financial records and reports in IDR rather than AUD. The stated goals are less currency-conversion administration and easier Indonesian legal and tax administration. Source currency, exchange-rate source and conversion date remain open decisions.

### Separate availability problem

Two large hotels retain GuestPro at their owners' request. According to the client, GuestPro is their PMS and SiteMinder handles OTA distribution. TLT currently copies their data and property catalogue into Guesty manually and uses iCalendar to align availability. The reported sync delay of about one hour creates a window for double bookings.

Availability synchronization is a separate problem from financial reporting. The financial dashboard does not, by itself, resolve it. Manual copying into Guesty describes the current workflow, not a final integration requirement. Guesty and GuestPro integration roles, authoritative data per property and duplicate-booking detection still need to be designed and their technical feasibility verified.

## Product Purpose

Provide an internal financial workspace that brings reservation data and TLT's own financial records together, replacing Excel-based commission calculations, owner-payment tracking and reporting.

The prototype demonstrates consolidated mock reservations, configurable commissions, guest payments, repeatable owner payments, linked boat-transfer records and IDR reports. It supports validation of the workflow with the client; it does not yet deliver operational automation or real PMS connectivity. See [BRD.md](BRD.md) for the detailed business background and requirements.

## Operating Context

Desktop-first internal financial application. January–December 2026 synthetic data; July is the default demo month. IDR throughout, with synthetic IDR demo amounts and no assumed FX conversion. Main demo: Clair Maguire at Villa Tranquilla. Boat transfers include boat company and departure/return times and are reported separately by service date, without affecting owner payable.

## Capabilities and Constraints

No backend, database, API integration or authentication service. Reusable domain types and provisional calculation utility. Rules and payments update all views. Refresh may reset state.

## Brand Commitments

TLT (The Lembongan Traveller). Clean professional hospitality/finance SaaS. Dense readable tables, obvious filters, restrained cards. No gradients, marketing heroes, amenities or PMS operational features.

## Evidence on Hand

Business background supplied directly by the project proposer, the client's sample workbook `TLT Excel.xlsx`, and the discussion captured in BRD.md. No existing visual assets. All prototype reservations and integration statuses are illustrative.

## Product Principles

Auditable money movement; source visibility; property/source rule specificity; Guesty and GuestPro remain operational PMSs.

## Open Decisions

Complete commission rules and calculation bases, guest payment meanings, owner-payment timing, cancellation/refund treatment, historical-rule changes, currency conversion policy, and reporting periods require business validation. The Villa Tranquilla + Agent demo split follows the supplied example at 12.5% TLT and 12.5% agent; it does not validate every property/source rule.

Boat-transfer cost versus selling price and its treatment in owner settlement remain undecided. Owner-statement/export format and role permissions need confirmation. PMS integration architecture and availability synchronization require separate technical assessment; no live API capabilities or sync guarantees have been established by the prototype.
