// Escaping and small markup helpers shared by every component. Plain strings are always escaped;
// markup built by another helper is passed through only when wrapped with raw().

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapes text for element content and attribute values. null/undefined become ''. */
export function esc(value) {
  if (value === null || value === undefined || value === false) return '';
  return String(value).replace(/[&<>"']/g, (c) => ESC[c]);
}

const RAW = Symbol('rds.raw');

/** Marks trusted markup (output of another helper) so it is not escaped again. */
export function raw(html) {
  return { [RAW]: true, html: String(html ?? '') };
}

export const isRaw = (v) => Boolean(v && typeof v === 'object' && v[RAW]);

/** Content: raw() markup as is, arrays joined, anything else escaped. */
export function content(value) {
  if (Array.isArray(value)) return value.map(content).join('');
  if (isRaw(value)) return value.html;
  return esc(value);
}

/** True when content() would render something visible. */
export function has(value) {
  if (Array.isArray(value)) return value.some(has);
  if (isRaw(value)) return value.html !== '';
  return value !== null && value !== undefined && value !== false && String(value) !== '';
}

/**
 * Attribute string from an object: true -> bare attribute, false/null/undefined -> omitted, else escaped value.
 * Names are restricted to safe characters; event handlers (on*) and style are refused.
 */
export function attrs(obj = {}) {
  let out = '';
  for (const [name, value] of Object.entries(obj)) {
    if (!/^[a-zA-Z_:][\w:.-]*$/.test(name) || /^on/i.test(name) || name.toLowerCase() === 'style') {
      throw new Error(`rds: attribute "${name}" is not allowed`);
    }
    if (value === false || value === null || value === undefined) continue;
    out += value === true ? ` ${name}` : ` ${name}="${esc(value)}"`;
  }
  return out;
}

/** Only http(s), relative, hash and mailto/tel links; anything else (javascript:, data:) becomes '#'. */
export function safeHref(href) {
  const h = String(href ?? '').trim();
  if (h === '') return '#';
  if (/^(https?:|mailto:|tel:)/i.test(h)) return h;
  if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return '#';
  return h;
}

/** Class list from strings and {name: condition} objects. */
export function cx(...parts) {
  const out = [];
  for (const p of parts) {
    if (!p) continue;
    if (typeof p === 'string') out.push(p);
    else for (const [k, v] of Object.entries(p)) if (v) out.push(k);
  }
  return out.join(' ');
}

// Small icon set drawn on Carbon's 32-unit grid (shapes follow Carbon icon names); used by the components.
const ICONS = {
  'chevron-right': '<path d="M22 16 12 26l-1.4-1.4 8.6-8.6-8.6-8.6L12 6z"/>',
  'chevron-down': '<path d="M16 22 6 12l1.4-1.4 8.6 8.6 8.6-8.6L26 12z"/>',
  'overflow-menu-horizontal': '<circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="24" cy="16" r="2"/>',
  'overflow-menu-vertical': '<circle cx="16" cy="8" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="16" cy="24" r="2"/>',
  filter: '<path d="M18 28h-4a2 2 0 0 1-2-2v-7.6L4.6 11A2 2 0 0 1 4 9.6V6a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2v3.6a2 2 0 0 1-.6 1.4L20 18.4V26a2 2 0 0 1-2 2M6 6v3.6l8 8V26h4v-8.4l8-8V6Z"/>',
  add: '<path d="M17 15V8h-2v7H8v2h7v7h2v-7h7v-2z"/>',
  edit: '<path d="M2 26h28v2H2zM25.4 9c.8-.8.8-2 0-2.8l-3.6-3.6c-.8-.8-2-.8-2.8 0l-15 15V24h6.4zm-5-5L24 7.6l-3 3L17.4 7zM6 22v-3.6l10-10 3.6 3.6-10 10z"/>',
  close: '<path d="M17.4 16 24 9.4 22.6 8 16 14.6 9.4 8 8 9.4l6.6 6.6L8 22.6 9.4 24l6.6-6.6 6.6 6.6 1.4-1.4z"/>',
  search: '<path d="m29 27.6-7.6-7.6a11 11 0 1 0-1.4 1.4l7.6 7.6zM4 13a9 9 0 1 1 9 9 9 9 0 0 1-9-9"/>',
  share: '<path d="M23 20a5 5 0 0 0-3.9 1.9l-7.5-4.7a5 5 0 0 0 0-2.4l7.5-4.7A5 5 0 1 0 18 7a5 5 0 0 0 .1 1.2l-7.5 4.7a5 5 0 1 0 0 6.2l7.5 4.7A5 5 0 0 0 18 25a5 5 0 1 0 5-5m0-16a3 3 0 1 1-3 3 3 3 0 0 1 3-3M8 19a3 3 0 1 1 3-3 3 3 0 0 1-3 3m15 9a3 3 0 1 1 3-3 3 3 0 0 1-3 3"/>',
};

export const iconNames = Object.keys(ICONS);

/** Inline SVG icon (decorative: aria-hidden). Unknown names throw, so typos fail in tests. */
export function icon(name, cls = '') {
  if (!ICONS[name]) throw new Error(`rds: unknown icon "${name}"`);
  return `<svg class="${cx('rds-icon', cls)}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}
