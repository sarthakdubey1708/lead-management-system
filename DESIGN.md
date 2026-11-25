# DESIGN.md — BizLeap Lead Management System (v2.0)

**Direction: "Pipeline Desk."** Deep navy frames the workspace. Deep teal guides actions and marks
the 30-day lead activity. Cool, light content surfaces separate the tools from the charts and
full-color KPI cards. The segmented pipeline is the first read on the Dashboard and the shared
visual reference for the split-screen login.

This reference describes the frontend design system. Design tokens live in
`client/tailwind.config.js` and global styles live in `client/src/index.css`.

---

## 1. Color

All colors are Tailwind tokens. Do not write hex values or invent local colors in components.

| Role | Token (class suffix) | Hex | Use |
|---|---|---|---|
| Primary | `brand-600` | #0C6566 | Primary buttons, links, focus on light surfaces |
| Primary hover/pressed | `brand-700` | #094F53 | Hover and active state of primary |
| Primary tint | `brand-50` | #E4F5F1 | Selected options and light branded surfaces |
| Highlight | `brand-200` / `brand-400` | #A5ECDD / #58C9B9 | Dark-surface focus, actions and activity bars |
| Deep teal | `brand-800` | #103E4B | Branded gradient and active navigation |
| Navy | `navy-950` / `900` / `850` / `800` | #10182C / #17213A / #1D2A47 / #263653 | Navigation, banner, dark chart and guides |
| Light navy | `navy-100` / `navy-200` | #E1E8F6 / #C1CEE5 | Text and metadata on dark surfaces |
| Secondary (ink) | `ink-800` | #142038 | Headings, tooltip background |
| App background | `canvas` | #F2F4F9 | Page background |
| Surface | `surface` | #FFFFFF | Cards, table, modals, inputs |
| Surface muted | `surface-muted` | #EAF0F8 | Table header and chart tracks |
| Surface hover | `surface-hover` | #F6F8FC | Table row hover and form fills |
| Text primary | `fg` | #1C2841 | Body and data |
| Text secondary | `fg-2` | #45536B | Table headers, labels, helper text |
| Text muted | `fg-3` | #566580 | Captions, placeholders, metadata |
| Divider | `line` | #DDE4EF | Card borders, row dividers |
| Divider strong | `line-strong` | #C7D2E2 | Emphasized dividers |
| Input border | `line-input` | #808DA2 | Input/select/checkbox boundary |
| Success | `success` / `success-bg` | #166534 / #E3F4E8 | Success toast, confirmations |
| Warning | `warning` / `warning-bg` | #92400E / #FEF3C7 | Warnings |
| Error | `error` / `error-bg` | #B42318 / #FDECEA | Validation errors, danger button, error toast |
| Info | `info` / `info-bg` | #1D4ED8 / #E8EEFB | Informational notices |

### Dashboard accent colors

| Token | Hex | Use |
|---|---|---|
| `accent-indigo` / `accent-indigo-bg` | #5252A3 / #E6E5FB | Total leads, Website, neutral empty states |
| `accent-blue` / `accent-blue-bg` | #2369A7 / #DFEBFD | Instagram and New KPI |
| `accent-violet` | #7842AE | LinkedIn |
| `accent-emerald` / `accent-emerald-deep` / `accent-emerald-bg` | #17634A / #103F36 / #CFF1E3 | Referral and Converted KPI |
| `accent-amber` / `accent-amber-bg` | #94600D / #FAEDD2 | Advertisement and Contacted KPI |
| `accent-coral` | #B74551 | Cold Calling |

### Lead status colors (used ONLY for lead status)

| Status | Label `fg` | Fill `bg` | Dot / chart `dot` |
|---|---|---|---|
| New | #1D4ED8 | #E8EEFB | #3B6FE0 |
| Contacted | #8A5A00 | #FBF1D9 | #B97A00 |
| Interested | #6D3FC0 | #F0EAFB | #8B5CD6 |
| Converted | #166534 | #E3F4E8 | #2E9F57 |
| Lost | #9F1239 | #FCE8EC | #D1435F |

