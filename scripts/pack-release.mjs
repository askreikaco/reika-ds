#!/usr/bin/env node
// Builds the public packages and writes GitHub release tarballs to release/.
//
// Consumers install from release asset URLs, so no registry login is needed.
// npm cannot resolve "@reika-ds/x": "0.1.0" from a tarball, so each tarball's
// internal dependencies are rewritten to their release asset URL.
//
// Usage: node scripts/pack-release.mjs [outDir]   (default: <repo>/release)

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_URL = 'https://github.com/askreikaco/reika-ds';
export const PACKAGE_DIRS = ['tokens', 'styles', 'react', 'web'];
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function tarballName(pkgName, version) {
  return `reika-ds-${pkgName.split('/')[1]}-${version}.tgz`;
}

export function releaseUrl(version, fileName) {
  return `${REPO_URL}/releases/download/v${version}/${fileName}`;
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

export function loadPackages(root = ROOT) {
  return PACKAGE_DIRS.map((dir) => {
    const pkgDir = join(root, 'packages', dir);
    const pkg = readJson(join(pkgDir, 'package.json'));
    return { dir: pkgDir, name: pkg.name, version: pkg.version };
  });
}

function sha256(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex');
}

// Unpacks one tarball, points each internal dependency at its release asset
// URL, and repacks the tarball in place.
function rewriteTarball(file, packages, version) {
  const work = mkdtempSync(join(tmpdir(), 'reika-ds-pack-'));
  try {
    execFileSync('tar', ['-xzf', file, '-C', work]);
    const pjPath = join(work, 'package', 'package.json');
    const pj = readJson(pjPath);
    const internal = new Set(packages.map((p) => p.name));
    for (const [dep, spec] of Object.entries(pj.dependencies ?? {})) {
      if (!internal.has(dep)) continue;
      if (spec !== version) {
        throw new Error(
          `${pj.name}: internal dep ${dep} must be "${version}", found "${spec}"`,
        );
      }
      pj.dependencies[dep] = releaseUrl(version, tarballName(dep, version));
    }
    writeFileSync(pjPath, `${JSON.stringify(pj, null, 2)}\n`);
    rmSync(file);
    execFileSync('tar', ['-czf', file, '-C', work, 'package']);
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

// Only a real tag push is compared against the package version. PR and
// branch runs have GITHUB_REF_NAME such as "20/merge", which is skipped.
export function assertTagMatches(version, env = process.env) {
  if (env.GITHUB_REF_TYPE !== 'tag') return;
  const tag = env.GITHUB_REF_NAME;
  if (tag !== `v${version}`) {
    throw new Error(`git tag ${tag} does not match package version v${version}`);
  }
}

export function packRelease({ root = ROOT, outDir = join(root, 'release') } = {}) {
  const packages = loadPackages(root);
  const versions = [...new Set(packages.map((p) => p.version))];
  if (versions.length !== 1) {
    throw new Error(`package versions differ: ${versions.join(', ')}`);
  }
  const [version] = versions;

  assertTagMatches(version);

  execFileSync(
    'npm',
    ['run', 'build', '--if-present', ...packages.flatMap((p) => ['-w', p.name])],
    { cwd: root, stdio: 'inherit' },
  );

  const resolvedOut = resolve(outDir);
  rmSync(resolvedOut, { recursive: true, force: true });
  mkdirSync(resolvedOut, { recursive: true });

  const files = [];
  for (const p of packages) {
    const json = execFileSync(
      'npm',
      ['pack', '--json', '--pack-destination', resolvedOut],
      { cwd: p.dir, encoding: 'utf8' },
    );
    const [{ filename }] = JSON.parse(json);
    const expected = tarballName(p.name, version);
    if (filename !== expected) {
      throw new Error(`npm pack wrote ${filename}, expected ${expected}`);
    }
    rewriteTarball(join(resolvedOut, filename), packages, version);
    files.push(filename);
  }

  files.sort();
  const sums = files.map((f) => `${sha256(join(resolvedOut, f))}  ${f}\n`).join('');
  writeFileSync(join(resolvedOut, 'SHA256SUMS'), sums);
  return { version, outDir: resolvedOut, files };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outDir = process.argv[2] ? resolve(process.argv[2]) : undefined;
  const result = packRelease({ outDir });
  console.log(`release v${result.version} -> ${result.outDir}`);
  for (const f of [...result.files, 'SHA256SUMS']) console.log(`  ${f}`);
}
