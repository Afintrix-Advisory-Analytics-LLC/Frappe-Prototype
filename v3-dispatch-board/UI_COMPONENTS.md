# Afintrix UI components (v3, "Dispatch board")

Live reference with copyable HTML: `Afintrix_UI_Components_v3.html` in this folder. Files: `afintrix-ui/`. (v2, "Control desk": `../v2-control-desk/`, same classes without the board. v1, "Ledger": `../v1-ledger/`.)

## Setup

```html
<link rel="stylesheet" href="afintrix-ui/afintrix-ui.css">
<script src="afintrix-ui/afintrix-ui.js" defer></script>
<body class="ax"> … </body>
```

The stylesheet imports the fonts; the script injects the icon sprite and starts every behaviour. `starter.html` is a working page.

## Components

| Component | Main classes | Behaviour (`data-ax`) |
|---|---|---|
| Desk frame | `ax-desk` (`is-no-read`, `is-plain`, `is-framed`), `ax-desk-top`, `ax-trail` (`data-trail`, `ax-trail-label`, `ax-chip`), `ax-desk-nav`, `ax-desk-work`, `ax-desk-read`, `ax-skip` | `desk` |
| Jump search | `ax-jump`, `ax-jump-box` | `jump` (`data-items`) |
| Buttons | `ax-btn` (`is-secondary`, `is-quiet`, `is-txt`, `is-danger`, `is-frame`, `is-sm`, `is-lg`, `is-icon`, `is-busy`), `ax-btn-row`, `ax-kbd` | `data-key="ctrl+s"` |
| Fields | `ax-fields` (`is-2/3/4`), `ax-field` (`is-invalid`, `is-wide`, `is-span-2`), `ax-label`, `ax-req`, `ax-input`, `ax-help`, `ax-err`, `ax-affix`, `ax-check`, `ax-radio`, `ax-switch`, `ax-pw`, `ax-strength` | `amount`, `password` |
| Link field, tokens | `ax-combo`, `ax-tokens`, `ax-token` | `combobox` (`data-options`, `data-create`), `tokens` |
| Upload | `ax-drop`, `ax-files` | `upload` (`data-max-mb`) |
| Lamps, counts, meter | `ax-lamp` (`is-ok/warn/info/bad/off/live`), `ax-count`, `ax-meter` | none |
| Chevron ribbon | `ax-rail` (`li.is-done`, `is-current`, `is-stopped`, optional `<small>` line) | none |
| Lanes and tickets | `ax-board` (`is-fixed`, `is-4`), `ax-col` (lane: `is-warn`, `data-col`, `data-empty`), `ax-col-head` (count numeral + label), `ax-col-sum` (`data-sum`), `ax-cards`, `ax-card` (ticket: `draggable`, `is-static`, `data-id`, `data-amount`, `data-to`), `ax-card-head`, `ax-card-row`, `ax-card-acts` (stub row), `ax-board-note` | `board`; buttons `data-move-to="col"`, gate button `data-gate-col="col"` |
| Totals band | `ax-band` (`dd.is-big`, `data-out`) | `readout` |
| Tabs, segments, menus | `ax-tabs`, `ax-seg`, `ax-menu-wrap`, `ax-menu` | `tabs`, `seg`, `menu` |
| Panels, facts | `ax-panel`, `ax-panel-head` (`is-tabs`), `ax-panel-body`, `ax-panel-foot`, `ax-facts` | none |
| Readout, checks | `ax-readout`, `ax-figs` (`is-big`), `ax-checks` | `readout` |
| Worksheet form | `ax-ws`, `ax-ws-sec`, `ax-errsum` | `worksheet` |
| Line items | `ax-table ax-lines`, `ax-cell-input`, `ax-idx`, `ax-lines-add` | `grid` (`data-readout`, `data-tax`) |
| Table | `ax-table-wrap`, `ax-table` (`is-stack`) | none |
| List view | `ax-list`, `ax-list-bar`, `ax-list-search`, `ax-filters`, `ax-chip`, `ax-list-body`, `ax-preview`, `ax-bulk`, `ax-list-foot` | `listview` (`data-rows`, `data-columns`, `data-choices`) |
| Report | `ax-params`, `ax-statement`, `ax-rgroup`, `ax-subtotal`, `ax-grand`, `ax-report-meta` | `report` |
| Charts, figures | `ax-chart`, `ax-figures`, `ax-fig` | `chart` (`data-type="bar|line|donut|spark"`) |
| Dashboard | `ax-queue`, `ax-shortcuts` | none |
| Docked panels | `ax-scrim`, `ax-dock` (`is-wide`, `is-danger`), `ax-dock-head/body/foot`, `ax-inline-dock`, `ax-steps` | `open`, `confirm`, `wizard` |
| Messages | `ax-banner` (`is-info/ok/warn/bad`), `ax-errsum`, `ax-empty`, `ax-errpage`, `ax-toast` | `toast`, `banner` |
| Login | `ax-auth`, `ax-auth-brand`, `ax-auth-card`, `ax-otp` | `login` |
| Document view | `ax-activity`, `ax-doc-lines` | none |
| Payroll run | desk + board with employee cards `article.ax-card[data-id][data-emp][data-rate][data-w4]`, `[data-hours]`, `[data-gross]`, `[data-net]`, buttons `[data-pay-save]`, `[data-pay-submit][data-gate-col="attn"]` | `payboard` (with `board`) |
| W-4 signature | `ax-sign` | `sign` |