Rules:
- A status is always shown as **dot + text label**. Color is never the only signal.
- Tailwind cannot see dynamically built class names. Keep a static map in `utils/constants.js`
  (for example `New: 'bg-status-new-bg text-status-new-fg'`) and never build `` `text-status-${x}-fg` ``.
- Brand teal is never used to mean a status. Converted is green, not teal.
- Acquisition sources use the separate accent palette alongside visible names and counts.

---

## 2. Verified contrast (WCAG 2.x, computed from the hex values above)

Targets: text >= 4.5:1, UI boundaries, focus indicators and meaningful graphics >= 3:1.

| Pair | Ratio | Target | Result |
|---|---|---|---|
| `fg` on surface / canvas | 14.69 / 13.35 | 4.5 | Pass |
| `fg-2` on surface | 7.77 | 4.5 | Pass |
| `fg-3` on surface / muted / hover | 5.88 / 5.13 / 5.53 | 4.5 | Pass |
| White on primary button / hover | 6.84 / 9.31 | 4.5 | Pass |
| White on danger button | 6.57 | 4.5 | Pass |
| `brand-600` on surface / `brand-50` / canvas | 6.84 / 6.07 / 6.22 | 4.5 | Pass |
| `navy-200` on `brand-800` | 7.30 | 4.5 | Pass |
| `brand-200` focus on `brand-800` | 8.63 | 3.0 | Pass |
| White on `ink-800` / emerald / deep emerald | 16.24 / 7.19 / 11.76 | 4.5 | Pass |
| Badge label on fill: New / Contacted / Interested / Converted / Lost | 5.76 / 5.27 / 5.72 / 6.24 / 6.83 | 4.5 | Pass |
| Status dot on surface: New / Contacted / Interested / Converted / Lost | 4.63 / 3.59 / 4.57 / 3.38 / 4.49 | 3.0 | Pass |
| Status dot on `navy-950` (pipeline strip) | 3.81 / 4.92 / 3.87 / 5.23 / 3.94 | 3.0 | Pass |
| Success / Warning / Error / Info text on own tint | 6.24 / 6.37 / 5.75 / 5.76 | 4.5 | Pass |
| Success / Warning / Error / Info text on surface | 7.13 / 7.09 / 6.57 / 6.70 | 4.5 | Pass |
| Input border `line-input` on `surface-hover` | 3.16 | 3.0 | Pass |
| Error input border on surface | 6.57 | 3.0 | Pass |

Ratios were calculated with the WCAG relative-luminance formula for the listed colors.
`line` and `line-strong` are decorative dividers, not required to meet 3:1. Never use them for input boundaries.
Disabled controls are exempt from contrast rules but must remain legible (50% opacity, `fg-3` text).

---

## 3. Typography

Family: **IBM Plex Sans** (400, 500, 600) via `@fontsource/ibm-plex-sans`, fallback system sans.
Numbers in tables, KPIs and pagination use `tabular-nums`.

| Role | Class | Size / line height | Weight |
|---|---|---|---|
| Page title (one `h1` per page) | `text-h1` / `text-h1-wide` | 28 / 34, 36 / 42 | 600 |
| Split-screen login heading | `text-display` | 40–60, 1.04 line height | 600 |
| Section title (`h2`) | `text-h2` | 20 / 28 | 600 |
| Card title (`h3`) | `text-h3` | 15 / 22 | 600 |
| Body, table cells, inputs (desktop) | `text-body` | 14 / 22 | 400 |
| Inputs on mobile (prevents iOS zoom) | `text-body-lg` | 16 / 24 | 400 |
| Status badge label | `text-badge` | 13 / 16 | 500 |
| Labels, captions, helper text | `text-caption` | 12 / 16 | 500 |
| KPI number | `text-kpi` / `text-kpi-wide` | 34 / 36, 44 / 44 | 600 |

Rules: sentence case everywhere, no all-caps micro labels. Nothing important (names, status, dates,
errors) is below 13px. Captions (12px) are for helper text and metadata only. Line length in forms and
descriptions stays under about 65 characters.

---

## 4. Spacing and layout

4px base. Allowed steps: **4, 8, 12, 16, 20, 24, 32, 48** (`1, 2, 3, 4, 5, 6, 8, 12`).
Avoid odd values like `p-7` or `gap-[13px]`.

