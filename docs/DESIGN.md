# DESIGN.md — The Patriots Council

> Design system authored via the **gem-designer** method (create / design_system).
> Constraints: **dark-only**, **Fluent UI Blazor**, **WCAG 2.1 AA**, responsive, **tokens-only**.
> One memorable thing: **"CODEC uplink"** — a phosphor-green tactical HUD rendered on a CRT codec
> screen. The council debate *is* the transmission: normal = green, CAUTION = amber, ALERT = red.
>
> **Implementation contract:** this is a pure re-valuing of the existing `--gc-*` token layer plus a
> few *additive* classes (`.hud-frame`, `.codec-crt`, `.gc-footer-strip`). Every `--gc-*` token name is
> preserved so current components keep working — only the values change. No hardcoded hex in
> components; no `.razor`/`.cs` changes beyond wiring the font-face, footer, and the one `CustomColor`.

---

## 1. Visual Theme

- **Direction:** *Metal Gear Solid codec / tactical-HUD.* Near-black CRT screen with a phosphor-green
  monochrome base, fine horizontal **scanlines**, and a faint flicker. Chrome is sharp and angular —
  thin hairlines, **corner-bracket** tick marks, all-caps HUD labels, oscilloscope/frequency motifs
  (e.g. `140.85`). Authority through restraint, not neon overload.
- **Mood:** clandestine mission-control tension. Quiet, legible surveillance console by default; the
  debating chamber lights up like a live codec call when a member takes the floor.
- **Alert semantics (the memorable through-line):**
  - **GREEN** = codec / normal / on-mission / support.
  - **AMBER** = CAUTION / live round / conditions / defer / active round.
  - **RED** = ALERT / "ON AIR" / oppose / reject.
- **Foundation:** Fluent UI Blazor themed via `FluentDesignTheme Mode="Dark"` with `CustomColor` set to
  the green accent (**`#37e08a`**), over our `--gc-*` token layer. Never use default Fluent purple/teal.
- **Authenticity vs legibility rule:** MGS display faces are for **chrome only** (wordmark, headings,
  HUD/codec labels, stat numerics). Long assessment prose stays in a clean system face. Authenticity
  must never break AA contrast or readability.

---

## 2. Color Palette (60-30-10, dark-only)

Re-value the existing tokens in `wwwroot/app.css` under `:root` (same names, MGS values). Palette is a
single **green** accent + **amber** caution + **red** alert + a **steel-neutral** — no competing hue.

```css
:root {
  color-scheme: dark;

  /* 60% — backgrounds (CRT screen, green-tinted near-black) */
  --gc-bg:            #060a08;  /* app base — the codec screen */
  --gc-bg-elevated:   #0a1210;  /* raised regions / header / nav rail */
  --gc-surface:       #0d1712;  /* cards, panels */
  --gc-surface-2:     #132019;  /* nested / hover surface */

  /* 30% — structure (dim → bright phosphor hairlines) */
  --gc-border:        #1d3327;  /* hairline borders / scanline rails */
  --gc-border-strong: #3a7a52;  /* HUD frames, corner brackets (UI ≥3:1) */
  --gc-text:          #d7f5e4;  /* primary phosphor text   (17.1:1 on --gc-bg) */
  --gc-text-muted:    #8fc7a6;  /* secondary               (10.3:1) */
  --gc-text-soft:     #6fae88;  /* tertiary / HUD labels   (7.7:1) */

  /* 10% — accent + semantics */
  --gc-accent:        #37e08a;  /* primary action / links / codec glow (11.6:1) */
  --gc-accent-hover:  #5cf0a5;
  --gc-accent-soft:   rgba(55,224,138,0.14);
  --gc-gold:          #ffb02e;  /* CAUTION / live round / active state (amber, 10.9:1) */
  --gc-success:       #37e08a;  /* Support / Approve  (green) */
  --gc-info:          #8fe0b0;  /* Support w/ Conditions (pale phosphor, 12.8:1) */
  --gc-danger:        #ff5a52;  /* Oppose / Reject / ALERT (red, 6.5:1) */
  --gc-warning:       #ffb02e;  /* Defer (amber) */
  --gc-neutral:       #9fb0a6;  /* Abstain (steel, 8.8:1) */
}
```

