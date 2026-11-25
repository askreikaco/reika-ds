# @reika-ds/styles

Carbon configured once for REIKA apps, plus the `rk-` utilities for the gaps Carbon has no class for.
Built on `@carbon/styles` (pinned 1.117.0) and `@reika-ds/tokens`.

## Setup

Install the package; `@carbon/styles` and `sass` are installed with it at the pinned versions:

```sh
npm install @reika-ds/styles
```

CSS (any app):

```html
<link rel="stylesheet" href="/node_modules/@reika-ds/styles/dist/reika-ds.min.css" />
<!-- optional on <html>: data-theme="dark" forces g100, data-theme="light" forces g10 -->
```

Sass (apps that compile their own styles):

```scss
@use '@reika-ds/styles';
```

Output: `:root` carries the Carbon g10 theme; `[data-theme="dark"]` and `prefers-color-scheme: dark`
(unless `data-theme="light"`) carry g100. Carbon component CSS is not included here; use Carbon's own
styles alongside it. Carbon's prefix is `cds`.

Three CSS entries are shipped, each with a `.min.css`. Apps that already load Carbon's base CSS import only
the first two (see the root README):

- `dist/reika-ds.css`: Carbon base, theme, utilities and components.
- `dist/reika-ds.components.css`: `rds-*` component styles only, no Carbon base or theme.
- `dist/reika-ds.utilities.css`: `rk-*` utilities only.

Sass consumers can also use `dist/scss/` (copies of the sources, with the tokens file inlined).

## Rules

- **New class only inside a component.** Apps do not write new `rk-` or `cds-` classes. If a gap
  shows up, add the rule to the component library, or ask for a utility here.
- **No selector that reaches into `.cds--` or `.rk-` internals** through a descendant or child
  combinator (for example `.app-form .cds--btn`). Style your own element, or use a component prop.
- **Values come from tokens.** No raw hex, no px except `0` and `1px`, no numeric `z-index`.
  Use `var(--cds-*)`, `var(--rk-*)`, the `rk-z-*` classes, or `rk-type--*`.

Check your own scss and css:

```sh
node node_modules/@reika-ds/styles/scripts/lint-consumer.mjs <file-or-dir> [...]
```

The lint fails on: `raw-hex`, `raw-px` (anything except `0` and `1px`), `raw-z-index`, and
`internal-override`.

## Build and test

```sh
npm run build   # tokens, then dist/reika-ds.css, dist/reika-ds.min.css, dist/scss/
npm test        # generation, spacing, no-hex, consumer lint
```

Generated utilities are written by `@each` loops in `src/_utilities.scss` from Carbon modules
(spacing, type-style, breakpoints) and REIKA tokens (z-layers, measures). The only literal
selectors are the allowlisted layout and text helpers listed in the test.

## Class reference

Generated from `dist/reika-ds.css` by `node scripts/readme-classes.mjs` (checked by the test suite).

<!-- classes:begin -->
**Spacing (Carbon $spacing-01..10)** (140)

