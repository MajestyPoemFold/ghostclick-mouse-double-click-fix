<div align="center">

<a href="https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix"><img src=".github/media/banner.png" alt="GhostClick, a mouse double click test and fix for Windows 11 and 10: a strip of chart recorder paper with a 6 ms ghost click circled in red ink" width="100%"></a>

<h3>Mouse double clicking on a single click? Test every button, see the ghost clicks on a strip chart, and filter them system-wide on Windows 11 and 10.</h3>

<p>
  <a href="https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix/releases/latest/download/app.zip"><img src=".github/media/btn-download.png" alt="Download GhostClick for Windows, free" height="46"></a>
  <a href="#faq"><img src=".github/media/btn-faq.png" alt="Why does my mouse double click? Read the FAQ" height="46"></a>
  <a href="https://discord.gg/INVITE"><img src=".github/media/btn-discord.png" alt="GhostClick Discord server" height="46"></a>
</p>

<p>
  <a href="https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix/releases/latest"><img src="https://img.shields.io/github/v/release/MajestyPoemFold/ghostclick-mouse-double-click-fix?style=flat-square&labelColor=1e2023&color=d3261d&label=release" alt="Latest release"></a>
  <a href="https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix/releases"><img src="https://img.shields.io/github/downloads/MajestyPoemFold/ghostclick-mouse-double-click-fix/total?style=flat-square&labelColor=1e2023&color=1f46c6&label=downloads" alt="Total downloads"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/MajestyPoemFold/ghostclick-mouse-double-click-fix?style=flat-square&labelColor=1e2023&color=4f8c60" alt="MIT license"></a>
<img src="https://img.shields.io/badge/Rust-2024-dea584?style=flat-square&logo=rust&logoColor=white&labelColor=1e2023" alt="Written in Rust with Tauri 2">
  <img src="https://img.shields.io/badge/Windows-10%20%7C%2011%20x64-a8d7b3?style=flat-square&labelColor=1e2023" alt="Windows 10 and Windows 11, x64">
  <a href="https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix/commits"><img src="https://img.shields.io/github/last-commit/MajestyPoemFold/ghostclick-mouse-double-click-fix?style=flat-square&labelColor=1e2023&color=6b7178&label=last%20commit" alt="Last commit"></a>
  <a href="https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix/stargazers"><img src="https://img.shields.io/github/stars/MajestyPoemFold/ghostclick-mouse-double-click-fix?style=flat-square&labelColor=1e2023&color=454a50" alt="GitHub stars"></a>
</p>

<p>
  <b>
  <a href="#features">Features</a> &nbsp;·&nbsp;
  <a href="#double-click-test">Double click test</a> &nbsp;·&nbsp;
  <a href="#install">Install</a> &nbsp;·&nbsp;
  <a href="#how-it-works">How it works</a> &nbsp;·&nbsp;
  <a href="#faq">FAQ</a> &nbsp;·&nbsp;
  <a href="#documentation">Docs</a> &nbsp;·&nbsp;
  <a href="#roadmap">Roadmap</a>
  </b>
</p>

<img src=".github/media/hero.png" alt="GhostClick recorder: a live mouse click test drawn as a strip chart, one ink pen per button, with two ghost clicks on the left button circled in red and annotated 11 ms and 6 ms" width="100%">

</div>

<br>

**GhostClick** is a free, open source **mouse double click test and fix for Windows 11 and Windows 10**.
When a mouse switch wears out it starts to *chatter*: one press reaches Windows as two clicks, the
left click double clicks on its own, and drag and drop lets go halfway. GhostClick records every
button on a polygraph-style strip chart, measures each ghost click in milliseconds, and then
filters them system-wide from the tray with a debounce threshold it learns from your own fastest
double-click. No account, no ads, nothing sent anywhere.

> [!NOTE]
> Screenshots, GIFs and numbers in this README show **sample data** from a demo session. The mouse
> in them is a generic "HID-compliant mouse"; no statement here is a measurement of any real product.

<br>

<h2><a name="features"></a><picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/media/h-features-dark.png">
  <img src=".github/media/h-features-light.png" alt="Features: ghost click test, debounce filter, hold test, switch wear and RMA report" width="100%">
