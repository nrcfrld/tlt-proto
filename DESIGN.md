---
name: TLT Back Office
description: Compact, auditable financial operations workspace.
colors:
  primary: "#15635b"
  primary-deep: "#103c39"
  ink: "#243b3a"
  muted: "#60736c"
  canvas: "#f6f8f8"
  surface: "#ffffff"
  border: "#e1e8e7"
  selected: "#e7f2ee"
typography:
  headline:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "28px"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "-0.035em"
  title:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "16px"
    fontWeight: 650
  body:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DM Sans Variable, sans-serif"
    fontSize: "12px"
    fontWeight: 500
rounded:
  control: "5px"
  panel: "6px"
  dialog: "8px"
spacing:
  compact: "8px"
  standard: "16px"
  section: "24px"
  canvas: "34px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
---

# Design System: TLT Back Office

## Overview

The interface serves finance staff reviewing a portfolio in daylight. Its visual direction follows the brief’s internal hospitality/finance SaaS: aligned columns, compact controls, clear source labels, restrained green financial emphasis, and no decorative imagery. This is a record of implemented decisions, not a separate user-approved brand identity.

## Colors

Deep teal identifies navigation and primary actions. Pale green identifies selected state and owner settlement. Neutral gray-green text carries metadata. Amber and red are reserved for actionable review and error states.

## Typography

Self-hosted DM Sans uses tabular numerals for monetary data. Main table values and form controls are 14px; secondary labels are 12px and footnotes 11px. Totals use 24px with restrained tracking.

## Layout

A fixed 238px navigation rail and 64px topbar anchor the desktop workspace. Main content uses 34px padding and 24px panel gaps. Reservation detail has a broad booking column and narrower financial column. Below 1050px, financials move first. Below 760px, navigation becomes a dismissible drawer and tables keep horizontal scroll.

## Elevation & Depth

Panels use hairline borders without shadows. Only dialogs and toast messages use soft offset shadows. Native modal backdrops protect focus.

## Shapes

Controls have compact 5px corners. Panels use 6px corners. Dialogs use 8px corners. Status badges are small, restrained rectangles.

## Components

Financial tables have sticky headings, aligned currency columns and linked reservations. The owner breakdown lists booking value, both deductions and final payable. The settlement history accepts any number of records. Form dialogs validate inputs, dates and commission overlaps. Empty results explain how to recover. Reduced motion disables transitions and sync rotation.

## Do's and Don'ts

- Do keep money aligned and its derivation visible.
- Do use source and PMS labels consistently.
- Do prioritize financial review before recording settlements.
- Don't add gradients, marketing heroes, property imagery or decorative motion.
- Don't mix additional service amounts into unvalidated owner calculations.
