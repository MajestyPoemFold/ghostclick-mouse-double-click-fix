# GhostClick design

GhostClick tests a mouse for chatter (ghost clicks), proves it, and filters it system-wide on
Windows 10 and 11. This document is the build spec: design system, screens, and the five killer
features with their algorithms and acceptance criteria. The HTML screens in `design/app/` are the
source of truth for layout; port them 1:1 (recommended stack: Tauri 2 + WebView2).

## 1. Concept

**A strip-chart recorder: a polygraph for your mouse.** The working surface is chart paper (white,
pale green grid, perforated edges) scrolling left past a carriage of ink pens, one pen per button.
A press draws a square pulse; a ghost click is a needle-thin spike that the recorder circles in red
ink with its timing. The window around the paper is the instrument's graphite housing.

It fits because chatter *is* a signal problem. People already describe it in recorder terms
("bounce", "spike", "it registers twice"), and a strip chart is the most honest way to show a
2.8 ms event to someone who has never seen one. The same paper becomes the evidence printout for
the warranty claim. It is the only light, paper-based app in the family; the grid, the ink and the
perforations carry it so it never reads as a generic light dashboard.

## 2. Tokens

Mirrors `design/tokens.css`. The app is light only, on purpose.

### Color

| Token | Value | Role |
|---|---|---|
| `--paper` | `#ffffff` | Chart paper. The only pure white |
| `--paper-panel` | `#f4f5f3` | Instrument panel behind everything in the content area |
| `--paper-sunk` | `#eceeeb` | Wells, inputs, the click target |
| `--paper-edge` | `#dfe3df` | Paper margins outside the grid |
| `--grid-minor` | `#dcefe0` | Grid line every unit (10 px) |
| `--grid-major` | `#a8d7b3` | Grid line every 5 units (50 px), paper margin lines |
| `--grid-label` | `#4f8c60` | Scale numerals printed on paper |
| `--ink` | `#15171a` | Black pen (L, M, X1, X2, wheel) and all text |
| `--ink-2` | `#454a50` | Secondary text |
| `--ink-3` | `#737a81` | Captions, caps labels |
| `--ink-blue` | `#1f46c6` | Blue pen: Right button only. Also focus ring |
| `--ink-red` | `#d3261d` | Red pen: ghost annotations, alerts, the ghost counter. Never decoration |
| `--ink-red-wash` | `#fdeceb` | Red ink bled into paper, behind alert chips and filtered bars |
| `--ink-green` | `#1c7a43` | Healthy verdicts ("0 dropouts", "kept") |
| `--ink-amber` | `#9a5b00` | Caution verdicts |
| `--graphite-900` | `#1e2023` | Title bar, rail, recorder deck, paper housings, sprocket holes |
| `--graphite-800` | `#292c30` | Pen carriage, hover on graphite |
| `--graphite-700` | `#3a3e43` | Carriage edge, pressed on graphite |
| `--graphite-300` | `#a9aeb3` | Text on graphite |
| `--graphite-100` | `#dadddb` | Bright text on graphite |
| `--rule` / `--rule-strong` | `#d8dcd8` / `#b7bdb8` | Hairlines between regions / control borders |
| `--win-close` | `#c42b1c` | Windows close button hover (system color) |

Rule for red: if it is red, it is a ghost click, a dropout, or something the user must act on.

### Type

| Token | Size | Use |
|---|---|---|
| `--font-ui` | SF Pro Rounded | All UI and counters. Friendly and tactile, like a mouse button |
| `--font-mono` | SF Mono | Every timing in ms, timestamps, annotations on paper, hashes |
| `--t-caps` | 11 px, 600, `.08em`, uppercase | Section labels ("GHOST DOUBLES") |
| `--t-meta` / `--t-small` / `--t-body` | 12 / 13 / 14 px | Meta lines / dense UI / default |
| `--t-lead` | 16 px | Emphasised lines |
| `--t-panel` | 19 px, 600 | Panel titles |
| `--t-page` | 26 px, 600 | Page titles |
| `--t-counter` | 42 px, 500 | Counters |
| `--t-hero` | 72 px, 500 | One hero number per screen at most |

`font-variant-numeric: tabular-nums` is set on `body`; every number that updates lines up.