</picture></h2>

<table>
<tr><td width="210"><b>Strip chart click test</b></td><td>Every button gets its own ink pen: Left, Right, Middle, Back (X1), Forward (X2) and the wheel. A press draws a square pulse. A ghost click shows up as a needle-thin spike, and the recorder circles it in red with its timing, for example <code>6 ms, ghost</code></td></tr>
<tr><td><b>Interval histogram that finds the gap</b></td><td>Time between clicks forms two humps: ghost clicks at about 1 to 20 ms and your real fastest double-clicks at about 70 to 200 ms. GhostClick puts the debounce threshold in the empty gap between them, so the fix never eats a real double-click or fast clicking in games</td></tr>
<tr><td><b>System-wide filter from the tray</b></td><td>Per-button debounce with its own threshold, an adaptive mode, per-app exclusions, a weekly counter ("1,284 ghost clicks filtered this week") and start with Windows. Built on the Windows low-level mouse hook</td></tr>
<tr><td><b>Hold test for drag and drop</b></td><td>Hold a button for 3 seconds. A healthy switch draws a flat line; a worn one shows release blips that the recorder marks. This finds the "drag and drop not working" fault that click tests miss, and turns on hold protection for it</td></tr>
<tr><td><b>Switch wear meter</b></td><td>Counts clicks per button since install and shows them on an instrument gauge against the rated life of the switch you pick, with the point where chatter began</td></tr>
<tr><td><b>RMA evidence report</b></td><td>Exports a printout-style PNG or PDF for a warranty claim: "37 double-click events under 20 ms during 5 minutes of testing", with the histogram, strip excerpts, timestamps and system info</td></tr>
</table>

<details>
<summary><b>And the rest</b></summary>
<br>
<table>
<tr><td width="210"><b>All five buttons and the wheel</b></td><td>Back and Forward side buttons chatter too. The wheel channel draws each notch, so a skipping scroll wheel shows up as missing or reversed ticks</td></tr>
<tr><td><b>Hold protection</b></td><td>A second filter rule for drags: a release followed by a press within a few milliseconds is swallowed, so a held button stays held</td></tr>
<tr><td><b>Per-app exclusions</b></td><td>The filter steps aside while a chosen program is in the foreground, for example a rhythm game where you really do tap faster than the threshold</td></tr>
<tr><td><b>Ghost log</b></td><td>Every ghost click with its time, button and gap, exportable as CSV</td></tr>
<tr><td><b>Portable build</b></td><td>A zip that runs without installing; settings stay next to the exe</td></tr>
<tr><td><b>Nothing about you</b></td><td>No telemetry, no account, no network calls. Reports are files you attach yourself</td></tr>
</table>
</details>

<br>

<h2><a name="double-click-test"></a><picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/media/h-test-dark.png">
  <img src=".github/media/h-test-light.png" alt="Double click test: how to test a mouse for double clicking and ghost clicks" width="100%">
</picture></h2>

Open **Recorder**, click in the box at your normal pace for a few minutes, and use every button you
want to check. The paper scrolls like a polygraph at 20 ms per division. Each press is a square
pulse; a ghost click is a spike right after a release, circled in red with the gap in milliseconds.
The counters at the top tell you clicks, ghost doubles, the shortest interval and the chatter rate.
A healthy switch scores zero ghost doubles.

<div align="center">
<img src=".github/media/recorder-live.gif" alt="Live mouse click test GIF: chart paper scrolls left, each click draws a pulse, a ghost click spike appears on the left button and gets a red 6 ms annotation" width="100%">
</div>

### Find the gap: the debounce threshold sets itself

The **Intervals** screen plots the time between clicks on a log scale. Ghost clicks pile up on the
left, real clicks on the right, and nothing lives in between. GhostClick takes the slowest ghost
(99th percentile) and your fastest real double-click and puts the threshold at their geometric
middle: with ghosts ending at 15.4 ms and a fastest double-click of 94 ms, that is
√(15.4 × 94) = **38 ms**, 2.5 times away from each side. Turn the filter on and the ghost bars are
struck out while your real double-click stays.

<div align="center">
<img src=".github/media/histogram-threshold.gif" alt="Interval histogram GIF: bars grow into two humps, the debounce threshold slides into the empty gap at 38 ms, then Filter ON strikes out the ghost clicks" width="100%">
</div>