**Fluent bridge:** `FluentDesignTheme` Mode=Dark, accent base ← `--gc-accent` (`#37e08a`); neutral base
tuned into the green-grey ramp. Update `MainLayout.razor` → `CustomColor="#37e08a"`.

**Nexus categorical colours** (data-viz, harmonized to the codec set — token-driven, no new brand hue):

| Nexus type | Token | Value |
|---|---|---|
| Implication | `--gc-accent` | `#37e08a` (green) |
| Reinforcement | `--gc-info` | `#8fe0b0` (pale green) |
| Dependency | `--gc-warning` | `#ffb02e` (amber) |
| Tension | *(tint)* `--gc-tension` | `#ff8a3c` (amber-orange — categorical only) |
| Contradiction | `--gc-danger` | `#ff5a52` (red) |
| Supersession | `--gc-neutral` | `#9fb0a6` (steel) |

### Contrast verification (WCAG 2.1 AA — text ≥4.5:1, large/UI ≥3:1)

| Foreground | Background | Ratio | Use | Pass |
|---|---|---:|---|:--:|
| `--gc-text` #d7f5e4 | `--gc-bg` #060a08 | **17.1:1** | body/heading | ✅ AAA |
| `--gc-text-muted` #8fc7a6 | `--gc-bg` | **10.3:1** | secondary | ✅ AAA |
| `--gc-text-soft` #6fae88 | `--gc-bg` | **7.7:1** | HUD labels/eyebrow | ✅ AAA |
| `--gc-accent` #37e08a | `--gc-bg` | **11.6:1** | links/action text | ✅ AAA |
| `--gc-gold` #ffb02e | `--gc-bg` | **10.9:1** | caution text | ✅ AAA |
| `--gc-danger` #ff5a52 | `--gc-bg` | **6.5:1** | alert text | ✅ AA |
| `--gc-info` #8fe0b0 | `--gc-bg` | **12.8:1** | conditions text | ✅ AAA |
| `--gc-neutral` #9fb0a6 | `--gc-bg` | **8.8:1** | abstain text | ✅ AAA |
| `--gc-text` | `--gc-surface` #0d1712 | **15.7:1** | text on cards | ✅ AAA |
| `--gc-text-muted` | `--gc-surface` | **9.5:1** | prose on cards | ✅ AAA |
| `--gc-text-soft` | `--gc-surface-2` #132019 | **6.5:1** | labels on hover surface | ✅ AAA |
| `--gc-accent` | `--gc-surface` | **10.6:1** | links on cards | ✅ AAA |
| `--gc-border-strong` #3a7a52 | `--gc-bg` | **3.9:1** | HUD frame / bracket (UI) | ✅ AA |
| `--gc-accent` (UI edge) | `--gc-bg` | **11.6:1** | focus ring / active mic | ✅ AAA |
| `#04140b` (btn text) | `--gc-accent` fill | **11.0:1** | primary button label | ✅ AAA |
| `#2a1400` (btn text) | `--gc-gold` fill | **9.6:1** | caution button label | ✅ AAA |

All text tokens exceed 4.5:1 on every intended background; all UI/structural tokens exceed 3:1.

### Changed tokens (navy → MGS)

`--gc-bg` #070d1c→#060a08 · `--gc-bg-elevated` #0d1830→#0a1210 · `--gc-surface` #14213f→#0d1712 ·
`--gc-surface-2` #1b2a4a→#132019 · `--gc-border` #25345c→#1d3327 · `--gc-border-strong`
#3a4d7e→#3a7a52 · `--gc-text` #e8eefc→#d7f5e4 · `--gc-text-muted` #9fb2d6→#8fc7a6 · `--gc-text-soft`
#7f93b8→#6fae88 · `--gc-accent` #6ea8fe→#37e08a · `--gc-accent-hover` #8cbcff→#5cf0a5 · `--gc-accent-soft`
blue14%→green14% · `--gc-gold` #f4c542→#ffb02e · `--gc-success` #3ddc97→#37e08a · `--gc-info`
#6ea8fe→#8fe0b0 · `--gc-danger` #ff6b6b→#ff5a52 · `--gc-warning` #f4c542→#ffb02e · `--gc-neutral`
#98a2b3→#9fb0a6. New: `--gc-tension` #ff8a3c (nexus only). `CustomColor` #6ea8fe→#37e08a.

