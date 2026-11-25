// REIKA DS web helpers: plain-JS functions that return HTML strings for apps without React (server-rendered pages,
// build-free PWAs). One component per pattern; variants and show options instead of copies (conv §36).
// Every text option is escaped; pass markup built by another helper with raw(). Styles: web.css (tokens only).
import { attrs, content, cx, esc, has, icon, isRaw, raw, safeHref } from './html.js';

// ---------------------------------------------------------------------------------------------------------------
// iconButton: 44px square icon button with an accessible name. Used alone, in toolbars and as a row action.
// ---------------------------------------------------------------------------------------------------------------
/**
 * @param {{ label: string, icon: string, tone?: 'default'|'primary'|'danger', pressed?: boolean,
 *   expanded?: boolean, controls?: string, haspopup?: 'menu'|'dialog', attrs?: object, cls?: string }} o
 */
export function iconButton(o) {
  if (!o || !o.label) throw new Error('rds: iconButton needs a label (accessible name)');
  const a = {
    type: 'button',
    class: cx('rds-ibtn', { [`rds-ibtn--${o.tone}`]: o.tone && o.tone !== 'default' }, o.cls),
    'aria-label': o.label,
    title: o.label,
    'aria-pressed': o.pressed === undefined ? undefined : String(Boolean(o.pressed)),
    'aria-haspopup': o.haspopup,
    'aria-expanded': o.haspopup ? String(Boolean(o.expanded)) : undefined,
    'aria-controls': o.controls,
    ...(o.attrs || {}),
  };
  return `<button${attrs(a)}>${icon(o.icon)}</button>`;
}

// ---------------------------------------------------------------------------------------------------------------
// tag: short label. Tones carry meaning with a border and a dot, never colour alone (text stays primary).
// ---------------------------------------------------------------------------------------------------------------
const TONES = ['gray', 'info', 'success', 'warning', 'error', 'accent'];
/**
 * @param {string|object} text
 * @param {{ tone?: string, size?: 'sm'|'md', as?: 'span'|'button', pressed?: boolean, attrs?: object }} [o]
 */
export function tag(text, o = {}) {
  const tone = TONES.includes(o.tone) ? o.tone : 'gray';
  const size = o.size === 'sm' ? 'sm' : 'md';
  const cls = cx('rds-tag', `rds-tag--${tone}`, `rds-tag--${size}`);
  if (o.as === 'button') {
    const a = { type: 'button', class: cx(cls, 'rds-tag--button'), 'aria-pressed': o.pressed === undefined ? undefined : String(Boolean(o.pressed)), ...(o.attrs || {}) };
    return `<button${attrs(a)}>${content(text)}</button>`;
  }
  return `<span${attrs({ class: cls, ...(o.attrs || {}) })}>${content(text)}</span>`;
}

// ---------------------------------------------------------------------------------------------------------------
// listItem: one item in a list. Variants: row | card | compact | tree | table-row.
// One link per item (the whole item) plus at most one trailing action; never nested interactive elements.
// ---------------------------------------------------------------------------------------------------------------
const VARIANTS = ['row', 'card', 'compact', 'tree', 'table-row'];
/**
 * @param {{ title: string|object, href?: string, meta?: any, leading?: object, badges?: any, trailing?: any,
 *   action?: object|null, variant?: string, depth?: number, muted?: boolean, current?: boolean,
 *   show?: { leading?: boolean, meta?: boolean, badges?: boolean, trailing?: boolean, chevron?: boolean },
 *   cells?: any[], attrs?: object, linkAttrs?: object }} o
 *  action: an iconButton() options object (rendered as a sibling of the link) or raw() markup.
 */