### Hold test: why drag and drop stops working

A worn switch can let go for 2 to 7 ms while you hold it. Windows sees a release and a new press, so
the file you were dragging drops and a text selection ends. A click test never sees this, because
nobody clicks for three seconds. The **Hold test** does: hold for 3 s and every dropout is marked.

<div align="center">
<img src=".github/media/hold-test.gif" alt="Mouse hold test GIF: a 3 second hold draws a flat line with four release dropouts that are circled in red, explaining why drag and drop drops" width="100%">
</div>

### Fix it system-wide

The **Filter** screen turns the result into a fix that runs from the tray for every program:
per-button threshold, adaptive learning, hold protection, exclusions, and a weekly count of what it
blocked. It is a workaround for a worn part, so the wear meter and the evidence report are there for
the day you replace the switch or send the mouse back.

<br>

<h2><a name="screenshots"></a><picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/media/h-screens-dark.png">
  <img src=".github/media/h-screens-light.png" alt="Screenshots of GhostClick for Windows" width="100%">
</picture></h2>

<div align="center">
  <img src=".github/media/screen-histogram.png" alt="Interval histogram of time between clicks with two humps and the automatic debounce threshold at 38 ms in the gap" width="49%">
  <img src=".github/media/screen-filter.png" alt="System-wide ghost click filter settings per button, app exclusions and the Windows 11 tray flyout" width="49%">
  <img src=".github/media/screen-hold-test.png" alt="Hold test result with four release dropouts in 3 seconds, the cause of drag and drop failures" width="49%">
  <img src=".github/media/screen-wear.png" alt="Switch wear meter gauges for left, right and middle mouse buttons against rated switch life" width="49%">
  <img src=".github/media/screen-report.png" alt="RMA evidence report printout for a mouse warranty claim: 37 double-click events under 20 ms in 5 minutes" width="100%">
</div>

<br>

<h2><a name="install"></a><picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/media/h-install-dark.png">
  <img src=".github/media/h-install-light.png" alt="Install GhostClick on Windows 11 or Windows 10" width="100%">
</picture></h2>

1. Download **[GhostClick-Setup.exe](https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix/releases/latest/download/app.zip)**, a direct link to the latest version
2. Run it. GhostClick installs for your user only (no administrator rights) and opens the Recorder
3. Click at your normal pace for five minutes. If ghost clicks show up, open **Intervals** and press **Apply**

**Portable:** [GhostClick-Portable.zip](https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix/releases/latest/download/app.zip),
unzip anywhere and run `GhostClick.exe`.

**winget** (once the package is published):

```powershell
winget install MajestyPoemFold.GhostClick
```

> [!IMPORTANT]
> Windows SmartScreen may say "Windows protected your PC" because the installer has no paid code
> signing certificate. Click **More info**, then **Run anyway**. Every release is built from this
> source by a public GitHub Actions workflow, so you can read the build log for the file you
> downloaded.

> [!WARNING]
> Only download GhostClick from this repository's
> [Releases](https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix/releases) page. An app with
> a system-wide mouse hook sees every click you make; do not run a renamed copy from somewhere else.

**Check your download.** Each release lists SHA-256 hashes in `SHA256SUMS`, and the release workflow
attests the files. With the GitHub CLI:

```powershell
gh attestation verify GhostClick-Setup.exe --repo MajestyPoemFold/ghostclick-mouse-double-click-fix
```

Or compare the hash yourself in PowerShell:

```powershell
Get-FileHash .\GhostClick-Setup.exe -Algorithm SHA256
```

<br>

## Build from source

Rust core, Tauri 2 shell, WebView2 UI. You need Rust stable (rustup), Visual Studio Build Tools
with "Desktop development with C++", and the WebView2 runtime, which Windows 11 already has.

```powershell
cargo test --workspace
cargo install tauri-cli --version "^2" --locked
cargo tauri dev      # run the app
cargo tauri build    # installer in target/release/bundle/nsis
```

