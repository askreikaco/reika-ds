# reika-ds
REIKA design system. Built on IBM Carbon (npm dependency, not a fork): tokens, styles, utility classes for Carbon gaps, React components and page templates shared by REIKA apps. App differences are themes (token overrides).

Status: setting up. Plan: packages/tokens, packages/styles, packages/react, packages/web, apps/catalog.

## Install

No registry account or token needed. Install from the GitHub release tarballs (v0.1.1):

```sh
npm i https://github.com/askreikaco/reika-ds/releases/download/v0.1.1/reika-ds-react-0.1.1.tgz \
      https://github.com/askreikaco/reika-ds/releases/download/v0.1.1/reika-ds-styles-0.1.1.tgz \
      https://github.com/askreikaco/reika-ds/releases/download/v0.1.1/reika-ds-tokens-0.1.1.tgz
```

Each tarball's internal dependencies point at the matching release asset, so the URLs above resolve without npm registry access. `SHA256SUMS` is attached to each release. Publishing to the npm registry is planned for later.

## Using with an app that already has Carbon

If the app already loads Carbon's base CSS, do not import `reika-ds.css`: it carries a second Carbon base and theme. Import the component and utility entries only:

```js
import '@reika-ds/styles/dist/reika-ds.components.css';
import '@reika-ds/styles/dist/reika-ds.utilities.css';
```

- `reika-ds.components.css`: `rds-*` component styles. No Carbon base, no theme rules, no utilities.
- `reika-ds.utilities.css`: `rk-*` utilities only.
- `reika-ds.css`: Carbon base, theme, utilities and components, for an app with no Carbon of its own.

Each entry also ships as `.min.css`. The React components need `react` 18.3.1 and `react-dom` 18.3.1 installed by the app (peer dependencies). A fresh project must add them explicitly:

```sh
npm i react@18.3.1 react-dom@18.3.1
```

## Development

```sh
npm ci
npm test
npm run build
npm run dev -w apps/catalog
```

## Contributing

PRs need green CI before merge.

License: Apache-2.0. REIKA names and logos are trademarks and are not covered by the license.