export function listItem(o) {
  const variant = VARIANTS.includes(o.variant) ? o.variant : 'row';
  const show = { leading: true, meta: true, badges: true, trailing: true, chevron: undefined, ...(o.show || {}) };
  const action = o.action ? (isRaw(o.action) ? content(o.action) : iconButton({ ...o.action, cls: cx('rds-item__action', o.action.cls) })) : '';
  const chevron = show.chevron === undefined ? Boolean(o.href) && !action : show.chevron && Boolean(o.href);
  const depth = Math.max(0, Math.min(12, Number(o.depth) || 0));
  const cls = cx('rds-item', `rds-item--${variant}`, { 'rds-item--muted': o.muted, 'rds-item--action': action, [`rds-item--d${depth}`]: variant === 'tree' });

  if (variant === 'table-row') {
    const cells = (o.cells || []).map((c) => `<td class="rds-item__cell">${content(c)}</td>`).join('');
    const title = o.href ? `<a${attrs({ class: 'rds-item__hit', href: safeHref(o.href), ...(o.linkAttrs || {}) })}>${content(o.title)}</a>` : content(o.title);
    return `<tr${attrs({ class: cls, ...(o.attrs || {}) })}><th scope="row" class="rds-item__cell rds-item__cell--title">${title}</th>${cells}${action ? `<td class="rds-item__cell rds-item__cell--action">${action}</td>` : ''}</tr>`;
  }

  const body = [
    show.leading && has(o.leading) ? `<span class="rds-item__leading">${content(o.leading)}</span>` : '',
    `<span class="rds-item__main"><span class="rds-item__title">${content(o.title)}${show.badges && has(o.badges) ? ` <span class="rds-item__badges">${content(o.badges)}</span>` : ''}</span>`,
    show.meta && has(o.meta) ? `<span class="rds-item__meta">${content(o.meta)}</span>` : '',
    '</span>',
    show.trailing && has(o.trailing) ? `<span class="rds-item__trailing">${content(o.trailing)}</span>` : '',
    chevron ? icon('chevron-right', 'rds-item__chevron') : '',
  ].join('');
  const hit = o.href
    ? `<a${attrs({ class: 'rds-item__hit', href: safeHref(o.href), 'aria-current': o.current ? 'page' : undefined, ...(o.linkAttrs || {}) })}>${body}</a>`
    : `<div class="rds-item__hit rds-item__hit--static">${body}</div>`;
  return `<li${attrs({ class: cls, ...(o.attrs || {}) })}>${hit}${action}</li>`;
}

/** List wrapper for listItem(): <ul> for row/card/compact/tree, <table> for table-row (with optional head). */
export function list(items, o = {}) {
  const variant = VARIANTS.includes(o.variant) ? o.variant : 'row';
  const html = items.map((i) => (typeof i === 'string' ? i : listItem({ variant, ...i }))).join('');
  if (variant === 'table-row') {
    const head = o.head ? `<thead><tr>${o.head.map((h) => `<th scope="col" class="rds-item__cell">${esc(h)}</th>`).join('')}</tr></thead>` : '';
    return `<table${attrs({ class: 'rds-list rds-list--table-row', 'aria-label': o.label })}>${head}<tbody>${html}</tbody></table>`;
  }
  return `<ul${attrs({ class: cx('rds-list', `rds-list--${variant}`), 'aria-label': o.label })}>${html}</ul>`;
}

// ---------------------------------------------------------------------------------------------------------------
// section: titled block. Variants: card (layer background + border) | plain. Optional count, toolbar slot,
// fold (native <details>, so it works without JS) and footer.
// ---------------------------------------------------------------------------------------------------------------
/**
 * @param {{ title: string, body: any, count?: number|string, toolbar?: object, footer?: any,
 *   variant?: 'card'|'plain', level?: 2|3|4, fold?: { open?: boolean }, id?: string, attrs?: object }} o
 */
export function section(o) {
  const level = [2, 3, 4].includes(o.level) ? o.level : 2;
  const variant = o.variant === 'plain' ? 'plain' : 'card';
  const count = has(o.count) ? ` <span class="rds-section__count">${esc(o.count)}</span>` : '';
  const head = `<h${level} class="rds-section__title">${esc(o.title)}${count}</h${level}>`;
  const inner = `${has(o.toolbar) ? `<div class="rds-section__toolbar">${content(o.toolbar)}</div>` : ''}<div class="rds-section__body">${content(o.body)}</div>${has(o.footer) ? `<div class="rds-section__footer">${content(o.footer)}</div>` : ''}`;
  const cls = cx('rds-section', `rds-section--${variant}`, { 'rds-section--fold': o.fold });
  const a = { class: cls, id: o.id, ...(o.attrs || {}) };
  if (o.fold) {
    return `<section${attrs(a)}><details class="rds-section__fold"${o.fold.open ? ' open' : ''}><summary class="rds-section__summary">${head}${icon('chevron-down', 'rds-section__caret')}</summary>${inner}</details></section>`;
  }
  return `<section${attrs(a)}><header class="rds-section__head">${head}</header>${inner}</section>`;
}