| Folder | Contents |
|---|---|
| `crates/ghostclick-core/` | Platform-independent logic, unit tested |
| `src-tauri/` | Windows app shell: window, commands, installer config |
| `ui/` | Frontend; port the screens from `design/app/` here |
| `design/` | HTML/CSS mockups of every screen and the design tokens |
| `docs/` | Build spec (`DESIGN.md`) and SEO notes |


<h2><a name="how-it-works"></a><picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/media/h-how-dark.png">
  <img src=".github/media/h-how-light.png" alt="How it works: Raw Input test, WH_MOUSE_LL debounce filter, switch bounce" width="100%">
</picture></h2>

**What chatter is.** A mouse button is a small mechanical switch: a metal leaf snaps onto a contact.
New, it closes once. Worn, with a tired spring or oxidized contacts, it bounces: closed, open for a
few milliseconds, closed again. The mouse firmware has its own debounce, but once the bounce lasts
longer than that window, the extra open-and-close reaches Windows as a real release and a real
press. That is a ghost click, and in Explorer two fast clicks are a double-click.

**The test reads Raw Input.** The Recorder registers for Raw Input (`RegisterRawInputDevices`,
usage page `0x01`, usage `0x02`) and reads `RAWMOUSE.usButtonFlags` from each `WM_INPUT`, so it sees
button transitions per device, before any program or filter touches them. Each event is stamped with
`QueryPerformanceCounter`. The interval that matters is the gap from a release to the next press of
the same button.

**The threshold comes from your data.** Gaps are binned on a log scale, 20 bins per decade, and
split into two clusters. GhostClick takes `G` = the 99th percentile of the low cluster (the slowest
ghost) and `F` = your fastest real double-click, and sets the threshold to `√(G × F)`, the middle of
the gap on a log scale. It needs about 20 real double-clicks to learn, refuses to apply a value when
the clusters overlap, and in adaptive mode only ever moves the threshold inside the gap.

**The filter is a low-level mouse hook.** The tray process installs `SetWindowsHookEx(WH_MOUSE_LL)`
and checks each `WM_xBUTTONDOWN` and `WM_xBUTTONUP` against two rules:

- **Block repeat presses:** a press that arrives less than the threshold after a release of the same
  button is dropped (the hook returns non-zero), together with its matching release. Nothing is
  delayed, so presses keep zero added latency.
- **Hold protection:** a release is held back for a few milliseconds (12 ms by default, set from your
  hold test). If a press of the same button arrives in that window, both are swallowed and the hold
  continues; if not, the release is sent on. Releases wait at most that long.