---

## 3. Typography

Seven self-hosted MGS faces (already at `wwwroot/fonts/mgs/`) drive **chrome**; a clean system face
carries **prose**. Add this `@font-face` block to `app.css` (design spec — `format('truetype')`,
`font-display: swap`):

```css
/* MGS display/chrome faces — self-hosted, see §5 attribution (legally required) */
@font-face { font-family:"MGS Logo";     src:url("/fonts/mgs/MetalGearSolid.ttf")          format("truetype"); font-display:swap; }
@font-face { font-family:"MGS Tactical"; src:url("/fonts/mgs/TacticalEspionageAction.ttf") format("truetype"); font-display:swap; }
@font-face { font-family:"MGS2 Logo";    src:url("/fonts/mgs/MetalGearSolid2.ttf")         format("truetype"); font-display:swap; }
@font-face { font-family:"MGS2 Menu";    src:url("/fonts/mgs/MGS2Menu.ttf")                format("truetype"); font-display:swap; }
@font-face { font-family:"MGS Codec";    src:url("/fonts/mgs/MGS1Codec.ttf")               format("truetype"); font-display:swap; }
@font-face { font-family:"MGS HUD";      src:url("/fonts/mgs/MGS1HUD.ttf")                 format("truetype"); font-display:swap; }
@font-face { font-family:"MGS Ammo";     src:url("/fonts/mgs/MGS1Ammo.ttf")                format("truetype"); font-display:swap; }
```

### Font-stack tokens

```css
:root {
  --font-wordmark: "MGS Logo","MGS2 Menu",Impact,"Arial Narrow",sans-serif; /* hero ONLY */
  --font-display:  "MGS2 Menu","Segoe UI",system-ui,sans-serif;             /* headings / UI chrome */
  --font-tactical: "MGS Tactical","MGS Codec",Consolas,monospace;           /* eyebrows / taglines */
  --font-codec:    "MGS Codec","MGS HUD",Consolas,monospace;                /* codec transcript / HUD labels */
  --font-hud:      "MGS HUD","MGS Codec",Consolas,monospace;                /* small HUD chrome */
  --font-ammo:     "MGS Ammo","MGS HUD",Consolas,monospace;                 /* big stat numerics */
  --font-body:     system-ui,"Segoe UI Variable Text","Segoe UI",-apple-system,BlinkMacSystemFont,sans-serif;
  --font-mono:     Consolas,"Courier New",monospace;
}
```

### Role → font hierarchy

| Role | Font token | Size / weight | Tracking | Case |
|---|---|---|---|---|
| Brand wordmark (hero) | `--font-wordmark` | 2.4–3.2rem / — | normal | as-drawn |
| Tagline / eyebrow | `--font-tactical` | 0.72rem / 400 | .18em | UPPER |
| h1 / page title | `--font-display` | 1.6rem / 600 | .04em | UPPER |
| h2 / section | `--font-display` | 1.3rem / 600 | .04em | UPPER |
| h3 | `--font-display` | 1.1rem / 600 | .03em | UPPER |
| HUD label / pill / nav item | `--font-hud` | 0.72–0.82rem / — | .08em | UPPER |
| Codec transcript turn head | `--font-codec` | 0.9rem / — | .04em | UPPER |
| Stat / ammo numerics | `--font-ammo` | 2.0–2.6rem / — | .02em | — |
| Frequency readout (e.g. 140.85) | `--font-ammo` | 0.9–1.1rem / — | .06em | — |
| **Body / assessment prose** | `--font-body` | 0.95rem / 400 | normal | sentence |
| Small / captions | `--font-body` | 0.825rem / 400 | normal | sentence |
| Code | `--font-mono` | 0.85rem / 400 | normal | — |

- **Legibility guards:** never set `--font-wordmark` below 1.6rem or use it for running text. Never set
  prose (transcript bodies, assessments, `.prose`) in an MGS face — keep `--font-body`.