### Space, radius, chrome, motion

| Token | Value | Note |
|---|---|---|
| `--s-1` … `--s-7` | 4, 8, 12, 16, 24, 32, 48 px | 4 px base. Page gutter is 32 px |
| `--r-paper` | 0 | Paper is always cut square |
| `--r-chip` / `--r-field` / `--r-panel` | 5 / 7 / 10 px | Pen tags / inputs / the few raised panels |
| `--r-pill` | 999 px | Buttons and toggles: round like a mouse button |
| `--titlebar-h`, `--caption-w`, `--rail-w` | 32, 46, 84 px | Windows 11 caption hit areas are 46 x 32 |
| `--grid-unit` | 10 px | One minor division |
| `--paper-speed` | 500 px/s | 20 ms per division on the Recorder |
| `--dur-fast` / `--dur-toggle` / `--dur-annotate` | 120 / 160 / 340 ms | Hovers / toggles / red circle drawn around a ghost |
| `--ease-pen` | `cubic-bezier(.2,.7,.2,1)` | Pen moves and toggles |

## 3. Components

Shared CSS is in `design/app/app.css`; chrome, icons and canvas helpers in `design/app/shared.js`.

| Component | Default | Hover | Active / on | Disabled | Error / alert |
|---|---|---|---|---|---|
| Title bar caption buttons | Graphite, light glyph, 46 x 32 | `rgba(255,255,255,.09)`; Close turns `#c42b1c` with white glyph | Slightly darker | – | – |
| Rail item | Graphite-300 icon + label | Graphite-800 fill | Paper-panel fill, ink icon, `aria-current="page"` | – | – |
| Button `.btn` (paper) | White, rule-strong border, pill | Paper-sunk fill, ink-3 border | Moves down 1 px | 40 % opacity, no pointer | – |
| Button `.btn-ink` (primary) | Ink fill, white text | Graphite-700 | Moves down 1 px | 40 % | – |
| Button `.btn-red` | Red border and text | Red wash fill | Moves down 1 px | 40 % | Used for destructive or alert actions only |
| Segmented `.seg` | Sunk track, ink-2 labels | Ink label | White pill with hairline | – | A red dot after a button label means that button chatters |
| Toggle | Outline, grey knob | – | Ink fill, white knob slid right | 40 % | – |
| Checkbox | Outline square r 5 | – | Ink fill, white check | 50 % (locked items) | – |
| Stepper (ms) | Mono value between − and + | Button fills sunk | – | 45 % when its row is off | Red border when outside the learned gap |
| Pen tag `.pen` | Channel letter, border in the pen's ink | – | – | Ink-3 (`.dim`) for untested buttons | Red (`.red`) for a chattering button |
| Chip | Hairline pill | – | – | – | `.red` (alert), `.green` (healthy), `.amber` (caution) |
| Counter | Caps label, 42 px value, mono note | – | – | – | Ghost counter value is red; it flashes a red ring for 0.4 s when a new ghost is written |
| Strip chart (canvas) | Paper, grid, perforations, ink traces, pen carriage | – | Paper scrolls while recording | Paper stops when paused, pens lift | Red circle + mono label on each ghost |
| Red ink circle | Hand-drawn loop, 2 px, overshoots its start by 10 % | – | Drawn over 340 ms after the spike is written | – | – |
| Gauge | Paper dial, ink scale, red 80 to 100 % zone, needle in pen color | – | – | – | Red triangle marks where chatter began |
| Tray flyout | Windows 11 flyout: `#f9f9f9`, 8 px radius, shadow | Row hover sunk | – | – | Chip turns red "Not filtering" if the hook is gone |
| Printout sheet | White, tractor-feed holes both sides, dashed tear lines | – | – | – | Red stamp "LEFT BUTTON CHATTERS" |

Focus: every interactive element shows a 2 px blue (`--focus`) outline with 2 px offset via
`:focus-visible`. `prefers-reduced-motion` stops the paper and draws annotations instantly.

Icons are inline SVG on a 24 px grid, 1.7 px stroke, round caps and joins. Each screen icon is that
screen's own trace: Recorder a pulse with a spike, Intervals a two-hump histogram with a threshold,
Hold test a long press with a notch, Wear a gauge, Report a sheet with a pulse.

