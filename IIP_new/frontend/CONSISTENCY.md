# IBM Case Intelligence Platform — UI Consistency Guidelines

> **Rules every contributor must follow.**
> These rules protect the 95%+ consistency score achieved across Phases 1–4.
> See `COMPONENTS.md` for the full component API reference.

---

## The Five Golden Rules

### 1. Always use documented button classes

```html
<!-- ✅ -->
<button class="btn btn-primary btn-sm">${IC.plus} Add</button>

<!-- ❌ Inline style -->
<button style="background:#0f62fe;color:#fff;padding:5px 12px">Add</button>

<!-- ❌ Custom class outside components.css -->
<button class="my-add-button">Add</button>

<!-- ❌ Missing size class -->
<button class="btn btn-primary">Add</button>
```

---

### 2. Always use CSS variables — never hardcoded values

```css
/* ✅ */
color: var(--text-primary);
background: var(--red-bg);
font-size: var(--font-size-sm);
border-radius: var(--radius-sm);
gap: var(--space-2);
transition: background var(--t-fast);

/* ❌ */
color: #0f1117;
background: #fff1f1;
font-size: 12px;
border-radius: 6px;
gap: 8px;
transition: background 0.1s;
```

---

### 3. Always use `.search-input` for search bars

```html
<!-- ✅ Plain -->
<input class="search-input" placeholder="Search…">

<!-- ✅ With icon -->
<div class="search-wrapper">
  <span class="search-icon">${IC.search}</span>
  <input class="search-input" placeholder="Search…">
</div>

<!-- ❌ Custom class -->
<input class="my-search" placeholder="Search…">

<!-- ❌ Old dashboard-specific class -->
<input class="ov7-search-input" placeholder="Search…">
<input class="filter-input" placeholder="Search…">
```

---

### 4. Always use `.form-input-group` for icon + input wrappers

```html
<!-- ✅ -->
<div class="form-input-group">
  <span class="input-icon">${IC.search}</span>
  <input class="form-input" placeholder="Filter…">
</div>

<!-- ❌ Old ad-hoc pattern -->
<div style="position:relative">
  <span style="position:absolute;left:9px;top:50%;transform:translateY(-50%)">
    ${IC.search}
  </span>
  <input class="form-input" style="padding-left:30px">
</div>
```

---

### 5. Always use `IC.iconName` — never inline SVG

```javascript
// ✅
`<button class="btn btn-sm btn-ghost">${IC.copy} Copy</button>`

// ❌ Inline SVG — creates inconsistent sizes and duplication
`<button class="btn btn-sm btn-ghost">
  <svg width="14" height="14" viewBox="...">...</svg> Copy
</button>`
```

---

## Code Review Checklist

Before approving any PR touching dashboard JS or CSS, verify:

### Buttons
- [ ] Every `<button>` with a visual role has both a type class (`btn-*`) and a size class
- [ ] No `style="background:…"` on buttons
- [ ] No new button classes created outside `components.css`

### Inputs & Search
- [ ] All search inputs use `class="search-input"`
- [ ] All icon+input combos use `<div class="form-input-group">`
- [ ] No `style="padding-left:NNpx"` on inputs
- [ ] No `position:absolute` icon spans outside `.form-input-group`

### Colors & Typography
- [ ] All colors reference `var(--*)` tokens
- [ ] All font-size values reference `var(--font-size-*)`
- [ ] All font-family values reference `var(--font-sans)` or `var(--font-mono)`
- [ ] No hardcoded hex values (`#0f62fe`, `#198038`, etc.)
- [ ] No hardcoded `px` for spacing — use `var(--space-*)` or utility classes

### Icons
- [ ] All icons use `${IC.iconName}` — no inline `<svg>` blocks
- [ ] If a new icon is needed, it's added to the `IC` object at the top of the module

### Accessibility
- [ ] All interactive elements have `:focus-visible` states (inherited from `btn` base class, or explicit for custom elements)
- [ ] Icon-only buttons have `aria-label` or `title`
- [ ] Inputs have `placeholder` or a visible `<label>`
- [ ] No `outline: none` without a replacement focus indicator

### Mobile
- [ ] No fixed-width inputs without `max-width` or `flex` constraints
- [ ] Tested at 375px viewport width
- [ ] No horizontal overflow

