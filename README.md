# reika-ds
REIKA design system. Built on IBM Carbon (npm dependency, not a fork): tokens, styles, utility classes for Carbon gaps, React components and page templates shared by REIKA apps. App differences are themes (token overrides).

Status: setting up. Plan: packages/tokens, packages/styles, packages/react, packages/web, apps/catalog.

## Install

No registry account or token needed. Install from the GitHub release tarballs (v0.1.0):

```sh
npm i https://github.com/askreikaco/reika-ds/releases/download/v0.1.0/reika-ds-react-0.1.0.tgz \
      https://github.com/askreikaco/reika-ds/releases/download/v0.1.0/reika-ds-styles-0.1.0.tgz \
      https://github.com/askreikaco/reika-ds/releases/download/v0.1.0/reika-ds-tokens-0.1.0.tgz
```

Each tarball's internal dependencies point at the matching release asset, so the URLs above resolve without npm registry access. `SHA256SUMS` is attached to each release. Publishing to the npm registry is planned for later.

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
