# Afintrix design system (v3, "Dispatch board")

The values behind every component in `afintrix-ui/afintrix-ui.css` (v2, "Control desk", shares the same tokens and lives in `../v2-control-desk/afintrix-ui/`). They are CSS custom properties on `:root`; change them there, never in a component.

## Idea

The work sits inside a frame: top bar with jump search, sidebar, and a status bar at the bottom. In light mode the frame is white with hairline borders; in dark mode it is near-black navy. Five rules make the product feel like one tool:

1. **Stages are the layout.** Records with a workflow are cards in columns. The column name is the state; the column total is the answer. Tables stay for ledgers and reports.
2. **Moving a card is the action.** Drag it, press ← → on it, or use the button on the card. A move that is not allowed is refused with the reason.
3. **Every record shows its stage.** A chevron ribbon sits at the top of each record (done in blue tint, current in navy), with one gated button to the next stage.
4. **The trail remembers.** Every action becomes a chip in the action trail under the top bar, newest first, with Undo (`Ctrl Z`) when it can be undone. There is no footer bar.
5. **Panels dock, never cover.** Confirmations and quick entry slide in at the right edge; the board stays visible while you decide.

Lamps (a small square plus the state in words) mark state on cards and rows; colour is never the only signal. Totals that change are recomputed at once and highlighted briefly.

## Colour

| Token | Light | Role |
|---|---|---|
| `--ax-frame` | `#FFFFFF` (dark: near-black navy) | Top bar, trail, sidebar, with `--ax-frame-line` hairlines |
| `--ax-navy` block | `#121CA4` + white text | Current page in the sidebar (with the 4px gold marker) and the current ribbon step |
| `--ax-navy` | `#121CA4` | Brand wordmark, current workflow step |
| `--ax-figure` | `#121CA4` (dark: `#B9C4FF`) | Key totals, grand totals, error codes |
| `--ax-blue` | `#1E39D6` | Focus, links, checkboxes, info lamps, chart series 1 |
| `--ax-gold-fill` / `--ax-on-gold` | `#D5AA55` / white | The one primary action, "needs you" badges, avatar |
| `--ax-gold-fill-hover` | `#9C6B1C` | Primary hover |
| `--ax-gold` | `#D5AA55` | Sidebar marker, "needs you" lamps, chart series 2 |
| `--ax-canvas` | `#F3F4F9` | Work area and lanes |
| `--ax-surface` | `#FFFFFF` | Panels, tables, readout |
| `--ax-line` | `#DEE2EE` | Borders, lane rules, ticket tear lines (dashed `--ax-line-strong`) |
| `--ax-text` / `--ax-heading` | `#24294A` / `#0E1340` | Body / headings and values |
| `--ax-muted` | `#596079` | Help text, labels in lists, timestamps |
| `--ax-ok` / `--ax-bad` | `#1E7B4F` / `#B42318` | Done, paid / failed, overdue, errors |
| `--ax-warn` / `--ax-warn-ink` | `#D5AA55` / `#7A4E0E` | Lamp square / its text |
| `--ax-changed` | `#F8E7BF` | A readout value that just changed |

Dark mode follows the OS, or set `data-theme="dark"` (or `"light"`) on `<html>`. Every token has a dark value; components need no dark-specific code.

The dark values are the Afintrix Platform's "Sapphire · Dark" tier, so the components match the platform exactly: canvas `#0c101a`, panels `#131826`, sunk fields `#181e2c`, lines `#252b3a`; heading text `#f7f8fb`, body `#b4bccb`, muted `#8a93a5`; brand lifted to `#6e86f2` (links and current items `#a3b2f8`, focus ring `rgba(110,134,242,.18)`); gold lifted to `#e2be79` with dark text `#080b18` on buttons, hover `#dfa94d`; the sidebar keeps the navy rail (`#0d1466`, hover `#151d80`, current `#1e2a9c`, text `#aab4ec`); green `#48b98a`, red `#e8776b`, with their tints `#12271e` and `#2a1715`.

Text contrast is at least 4.5:1 in both themes. Gold text is never placed on white: lamps use `--ax-warn-ink` for the words. Gold buttons and badges carry white text.

## Type

- **Montserrat** (600–800): page titles 24px/800, lane counts 40px/800, band figures 26px/700, ticket names 14px/700, lane and band labels 11px/600 uppercase tracked, figures with tabular numerals.
- **Poppins** (400–600): body 13.5px, tables 13px, help and meta 12px. Nothing below 11px (keycaps and counts use 11px).
- Field labels: Poppins 12px, 600, uppercase, letter-spacing .05em (Afintrix field standard).
- All money and counts use tabular figures so columns line up.

## Shape and space

- Surfaces (panels, tables, docks, banners): square corners. Tickets (cards) have one notched corner (top right, 14px) and a dashed tear line under their header. Lanes are separated by rules, not boxes.
- Buttons: 10px radius. Fields: 8px radius. The login card: 14px.
- Field style: `#FAFBFD` fill, `#E4E8F2` hairline, gold-tinted hover, blue focus border with a 3px focus ring.
- Density: buttons 34px (28 small, 42 large), fields 34px, table rows 40px. Panel padding 14px; gaps 8 / 14 / 22px.
- Shadows only on things that float: menus, lists, docks, toasts. Never on panels.

## Motion

- Motion answers an action: a dock slides in (220ms), a moved ticket settles into its lane (280ms), a new chip slides into the trail (220ms), a changed figure fades from gold (1.2s).
- Charts draw once on load (bars grow, lines reveal, slices fade, about 1s).
- Nothing loops except the "syncing" lamp. `prefers-reduced-motion` turns all of it off.

## Icons

24px-grid stroke icons (1.75px), shown at 14, 16 or 22px. Use `<svg class="ax-i"><use href="#ax-i-name"></use></svg>`; the sprite is injected by the script. Icon-only buttons always carry an `aria-label`.

## Breakpoints

| Width | Desk behaviour |
|---|---|
| > 1100px | Sidebar, work, readout side by side |
| ≤ 1100px | Sidebar opens from the menu button |
| ≤ 820px | Readout moves above the work |
| ≤ 600px | Tables become stacked cards (`.ax-table.is-stack`) |
| ≤ 560px | All field grids become one column; docks take the full width |