- Line-height: body 1.6, prose 1.65, headings 1.2. Max prose width ~72ch.
- MGS display faces are all-caps by design intent; apply `text-transform:uppercase` + letter-spacing so
  bitmap glyphs breathe.

---

## 4. Component Stylings

All deltas are token-driven and additive; existing class names stay.

- **HUD card** (`.gc-card`, `.card`): `--gc-surface`, radius **6px** (sharper, was 16px), border
  `--gc-border`, `--elev-1`. Add **corner brackets** via the additive `.hud-frame` class (§ technique
  below) drawn in `--gc-border-strong`. Optional eyebrow (`--font-tactical`) + title (`--font-display`).
  Hover → `--gc-surface-2` + `--elev-2`, brackets brighten to `--gc-accent`.
- **Stat tile** (`.gc-stat` / `.gc-stat-num`): number set in `--font-ammo`, color `--gc-accent` (codec
  green), with an `--font-tactical` eyebrow label above. Reads like an ammo/vitals counter. Optional
  `--glow-accent` on the number container. Trend/`--gc-stat-cta` stays `--gc-accent`; the gold variant
  `--gc-stat-cta--gold` uses `--gc-gold`.
- **Pills / badges** (`.gc-pill`, `.badge-*`): radius **3px** (was 999px — HUD chips are squared),
  `--font-hud` uppercase, bg `color/14%` + solid semantic text. Map: support/approve→`--gc-success`,
  conditions→`--gc-info`, oppose/reject→`--gc-danger`, defer→`--gc-warning`, abstain→`--gc-neutral`.
  Optional 1px `currentColor` @ 35% hairline border for the tactical-chip look.
- **Buttons:** Fluent `Appearance.Accent` (primary, `--gc-accent` fill + `#04140b` label),
  `Neutral` (secondary), `Stealth` (tertiary). Label in `--font-hud` uppercase. 44px min height. Focus
  ring 2px `--gc-accent` offset 2px. Caution button = `--gc-gold` fill + `#2a1400` label.
- **DataGrid / tables:** zebra `--gc-surface`/transparent; header row in `--font-hud` uppercase
  `--gc-text-soft`; hover `--gc-surface-2`; links `--gc-accent`; borders `--gc-border`.
- **Nav rail / brand wordmark** (`FluentNavMenu`): vertical rail on `--gc-bg-elevated` with a
  right-edge hairline `--gc-border`. Items in `--font-hud` uppercase; active = `--gc-accent-soft` +
  left border 2px `--gc-accent` + `--gc-accent` label. Brand block at top: emblem + wordmark in
  `--font-wordmark` (`--gc-text`), with a `--font-tactical` "TACTICAL ESPIONAGE ACTION"-style tagline
  in `--gc-text-soft`. Optional frequency readout (`140.85`) in `--font-ammo` `--gc-text-soft`.
- **Prose** (`.prose`): `--font-body`, `--gc-text-muted`; headings `--gc-text`; inline `code`
  `--gc-surface-2` bg + `--gc-accent` text; blockquote left border `--gc-border-strong`.
