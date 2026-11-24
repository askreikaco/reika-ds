# @reika-ds/tokens

Single source of design tokens for REIKA apps.

## Rule

Colours come from Carbon by key. REIKA adds only gaps.

- Carbon colours are never copied. `src/tokens.json` names the theme (`g10` light, `g100` dark) and the build reads every token from `@carbon/themes` (pinned 11.83.0).
- REIKA values exist only where Carbon has no token (layout widths, card and table padding, chart heights, z-layers, focus ring widths, breakpoints, icon sizes, radius 0, shadow none, density). Each one has its value in `src/tokens.json`.
- The chart palette (5 categorical slots, light and dark) is a REIKA colour set, written as hex in `src/tokens.json`.
- REIKA colours with no Carbon token reference a Carbon palette name (`carbon-palette`, resolved from `@carbon/colors` 11.62.0, the version `@carbon/themes` 11.83.0 uses). `tag-background-green` is `green20` light and `green80` dark.
- Type scale and motion come from Carbon by key too: `carbon-type` names a `@carbon/type` style per step, `carbon-motion` names `@carbon/motion` durations and easings. The build reads size, line height (rounded to 1px), letter spacing, durations and curves from the pinned packages.
- `_sources` names the app (workforce or giapha) source of each value the reika-app fixture cannot check.

## Files

- `src/tokens.json`: the only hand-edited source.
- `scripts/build.mjs`: generates `dist/` (`node scripts/build.mjs [outDir]`).
- `scripts/extract-app-values.mjs`: reads the REIKA values from a reika-app checkout into `test/fixtures/app-values.json` (`node scripts/extract-app-values.mjs <reika-app path>`).
- `dist/` (not committed):
  - `tokens.json`: resolved tokens. `carbon.themes.light|dark.tokens` maps each Carbon token (kebab name) to its value.
  - `_tokens.scss`: `$` variables for the REIKA values, `$z-layers` map, `z($layer)` function, chart palette lists.
  - `tokens.css`: `:root` (g10 `--cds-*`, `--rk-*`, light chart), `[data-theme="dark"]` and `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` (g100 `--cds-*`, dark chart).
  - `tokens.ts`: typed export of the resolved object.
- `test/`: parity with the app fixture, Carbon sample match, type scale and motion equal to Carbon, tile contrast in both themes, deterministic build, no hex outside the chart palette.

## Tokens added for non-React apps (giapha, 2026-11)

All are `--rk-*` custom properties in `tokens.css` (and `$` variables in `_tokens.scss`). Use these instead of raw values; text on a coloured fill uses Carbon `--cds-text-on-color` (no REIKA token needed).

| Token | Light / dark | Purpose, where used |
|---|---|---|
| `--rk-fs-1` … `--rk-fs-6` | 0.75 · 0.875 · 1 · 1.25 · 1.75 · 2.625rem (Carbon label-01, body-01, body-02, heading-03, heading-04, heading-06) | Type scale: captions/labels, body, large body, section titles, page titles, display numbers. Replaces raw `font-size` px. |
| `--rk-lh-1` … `--rk-lh-6` | 1 · 1.25 · 1.5 · 1.75 · 2.25 · 3.125rem | Line height paired with the same step. |
| `--rk-ls-1` … `--rk-ls-6` | 0.32px · 0.16px · 0 … | Letter spacing of the step (labels, body). |
| `--rk-dur-fast` / `-moderate` / `-slow` | 110 / 150 / 240ms (Carbon fast-02, moderate-01, moderate-02) | Transitions: hover/press, menus and toasts, sheets. |
| `--rk-sp-01` … `--rk-sp-13` | 2 / 4 / 8 / 12 / 16 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 160px (Carbon spacing-01…13) | Gaps and padding in non-React CSS (packages/web): no raw spacing values. |
| `--rk-ease-standard` / `-entrance` / `-exit` | Carbon productive curves | Matching easing for the durations. |
| `--rk-tile`, `--rk-tile-sm` | 2.5rem, 2rem | Avatar/surname tile in list rows; compact rows and pickers. |
| `--rk-tile-1` … `--rk-tile-8` | Carbon purple70/60, green60/60, blue70/60, orange70/60, teal70/60, magenta70/60, cyan70/60, red70/60 | Categorical fill for surname or family tiles (white text on top). Tested: text ≥ 4.5:1 on every tile, tile ≥ 3:1 against background and layer-01 in both themes. |
| `--rk-radius-pill` | 62.5rem | The only rounded shape: chips and tags. Everything else keeps radius 0. |
| `--rk-shadow-pop` | `0 0.125rem 0.375rem var(--cds-shadow)` | Overlays only (menus, sheets, toasts). Surfaces keep `--rk-shadow: none`. |
| `--rk-z-sticky`, `--rk-z-pop`, `--rk-z-modal` | 40, 8000, 8500 | Added layers: sticky toolbars (below the app bar), menus/popovers, modal sheets (below toasts). App layers raised 1, bar 50, shell 100, toast 9000 unchanged. |

## Build and test

```
npm install
npm test
npm run build
```

The build is deterministic: two runs give identical bytes.

## Units

Values keep the units of their source: `rem` for lengths, `px` numbers for icon sizes and `breakpoint-lg-px`, unitless `0` for radius. Carbon spacing `$spacing-NN` and the `u(n)` helper are written as `n` times `1rem`.