## 4. Screens

All screens are 1440 x 900 full windows: 32 px title bar, 84 px rail, content on `--paper-panel`
with a 10 px top-left radius where it meets the housing (as WinUI does). Every screen opens in a
working state with sample data; the README says so.

### Recorder (`recorder.html`, hero)

- **Purpose:** the click test. Prove which button chatters.
- **Layout:** page head (title, device line, recording state, Pause paper / Mark / Export evidence);
  summary row (verdict, Clicks, Ghost doubles, Shortest interval, Chatter rate); the recorder deck
  (graphite band, channel labels left, paper strip, pen carriage right, time axis below); lower row
  with the click target (left) and the ghost log (right).
- **Data:** per channel: press count, ghost count. Counters for the session. Ghost log: time, button,
  gap, which side of the press it happened on.
- **Interactions:** clicks inside the target are recorded (all buttons, wheel too; the target
  suppresses the context menu). Paper speed menu (10 / 20 / 50 ms per division). Mark drops a
  numbered event mark on the EV track. Pause stops the paper; the session clock pauses too. The test
  runs 5 minutes by default, then the verdict locks and Export evidence becomes the primary action.
- **Ghost rule during the test:** before a threshold is learned, a press less than 20 ms after a
  release of the same button is a ghost. After learning, the per-button threshold is used.
- **Empty state:** paper scrolling with flat lines, counters at 0, the target pulses its rings once.
  Verdict: "Click at your normal pace. Use every button you want to test."
- **Error states:** no mouse found ("Plug in a mouse or wake it up"), Raw Input registration failed
  (red chip, Retry). Paused: pens lift, paper stops, chip "Paused".

### Intervals (`histogram.html`)

- **Purpose:** show the two humps and set the threshold.
- **Layout:** page head with a button picker (L R M X1 X2, red dot on chattering ones) and Export CSV.
  Left: housing with the interval histogram (semi-log paper, √ count) and an excerpt strip "On your
  recording". Right: suggested threshold (hero number), the derivation table, Filter toggle, Apply /
  Set by hand, other buttons, learning note.
- **Interactions:** drag the threshold handle on the chart (snaps to 1 ms, mono pill shows the
  value); the excerpt updates live to show which spikes would be struck out. Apply writes the value
  to the Filter screen. Set by hand opens the stepper with the gap shown as the safe range.
- **Empty state:** paper with axes only. "Double-click a few times. 20 real double-clicks are enough
  to learn" with a counter "7 of 20".
- **Error state:** "No clean gap": the humps overlap (ratio F / G under 2.5). Copy: "Ghost clicks and
  your real double-clicks overlap, so no threshold is safe. Set one by hand, or replace the switch."

### Filter (`filter.html`)

- **Purpose:** the system-wide fix and its settings.
- **Layout:** page head (Starts with Windows toggle, Pause 15 min, status chip). Left: weekly counter
  with a per-day strip, per-button table (Filter, Threshold, Adaptive, Hold protection, Filtered this
  week with sparkbars), the two rules explained with mini traces, and a hook status line. Right:
  Exclusions list with Add app, and "In the tray" preview with the Windows 11 flyout.
- **Interactions:** each row's toggle enables the filter for that button; rows that are off dim their
  controls. Adaptive "learned" means the threshold follows the Intervals result inside the gap.
  Add app opens a picker of running processes plus Browse for an `.exe`.
- **Empty state:** before any test: all rows off, banner "Run the Recorder first so GhostClick can
  pick a threshold".
- **Error states:** hook not installed or removed by Windows: chip turns red "Not filtering", hook
  line shows the reason, button "Restart filter". Paused: chip amber "Paused, 14:21 left".

### Tray flyout (in `filter.html`)

Windows 11 style flyout above the notification area: header (glyph, name, status chip), weekly
counter, a row per enabled button with its threshold and toggle, footer buttons Pause 15 min and
Open recorder. Left click on the tray icon opens it; right click opens the native context menu
(Open, Pause, Quit). The tray icon is the app glyph; it gains a small amber dot while paused and a
red dot when not filtering.

### Hold test (`hold-test.html`)