- **Debating chamber** (`debate.css` — re-point every hard-coded hex to tokens; add codec skin):
  - **Stage** (`.debate-stage`): radial `--gc-surface-2 → --gc-bg-elevated → --gc-bg`, border
    `--gc-border-strong`, radius 6px, inset shadow. Wrap in `.hud-frame` (corner brackets) and overlay
    `.codec-crt` scanlines (§ technique). Add a top HUD strip with `--font-hud` phase label + a
    `140.85` frequency readout in `--font-ammo`.
  - **ON AIR** (`.debate-onair`, `.dot`): stays **RED** — `--gc-danger`; blinking dot glow
    `--gc-danger`. This is the ALERT state; do not recolour.
  - **Round pill** (`.debate-round-pill`): **AMBER** live-round — `--gc-gold` fill + `#2a1400` text,
    `--font-hud`. Phase pill (`.debate-phase-pill`) uses `--gc-surface-2` + `--gc-border-strong`.
  - **Seats / plaques:** plaque bg `--gc-surface`, name `--gc-text` (`--font-hud`), role
    `--gc-text-soft`. Avatars keep persona colours (data), ringed with `--gc-border-strong`.
  - **Active speaker** (`.seat.speaking .avatar`, `.podium.speaking`, mic-live, `.transcript .caret`):
    **GREEN codec glow** — `--gc-accent` ring + `--glow-accent`; mic + caret `--gc-accent`.
  - **Transcript turns** (`.transcript .turn`): bg `--gc-surface`, text `--gc-text` **prose in
    `--font-body`**, turn-head in `--font-codec` uppercase `--gc-accent`; left border `--gc-border`,
    active turn `--gc-accent`. (Flip from white bubbles to dark codec panels.)
  - **Moderator banner:** `.calling` → amber wash `--gc-gold` @ ~12% + `--gc-gold` left border;
    `.selected` → green wash `--gc-accent` @ ~12%. Roll-call `.assessing`→amber, `.done`→green,
    `.failed`→`--gc-warning`, `.blocked`→`--gc-danger`. Retire the purple/blue gradients.
  - **Citations / chips:** `--gc-surface-2` bg, `--gc-border` border, `--gc-accent` link text.
  - **Avatars (codec PIP portraits):** *every* avatar (seats, podium, roll-call, transcript) renders as
    an **MGS1 green-codec monochrome** portrait — the image is duotoned green via a CSS `filter`
    (`grayscale sepia hue-rotate saturate`), wrapped in a circular `.avatar` that clips a decorative
    `::after` **scanline + green-phosphor vignette** overlay. The active speaker (`.speaking`/`.mic-live`)
    burns brighter and gets an animated downward **scan-sweep** (`.avatar::before`, reduced-motion aware).
    Purely decorative overlays are `pointer-events:none` / `aria-hidden`.

---

## 5. Layout Principles

- **Shell:** fixed left nav rail (240px ≥ md; collapsible drawer < md) + sticky top **HUD header**
  (breadcrumbs + context actions + optional frequency readout) over a scrollable content well
  (max-width 1200px, 32px gutters). A slim **codec footer strip** pins to the bottom of every page.
- **Grid:** 12-col responsive; dashboard uses a **bento** of ammo-style stat tiles + recent list.
- **8pt spacing** scale: 4/8/12/16/24/32/48. Section rhythm 32px.
- **Corners:** the whole system moves from soft (16px) to **sharp** (radius 3–6px) to read as a HUD.
  `--gc-radius: 4px`, `--gc-radius-card: 6px`.
