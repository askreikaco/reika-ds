# @reika-ds/tokens

Single source of design tokens for REIKA apps.

## Rule

Colours come from Carbon by key. REIKA adds only gaps.

- Carbon colours are never copied. `src/tokens.json` names the theme (`g10` light, `g100` dark) and the build reads every token from `@carbon/themes` (pinned 11.83.0).
- REIKA values exist only where Carbon has no token (layout widths, card and table padding, chart heights, z-layers, focus ring widths, breakpoints, icon sizes, radius 0, shadow none, density). Each one has its value in `src/tokens.json`.
- The chart palette (5 categorical slots, light and dark) is a REIKA colour set, written as hex in `src/tokens.json`.
- REIKA colours with no Carbon token reference a Carbon palette name (`carbon-palette`, resolved from `@carbon/colors` 11.62.0, the version `@carbon/themes` 11.83.0 uses). `tag-background-green` is `green20` light and `green80` dark.
- `_sources` names the app (workforce) source of each value the reika-app fixture cannot check.

## Files

- `src/tokens.json`: the only hand-edited source.
- `scripts/build.mjs`: generates `dist/` (`node scripts/build.mjs [outDir]`).
- `scripts/extract-app-values.mjs`: reads the REIKA values from a reika-app checkout into `test/fixtures/app-values.json` (`node scripts/extract-app-values.mjs <reika-app path>`).
- `dist/` (not committed):
  - `tokens.json`: resolved tokens. `carbon.themes.light|dark.tokens` maps each Carbon token (kebab name) to its value.
  - `_tokens.scss`: `$` variables for the REIKA values, `$z-layers` map, `z($layer)` function, chart palette lists.
  - `tokens.css`: `:root` (g10 `--cds-*`, `--rk-*`, light chart), `[data-theme="dark"]` and `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` (g100 `--cds-*`, dark chart).
  - `tokens.ts`: typed export of the resolved object.
- `test/`: parity with the app fixture, Carbon sample match, deterministic build, no hex outside the chart palette.

## Build and test

```
npm install
npm test
npm run build
```

The build is deterministic: two runs give identical bytes.

## Units

Values keep the units of their source: `rem` for lengths, `px` numbers for icon sizes and `breakpoint-lg-px`, unitless `0` for radius. Carbon spacing `$spacing-NN` and the `u(n)` helper are written as `n` times `1rem`.