### General
- [ ] No `<style>` tags inline in HTML/JS templates
- [ ] No `!important` added without a code comment explaining why
- [ ] No duplicate CSS class definitions
- [ ] `console.log` removed before merge

---

## Common Mistakes & How to Fix Them

| Mistake | Fix |
|---|---|
| `<button style="background:blue">` | Use `<button class="btn btn-primary btn-sm">` |
| `font-size: 12px` inline | Use `font-size: var(--font-size-sm)` |
| `color: #0f62fe` | Use `color: var(--ibm-blue-50)` |
| `border-radius: 6px` | Use `border-radius: var(--radius-sm)` |
| `padding-left: 30px` on input | Wrap in `.form-input-group` with `.input-icon` |
| `class="my-custom-search"` | Use `class="search-input"` |
| Inline `<svg>` in button | Use `${IC.iconName}` |
| `class="btn btn-primary"` (no size) | Add `btn-sm` or appropriate size |
| New CSS in a dashboard JS file | Add to `components.css` with a comment |
| Duplicating a status badge manually | Use `${Utils.statusBadge(c.Status)}` |

---

## Before Adding a New Component

1. **Check `COMPONENTS.md`** — does an existing component already solve it?
2. **Check `variables.css`** — use existing tokens, don't introduce new ones without discussion
3. **Check `components.css`** — does a similar pattern already exist to extend?
4. **Ask:** can this be a modifier class on an existing component instead?
5. **If truly new:** add it to `components.css` with:
   - A section comment explaining purpose and use cases
   - `:hover` state
   - `:focus-visible` state
   - A usage example in `COMPONENTS.md`

---

## Consistency Score — Target: 95%+

| Area | Standard | Status |
|---|---|---|
| Search bars | All use `.search-input` | ✅ Phase 1 |
| Button types | All use `.btn-[type]` | ✅ Phase 2 |
| Button focus states | All have `:focus-visible` | ✅ Phase 2 |
| Icon+input wrappers | All use `.form-input-group` | ✅ Phase 4 |
| Custom buttons centralized | All in `components.css` | ✅ Phase 2 |
| Missing search features | Investigate + Info added | ✅ Phase 3 |
| Inline padding-left | Eliminated | ✅ Phase 4 |
| Ad-hoc `position:absolute` icon spans | Eliminated | ✅ Phase 4 |

---

## Dashboard Inventory

| Dashboard | File | Search | Standardized |
|---|---|---|---|
| Overview | `overview.js` | `ov7-table-search` | ✅ |
| Weekly Tracker | `weekly-tracker.js` | `wt-search`, `wt-hist-search` | ✅ |
| Admin | `admin-dash.js` | `admin-search`, `history-search` | ✅ |
| Members | `members.js` | `members-search` | ✅ |
| Performance | `performance.js` | `perf-search` | ✅ |
| RFE Tracking | `rfe-tracking.js` | `rfe-search` | ✅ |
| RFE Tracking Advanced | `rfe-tracking-advanced.js` | `rfe-search` | ✅ |
| Changelog | `changelog.js` | `cl-search` | ✅ |
| Info | `info.js` | `dir-search`, `alm-search` | ✅ |
| Investigate | `investigate.js` | `inv-archive-search` | ✅ |
| Closed | `closed.js` | Date/number filters only | ✅ |
| Team | `team.js` | — | ✅ |
| Created | `created.js` | — | ✅ |
| Customer | `customer.js` | — | ✅ |
| Closed Combined | `closed-combined.js` | — | ✅ |
| Team Combined | `team-combined.js` | — | ✅ |

---

## File Locations Reference

| What | Where |
|---|---|
| All UI components | `frontend/css/core/components.css` |
| Design tokens (colors, fonts, spacing) | `frontend/css/core/variables.css` |
| Base reset & body styles | `frontend/css/core/base.css` |
| Layout utilities | `frontend/css/core/layout.css` |
| Modal styles | `frontend/css/features/modals.css` |
| Table styles | `frontend/css/features/tables.css` |
| Atlassian card styles | `frontend/css/features/atlassian.css` |
| This guide | `frontend/CONSISTENCY.md` |
| Component API reference | `frontend/COMPONENTS.md` |