- **Purpose:** catch release bounce that breaks drag and drop.
- **Layout:** page head (button picker, Start a 3 s hold). Housing with a tall single-channel strip
  (30 ms per division, second marks printed on the paper). Lower row: hold pad with a ring timer,
  results (dropout count, longest, shortest, per second, what a drag would do, verdict), runs today
  with mini traces, and the fix card (Turn on hold protection).
- **Flow:** press inside the pad, ring fills over 3.00 s, paper runs, pen draws. On release the paper
  stops and each dropout is circled in red in turn, then the verdict appears.
- **Error states:** released early ("Released at 1.24 s. Hold for the full 3 seconds."), mouse moved
  more than 6 px ("Keep the mouse still; moving it can trigger the same blips on some sensors"),
  pressed outside the pad (ignored).

### Wear (`wear.html`)

- **Purpose:** how much life the switches have used, and when chatter began.
- **Layout:** three gauges (L, R, M) in graphite bezels, each with count, percent of rated life and a
  switch picker. Lower: "Chatter against clicks" line chart on paper, switch ratings table with the
  note that ratings are lab figures, X1 and X2 counts.
- **Empty state:** needles at 0, "Counting starts now. GhostClick counts clicks while it runs in the
  tray."
- **Reset:** "New mouse, reset counters" asks for confirmation in-page and archives the old counts.

### Report (`report.html`)

- **Purpose:** an evidence printout for a warranty claim (RMA).
- **Layout:** options column (Include checklist, claim details, paper size), print preview on a
  graphite desk: tractor-feed sheet with header, the claim sentence, a red stamp, key figures,
  histogram, hold test, three strip excerpts, system table, hash, signature lines.
- **Error states:** no test yet ("Run a 5 minute test first; the report is built from it"), export
  failed (path and reason, Retry).

## 5. Killer features

### 5.1 Interval histogram that finds the gap

**Problem.** Every debounce tool asks for a number. Too low and ghosts get through; too high and the
filter eats real double-clicks or fast clicking in games. Users guess.

**UX flow.** Test in the Recorder → Intervals shows two humps → the threshold slides into the gap
with its derivation → Apply → the Filter screen has the value, marked "learned".

**Data and algorithm.**

- Events per button: `{ t_qpc, button, down|up }` from Raw Input (see 5.6).
- Gap for each press: `gap = t_down − t_previous_up` (same button), in ms.
  `ms = (Δticks * 1000) / QueryPerformanceFrequency`.
- Bins: log scale, 20 per decade, 1 ms to 1000 ms (60 bins). Edges `10^(i/20)` ms.
- Split: find the widest run of empty bins between 1 ms and 300 ms; if none, fall back to Otsu's
  method on `log10(gap)`. Low cluster = ghosts, high cluster = real clicks.
- `G` = 99th percentile of the low cluster. `F` = the fastest real double-click: the minimum gap in
  the high cluster among pairs that Windows would call a double-click
  (gap below `GetDoubleClickTime()`), after discarding the single lowest value as an outlier when
  there are more than 50.
- Threshold `T = round(sqrt(G × F))`, the middle of the gap on a log axis. Sample: G 15.4, F 94,
  T 38, margin 2.5 on both sides.
- Guards: need at least 20 real double-clicks. Refuse when `F / G < 2.5` ("No clean gap").
  Clamp `T` to `[G × 1.5, F / 1.5]`.
- Adaptive mode: recompute after each test or every 500 new real double-clicks; move `T` by at most
  20 % per update and never outside the clamp.

**Acceptance criteria**

- [ ] With the sample data (G 15.4 ms, F 94 ms) the suggested threshold is 38 ms and the derivation
      table shows each number
- [ ] With fewer than 20 real double-clicks the screen shows the empty state with a counter
- [ ] With overlapping humps the screen shows "No clean gap" and Apply is disabled
- [ ] Dragging the handle updates the excerpt strip and the "would be removed" count live
- [ ] Apply writes the value to Filter and marks it "learned"
- [ ] Export CSV writes one row per gap: time, button, gap_ms, cluster

> [!NOTE] Verify: the 1 to 20 ms ghost range and 70 to 200 ms fast double-click range are typical
> values from public reports, not a standard. Validate them against real chattering mice before
> shipping the default classifier (20 ms) used before learning.

