# Afintrix design guidelines (v3, "Dispatch board")

How to build a new screen so it matches the rest of the product. The values are in `DESIGN_SYSTEM.md`; the markup and API are in `UI_COMPONENTS.md`.

## Start from a template

| The screen… | Use |
|---|---|
| creates or edits one record | Form template (worksheet + readout + checks) |
| shows many records with a workflow | List view template: board by state (counts, money totals, the allowed move), with the table one click away |
| shows many records without a workflow | The table view of the list template (filter chips, preview, bulk bar) |
| shows a calculated result | Report template (parameters, statement, readout) |
| is a start page for a role | Dashboard template (figures band, the day as a board: Waiting for you / In progress / Done today, shortcuts) |
| shows a submitted record | Document view (chevron ribbon, facts, lines, position readout) |
| runs payroll | Payroll run as a board (Needs attention / Ready to pay / On hold, totals band, gated submit) |

Every page sits in the desk frame: top bar with jump search, the action trail under it, sidebar, work area, optional readout column. Every record with a workflow carries its chevron ribbon at the top.

## Actions

- **One gold button per screen**: the step that moves the work forward (Save draft is secondary; Submit for approval is primary).
- Give frequent actions a shortcut and print it on the button. Standard keys:

| Key | Action |
|---|---|
| `Ctrl K` | Jump to a record or page |
| `Ctrl S` | Save |
| `Ctrl ↵` | Submit, run, or confirm the open panel |
| `Ctrl Z` | Undo the last change reported in the status bar |
| `Alt N` | Add a line |
| `←` `→` on a card | Move it to the previous or next column (`Home` / `End` for first / last) |
| `Alt` + letter | Record-specific actions (Receive, Bill…) |
| `/` | Search in a list |
| `J` `K` or `↑` `↓`, `↵`, `X` | Move, open, select in a list |
| `N` | New record (on a list page) |
| `Esc` | Close a panel, then clear a selection |

- Disabled buttons look disabled and the reason is written next to them ("Approve the payroll run first.").
- A move that the rules refuse keeps the ticket where it was and says why in the trail. Never move a ticket silently.
- Destructive actions ask in a docked panel that lists what will happen. Deletes that cannot be undone ask for the typed word `DELETE`. Everything else offers Undo instead of asking.

## Where messages go

| What happened | Where |
|---|---|
| Result of an action (saved, sent, held) | A chip in the action trail, with Undo if possible |
| A problem with fields | Error summary at the top of the form (it takes focus) + the message under each field + the checks list in the readout |
| A problem with the page or record | Banner at the top of the work area |
| Nothing to show | Empty state that offers the next step |
| The page itself failed (403, 404, 500) | Error page with what happened, what to do, and a reference code |
| Pages without a desk (login) | Floating message at the bottom left |

There is no footer status bar in v3: the trail under the top bar holds the last six results.

Fields are checked when you leave them, never while typing the first time.

## Writing

- Sentence case everywhere ("Submit for approval", not "Submit For Approval").
- Buttons say exactly what happens, and the result uses the same verb: "Hold pay" → "Tom Becker's pay is on hold."
- Errors name the problem and the fix: "Nov 14 is a Saturday. Pick Fri, Nov 13 or Mon, Nov 16." Never "Invalid input", never a traceback.
- Use people's and records' real names; use numerals for counts and money with two decimals.
- No product names of the underlying platform anywhere in the interface. Footer and login show "Powered by Afintrix".

## Accessibility floor

- Contrast 4.5:1 for text, 3:1 for large text and focus rings, in light and dark.
- Everything works from the keyboard; focus is always visible; docks trap focus and return it when closed.
- Every input has a visible label; icon-only buttons have an `aria-label`.
- Trail chips are live regions (`role="status"`, errors `role="alert"`); error summaries use `role="alert"`.
- Colour is never the only signal: lamps carry words, invalid fields carry a message.
- Motion respects `prefers-reduced-motion`. The signature pad accepts typing as well as drawing.

## Don'ts

- No rounded cards, gradients, glows or drop shadows on panels.
- No centred modals for confirmations: dock them.
- No toasts in the corner of a desk page: use the trail.
- No new colours: use a token, or add one to the system first.
- No numbered decorations unless the content is a real sequence (wizard steps, workflow states).
