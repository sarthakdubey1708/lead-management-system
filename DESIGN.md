# DESIGN.md — BizLeap Lead Management System (v1.0)

**Direction: "Pipeline Desk."** A calm, data-first, border-led CRM workspace with one brand color
and a segmented pipeline strip as its signature element.

This file is the single source of truth for the frontend design. Tokens are implemented in
`client/tailwind.config.js` and global behavior in `client/src/index.css`. If a component, skill
or habit conflicts with this file, this file wins; change this file first, then the code.

---

## 1. Color

All colors are Tailwind tokens. Do not write hex values or invent local colors in components.

| Role | Token (class suffix) | Hex | Use |
|---|---|---|---|
| Primary | `brand-600` | #0E5A5F | Primary buttons, links, focus ring, chart brand color |
| Primary hover/pressed | `brand-700` | #0A4A4E | Hover and active state of primary |
| Primary tint | `brand-50` | #E3F1F1 | Active nav item, selected row/option |
| Secondary (ink) | `ink-800` | #1F2D3A | Headings, tooltip background |
| App background | `canvas` | #F6F5F1 | Page background |
| Surface | `surface` | #FFFFFF | Cards, table, modals, inputs, nav |
| Surface muted | `surface-muted` | #F0EEE8 | Table header |
| Surface hover | `surface-hover` | #FAF9F6 | Table row hover |
| Text primary | `fg` | #1A2430 | Body and data |
| Text secondary | `fg-2` | #4B5663 | Table headers, labels, helper text |
| Text muted | `fg-3` | #5F6875 | Captions, placeholders, metadata |
| Divider | `line` | #E4E2DA | Card borders, row dividers (decorative) |
| Divider strong | `line-strong` | #CFCCC1 | Emphasized dividers, hover borders (decorative) |
| Input border | `line-input` | #8C8A80 | Input/select/checkbox boundary (must be >= 3:1) |
| Success | `success` / `success-bg` | #166534 / #E3F4E8 | Success toast, confirmations |
| Warning | `warning` / `warning-bg` | #92400E / #FEF3C7 | Warnings |
| Error | `error` / `error-bg` | #B42318 / #FDECEA | Validation errors, danger button, error toast |
| Info | `info` / `info-bg` | #1D4ED8 / #E8EEFB | Informational notices |

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
- Source chart (Website, Instagram, ...) uses a single `brand-600` color, because sources are not statuses.

---

## 2. Verified contrast (WCAG 2.x, computed from the hex values above)

Targets: text >= 4.5:1, UI boundaries, focus indicators and meaningful graphics >= 3:1.

| Pair | Ratio | Target | Result |
|---|---|---|---|
| `fg` on surface / canvas | 15.68 / 14.38 | 4.5 | Pass |
| `fg-2` on surface / canvas | 7.47 / 6.85 | 4.5 | Pass |
| `fg-3` on surface / canvas | 5.64 / 5.17 | 4.5 | Pass |
| `fg-2` / `fg-3` on table header (`surface-muted`) | 6.44 / 4.86 | 4.5 | Pass |
| `fg` on row hover | 14.90 | 4.5 | Pass |
| White on primary button / hover | 7.94 / 9.99 | 4.5 | Pass |
| White on danger button | 6.57 | 4.5 | Pass |
| `brand-600` text on surface / on `brand-50` | 7.94 / 6.85 | 4.5 | Pass |
| White on tooltip (`ink-800`) | 14.05 | 4.5 | Pass |
| Badge label on fill: New / Contacted / Interested / Converted / Lost | 5.76 / 5.27 / 5.72 / 6.24 / 6.83 | 4.5 | Pass |
| Status dot on surface: New / Contacted / Interested / Converted / Lost | 4.63 / 3.59 / 4.57 / 3.38 / 4.49 | 3.0 | Pass |
| Status dot on canvas (pipeline strip) | 4.24 / 3.29 / 4.19 / 3.10 / 4.11 | 3.0 | Pass |
| Success / Warning / Error / Info text on own tint | 6.24 / 6.37 / 5.75 / 5.76 | 4.5 | Pass |
| Success / Warning / Error / Info text on surface | 7.13 / 7.09 / 6.57 / 6.70 | 4.5 | Pass |
| Input border `line-input` on surface | 3.46 | 3.0 | Pass |
| Error input border on surface | 6.57 | 3.0 | Pass |
| Focus ring `brand-600` on surface / canvas / `brand-50` | 7.94 / 7.27 / 6.85 | 3.0 | Pass |
| Placeholder (`fg-3`) on surface | 5.64 | 4.5 | Pass |

Ratios were calculated with the WCAG relative-luminance formula. They confirm the palette on paper;
real rendering (browser, monitor, dark mode) is checked in Stage 5.
`line` and `line-strong` are decorative dividers, not required to meet 3:1. Never use them for input boundaries.
Disabled controls are exempt from contrast rules but must remain legible (50% opacity, `fg-3` text).

---

## 3. Typography

Family: **IBM Plex Sans** (400, 500, 600) via `@fontsource/ibm-plex-sans`, fallback system sans.
Numbers in tables, KPIs and pagination use `tabular-nums`.

| Role | Class | Size / line height | Weight |
|---|---|---|---|
| Page title (one `h1` per page) | `text-h1` | 24 / 32 | 600 |
| Section title (`h2`) | `text-h2` | 18 / 26 | 600 |
| Card title (`h3`) | `text-h3` | 15 / 22 | 600 |
| Body, table cells, inputs (desktop) | `text-body` | 14 / 22 | 400 |
| Inputs on mobile (prevents iOS zoom) | `text-body-lg` | 16 / 24 | 400 |
| Status badge label | `text-badge` | 13 / 16 | 500 |
| Labels, captions, helper text | `text-caption` | 12 / 16 | 500 |
| KPI number | `text-kpi` | 32 / 36 | 600 |