// ---------------------------------------------------------------------------------------------------------------
// toolbar: search field plus icon buttons on one line; the search takes the free space.
// ---------------------------------------------------------------------------------------------------------------
/**
 * @param {{ search?: { label: string, placeholder?: string, value?: string, name?: string, id?: string },
 *   actions?: Array<object>, sticky?: boolean, count?: string, attrs?: object }} o
 *  actions: iconButton() option objects or raw() markup.
 */
export function toolbar(o = {}) {
  const s = o.search;
  const search = s
    ? `<label class="rds-tbar__search">${icon('search', 'rds-tbar__search-icon')}<span class="rds-vh">${esc(s.label)}</span><input${attrs({ type: 'search', class: 'rds-tbar__input', name: s.name, id: s.id, value: s.value, placeholder: s.placeholder, autocomplete: 'off' })}></label>`
    : '';
  const actions = (o.actions || []).map((a) => (isRaw(a) ? content(a) : iconButton(a))).join('');
  const count = has(o.count) ? `<p class="rds-tbar__count">${esc(o.count)}</p>` : '';
  return `<div${attrs({ class: cx('rds-tbar', { 'rds-tbar--sticky': o.sticky }), role: 'search', ...(o.attrs || {}) })}><div class="rds-tbar__row">${search}${actions ? `<div class="rds-tbar__actions">${actions}</div>` : ''}</div>${count}</div>`;
}

// ---------------------------------------------------------------------------------------------------------------
// menu: pop-up menu markup. The trigger is any iconButton with haspopup:'menu' and controls:<menu id>.
// Behaviour (toggle, Escape, outside click, placement) is in menu-controller.js.
// ---------------------------------------------------------------------------------------------------------------
/**
 * @param {{ id: string, label?: string, items: Array<{ label: string, value?: string, href?: string,
 *   tone?: 'default'|'danger', disabled?: boolean }> }} o
 */
export function menu(o) {
  if (!o.id) throw new Error('rds: menu needs an id (the trigger points at it with aria-controls)');
  const head = has(o.label) ? `<p class="rds-menu__label" aria-hidden="true">${esc(o.label)}</p>` : '';
  const items = o.items
    .map((it) => {
      const cls = cx('rds-menu__item', { 'rds-menu__item--danger': it.tone === 'danger' });
      if (it.href) return `<a${attrs({ class: cls, role: 'menuitem', href: safeHref(it.href), tabindex: '-1' })}>${esc(it.label)}</a>`;
      return `<button${attrs({ type: 'button', class: cls, role: 'menuitem', 'data-value': it.value, disabled: Boolean(it.disabled), tabindex: '-1' })}>${esc(it.label)}</button>`;
    })
    .join('');
  return `<div${attrs({ class: 'rds-menu', id: o.id, role: 'menu', 'aria-label': o.label, hidden: true })}>${head}${items}</div>`;
}

// ---------------------------------------------------------------------------------------------------------------
// sheet / confirm: native <dialog> as a bottom sheet; full width on phones, capped and centred when wide (fluid).
// ---------------------------------------------------------------------------------------------------------------
/**
 * @param {{ id: string, title: string, body: any, actions?: any, closeLabel?: string, attrs?: object }} o
 */
export function sheet(o) {
  if (!o.id) throw new Error('rds: sheet needs an id');
  const titleId = `${o.id}-title`;
  return `<dialog${attrs({ class: 'rds-sheet-d', id: o.id, 'aria-labelledby': titleId, ...(o.attrs || {}) })}><div class="rds-sheet-d__panel"><header class="rds-sheet-d__head"><h2 class="rds-sheet-d__title" id="${esc(titleId)}">${esc(o.title)}</h2>${iconButton({ label: o.closeLabel || 'Close', icon: 'close', attrs: { 'data-rds-close': true } })}</header><div class="rds-sheet-d__body">${content(o.body)}</div>${has(o.actions) ? `<footer class="rds-sheet-d__actions">${content(o.actions)}</footer>` : ''}</div></dialog>`;
}