### 5.2 System-wide filter from the tray

**Problem.** Knowing the switch is bad does not stop Explorer from opening two windows. The fix has to
run everywhere, all the time, without the user thinking about it.

**UX flow.** Apply from Intervals or toggle a row in Filter → tray icon shows the state → the weekly
counter grows → exclusions for programs that need it → Starts with Windows on by default after the
first Apply.

**Data and algorithm.**

- A native thread with its own message loop installs `SetWindowsHookEx(WH_MOUSE_LL, proc, hInstance, 0)`.
  Keep it out of the WebView2 UI thread; talk to the UI over a channel.
- In `LowLevelMouseProc`, for `WM_LBUTTONDOWN/UP`, `WM_RBUTTONDOWN/UP`, `WM_MBUTTONDOWN/UP`,
  `WM_XBUTTONDOWN/UP` (button from `HIWORD(MSLLHOOKSTRUCT.mouseData)`): read `QueryPerformanceCounter`
  at entry (do not rely on `MSLLHOOKSTRUCT.time`, it is milliseconds).
- Skip events with `LLMHF_INJECTED` in `flags`. Tag GhostClick's own `SendInput` events with a
  signature in `dwExtraInfo` so they are never re-filtered.
- **Rule A, block repeat presses (zero latency).** Per button keep `last_up`. On down: if
  `now − last_up < T`, return 1 (block) and set `swallow_next_up = true`. On up: if
  `swallow_next_up`, block it and clear the flag; else `last_up = now` and pass.
- **Rule B, hold protection (delays releases by up to H).** On up: block it, remember it, start an
  `H` ms one-shot timer (`CreateTimerQueueTimer` or a waitable timer). If a down of the same button
  arrives before the timer fires, block that down too and cancel the timer: the hold continues. If the
  timer fires, re-send the up with `SendInput` (tagged). Default `H` = 12 ms or 1.5 × the longest
  dropout from the hold test, capped at 25 ms.
- Exclusions: track the foreground process with `SetWinEventHook(EVENT_SYSTEM_FOREGROUND)` and
  `QueryFullProcessImageNameW`; keep a boolean the hook proc reads. Never resolve process names
  inside the hook proc.
- Counters: increment in the hook, flush to `%APPDATA%\GhostClick\stats.json` every 60 s and on exit.
- Start with Windows: `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\GhostClick` =
  `"<path>\GhostClick.exe" --tray`.
- Watchdog: every 5 s check the hook still fires (count events) while the cursor moves; if not,
  reinstall it and show "Restarted the filter" once.

**Acceptance criteria**

- [ ] With L at 38 ms, a synthetic down 6 ms after an up is blocked along with its up; a down 40 ms
      after an up passes
- [ ] Presses that pass get no added latency (measure hook entry to return under 0.05 ms median)
- [ ] Hold protection: up, down 5 ms later → neither reaches applications and the drag continues;
      up with no follow-up → reaches applications after H ms
- [ ] Injected events are never blocked
- [ ] The foreground app in Exclusions bypasses both rules within 100 ms of switching
- [ ] Tray flyout matches the counter on the Filter screen; Pause 15 min resumes on its own
- [ ] Starts with Windows on: after sign-in the tray icon is present and filtering

