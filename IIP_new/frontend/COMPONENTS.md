# IBM Case Intelligence Platform — UI Component Library

> **Canonical reference for all reusable UI components.**
> All components live in `frontend/css/core/components.css`.
> Variables live in `frontend/css/core/variables.css`.
> Last updated: Phase 4 & 5 standardization.

---

## Table of Contents

1. [Buttons](#buttons)
2. [Search Input](#search-input)
3. [Form Inputs](#form-inputs)
4. [Form Input Group (Icon + Input)](#form-input-group)
5. [Status Badges](#status-badges)
6. [Severity Badges](#severity-badges)
7. [Notify Bars](#notify-bars)
8. [Icons (IC Object)](#icons-ic-object)
9. [Typography](#typography)
10. [Colors & Semantic Tokens](#colors--semantic-tokens)
11. [Spacing](#spacing)
12. [Border Radius](#border-radius)
13. [Transitions](#transitions)
14. [Z-Index Stack](#z-index-stack)

---

## Buttons

### Usage Rule: always combine **TYPE + SIZE**

```html
<button class="btn btn-primary btn-sm">Save</button>
```

Missing either part is a linting error. `btn` alone has no background — it is the base reset only.

### Type Classes

| Class | Color | When to use |
|---|---|---|
| `.btn-primary` | IBM Blue | Main/only action on a panel |
| `.btn-secondary` | Gray | Alternative or secondary action |
| `.btn-danger` | Red (outline) | Destructive action with confirmation |
| `.btn-danger-filled` | Red (solid) | Immediate destructive primary action (e.g. mark defect) |
| `.btn-success` | Green | Positive/create action |
| `.btn-ghost` | Transparent outline | Low-emphasis, tertiary action |
| `.btn-ai` | Purple | AI-powered feature buttons (Copilot, Knowledge Hub) |
| `.btn-overlay` | Semi-transparent white | Actions inside dark header bands only |
| `.btn-warning` | Yellow | Caution / irreversible actions (confirm wipe, reset) |
| `.btn-remove` | Red icon | Remove/delete icon-only button |
| `.btn-micro` | Neutral icon square | 28×28 compact icon button for table cells |

### Size Classes

| Class | Height | Font | When to use |
|---|---|---|---|
| `.btn-lg` | ~40px | 15px | Hero CTAs only |
| `.btn` (no size) | ~34px | 13px | Default / modal footers |
| `.btn-sm` | ~28px | 12px | **Most common — toolbar, card headers** |
| `.btn-xs` | ~24px | 11px | Dense toolbars, inline table actions |
| `.btn-2xs` | ~20px | 10px | Extremely compact contexts only |

### Examples

```html
<!-- Standard toolbar button -->
<button class="btn btn-primary btn-sm">
  ${IC.plus} Add Case
</button>

<!-- Destructive with confirmation -->
<button class="btn btn-danger btn-sm">
  ${IC.trash} Delete
</button>

<!-- AI feature -->
<button class="btn btn-ai btn-sm">
  ${IC.search} Ask Copilot
</button>

<!-- Dark header band -->
<button class="btn btn-overlay btn-sm">
  ${IC.undo} Undo
</button>

<!-- Compact table action -->
<button class="btn btn-micro" title="Open in Aha!">
  ${IC.link}
</button>

<!-- Icon-only remove -->
<button class="btn btn-remove btn-xs" aria-label="Remove item">
  ${IC.close}
</button>
```

### DO NOT

```html
<!-- ❌ Missing size -->
<button class="btn btn-primary">Save</button>

<!-- ❌ Missing type -->
<button class="btn btn-sm">Save</button>

<!-- ❌ Inline styles instead of classes -->
<button style="background:blue;color:#fff">Save</button>

<!-- ❌ Custom class outside components.css -->
<button class="my-special-save-btn">Save</button>
```

---

## Search Input

All search bars use **one class**: `.search-input`.

```html
<!-- Plain (no icon) -->
<input type="text" class="search-input" placeholder="Search…">

<!-- With icon — use .search-wrapper -->
<div class="search-wrapper">
  <span class="search-icon">${IC.search}</span>
  <input class="search-input" placeholder="Search case #, title, owner…">
</div>
```

`.search-wrapper` provides the relative positioning shell; `.search-icon` is the absolute-positioned SVG; `.search-input` inside a `.search-wrapper` gets `padding-left: 32px` automatically.

### Width control

```html
<!-- Fixed width: put it on the wrapper, not the input -->
<div class="search-wrapper" style="width:260px">
  <span class="search-icon">${IC.search}</span>
  <input class="search-input" placeholder="Search…">
</div>
```

### Dashboards using .search-input

| Dashboard | Input ID |
|---|---|
| Overview | `ov7-table-search` |
| Weekly Tracker (main) | `wt-search` |
| Weekly Tracker (history) | `wt-hist-search` |
| Admin (case search) | `admin-search` |
| Admin (history filter) | `history-search` |
| Members | `members-search` |
| Performance | `perf-search` |
| RFE Tracking | `rfe-search` |
| RFE Tracking Advanced | `rfe-search` |
| Changelog | `cl-search` |
| Info (contacts dir) | `dir-search` |
| Info (ALM lines) | `alm-search` |
| Investigate (archive) | `inv-archive-search` |

---

## Form Inputs

Standard text fields, selects, and textareas.

```html
<!-- Text input -->
<input class="form-input" placeholder="Enter value…">

<!-- Small text input -->
<input class="form-input form-input-sm" placeholder="Enter value…">

<!-- Select -->
<select class="form-select">
  <option>Option A</option>
</select>
```

`.form-input-sm` reduces padding to `4px 8px` and font-size to `12px`. Use for dense filter rows.

---

## Form Input Group

Wraps **any input** with a leading icon — replaces all ad-hoc `position:relative` + `position:absolute` icon patterns.

```html
<div class="form-input-group">
  <span class="input-icon">${IC.search}</span>
  <input class="form-input" placeholder="Search…">
</div>
```

Works with `.form-input` and `.search-input`:

```html
<!-- search-input variant -->
<div class="form-input-group" style="width:240px">
  <span class="input-icon">${IC.search}</span>
  <input class="search-input" style="height:30px;font-size:12px" placeholder="Filter history…">
</div>
```

### Icon offset

The `.input-icon` span is positioned at `left: 10px`, centered vertically. The input gets `padding-left: 32px` automatically. **Never set `padding-left` manually on an input inside `.form-input-group`.**

### Width

Set width on the `.form-input-group` div — the input stretches to fill it (`width: 100%; box-sizing: border-box`).

### DO NOT

```html
<!-- ❌ Old ad-hoc pattern — replaced by .form-input-group -->
<div style="position:relative">
  <span style="position:absolute;left:9px;top:50%;transform:translateY(-50%)">
    ${IC.search}
  </span>
  <input class="form-input" style="padding-left:30px">
</div>
```

---

## Status Badges

```html
${Utils.statusBadge(c.Status)}
```

Always use the `Utils.statusBadge()` helper. Never write status badge HTML manually.

Manual class reference (for reference only):

| Class | Color | Status |
|---|---|---|
| `.status-awaiting` | Yellow | Awaiting customer |
| `.status-ibm-work` | Blue | IBM working |
| `.status-wait-ibm` | Purple | Waiting on IBM |
| `.status-closed-i` | Green | Closed – IBM |
| `.status-closed-c` | Gray | Closed – customer |
| `.status-archived` | Purple | Archived |
| `.status-unknown` | Gray | Unknown |

---

## Severity Badges

```html
<span class="sev-badge sev-badge-1">1</span>  <!-- red -->
<span class="sev-badge sev-badge-2">2</span>  <!-- yellow -->
<span class="sev-badge sev-badge-3">3</span>  <!-- blue -->
<span class="sev-badge sev-badge-4">4</span>  <!-- green -->
```

---

## Notify Bars

In-page alert banners. Always add `margin-bottom` after them.

```html
<div class="notify-bar info">${IC.check} Info message</div>
<div class="notify-bar warn">${IC.warn} Warning message</div>
<div class="notify-bar error">${IC.warn} Error message</div>
<div class="notify-bar ok">${IC.check} Success message</div>
```

---

## Icons (IC Object)

**Never embed SVG inline.** Always use the `IC` constant defined at the top of each dashboard module.

```javascript
// ✅ Correct
`<button class="btn btn-primary btn-sm">${IC.plus} Add</button>`

// ❌ Wrong — inline SVG
`<button><svg width="14"...>...</svg> Add</button>`
```

### Available keys (admin-dash.js / most complete set)

| Key | Description |
|---|---|
| `IC.search` | Magnifier |
| `IC.plus` | Plus / add |
| `IC.check` | Checkmark |
| `IC.close` | × close |
| `IC.save` | Floppy disk |
| `IC.trash` | Bin / delete |
| `IC.upload` | Upload arrow |
| `IC.download` | Download arrow |
| `IC.undo` | Undo arrow |
| `IC.redo` | Redo arrow |
| `IC.history` | Clock / history |
| `IC.chevron` | Chevron down |
| `IC.arrow` | Right arrow |
| `IC.link` | Chain link |
| `IC.tag` | Tag / label |
| `IC.shield` | Shield |
| `IC.warn` | Warning triangle |
| `IC.perf` | Lightning bolt |
| `IC.select` | Checkbox list |
| `IC.dot` | Small dot |
| `IC.reassign` | Swap arrows |
| `IC.pkg` | Package / box |
| `IC.eye` | Visibility |

Info dashboard additionally defines: `IC.user`, `IC.users`, `IC.folder`, `IC.file`, `IC.table`, `IC.zap`, `IC.mail`, `IC.copy`, `IC.external`, `IC.edit`, `IC.clock`, `IC.phone`, `IC.opencase`, `IC.wiki`, `IC.template`.

> **Note:** Each dashboard module defines its own local `IC` constant. If you need an icon in a new dashboard, copy the relevant SVG entry from an existing module's `IC` object.

---

## Typography

### Font families

```css
font-family: var(--font-sans);   /* IBM Plex Sans — all UI text */
font-family: var(--font-mono);   /* IBM Plex Mono — case numbers, code, emails */
```

### Font size scale

| Variable | Value | Use |
|---|---|---|
| `--font-size-2xs` | 9px | Dense badges, labels |
| `--font-size-xs` | 11px | Secondary metadata, timestamps |
| `--font-size-sm` | 12px | Table body, descriptions |
| `--font-size-md` | 14px | Default body text |
| `--font-size-lg` | 16px | Section titles |
| `--font-size-xl` | 20px | Dashboard headings |
| `--font-size-2xl` | 24px | Hero numbers (KPI cards) |

```css
/* ✅ Use variables */
font-size: var(--font-size-sm);

/* ❌ Hardcoded — never do this */
font-size: 12px;
```

---

## Colors & Semantic Tokens

### Semantic text colors

| Token | Use |
|---|---|
| `--text-primary` | Main body text |
| `--text-secondary` | Supporting text, labels |
| `--text-tertiary` | Placeholder, hint text |
| `--text-disabled` | Disabled / empty state text |
| `--text-on-color` | Text on colored backgrounds |
| `--text-blue` | Inline link / blue text |

### Semantic background colors

| Token | Use |
|---|---|
| `--bg-ui` | Primary surface (cards, panels) |
| `--bg-layer` | Secondary surface (nested sections) |
| `--bg-layer-2` | Tertiary surface (table headers) |
| `--bg-page` | Page background |
| `--bg-input` | Input field background |
| `--bg-hover` | Hover state background |
| `--bg-selected` | Selected row/item |
| `--bg-card` | Card background |
| `--bg-tile` | Tile background |

### Border tokens

| Token | Use |
|---|---|
| `--border-subtle` | Light dividers, row separators |
| `--border-mid` | Default input / card borders |
| `--border-strong` | Emphasized borders |
| `--border-blue` | Focus or active state borders |

### Semantic accent colors

| Token | Use |
|---|---|
| `--red` / `--red-bg` | Error, destructive, Severity 1 |
| `--green` / `--green-bg` | Success, closed, positive |
| `--yellow` / `--yellow-bg` / `--yellow-text` | Warning, caution, Severity 2 |
| `--purple` / `--purple-bg` | AI features, archived |
| `--orange` / `--orange-bg` | Severity 2 alternate |
| `--ibm-blue-10` through `--ibm-blue-90` | IBM Blue scale |

```css
/* ✅ Always use semantic tokens */
color: var(--text-primary);
background: var(--red-bg);
border-color: var(--border-mid);

/* ❌ Never hardcode hex */
color: #0f1117;
background: #fff1f1;
border-color: #e0e0e0;
```

---

## Spacing

Use the spacing scale for `margin`, `padding`, `gap`. **Never hardcode pixel values.**

| Token | Value | Class shorthand |
|---|---|---|
| `--space-1` | 4px | `.mb-4`, `.mt-4` |
| `--space-2` | 8px | `.mb-8`, `.mt-8`, `.row-8` |
| `--space-3` | 12px | `.mb-12`, `.mt-12` |
| `--space-4` | 16px | `.mb-16`, `.mt-16` |
| `--space-6` | 24px | — |
| `--space-8` | 32px | — |

```css
/* ✅ Use spacing tokens or utility classes */
gap: var(--space-2);
margin-bottom: var(--space-4);

/* ❌ Never hardcode */
gap: 8px;
margin-bottom: 16px;
```

---

## Border Radius

| Token | Value | Use |
|---|---|---|
| `--radius-xs` | 3px | Tiny badges, tight corners |
| `--radius-sm` | 6px | Buttons, inputs, small cards |
| `--radius-md` | 10px | Cards, tiles, modals |
| `--radius-lg` | 14px | Large panels, hero sections |
| `--radius-xl` | 20px | Hero banners, pill elements |

```css
border-radius: var(--radius-sm);  /* inputs, buttons */
border-radius: var(--radius-md);  /* cards, tiles */
```

---

## Transitions

| Token | Value | Use |
|---|---|---|
| `--t-fast` | 0.1s | Hover states, icon color changes |
| `--t-base` | 0.18s | Most UI transitions (default) |
| `--t-slow` | 0.28s | Expand/collapse, panel open |
| `--transition-fast` | 0.12s ease | Shorthand with easing |
| `--transition-base` | 0.18s ease | Shorthand with easing |

```css
transition: background var(--t-fast);
transition: border-color var(--t-base), box-shadow var(--t-base);
```

---

## Z-Index Stack

| Token | Value | Layer |
|---|---|---|
| `--z-base` | 1 | Default stacking |
| `--z-dropdown` | 100 | Dropdowns, popovers, menus |
| `--z-sticky` | 200 | Sticky headers, status bars |
| `--z-overlay` | 500 | Sidebar backdrop, dim layers |
| `--z-modal` | 1000 | Dialogs, modals |
| `--z-toast` | 1100 | Toast notifications |
| `--z-tooltip` | 1200 | Tooltips (always topmost) |

```css
z-index: var(--z-modal);    /* dialogs */
z-index: var(--z-dropdown); /* custom selects */
z-index: var(--z-toast);    /* notifications */
```

---

## Quick Reference Card

```
BUTTON:        <button class="btn btn-[TYPE] btn-[SIZE]">
SEARCH INPUT:  <input class="search-input" placeholder="…">
SEARCH WRAP:   <div class="search-wrapper">
                 <span class="search-icon">${IC.search}</span>
                 <input class="search-input">
               </div>
FORM INPUT:    <input class="form-input" placeholder="…">
ICON INPUT:    <div class="form-input-group">
                 <span class="input-icon">${IC.search}</span>
                 <input class="form-input" placeholder="…">
               </div>
STATUS BADGE:  ${Utils.statusBadge(c.Status)}
SEV BADGE:     <span class="sev-badge sev-badge-[1-4]">N</span>
NOTIFY BAR:    <div class="notify-bar [info|warn|error|ok]">…</div>
ICON:          ${IC.iconName}  — never inline SVG
```