/**
 * Confirm dialog markup: a sheet with a message, an optional note callout, an optional type-to-confirm input,
 * an optional reason textarea, an error slot (hidden) and two buttons (cancel, confirm).
 * danger:true marks a destructive action (alertdialog, red confirm button). Behaviour (showing, gating, pending
 * state, closing, focus) is in openConfirm() (confirm.js); this function only renders markup.
 * @param {{ id: string, title: string, message?: any, note?: any, danger?: boolean, role?: 'dialog'|'alertdialog',
 *   initialFocus?: 'cancel'|'confirm'|'heading', confirmLabel?: string, cancelLabel?: string, errorText?: string,
 *   typeToConfirm?: { value: string, label?: string }, reason?: { label?: string, min?: number, max?: number } }} o
 *   note: text or raw() markup, shown as a callout with role=note. Text options are escaped unless raw().
 *   typeToConfirm.value is compared with the typed text after trim, NFC and lower-casing.
 *   reason.min (default 3) and reason.max (default 500) bound the trimmed length of the reason.
 */
export function confirm(o) {
  if (!o || !o.id) throw new Error('rds: confirm needs an id');
  const role = o.role === 'dialog' || o.role === 'alertdialog' ? o.role : o.danger ? 'alertdialog' : 'dialog';
  const typeId = `${o.id}-type`;
  const reasonId = `${o.id}-reason`;
  const reasonMin = o.reason ? (o.reason.min ?? 3) : 0;
  const gated = Boolean(o.typeToConfirm) || reasonMin > 0; // OK starts disabled; the page script enables it
  const note = has(o.note) ? `<div class="rds-confirm__note" role="note">${content(o.note)}</div>` : '';
  const typeField = o.typeToConfirm
    ? `<div class="rds-confirm__field"><label class="rds-confirm__label" for="${esc(typeId)}">${esc(o.typeToConfirm.label || 'Type to confirm')}</label><input${attrs({ type: 'text', class: 'rds-confirm__input', id: typeId, autocomplete: 'off', spellcheck: 'false', 'data-rds-type': true })}></div>`
    : '';
  const reasonField = o.reason
    ? `<div class="rds-confirm__field"><label class="rds-confirm__label" for="${esc(reasonId)}">${esc(o.reason.label || 'Reason')}</label><textarea${attrs({ class: 'rds-confirm__textarea', id: reasonId, rows: 3, maxlength: o.reason.max ?? 500, 'data-rds-reason': true })}></textarea></div>`
    : '';
  const body = `<p class="rds-sheet-d__text">${content(o.message)}</p>${note}${typeField}${reasonField}<p class="rds-confirm__error" role="alert" hidden></p>`;
  const ok = `<button${attrs({ type: 'button', class: cx('rds-btn', o.danger ? 'rds-btn--danger' : 'rds-btn--primary'), 'data-rds-confirm': true, 'data-danger': o.danger ? true : undefined, disabled: gated ? true : undefined })}>${esc(o.confirmLabel || 'OK')}</button>`;
  const cancel = `<button${attrs({ type: 'button', class: 'rds-btn rds-btn--ghost', 'data-rds-close': true })}>${esc(o.cancelLabel || 'Cancel')}</button>`;
  const dialogAttrs = { role, 'data-initial-focus': o.initialFocus };
  return sheet({ id: o.id, title: o.title, closeLabel: o.cancelLabel, body: raw(body), actions: raw(cancel + ok), attrs: dialogAttrs });
}

// ---------------------------------------------------------------------------------------------------------------
// infoTip: ⓘ toggletip for "why / what does this mean" help (conv §36: no hover-only help). Tap or click opens a
// small popover; a second tap, Escape or a tap outside closes it and Escape returns focus to the trigger.
// Behaviour is in menu-controller.js (data-rds-toggletip). Put one-line helper text on the page; use this for detail.
// ---------------------------------------------------------------------------------------------------------------
/**
 * @param {string|object} text  popover content (escaped; pass raw() for markup)
 * @param {{ id: string, label: string, attrs?: object }} o  id: popover id; label: accessible name of the ⓘ button
 */