> [!NOTE] Verify: how raw-input games interact with the hook. Blocking an event in a `WH_MOUSE_LL`
> hook stops the window messages, but games that read buttons through Raw Input (`WM_INPUT`) or
> DirectInput may still receive the ghost click, because raw input may be generated independently of
> low-level hook blocking. Test in two or three Raw Input games and state the result in the FAQ. If
> games do see the ghosts, the options are a per-game note ("use the mouse software's own debounce
> setting if it has one") or a kernel filter driver, which needs signing and may conflict with
> anti-cheat. Do not ship a driver without that research.

> [!NOTE] Verify: Windows removes a low-level hook that exceeds `LowLevelHooksTimeout`
> (`HKCU\Control Panel\Desktop`) and does not always notify the process. Confirm the current
> behaviour on Windows 10 and 11 and tune the watchdog.

> [!NOTE] Verify: a hook in a non-elevated process does not see input aimed at elevated windows
> (UIPI). Confirm, and decide whether to offer "Run elevated" (Task Scheduler task at logon with
> highest privileges) as an option.

> [!NOTE] Verify: the re-sent release from `SendInput` is subject to UIPI as well; check drags into
> elevated windows with hold protection on.

### 5.3 Hold test (drag and drop failure detector)

**Problem.** "My drags drop" is the same fault as double clicking, but on release instead of press.
Click tests miss it because nobody holds a button for seconds during a click test.

**UX flow.** Pick a button → Start a 3 s hold → press in the pad, ring fills → paper draws a flat high
line, dropouts drop to the baseline → release → each dropout is circled in red → verdict and the
Turn on hold protection card with a suggested `H`.

**Data and algorithm.**

- Same Raw Input stream. Between the first down and the final up, every `up → down` pair with the
  down less than 50 ms after the up is a dropout; its length is `t_down − t_up`.
- Pass: 0 dropouts. Caution (amber): 1 dropout. Fail (red): 2 or more, or any single dropout longer
  than 10 ms.
- Suggested hold protection `H = clamp(ceil(1.5 × longest), 8, 25)` ms.
- The test ends at 3.00 s after the first down; the user releases after the ring completes. A release
  before 3 s with no follow-up press inside 50 ms is "released early".
- Mouse movement: sum of `|lLastX| + |lLastY|` during the hold above 6 counts shows the "keep still"
  error.

**Acceptance criteria**

- [ ] A 3 s hold with no transitions shows 0 dropouts, a green verdict, and no fix card
- [ ] Dropouts of 2, 3, 5 and 7 ms are each circled with their length, longest 7 ms, suggestion 12 ms
- [ ] Released early and moved-mouse states show their copy and do not save a run
- [ ] Runs today keeps the last 10 runs with mini traces

### 5.4 Switch wear meter

**Problem.** People want to know if the mouse is "used up" and whether to replace the switch or the
mouse. A count against a rating makes it concrete.

**Data and algorithm.**

- Count every down per button while GhostClick runs (from the tray process). Persist per device
  (VID, PID and the device instance path) in `%APPDATA%\GhostClick\wear.json` with the install date.
- `percent = clicks / rated_life`. Needle and red zone at 80 to 100 %. Values above 100 % pin the
  needle past the end of the scale and show "over rating".
- Chatter onset: the click count at which the weekly ghost rate first exceeded 0.2 % and stayed there
  for two weeks. Mark it on the gauge and the chart.
- Projection: `days_left = (rated_life − clicks) / clicks_per_day` over the last 30 days.

**Switch ratings (sample library)**

| Switch | Rated life | Type |
|---|---|---|
| Omron D2FC-F-7N | 20 M clicks | mechanical |
| Kailh GM 8.0 | 80 M clicks | mechanical |
| Optical switch | maker's figure | optical, no contact bounce |
| Custom | user enters | any |

> [!NOTE] Verify: the ratings above are the commonly published maker figures and must be checked
> against current datasheets before shipping. Keep "Ratings are lab figures; switches often chatter
> long before them" in the UI. Optical switches have no metal contact to bounce, but can still fail
> in other ways; do not claim they never double click.

**Acceptance criteria**

- [ ] Counts survive restarts and reboots; reset archives instead of deleting
- [ ] Changing the switch rescales the gauge and percent immediately
- [ ] Two mice are counted separately when both are connected

### 5.5 RMA evidence report

**Problem.** Support teams ask for proof that the fault is the mouse. A shaky phone video is weak; a
timestamped printout is strong.

**Contents.** Header (report ID `GC-YYYYMMDD-XXXX`, claim number, print time), the claim sentence
generated from data ("37 double-click events under 20 ms during 5 minutes of testing"), a stamp
naming the failing button, key figures, interval histogram, hold test, three strip excerpts with
timestamps, system info, SHA-256 of the raw event CSV, signature lines.

**Data and export.**

- System info: Windows edition and build (`RtlGetVersion`), device name and hardware ID
  (`SetupDiGetDeviceRegistryProperty` / the Raw Input device name), connection, measured polling rate
  (median interval between Raw Input reports while moving the mouse), input source, clock frequency.
- PDF: render the sheet in a hidden WebView2 and call `CoreWebView2.PrintToPdfAsync` with A4 or Letter.
  "Long strip" prints one continuous page.
- PNG: `CoreWebView2.CapturePreviewAsync` of the sheet at 2x.
- Raw log CSV: `t_ms,button,edge,gap_ms,class`; its SHA-256 is printed on the sheet so the file and
  the paper can be matched.
- Copy summary: puts the claim sentence, key figures and test date on the clipboard as plain text.

**Acceptance criteria**

- [ ] The claim sentence matches the counters exactly and names the test length
- [ ] PDF and PNG show the same content as the preview; file name `ghostclick-evidence-YYYY-MM-DD`
- [ ] Unticked sections disappear from preview and export
- [ ] The hash printed on the sheet equals `Get-FileHash` of the exported CSV

### 5.6 Recorder input (shared by 5.1, 5.3, 5.4)

- Register `RAWINPUTDEVICE { usUsagePage 0x01, usUsage 0x02, dwFlags RIDEV_INPUTSINK, hwndTarget }`
  on a message-only window in a dedicated thread. Read with `GetRawInputData`, or `GetRawInputBuffer`
  when the polling rate is high.
- Button edges from `RAWMOUSE.usButtonFlags`: `RI_MOUSE_LEFT_BUTTON_DOWN/UP`, `RIGHT`, `MIDDLE`,
  `RI_MOUSE_BUTTON_4_DOWN/UP` (X1), `RI_MOUSE_BUTTON_5_DOWN/UP` (X2), `RI_MOUSE_WHEEL` with
  `usButtonData` as a signed delta (120 per notch).
- Timestamp with `QueryPerformanceCounter` when the message is read.

> [!NOTE] Verify: Raw Input carries no hardware timestamp, so measured gaps include message-queue
> jitter. Measure the jitter on a few machines; if it exceeds about 0.5 ms, show timings with one
> decimal only above 2 ms. Also confirm `RIDEV_INPUTSINK` delivers to a message-only window.

> [!NOTE] Verify: at 125 Hz polling, a bounce shorter than 8 ms can fall between two reports and be
> invisible. Show the measured polling rate in the Recorder and the report, and say so in the FAQ.

### 5.7 Website: download page only

Product decision: every test and fix runs in the app; the website does no work in the browser.
The site (`https://OWNER.github.io/ghostclick-mouse-double-click-fix/`) is static HTML: what
chatter is, the symptoms, the FAQ answered in full text (so the pages rank for questions such as
"why does my mouse double click"), screenshots, and the download button. No browser click test,
no pointer-event code, no inputs.

## 6. Animation contract and README media

Every animated page defines `render(t)` as a pure function of time and exposes
`window.__demo = { duration, still, seek }`. Loops are seamless: the Recorder period is 6 s and the
paper moves 3000 px, a whole number of grid squares; the hold test feeds the paper out to 2400 px
before it loops. All randomness uses the seeded `mulberry32` in `shared.js`.

Regenerate all README images and GIFs from the project root (Node 22+, Chrome or Edge, ffmpeg):

```powershell
node scripts/render-media.mjs                 # all jobs in media.config.json
node scripts/render-media.mjs --only gif-     # only the GIFs
node scripts/render-media.mjs --list          # list jobs
```

| Output | Source |
|---|---|
| `hero.png` | `design/app/recorder.html` at `still` |
| `screen-*.png` | the other five app screens |
| `recorder-live.gif`, `histogram-threshold.gif`, `hold-test.gif` | `#demo` of recorder, histogram, hold test (15 fps, 1100 px wide, 64 colors, no dither) |
| `banner.png`, `btn-*.png`, `h-*-light.png`, `h-*-dark.png` | `design/readme/kit.html?part=…` (transparent) |
| `social-preview.png` | `design/readme/kit.html?part=social` at 1280 x 640 |

Fonts: `design/assets/fonts/` is where Apple's SF Pro, SF Pro Rounded and SF Mono go for local rendering
only; they are gitignored and must not be shipped in the app. In the app, use the same families if
the license allows on the target, or substitute and keep the type scale.

> [!NOTE] Verify: Apple's font license limits use of SF fonts outside Apple platforms. Check it
> before bundling any SF font in the Windows app; the README images are rendered locally.