Rules: sentence case everywhere, no all-caps micro labels. Nothing important (names, status, dates,
errors) is below 13px. Captions (12px) are for helper text and metadata only. Line length in forms and
descriptions stays under about 65 characters.

---

## 4. Spacing and layout

4px base. Allowed steps: **4, 8, 12, 16, 20, 24, 32, 48** (`1, 2, 3, 4, 5, 6, 8, 12`).
Avoid odd values like `p-7` or `gap-[13px]`.

| Item | Value |
|---|---|
| Page padding | 32 desktop, 24 tablet, 16 mobile |
| Card padding | 20 (16 on mobile) |
| Grid gap | 16; 24 between major sections |
| Page header (title + primary action) to content | 24 |
| Table row height | 52, cell padding 12 x 16 |
| Form: field gap / label to input | 16 / 6 |
| Page content max width | 1200 (`max-w-content`), centered |

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
| `rounded-control` | 6px | Buttons, inputs, selects |
| `rounded-card` | 8px | Cards, table container, menus, toasts |
| `rounded-modal` | 12px | Dialogs and sheets (top corners only on mobile sheet) |
| `rounded-full` | pill | Status badges, avatars |
| `shadow-pop` | 0 8px 24px rgba(26,36,48,.12) | Menus, dialogs, toasts only |

Surfaces use a 1px `border-line` instead of shadow. No cards inside cards.
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
Surface, 1px `line` border, `rounded-card`, 20px padding. KPI card: label (`text-caption fg-2`), number
(`text-kpi`), supporting text (`text-caption fg-3`). Never decorative gradients.

### Table (Leads)
Container: card with `overflow-x: auto` only as a last resort (should not trigger at 768+).
Header: `surface-muted`, `text-caption fg-2`. Rows: 1px `line` divider, hover `surface-hover`.
Semantic `<table>`, `<th scope="col">`, visually hidden `<caption>`.
Row actions (Edit, Delete) are **always visible**, never hover-revealed.
Responsive: desktop shows all seven columns; tablet folds Phone and Created into a second line under the lead name;
mobile renders each lead as a stacked card with the same actions.
Pagination: "Showing 11-20 of 40", Previous / Next plus page numbers; `nav aria-label="Pagination"`,
`aria-current="page"` on the current page.

### Status badge
24px high pill, `text-badge`, 8px dot + label, `status-*` fg on bg tokens. Display-only.

### Status control (interactive, in rows and cards)
See section 7. Visually a badge with a chevron.

### Navigation
Active item: `brand-50` background, `brand-600` text and icon, 2px left bar on the sidebar (top bar on mobile tab),
`aria-current="page"`. Inactive: `fg-2`. Icon-only rail items have tooltips plus `aria-label`.

### Modal and sheet
Desktop: centered, `max-w-modal`, `rounded-modal`, backdrop `ink-800` at 40%.
Mobile: full-screen sheet with a sticky header (title, close) and sticky footer (Cancel, Save).
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
- Exactly one `h1` per page; on route change focus moves to the page `h1` (`tabIndex={-1}`).
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
| Dismiss | Esc or Tab closes without saving, focus returns to the trigger; outside click also closes |
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
| Desktop | 1440 (1024+) | 32 | 4 in a row | Trend 2/3 + Sources 1/3 | Full table |
| Tablet | 768 (768-1023) | 24 | 2 x 2 | Stacked full width | Condensed table |
| Mobile | 375 (<768) | 16 | 2 x 2 compact (or stacked) | Stacked | Cards |

No page-level horizontal scroll at any width. Filters wrap; on mobile the search box is full width
and Status/Source filters sit on one row below.

---

## 10. Data visualization rules

- Pipeline strip: five segments in status `dot` colors, proportional to counts, 2px surface gaps, labels and counts below. Zero-count statuses stay in the legend.
- 30-day trend: single `brand-600` line, light `brand-50` area, no gradient. X axis uses the API's UTC `date` strings formatted without timezone conversion.
- Sources: horizontal bars, `brand-600`, value labels at bar ends, API enum order.
- Every chart: title, units ("leads"), tooltip, empty state when the total is 0.
- Conversion rate: `totalLeads ? convertedLeads / totalLeads * 100 : 0`, shown to one decimal place.

---

## 11. Changes from the Stage 1 draft (and why)

| # | Change | Reason |
|---|---|---|
| 1 | Input border `#CFCCC1` -> `line-input #8C8A80` | The Stage 1 border was 1.61:1 on white, below the 3:1 needed for a control boundary. |
| 2 | Contacted dot `#D99A1B` -> `#B97A00` | 2.45:1 on white, failed 3:1 for the pipeline strip and badge dot. |
| 3 | Added `surface-muted` and `surface-hover` tokens | Table header and row hover had no named token. |
| 4 | Added `*-bg` tints for success, warning, error, info | Toasts and notices need an accessible fill. |
| 5 | Badge text 12px -> 13px | Status is essential data and should not sit at caption size. |
| 6 | Mobile touch height 40 -> 44; mobile input text 16px | Easier tapping, no iOS zoom on focus. |
| 7 | Status control is a custom menu, not a native select | Prevents accidental saves on arrow keys (Windows), and is fully keyboard operable. |
| 8 | Added mobile safe-area rules and `pb-above-nav` | Bottom nav must clear the home indicator and not hide content. |
| 9 | No column sorting | The API contract fixes order to newest first; no sort parameter exists. |