| Item | Value |
|---|---|
| Page padding | 24 desktop and tablet, 16 mobile |
| Card padding | 20 (16 on mobile) |
| Grid gap | 16; 24 between major sections |
| Page header (title + primary action) to content | 24 |
| Table row height | 52 minimum, desktop cell padding 8 x 16 (8 x 8 in narrow table containers). Tablet uses 12px vertical padding. |
| Form: field gap / label to input | 16 / 6 |
| Page content max width | 1664 (`max-w-content`), aligned to the sidebar with a 24px inset |
| Login form max width | 432 (`max-w-login`) |

### Layout chrome

| Breakpoint | Navigation |
|---|---|
| Desktop, 1024+ | Left sidebar 232px: brand, Dashboard, Leads, then user and Log out |
| Tablet, 768-1023 | Icon rail 64px with tooltips and accessible names |
| Mobile, under 768 | Top bar 56px + bottom tab bar 56px (two items) |

### Mobile safe areas

`index.html` must use `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
Without `viewport-fit=cover`, the `env(safe-area-inset-*)` values are zero.

- **Bottom nav:** fixed at `bottom: 0`, class `safe-bottom-nav` (56px + `env(safe-area-inset-bottom)`),
  surface background with a top border so content never shows through the home-indicator zone.
- **Top bar:** class `safe-top-bar` (56px + `env(safe-area-inset-top)`).
- **Page content:** class `pb-above-nav` so the last table card or button is never hidden behind the nav.
- **Toasts:** class `toast-offset`, which places them above the bottom nav on mobile.
- **Form sheet (full screen on mobile):** sticky footer uses `safe-sheet-footer`; the sheet covers the nav.
- Nav items are at least 44px tall and the full 50% width of the bar (large tap target).

---

## 5. Shape, elevation, icons

| Token | Value | Use |
|---|---|---|
| `rounded-control` | 8px | Buttons, inputs, selects |
| `rounded-card` | 14px | Cards, table container, menus, toasts |
| `rounded-modal` | 16px | Dialogs and sheets (top corners only on mobile sheet) |
| `rounded-hero` | 20px | Branded page banners |
| `rounded-full` | pill | Status badges, avatars |
| `shadow-card` | 0 1px 2px rgba(16,24,44,.045), 0 6px 16px rgba(16,24,44,.035) | Bordered panels |
| `shadow-control` | 0 1px 2px rgba(26,36,48,.16) | Solid action buttons |
| `shadow-pop` | 0 8px 24px rgba(26,36,48,.12) | Menus, dialogs, toasts only |

Panels use a 1px `border-line` and a shallow shadow. Reserve stronger elevation for floating layers.
Icons: **Lucide React only**. 16px inline with text, 20px in nav and buttons, stroke 1.75.
Icon-only controls always have an accessible name (`aria-label`).

---

## 6. Components

Every interactive component defines: default, hover, focus-visible, pressed, disabled, loading.

### Buttons
Min height: 40 desktop (`min-h-control`), 44 mobile (`min-h-touch`). Padding 16 horizontal. 600 weight.

| Variant | Default | Hover | Pressed | Use |
|---|---|---|---|---|
| Primary | `brand-600`, white text | `brand-700` | `brand-700` + scale .98 | One per view (Add lead, Save, Log in) |
| On dark | `brand-200`, navy text | `brand-50` | scale .98 | Primary action in a dark banner |
| Secondary | surface, `line-input` border, `fg` text | `surface-hover` | scale .98 | Cancel, Clear filters |
| Danger | `error`, white text | darker 8% | scale .98 | Delete confirm only |
| Ghost / icon | transparent, `fg-2` | `surface-muted` | scale .98 | Row actions (min 44x44 hit area on touch) |

Disabled: 50% opacity, `cursor-not-allowed`. Loading: spinner replaces nothing; label stays, button
is disabled (`aria-busy="true"`), so double-submits are impossible.

### Inputs, selects, form fields
Persistent visible label above the field (never placeholder-only). Mark optional fields "(optional)";
all six lead fields are required except Status on create (default New).
Border `line-input`, hover border `fg-3`, focus: 2px brand ring. Error: `error` border, message below
with an alert icon, linked by `aria-describedby`, field gets `aria-invalid="true"`.
Server `fields` errors from the API map onto the same field messages. Values are preserved when a request fails.

### Cards
The dashboard starts with its title and a lead-list link on the left and the pipeline distribution
on the right. KPI cards below have indigo, blue, amber, and emerald surfaces, with the conversion
rate attached to the Converted metric. The dark daily activity chart anchors the charts row.

### Login

Desktop uses a full-height split layout with a navy-to-teal brand panel, a diagram of the five lead
statuses, and a light sign-in panel. At smaller widths, the brand reduces to a compact header above
the form.

### Table (Leads)
The Leads banner places the result count beside the primary action. Filters, table, and pagination
share one white work surface at tablet widths and larger. Mobile cards group the identity and
status at the top, then show the contact details and actions.
Header: `surface-muted`, `text-caption fg-2`. Rows: 1px `line` divider, hover `surface-hover`.
Semantic `<table>`, `<th scope="col">`, visually hidden `<caption>`.
Row actions (Edit, Delete) are **always visible**, never hover-revealed.
Responsive: desktop shows all seven columns. Phone and Created stay on single lines, with a text
ellipsis and full-value title for unusually long phone formatting. Tablet moves both fields below
the lead identity. Mobile renders each lead as a stacked card with the same actions.
Pagination: "Showing 11-20 of 40", Previous / Next plus page numbers; `nav aria-label="Pagination"`,
`aria-current="page"` on the current page.

### Status badge
24px high pill, `text-badge`, 8px dot + label, `status-*` fg on bg tokens. Display-only.

### Status control (interactive, in rows and cards)
See section 7. Visually a badge with a chevron.

### Navigation
Navy navigation frames the workspace across breakpoints. Active items use a teal surface and a
`brand-200` marker with `aria-current="page"`. Inactive labels use `navy-200`. Icon-only rail items
have tooltips and accessible names.

### Modal and sheet
Desktop: centered, `max-w-modal`, `rounded-modal`, backdrop `ink-800` at 40%.
Mobile: full-screen sheet with a sticky header (title, close) and sticky footer (Cancel, Save).
The form sheet footer gives Cancel and Save equal widths on mobile.
Delete confirmation is a small centered dialog on every size.

### Dropdown / menu
Surface, `line` border, `rounded-card`, `shadow-pop`, 4px padding, items min 40px (44 on touch).
Selected item shows a check icon plus `brand-50` background (not color alone).

### Toast
Top-right on desktop, above the bottom nav on mobile. Max 3 visible, 4s auto-dismiss (errors persist until dismissed).
Success/info: `role="status"`. Error: `role="alert"`. Always has a close button.

### Tooltip
`ink-800` background, white 12px text, 8px 12px padding. Appears on hover **and** keyboard focus.
Used only for icon-only controls; never carries essential information.

### Empty, loading and error states
- Loading: skeleton rows (table) and skeleton cards (dashboard), no layout jump. Buttons use spinner, not skeletons.
- Empty (no leads): icon, one-line explanation, primary "Add lead". Empty (no filter match): "No leads match" plus "Clear filters".
- Error: plain-language message and a "Try again" button. Never show raw stack traces or codes.

---

## 7. Keyboard and accessibility specs

### Global
- First focusable element is a **Skip to main content** link (visible on focus).
- Each page has one `h1`. The heading receives focus on in-app page transitions. Initial loads
  follow normal tab order.
- Landmarks: `nav`, `main`, labelled regions. Focus ring is never removed; ring uses 2px offset.
- Tab order follows visual order: nav, page header action, filters, table/cards, pagination.
- Touch targets: 44px minimum on mobile.

### Status control (keyboard accessible)
A custom menu button, not a native `<select>`. Reason: on Windows, arrow keys on a closed native select
change the value immediately, which would fire a save request on every key press.

| Element | Behavior |
|---|---|
| Trigger | `<button aria-haspopup="menu" aria-expanded aria-label="Status for {Full Name}: {current}. Change status">` |
| Open | Enter, Space or ArrowDown; focus moves to the current status item |
| Menu | `role="menu"` with five `role="menuitemradio"` items, `aria-checked` on the current one |
| Move | ArrowUp / ArrowDown, Home / End, wraps no further than ends |
| Choose | Enter or Space saves via full PUT, closes the menu, returns focus to the trigger |
| Dismiss | Escape returns focus to the trigger. Tab and Shift+Tab close the menu and continue normal focus traversal. Outside click also closes it. |
| Pending | Trigger disabled with spinner, `aria-busy`; on success a toast "Status updated to {X}"; on failure the old status stays and an error toast shows |
| Touch | Same menu, items 44px tall; no hover dependency |

In the Add/Edit form the Status field is a normal labelled native `<select>`, because the value is only
committed on Save.

### Dialogs (Add/Edit lead, Delete confirm)
- `role="dialog"` for the form, `role="alertdialog"` for delete; `aria-modal="true"`, `aria-labelledby` (title),
  `aria-describedby` (description or error summary).
- Focus moves into the dialog on open: form -> first field; delete -> **Cancel** (safe default).
- Focus is trapped inside; Tab and Shift+Tab cycle. Background content is inert/hidden from screen readers; body scroll locked.
- Esc closes (disabled while a request is pending). Closing returns focus to the control that opened it.
- Backdrop click closes the delete dialog; it does **not** close the form if the user has typed changes
  (prevents accidental data loss).
- Delete dialog names the lead ("Delete Alex Morgan? This cannot be undone.") and Danger button reads "Delete lead".
- On submit with errors: focus moves to the first invalid field; an error summary is not required but field messages are.

### Forms and live regions
Required and optional marked in label text. Errors by text, icon and border (not color alone).
Toasts announce through `aria-live`. Search results count changes are announced politely ("12 leads found").

### Charts
Each chart has a heading and a visually hidden data table or a text summary (counts per category).
On the Lead Activity chart, focus the plot and press Left or Right to read exact daily counts.
The pipeline strip has `role="img"` with an `aria-label` summarizing counts, plus a visible legend with numbers.

---

## 8. Motion

Principles: motion explains a state change; it never decorates. Nothing animates on page load, in charts, cards or tables.

| Token | Value | Use |
|---|---|---|
| `duration-fast` | 120ms | Hover, color, menu close |
| `duration-base` | 160ms | Modal, sheet, toast, menu open |
| `ease-out` | cubic-bezier(.23, 1, .32, 1) | Entering |
| `ease-in` | cubic-bezier(.55, 0, 1, .45) | Leaving |

Rules: never `transition: all`; list properties explicitly (`transition-colors`, `transition-opacity`, `transition-transform`).
Animate `transform` and `opacity` only. Buttons press to `scale-[0.98]`.
Modal: fade + 8px rise. Sheet: 16px rise. Toast: fade + 8px rise.
`prefers-reduced-motion: reduce` collapses all animation and transition durations to near zero (see `index.css`).

---

## 9. Responsive rules

| Target | Width | Page padding | KPI cards | Dashboard charts | Leads |
|---|---|---|---|---|---|
| Desktop | 1440 (1024+) | 24 | 4 in a row | Trend 2/3 + Sources 1/3 | Full table |
| Tablet | 768 (768-1023) | 24 | 2 x 2 | Stacked full width | Condensed table |
| Mobile | 375 (<768) | 16 | 2 x 2 compact (or stacked) | Stacked | Cards |

No page-level horizontal scroll at any width. Filters wrap; on mobile the search box is full width
and Status/Source filters sit on one row below.

---

## 10. Data visualization rules

- Pipeline strip: five segments in status `dot` colors on navy, proportional to counts, 2px gaps, labels and counts below. Zero-count statuses stay in the legend.
- 30-day activity: one teal column per UTC day with a zero baseline, a navy plot surface, integer count ticks, and an exact-date tooltip. Plot each daily count directly from the API.
- Sources: horizontal bars in the acquisition accent palette, with visible names and a right-aligned count column outside the bar tracks. Keep API enum order.
- Every chart: title, units ("leads"), a bordered surface tooltip with a color marker and exact count, and an empty state when the total is 0.
- Conversion rate: `totalLeads ? convertedLeads / totalLeads * 100 : 0`, shown to one decimal place.

---
