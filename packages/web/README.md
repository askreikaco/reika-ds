# @reika-ds/web

HTML-string helpers and CSS for apps without React: server-rendered pages and build-free PWAs. Plain ES modules,
no runtime dependency. Same rules as the rest of REIKA DS (conv §36): one component per pattern with variants and
show options, tokens only, fluid layout, 44px touch targets, one link per item plus at most one trailing action.

## Use

```html
<link rel="stylesheet" href="tokens.css"> <!-- from @reika-ds/tokens/dist -->
<link rel="stylesheet" href="web.css">    <!-- from @reika-ds/web/dist -->
```

```js
import { list, listItem, section, toolbar, tag, iconButton, menu, menuController, raw } from '@reika-ds/web';

main.innerHTML = section({
  title: 'Relations',
  count: '3',
  toolbar: raw(toolbar({ search: { label: 'Search relations' }, actions: [{ label: 'Add', icon: 'add' }] })),
  body: raw(list(rows.map((r) => ({ title: r.name, meta: r.role, href: `#person/${r.id}` })))),
});
menuController(document, { onSelect: ({ value }) => run(value) });
```

- **Escaping:** every text option is escaped. Pass markup made by another helper with `raw()`; never pass user
  data through `raw()`. `attrs` refuses `on*` and `style`; links go through `safeHref` (`javascript:`/`data:` → `#`).
- **Build-free apps** copy `dist/` (pinned release + `SHA256SUMS`) instead of installing.
- **Catalogue:** `dist/catalog.html` renders every component × variant in light and dark (review surface and
  visual-baseline source). Build with `npm run build -w packages/web`.

## Components

### listItem / list
One item in a list. Variants: `row` (default; hairline between rows), `card` (own layer), `compact` (pickers,
autocomplete, menus), `tree` (indented by `depth` 0–12 with a guide line), `table-row` (a `<tr>`; `cells` after the
title; `list(items, { variant: 'table-row', head })` wraps it in a table).
Options: `title`, `href`, `meta`, `leading`, `badges`, `trailing`, `action`, `depth`, `muted`, `current`,
`show: { leading, meta, badges, trailing, chevron }`, `attrs`, `linkAttrs`.
- Do: make the whole item one link; put the editor action in `action` (an `iconButton` option object) — it renders
  as a sibling, and the chevron is dropped.
- Don't: nest buttons or links inside the item; build a look-alike row by hand; hide meaning in colour only.

### section
Titled block. Variants `card` (layer + border) and `plain`. Options: `title`, `count`, `toolbar`, `body`, `footer`,
`level` (2–4), `fold: { open }` (native `<details>`, works without JS), `id`.
- Do: one section per topic; put its search/filter/add in `toolbar`.
- Don't: nest card sections inside card sections.

### toolbar
Search field plus icon buttons on one line; the search takes the free space. Options: `search: { label,
placeholder, value, name, id }`, `actions` (iconButton options or `raw()`), `count`, `sticky` (opaque background at
the top of its scroll container, so nothing shows through).
- Do: give the search a real `label` (visually hidden). Don't: offset a sticky toolbar by a fixed amount inside an
  iframe or a container that already sits below the app bar.

### tag
Short label. Tones `gray` (filled), `info`, `success`, `warning`, `error`, `accent` (border + dot; text stays
primary, so contrast always passes). Sizes `md`, `sm`. `as: 'button'` + `pressed` for filter chips.
- Don't: rely on tone colour alone; keep the text meaningful.

### iconButton
44px square button. Requires `label` (accessible name, also the tooltip). Options: `icon`, `tone` (`primary`,
`danger`), `pressed`, `haspopup` + `expanded` + `controls` (menu triggers), `attrs`. Icons: `iconNames`.

### menu + menuController
`menu({ id, label, items })` renders a hidden `role="menu"`. The trigger is an `iconButton` with
`haspopup: 'menu', controls: id`. `menuController(document, { onSelect })` (one per document):
- a second tap on the same trigger closes the menu; another trigger switches menus;
- Escape closes and returns focus to the trigger; a tap outside closes it; arrow keys move between items;
- opens below when it fits, else above; if neither fits it takes the larger side and scrolls inside — it never covers
  its own trigger.

### sheet / confirm + sheetController
Native `<dialog>` as a bottom sheet (full width on phones, capped at the form measure and centred when wide).
`sheet({ id, title, body, actions, closeLabel })`; `confirm({ id, title, message, confirmLabel, cancelLabel,
danger })`. `sheetController(document, { onConfirm })` wires `[data-rds-close]`, `[data-rds-confirm]` and backdrop
taps; open with `.open(id)`. Focus returns to whatever opened the dialog when it closes (buttons, Escape, backdrop).

### infoTip (toggletip)
`infoTip(text, { id, label })`: an ⓘ button (44px target, accessible name `label`) and a hidden popover with `id`.
Tap or click opens it; a second tap, Escape or a tap outside closes it, and focus stays on the trigger. Served by the
same `menuController` (no extra script). Use it for "why / what does this mean" detail, never for warnings, errors or
costs (those stay visible). Keep one-line helper text visible; put longer rules behind a toggletip or a link.

### timelineItem / timeline
One entry on a timeline: date column (year + optional `sub`, e.g. the age), rail, box. Variants: `card` (personal or
family events), `band` (a span such as a reign), `quiet` (context such as a historical event — lighter than any
card). Options: `date`, `sub`, `title`, `kind`, `body`, `tag`, `href`, `external` (new tab, `rel="noopener"`).

### emptyState
`emptyState({ title, text, action, variant: 'block' | 'inline' })`, `role="status"`.

### Icons and tokens
Icons are Carbon shapes: `ICONS` in `src/html.js` holds the 32px paths copied from `@carbon/icons-react` 11.92.0
(Apache-2.0). No custom icon files and no hand-drawn icons: a new icon is a new `ICONS` entry copied from Carbon, and
`test/fixtures/carbon-icons-32.json` must list it. Colours, sizes and motion come only from `--rk-*` / `--cds-*` (`@reika-ds/tokens`);
the modal scrim is `--rk-scrim` (Carbon overlay in both themes).

### button
Text button: `primary`, `outline`, `ghost`, `danger`; `href` renders a link styled as a button.

## Tests
`npm test -w packages/web`: escaping and unsafe links, structure and a11y attributes per component and variant, the
menu controller in jsdom (toggle, Escape, outside tap, switching, selection, arrow keys), CSS rules (no raw hex/px/
rem, no numeric z-index, no width media queries, hover only under `(hover: hover)`, every emitted class styled),
deterministic build. `npm run lint -w packages/web` runs the consumer lint on `web.css`.