- **HUD framing:** primary panels (chamber, hero card, modals) wear `.hud-frame` corner brackets;
  secondary cards may omit them to avoid noise (the "ONE memorable thing" — don't bracket everything).

### Footer attribution (required — CC BY-SA, must be visible on every page)

A slim tactical/codec strip rendered in `MainLayout` below the content well.

```css
.gc-footer-strip {
  display:flex; flex-wrap:wrap; align-items:center; gap:.35rem 1rem;
  padding:.4rem 1rem; border-top:1px solid var(--gc-border);
  background:var(--gc-bg-elevated); color:var(--gc-text-soft);
  font-family:var(--font-hud); font-size:.66rem; letter-spacing:.06em; text-transform:uppercase;
}
.gc-footer-strip a { color:var(--gc-accent); text-decoration:none; }
.gc-footer-strip a:hover { text-decoration:underline; }
```

Required content (verbatim intent — link the CC license):

> **FONTS:** dafont "Metal Gear Solid" fonts by Steve Snape (Solid Snake's Game Shrine). ·
> "MGS1 Fonts © 2025 Andrew Gleeson", licensed
> [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).

Legal note: CC BY-SA 4.0 requires attribution **and** a link to the license on every page that ships
the MGS1 fonts. Do not remove or hide this strip. Keep it AA-legible (`--gc-text-soft` = 7.7:1).

---

## 6. Depth & Elevation (dark = phosphor glow, not drop shadow)

```css
:root {
  --elev-0: none;
  --elev-1: 0 1px 2px rgba(0,0,0,.5), 0 0 0 1px var(--gc-border);
  --elev-2: 0 6px 20px rgba(0,0,0,.55), 0 0 0 1px var(--gc-border);
  --elev-3: 0 14px 40px rgba(0,0,0,.6),  0 0 0 1px var(--gc-border-strong);
  --glow-accent: 0 0 0 1px rgba(55,224,138,.45), 0 0 18px rgba(55,224,138,.30); /* codec green */
  --glow-live:   0 0 0 1px rgba(255,176,46,.50), 0 0 22px rgba(255,176,46,.32);  /* amber caution */
  --glow-alert:  0 0 0 1px rgba(255,90,82,.55),  0 0 22px rgba(255,90,82,.35);   /* red ON AIR */
  --gc-radius: 4px;
  --gc-radius-card: 6px;
}
```

Elevation = darker screen + hairline; interaction/state = **glow** (green normal, amber caution, red
alert). `--glow-alert` is new (additive) for the ON AIR dot; keep `--glow-live` for live-round amber.

### Scanline / CRT overlay technique (additive `.codec-crt`)

Applies phosphor scanlines + a slow flicker + vignette **over** a panel without touching its content.
Purely decorative → `pointer-events:none` and `aria-hidden`.

```css
.codec-crt { position:relative; isolation:isolate; }
.codec-crt::after {
  content:""; position:absolute; inset:0; z-index:2; pointer-events:none;
  border-radius:inherit;
  background:
    repeating-linear-gradient(              /* fine horizontal scanlines */
      to bottom,
      rgba(0,0,0,0)        0px,
      rgba(0,0,0,0)        2px,
      rgba(2,10,6,.28)     3px,
      rgba(2,10,6,.28)     3px),
    radial-gradient(ellipse at 50% 40%,      /* screen vignette */
      rgba(55,224,138,.05) 0%,
      rgba(0,0,0,0)        55%,
      rgba(0,0,0,.35)      100%);
  mix-blend-mode:multiply;
  animation:codec-flicker 5.5s steps(60) infinite;
}
@keyframes codec-flicker {
  0%,100% { opacity:.90; }
  47%     { opacity:.94; }
  48%     { opacity:.82; }  /* brief signal dip */
  49%     { opacity:.93; }
  73%     { opacity:.88; }
}
```

- Scanline pitch = 3px; keep opacity ≤ .30 so contrast underneath is preserved (text sits at z-index
  0/1, overlay at z-index 2). Never place the overlay over `.prose`/transcript bodies at an opacity
  that drops text below AA — it rides the stage chrome, not the reading column.

---

## 7. Do's / Don'ts

- ✅ Phosphor-green base, ONE green accent + amber caution + red alert (+ steel neutral). Semantic
  green/amber/red mapping everywhere (normal / CAUTION / ALERT).
- ✅ MGS faces for **chrome only** — wordmark, headings, HUD/codec labels, ammo numerics. Prose stays
  `--font-body`.
- ✅ Sharp corners (3–6px), corner-bracket `.hud-frame`, hairline borders, uppercase HUD labels,
  frequency readouts, glow elevation.
- ✅ WCAG AA (≥4.5:1 text / ≥3:1 UI), visible focus rings, honour `prefers-reduced-motion`, footer
  attribution on every page.
- ❌ No `--font-wordmark`/logo faces in running text or below 1.6rem; no MGS face on assessment prose.
- ❌ No second accent hue (no blue/purple/teal); no Bootstrap `bg-light/bg-white/text-dark`; no
  hardcoded hex in components (tokens only).
- ❌ No scanline/flicker over reading columns; no glassmorphism; no heavy drop shadows; don't bracket
  every card (reserve `.hud-frame` for primary panels).

---

## 8. Responsive Behavior

- **≥1200:** full bento + nav rail + HUD header + footer strip. Chamber `.hud-frame` + `.codec-crt`.
- **768–1199:** nav rail persists, single-column content, tiles 2-up, chamber scales seats.
- **<768:** nav becomes top drawer; tiles stack; chamber scales seats; tables → stacked/scroll; footer
  strip wraps to two lines but stays visible. Touch targets ≥44×44px. No horizontal body scroll.
- **Reduced motion** (`prefers-reduced-motion: reduce`): scanlines render **static** (freeze the
  overlay), no `codec-flicker`, no ON-AIR blink, no mic/hand/caret animation — all state stays legible
  via colour + glow alone:

```css
@media (prefers-reduced-motion: reduce) {
  .codec-crt::after { animation:none; opacity:.88; }
  .debate-onair .dot,
  .seat.hand-up .hand, .seat.mic-live .mic, .seat.assessing .avatar,
  .moderator-banner.calling, .transcript .caret { animation:none !important; }
}
```

---

## 9. Agent Prompt Guide (implementation rules)

1. **Token swap, not a rewrite.** Re-value the `--gc-*` tokens in `wwwroot/app.css` to the §2 values
   (names unchanged). Update `--gc-radius`/`--gc-radius-card` and elevation/glow per §6.
2. **Fonts:** add the §3 `@font-face` block + font-stack tokens to `app.css`; apply `--font-body` to
   `html,body`; point headings to `--font-display`, eyebrows to `--font-tactical`, HUD labels to
   `--font-hud`, stat numerics to `--font-ammo`, codec transcript heads to `--font-codec`. Keep all
   long prose in `--font-body`.
3. **Fluent:** set `FluentDesignTheme CustomColor="#37e08a"` in `MainLayout.razor`. Never hardcode hex
   in `.razor`/scoped css — colours come from `--gc-*` only.
4. **Additive classes:** implement `.hud-frame` (corner brackets, §HUD technique), `.codec-crt`
   (scanline/CRT overlay, §6) and `.gc-footer-strip` (§5). Apply `.hud-frame`+`.codec-crt` to
   `.debate-stage` and hero/modal panels; do not bracket every card.
5. **debate.css:** replace every hard-coded hex with the mapped `--gc-*` token per §4. Keep ON AIR red
   (`--gc-danger`), live round amber (`--gc-gold`), active-speaker green (`--gc-accent` + `--glow-accent`).
6. **Footer:** render `.gc-footer-strip` in `MainLayout` on every page with the exact §5 attribution +
   CC BY-SA link. This is legally required — do not omit.
7. **A11y:** every interactive element keeps a visible focus ring + ARIA label; decorative overlays
   (`.codec-crt`, brackets, scanlines) are `aria-hidden` / `pointer-events:none`; honour
   `prefers-reduced-motion` per §8.
8. **Preserve behaviour** — SignalR, data bindings, persona colours are presentation-neutral; this is a
   token re-skin only. Build (`dotnet build`) after each page; keep 0 warnings / 0 errors.

### HUD corner-bracket technique (`.hud-frame`)

Token-driven, no extra markup — draws 4 L-shaped tick brackets with layered gradients:

```css
.hud-frame {
  --hud-b: 2px;    /* bracket thickness */
  --hud-l: 16px;   /* bracket arm length */
  position:relative;
  background-image:
    linear-gradient(var(--gc-border-strong),var(--gc-border-strong)), /* TL h */
    linear-gradient(var(--gc-border-strong),var(--gc-border-strong)), /* TL v */
    linear-gradient(var(--gc-border-strong),var(--gc-border-strong)), /* TR h */
    linear-gradient(var(--gc-border-strong),var(--gc-border-strong)), /* TR v */
    linear-gradient(var(--gc-border-strong),var(--gc-border-strong)), /* BL h */
    linear-gradient(var(--gc-border-strong),var(--gc-border-strong)), /* BL v */
    linear-gradient(var(--gc-border-strong),var(--gc-border-strong)), /* BR h */
    linear-gradient(var(--gc-border-strong),var(--gc-border-strong)); /* BR v */
  background-repeat:no-repeat;
  background-size:
    var(--hud-l) var(--hud-b), var(--hud-b) var(--hud-l),
    var(--hud-l) var(--hud-b), var(--hud-b) var(--hud-l),
    var(--hud-l) var(--hud-b), var(--hud-b) var(--hud-l),
    var(--hud-l) var(--hud-b), var(--hud-b) var(--hud-l);
  background-position:
    top left, top left, top right, top right,
    bottom left, bottom left, bottom right, bottom right;
}
.hud-frame:hover,
.hud-frame.is-live { --hud-l:22px; background-image:linear-gradient(var(--gc-accent),var(--gc-accent)) /* ×8 */; }
```

(Repeat the accent gradient 8× on the live/hover state; brackets brighten green to signal focus.)
