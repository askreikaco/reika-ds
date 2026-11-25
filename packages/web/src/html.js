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

// Icons: Carbon shapes, 32 grid, copied from @carbon/icons-react 11.92.0 (Apache-2.0). Do not hand-draw icons;
// add a name here only by copying the Carbon 32px paths. Used by the components.
const ICONS = {
  'chevron-right': '<path d="M22 16 12 26 10.6 24.6 19.2 16 10.6 7.4 12 6z"/>',
  'chevron-down': '<path d="M16 22 6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z"/>',
  'overflow-menu-horizontal': '<circle cx="8" cy="16" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="24" cy="16" r="2"/>',
  'overflow-menu-vertical': '<circle cx="16" cy="8" r="2"/><circle cx="16" cy="16" r="2"/><circle cx="16" cy="24" r="2"/>',
  filter: '<path d="M18,28H14a2,2,0,0,1-2-2V18.41L4.59,11A2,2,0,0,1,4,9.59V6A2,2,0,0,1,6,4H26a2,2,0,0,1,2,2V9.59A2,2,0,0,1,27.41,11L20,18.41V26A2,2,0,0,1,18,28ZM6,6V9.59l8,8V26h4V17.59l8-8V6Z"/>',
  information: '<path d="M17 22 17 14 13 14 13 16 15 16 15 22 12 22 12 24 20 24 20 22 17 22z"/><path d="M16,8a1.5,1.5,0,1,0,1.5,1.5A1.5,1.5,0,0,0,16,8Z"/><path d="M16,30A14,14,0,1,1,30,16,14,14,0,0,1,16,30ZM16,4A12,12,0,1,0,28,16,12,12,0,0,0,16,4Z"/>',
  add: '<path d="M17 15 17 8 15 8 15 15 8 15 8 17 15 17 15 24 17 24 17 17 24 17 24 15z"/>',
  edit: '<path d="M2 26H30V28H2z"/><path d="M25.4,9c0.8-0.8,0.8-2,0-2.8c0,0,0,0,0,0l-3.6-3.6c-0.8-0.8-2-0.8-2.8,0c0,0,0,0,0,0l-15,15V24h6.4L25.4,9z M20.4,4L24,7.6 l-3,3L17.4,7L20.4,4z M6,22v-3.6l10-10l3.6,3.6l-10,10H6z"/>',
  close: '<path d="M17.4141 16 24 9.4141 22.5859 8 16 14.5859 9.4143 8 8 9.4141 14.5859 16 8 22.5859 9.4143 24 16 17.4141 22.5859 24 24 22.5859 17.4141 16z"/>',
  search: '<path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"/>',
  share: '<path d="M23,20a5,5,0,0,0-3.89,1.89L11.8,17.32a4.46,4.46,0,0,0,0-2.64l7.31-4.57A5,5,0,1,0,18,7a4.79,4.79,0,0,0,.2,1.32l-7.31,4.57a5,5,0,1,0,0,6.22l7.31,4.57A4.79,4.79,0,0,0,18,25a5,5,0,1,0,5-5ZM23,4a3,3,0,1,1-3,3A3,3,0,0,1,23,4ZM7,19a3,3,0,1,1,3-3A3,3,0,0,1,7,19Zm16,9a3,3,0,1,1,3-3A3,3,0,0,1,23,28Z"/>',
};

export const iconNames = Object.keys(ICONS);

/** Inline SVG icon (decorative: aria-hidden). Unknown names throw, so typos fail in tests. */
export function icon(name, cls = '') {
  if (!ICONS[name]) throw new Error(`rds: unknown icon "${name}"`);
  return `<svg class="${cx('rds-icon', cls)}" viewBox="0 0 32 32" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}