Events with `LLMHF_INJECTED` set (macro tools, GhostClick's own re-sent releases) are never
filtered. The hook procedure only compares timestamps and returns, because Windows skips a
low-level hook that takes too long. Windows does not hand input aimed at a program running as
administrator to a hook in a normal process, so clicks in elevated windows are not filtered unless
you start GhostClick as administrator too.

**Where things live.** Settings are in `%APPDATA%\GhostClick\settings.json`, test sessions in
`%APPDATA%\GhostClick\sessions\`, and the start-with-Windows entry is a value under
`HKCU\Software\Microsoft\Windows\CurrentVersion\Run`. Uninstalling removes all three.

<br>

<h2><a name="faq"></a><picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/media/h-faq-dark.png">
  <img src=".github/media/h-faq-light.png" alt="FAQ: why does my mouse double click and how to fix it" width="100%">
</picture></h2>

<details>
<summary><b>Why does my mouse double click when I click once?</b></summary>
<br>

Almost always a worn switch. The contact inside the button bounces, and the bounce gets past the
mouse's own debounce, so Windows receives two clicks. It typically starts on the left button
because that one does most of the work, and it gets worse over weeks. Less often the cause is a
setting: File Explorer's "Single-click to open an item" (Folder Options) or ClickLock in Mouse
settings can look like double clicking. Run the Recorder for five minutes: ghost clicks within 20 ms
of a release mean hardware.
</details>

<details>
<summary><b>How to fix mouse double clicking on Windows 11?</b></summary>
<br>

1. Install GhostClick and test in the Recorder to confirm which button chatters.
2. Open **Intervals** and apply the suggested threshold for that button.
3. If drags drop, run the **Hold test** and turn on hold protection.
4. Leave the filter running from the tray with **Starts with Windows** on.

This works the same on Windows 10. It is a software fix for a hardware fault: if the mouse is
under warranty, export the evidence report and claim a replacement. Replacing the switch with a
soldering iron is the permanent fix.
</details>

<details>
<summary><b>Is it the switch or the software?</b></summary>
<br>

The interval tells you. Ghost clicks from a bouncing switch land 1 to 20 ms after a release, far
faster than a person can click (a fast human double-click is around 70 ms or more between clicks).
Software causes do not produce that pattern. Also try the mouse on another PC with the portable build: if
the spikes follow the mouse, it is the switch. If only one program misbehaves, check that program's
own settings and the Explorer click settings first.
</details>

<details>
<summary><b>Will the filter affect gaming?</b></summary>
<br>

It is built not to. The threshold sits well below your fastest real double-click, so normal fast
clicking passes untouched, and blocking a press adds no delay to the presses that get through. Hold
protection delays releases only, by at most its window (12 ms by default); turn it off for games if
you prefer. You can exclude any game in **Filter > Exclusions**. One limit: games that read the mouse
through Raw Input may still see a ghost click that the hook blocked for other programs. GhostClick
does not inject anything into games.
</details>

<details>
<summary><b>Logitech G Pro, G305, G502 double click fix</b></summary>
<br>

The steps are the same for every brand: test, apply the threshold, turn on hold protection if drags
drop, and keep the evidence report for the manufacturer's support. These models come up often in
public forum threads about double clicking. That says more about how many people own them than about
failure rates; any mouse with mechanical switches can chatter, and optical switches do not bounce.

| Mouse | Commonly reported | What to try first |
|---|---|---|
| Logitech G Pro Wireless | Left click double clicks | Recorder, then Intervals threshold |
| Logitech G305 | Left click double clicks, drag drops | Hold test, hold protection |
| Logitech G502 (HERO, Lightspeed) | Left or side button double clicks | Test X1 and X2 too |
| Logitech G703, G903 | Left click double clicks | Recorder, warranty report |
| Logitech MX Master 2S, MX Master 3 | Left click double clicks | Recorder, warranty report |
| Razer DeathAdder (Elite, V2) | Left click double clicks | Recorder, Intervals threshold |
| Razer Viper, Viper Ultimate | Double clicks, drag drops | Hold test |
| Razer Basilisk | Left or side button double clicks | Test X1 and X2 too |
| SteelSeries Rival series | Left click double clicks | Recorder, Intervals threshold |
| Corsair M65, Harpoon | Left click double clicks | Recorder, warranty report |
| Zowie EC, FK series | Left click double clicks | Recorder, Intervals threshold |
</details>

<details>
<summary><b>Does the double-click speed slider in Windows fix it?</b></summary>
<br>

No. That slider decides how close two clicks must be to count as a double-click; it cannot tell a
ghost from a real click. Making it faster can hide some double-opens in Explorer but does nothing
for drags, games or text selection.
</details>

<details>
<summary><b>Is it safe? Is a mouse hook a keylogger?</b></summary>
<br>

The hook is a mouse hook only (`WH_MOUSE_LL`); there is no keyboard hook. It looks at button events
and their timing, keeps counters, and stores nothing about where you clicked. The source is here to
read, and there is no network code.
</details>

<details>
<summary><b>Does it work with wireless and Bluetooth mice?</b></summary>
<br>

Yes. The test works with any mouse Windows sees. Timing precision depends on the polling rate: at
1000 Hz each report is 1 ms apart, at 125 Hz 8 ms. Bounces shorter than one report can be invisible
to any software, so a slow wireless or Bluetooth link may under-count chatter.
</details>

<details>
<summary><b>Can I fix keyboard chatter too?</b></summary>
<br>

Not yet. It is on the roadmap.
</details>

<br>

<h2><a name="documentation"></a><picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/media/h-docs-dark.png">
  <img src=".github/media/h-docs-light.png" alt="Documentation" width="100%">
</picture></h2>

| | |
|---|---|
| [docs/DESIGN.md](docs/DESIGN.md) | Design system, every screen, and the specs for the test, the threshold, the filter, the hold test, the wear meter and the report |
| [docs/SEO.md](docs/SEO.md) | GitHub About text, topics and the keyword map |
| [design/app/](design/app/) | The app screens as HTML and CSS, ready to port into Tauri and WebView2 |
| [design/tokens.css](design/tokens.css) | Colors, type, spacing, radii and motion tokens |
| [media.config.json](media.config.json) · [scripts/render-media.mjs](scripts/render-media.mjs) | How every image and GIF in this README is rendered from the design files |
| [Bug report](https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix/issues/new?template=bug_report.yml) · [Feature request](https://github.com/MajestyPoemFold/ghostclick-mouse-double-click-fix/issues/new?template=feature_request.yml) | Attach an evidence report with the raw event log; it is the fastest way to a fix |

<br>

<h2><a name="roadmap"></a><picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/media/h-roadmap-dark.png">
  <img src=".github/media/h-roadmap-light.png" alt="Roadmap" width="100%">
</picture></h2>

- [x] Strip chart recorder for all five buttons and the wheel
- [x] Interval histogram with the automatic threshold
- [x] System-wide filter with hold protection and exclusions
- [x] Hold test, wear meter, evidence report
- [ ] Project website: a static download page with the FAQ and fix guides
- [ ] winget package
- [ ] Separate profiles when you use more than one mouse
- [ ] Keyboard chatter test and filter
- [ ] Research a filter for games that read Raw Input
- [ ] Translations

<br>

<h2><a name="contributing"></a><picture>
  <source media="(prefers-color-scheme: dark)" srcset=".github/media/h-contributing-dark.png">
  <img src=".github/media/h-contributing-light.png" alt="Contributing" width="100%">
</picture></h2>

Open an issue before you build anything larger than a fix: it saves two people solving the same
thing. The app is Tauri 2 on WebView2, and the screens in `design/app/` port over as they are.
Bug reports with an evidence report attached are the most useful contribution of all, because every
mouse bounces a little differently.

To regenerate the README images after changing a design file (needs Node 22+, Chrome or Edge, and
ffmpeg for the GIFs):

```powershell
node scripts/render-media.mjs              # everything
node scripts/render-media.mjs --only gif-  # just the GIFs
```

## License

[MIT](LICENSE). Use it, change it, ship it.

## Disclaimer

GhostClick is not affiliated with Microsoft, Logitech, Razer, SteelSeries, Corsair, BenQ Zowie,
Omron or Kailh. Product names are trademarks of their owners and are used only to describe
compatibility and commonly reported symptoms. GhostClick hides a hardware fault; it does not repair
it. If your mouse is under warranty, the manufacturer's replacement is the real fix.

<details>
<summary>Search keywords</summary>
<br>

mouse double click fix, mouse double clicking, mouse double clicks on single click, double click test, mouse double click test, click test, mouse click test, ghost clicks, ghost click fix, mouse chatter, mouse chatter fix, switch bounce, debounce, mouse debounce, debounce mouse windows, left click double clicks, left click double clicking, right click double clicks, mouse clicks twice, mouse clicking twice, mouse double clicking windows 11, mouse double clicking windows 10, how to fix mouse double clicking, fix double click mouse windows 11, drag and drop not working mouse, mouse drag drops, mouse drag and drop problem, mouse releases while holding, click and drag not working, logitech double click fix, logitech double click issue, logitech g pro double click, logitech g305 double click, logitech g502 double click, logitech mx master double click, razer double click fix, razer deathadder double click, razer viper double click, steelseries double click, corsair double click, zowie double click, omron switch double click, omron d2fc double click, worn mouse switch, mouse switch chatter, mouse button bounce, double click software fix, mouse double click software, mouse fix tool, free mouse fix, open source mouse tool, mouse tester, mouse button test, side button double click, mouse 4 mouse 5 double click, scroll wheel skipping test, chatter rate, click interval histogram, rma mouse, mouse warranty proof, mouse rma evidence, low level mouse hook, wh_mouse_ll, raw input mouse test, mouse polling rate test, mouse dubble click, mouse duble click, double clik, dubble click fix, mous double click, double-click fix, doubleclick fix, mouse ghosting clicks, phantom clicks, mouse phantom clicks, mouse random double click, mouse auto double click, windows 11 mouse fix, no ads mouse fix
</details>