export function infoTip(text, o = {}) {
  if (!o.id) throw new Error('rds: infoTip needs an id (the trigger points at the popover with aria-controls)');
  if (!o.label) throw new Error('rds: infoTip needs a label (the accessible name of the ⓘ button)');
  const btn = `<button${attrs({ type: 'button', class: 'rds-tip__btn', 'aria-label': o.label, title: o.label, 'aria-expanded': 'false', 'aria-controls': o.id, 'data-rds-toggletip': true })}>${icon('information', 'rds-tip__icon')}</button>`;
  const pop = `<span${attrs({ class: 'rds-tip__pop', id: o.id, hidden: true })}>${content(text)}</span>`;
  return `<span${attrs({ class: 'rds-tip', ...(o.attrs || {}) })}>${btn}${pop}</span>`;
}

// ---------------------------------------------------------------------------------------------------------------
// timelineItem: one entry on a timeline. Variants: card (personal/family event) | band (a span, e.g. a reign)
// | quiet (context row, e.g. a historical event). The date column shows the year and an optional age line.
// ---------------------------------------------------------------------------------------------------------------
/**
 * @param {{ date: string, sub?: string, title: any, kind?: any, body?: any, tag?: any, href?: string,
 *   variant?: 'card'|'band'|'quiet', external?: boolean, attrs?: object }} o
 */
export function timelineItem(o) {
  const variant = ['card', 'band', 'quiet'].includes(o.variant) ? o.variant : 'card';
  const date = `<div class="rds-tl__date"><span class="rds-tl__year">${esc(o.date)}</span>${has(o.sub) ? `<span class="rds-tl__sub">${esc(o.sub)}</span>` : ''}</div>`;
  const rail = `<div class="rds-tl__rail" aria-hidden="true"><span class="rds-tl__dot"></span></div>`;
  const inner = `${has(o.kind) ? `<span class="rds-tl__kind">${content(o.kind)}</span>` : ''}<span class="rds-tl__title">${has(o.tag) ? `${content(o.tag)} ` : ''}${content(o.title)}</span>${has(o.body) ? `<span class="rds-tl__body">${content(o.body)}</span>` : ''}`;
  const linkA = o.href ? { class: 'rds-tl__box', href: safeHref(o.href), ...(o.external ? { target: '_blank', rel: 'noopener' } : {}) } : null;
  const box = linkA ? `<a${attrs(linkA)}>${inner}</a>` : `<div class="rds-tl__box">${inner}</div>`;
  return `<li${attrs({ class: cx('rds-tl', `rds-tl--${variant}`), ...(o.attrs || {}) })}>${date}${rail}${box}</li>`;
}

/** Timeline wrapper: an ordered list of timelineItem() markup or option objects. */
export function timeline(items, o = {}) {
  const html = items.map((i) => (typeof i === 'string' ? i : timelineItem(i))).join('');
  return `<ol${attrs({ class: 'rds-timeline', 'aria-label': o.label })}>${html}</ol>`;
}

// ---------------------------------------------------------------------------------------------------------------
// emptyState: what to show when a list or page has nothing. Optional action (raw button/link markup).
// ---------------------------------------------------------------------------------------------------------------
/** @param {{ title: string, text?: string, action?: object, variant?: 'block'|'inline' }} o */
export function emptyState(o) {
  const variant = o.variant === 'inline' ? 'inline' : 'block';
  return `<div class="rds-empty rds-empty--${variant}" role="status"><p class="rds-empty__title">${esc(o.title)}</p>${has(o.text) ? `<p class="rds-empty__text">${esc(o.text)}</p>` : ''}${has(o.action) ? `<div class="rds-empty__action">${content(o.action)}</div>` : ''}</div>`;
}

/** Text button (for sheets, empty states). Variants: primary | ghost | danger | outline. */
export function button(label, o = {}) {
  const v = ['primary', 'ghost', 'danger', 'outline'].includes(o.variant) ? o.variant : 'primary';
  if (o.href) return `<a${attrs({ class: cx('rds-btn', `rds-btn--${v}`), href: safeHref(o.href), ...(o.attrs || {}) })}>${esc(label)}</a>`;
  return `<button${attrs({ type: o.type || 'button', class: cx('rds-btn', `rds-btn--${v}`), ...(o.attrs || {}) })}>${esc(label)}</button>`;
}
