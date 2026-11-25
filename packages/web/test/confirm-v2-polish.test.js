// confirm v2 polish (0.3.1): field classes on the type and reason fields, noteTone, and the heading focus rule.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as W from '../src/index.js';

const css = readFileSync(join(__dirname, '..', 'src', 'web.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

describe('confirm v2 polish', () => {
  it('type-to-confirm input and reason textarea carry the shared field class', () => {
    const html = W.confirm({ id: 'p1', title: 'T', message: 'M', typeToConfirm: { value: 'DELETE' }, reason: { label: 'Why' } });
    expect(html).toMatch(/<input[^>]*class="[^"]*\brds-field__input\b[^"]*"[^>]*data-rds-type/);
    expect(html).toMatch(/<textarea[^>]*class="[^"]*\brds-field__input\b[^"]*"[^>]*data-rds-reason/);
  });

  it('field class has the field background, bottom border and padding tokens', () => {
    const rule = css.match(/\.rds-confirm__input,\s*\.rds-confirm__textarea,\s*\.rds-field__input\s*\{[^}]*\}/);
    expect(rule).not.toBeNull();
    expect(rule[0]).toMatch(/background:\s*var\(--cds-field-01\)/);
    expect(rule[0]).toMatch(/border-block-end:\s*1px solid var\(--cds-border-strong-01\)/);
    expect(rule[0]).toMatch(/padding:\s*var\(--rk-sp-03\) var\(--rk-sp-04\)/);
  });

  it('noteTone danger adds the danger note class; default and info do not', () => {
    const danger = W.confirm({ id: 'n1', title: 'T', message: 'M', note: 'Careful', noteTone: 'danger' });
    expect(danger).toMatch(/<div class="rds-confirm__note rds-confirm__note--danger" role="note">Careful<\/div>/);
    const def = W.confirm({ id: 'n2', title: 'T', message: 'M', note: 'Info' });
    expect(def).toMatch(/<div class="rds-confirm__note" role="note">Info<\/div>/);
    expect(W.confirm({ id: 'n3', title: 'T', message: 'M', note: 'x', noteTone: 'info' })).not.toMatch(/note--danger/);
  });

  it('danger note uses the error tokens for its left border and text', () => {
    const rule = css.match(/\.rds-confirm__note--danger\s*\{[^}]*\}/);
    expect(rule).not.toBeNull();
    expect(rule[0]).toMatch(/border-inline-start-color:\s*var\(--cds-support-error\)/);
    expect(rule[0]).toMatch(/color:\s*var\(--cds-text-error\)/);
  });

  it('script-focused headings (tabindex=-1) lose the outline unless keyboard focus is visible', () => {
    expect(css).toMatch(/\[tabindex="-1"\]:focus:not\(:focus-visible\)\s*\{\s*outline:\s*none;?\s*\}/);
  });
});