## JavaScript API

| Call | Does |
|---|---|
| `AxUI.init(el)` | Starts behaviours in markup added later (call after a React render). |
| `AxUI.say(text, { tone, undo, from })` | Adds a chip (newest first, six kept) to the trail of the desk that contains `from`; `undo` adds Undo and Ctrl Z. Without a desk it shows a floating message. |
| `AxUI.toast({ title, text, tone, undo })` | Floating message (pages without a desk). |
| `AxUI.confirm({ title, text, consequences, typed, ok, danger })` | Docked confirm; resolves `true` or `false`. |
| `AxUI.openDialog(scrim)` / `AxUI.closeDialog(scrim)` | Open or close a docked panel; focus is trapped and returned. |
| `AxUI.readout(el, { key: value })` | Sets `[data-out="key"]` values (money by default, `data-format="int|text"`) and highlights changes. |
| `AxUI.boardMove(boardEl, id, col)` | Moves a card from script (same rules and events as a drag). |
| `AxUI.checks(listEl, [{ tone, text, fix, onFix }])` | Fills a checks list. |
| `AxUI.validate(input)` | Returns the error message for a field, or `''`. |
| `AxUI.bizday('2026-11-14')` | Returns why a date is not a business day, or `''`. |
| `AxUI.signature(el)` | PNG data URL of a signature pad, or `null`. |

## Events

All bubble and carry `event.detail`.

| Event | From | Detail |
|---|---|---|
| `ax:save`, `ax:submit` | worksheet | form values (`submit`: `{ action, data }`) |
| `ax:total` | grid | `{ lines, subtotal, tax, total }` |
| `ax:filter`, `ax:preview`, `ax:bulk` | listview | filters and search, the row, `{ action, ids }` |
| `ax:run`, `ax:drill` | report | parameters, `{ account }` |
| `ax:command` | jump | the picked item |
| `ax:pick`, `ax:create`, `ax:change` | combobox, tokens | option, `{ value, doctype }`, `{ values }` |
| `ax:move` (cancelable), `ax:moved`, `ax:board` | board | `{ id, from, to, card }`; `preventDefault()` on `ax:move` refuses the move; `ax:board` carries the counts per column |
| `ax:payrun` | payboard | `{ action, totals, held }` |
| `ax:signin`, `ax:otp` | login | `{ usr }`, `{ code }` |
| `ax:confirm`, `ax:open`, `ax:close` | confirm button, docks | `{ yes }` |
| `ax:tab`, `ax:seg`, `ax:menu` | tabs, segments, menus | id, value, action |
| `ax:files`, `ax:signed`, `ax:cleared` | upload, signature | counts |

## Shortcuts

Add `data-key` to any button, link or input: `ctrl+s`, `ctrl+enter`, `alt+n`, `/`, `n`. Several keys: `data-key="ctrl+s, ctrl+shift+s"`. Single keys never fire while typing. With a dock open, only its own shortcuts work. Show the key with `<span class="ax-kbd">Ctrl S</span>`; on a Mac the script shows ⌘.

## Using it in React

- Render the same markup (use `className`). After mount, call `AxUI.init(ref.current)`.
- Listen to `ax:*` events with `addEventListener` in an effect; send the data to the API there.
- Behaviours own the inner state of their element (list rows, combobox list, readout values). Re-render the element with new `data-*` attributes and call `AxUI.init` again, or update values through `AxUI.readout` / `AxUI.checks`.
- Add `data-guard` to a worksheet form to warn before leaving with unsaved changes.
- Data sources for each component are listed in the "Data & API for the developer" note of each section in the component library.