`rk-p-01`, `rk-p-02`, `rk-p-03`, `rk-p-04`, `rk-p-05`, `rk-p-06`, `rk-p-07`, `rk-p-08`, `rk-p-09`, `rk-p-10`, `rk-px-01`, `rk-px-02`, `rk-px-03`, `rk-px-04`, `rk-px-05`, `rk-px-06`, `rk-px-07`, `rk-px-08`, `rk-px-09`, `rk-px-10`, `rk-py-01`, `rk-py-02`, `rk-py-03`, `rk-py-04`, `rk-py-05`, `rk-py-06`, `rk-py-07`, `rk-py-08`, `rk-py-09`, `rk-py-10`, `rk-pt-01`, `rk-pt-02`, `rk-pt-03`, `rk-pt-04`, `rk-pt-05`, `rk-pt-06`, `rk-pt-07`, `rk-pt-08`, `rk-pt-09`, `rk-pt-10`, `rk-pr-01`, `rk-pr-02`, `rk-pr-03`, `rk-pr-04`, `rk-pr-05`, `rk-pr-06`, `rk-pr-07`, `rk-pr-08`, `rk-pr-09`, `rk-pr-10`, `rk-pb-01`, `rk-pb-02`, `rk-pb-03`, `rk-pb-04`, `rk-pb-05`, `rk-pb-06`, `rk-pb-07`, `rk-pb-08`, `rk-pb-09`, `rk-pb-10`, `rk-pl-01`, `rk-pl-02`, `rk-pl-03`, `rk-pl-04`, `rk-pl-05`, `rk-pl-06`, `rk-pl-07`, `rk-pl-08`, `rk-pl-09`, `rk-pl-10`, `rk-m-01`, `rk-m-02`, `rk-m-03`, `rk-m-04`, `rk-m-05`, `rk-m-06`, `rk-m-07`, `rk-m-08`, `rk-m-09`, `rk-m-10`, `rk-mx-01`, `rk-mx-02`, `rk-mx-03`, `rk-mx-04`, `rk-mx-05`, `rk-mx-06`, `rk-mx-07`, `rk-mx-08`, `rk-mx-09`, `rk-mx-10`, `rk-my-01`, `rk-my-02`, `rk-my-03`, `rk-my-04`, `rk-my-05`, `rk-my-06`, `rk-my-07`, `rk-my-08`, `rk-my-09`, `rk-my-10`, `rk-mt-01`, `rk-mt-02`, `rk-mt-03`, `rk-mt-04`, `rk-mt-05`, `rk-mt-06`, `rk-mt-07`, `rk-mt-08`, `rk-mt-09`, `rk-mt-10`, `rk-mr-01`, `rk-mr-02`, `rk-mr-03`, `rk-mr-04`, `rk-mr-05`, `rk-mr-06`, `rk-mr-07`, `rk-mr-08`, `rk-mr-09`, `rk-mr-10`, `rk-mb-01`, `rk-mb-02`, `rk-mb-03`, `rk-mb-04`, `rk-mb-05`, `rk-mb-06`, `rk-mb-07`, `rk-mb-08`, `rk-mb-09`, `rk-mb-10`, `rk-ml-01`, `rk-ml-02`, `rk-ml-03`, `rk-ml-04`, `rk-ml-05`, `rk-ml-06`, `rk-ml-07`, `rk-ml-08`, `rk-ml-09`, `rk-ml-10`

**Type (Carbon type-style)** (18)

`rk-type--body-01`, `rk-type--body-02`, `rk-type--body-compact-01`, `rk-type--body-compact-02`, `rk-type--heading-compact-01`, `rk-type--heading-compact-02`, `rk-type--heading-03`, `rk-type--heading-04`, `rk-type--heading-05`, `rk-type--heading-06`, `rk-type--productive-heading-02`, `rk-type--productive-heading-03`, `rk-type--productive-heading-04`, `rk-type--productive-heading-05`, `rk-type--label-01`, `rk-type--helper-text-01`, `rk-type--code-01`, `rk-type--code-02`

**Text colour (semantic tokens)** (8)

`rk-text-primary`, `rk-text-secondary`, `rk-text-helper`, `rk-text-error`, `rk-text-on-color`, `rk-text-disabled`, `rk-text-inverse`, `rk-text-placeholder`

**Background colour (semantic tokens)** (5)

`rk-bg-background`, `rk-bg-layer-01`, `rk-bg-layer-02`, `rk-bg-field-01`, `rk-bg-inverse`

**Border colour (semantic tokens)** (3)

`rk-border-subtle-01`, `rk-border-strong-01`, `rk-border-interactive`

**Stacking (REIKA z-layers)** (7)

`rk-z-raised`, `rk-z-sticky`, `rk-z-bar`, `rk-z-shell`, `rk-z-pop`, `rk-z-modal`, `rk-z-toast`

**Show/hide at Carbon breakpoints** (4)

`rk-hide-md-up`, `rk-hide-md-down`, `rk-hide-lg-up`, `rk-hide-lg-down`

**Layout** (5)

`rk-row`, `rk-col`, `rk-wrap`, `rk-between`, `rk-center`

**Text, numbers and overflow** (4)

`rk-tabular`, `rk-scroll-x`, `rk-truncate`, `rk-truncate-front`

**Measure (REIKA tokens)** (2)

`rk-measure-form`, `rk-measure-text`

Total: 196 classes.
<!-- classes:end -->

## Fonts

IBM Plex Sans (300, 400, 500, 600) and IBM Plex Mono (400) are self-hosted in `fonts/` (woff2, from `@ibm/plex` 6.4.1).
Load `fonts/fonts.css` once; it declares the `@font-face` rules with `font-display: swap` and loads only from the same
folder (no third-party request). The licence is SIL Open Font License 1.1, in `fonts/LICENSE-OFL.txt`. Apps that copy
the tarball keep the `fonts/` folder next to `reika-ds.css`.

## Icons

Icons are Carbon's (`@carbon/icons`, Apache-2.0). Decision: Carbon icons everywhere, no custom icon files. React uses
`@carbon/icons-react`; the HTML helpers in `@reika-ds/web` carry the same 32px shapes (see packages/web/README.md).
