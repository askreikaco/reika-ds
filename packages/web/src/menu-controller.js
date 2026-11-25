// Pop-up behaviour for menu() markup and infoTip() toggletips. One controller per document:
//  - a trigger (aria-haspopup="menu", aria-controls="<menu id>") toggles its menu: a second tap closes it;
//  - a toggletip trigger (data-rds-toggletip, aria-controls="<popover id>") toggles its popover the same way,
//    but focus stays on the trigger (no menu items to move to);
//  - tapping another trigger closes the first menu and opens the new one;
//  - Escape closes and returns focus to the trigger; a tap outside the menu and its trigger closes it;
//  - the menu opens below the trigger when it fits, else above; if neither fits it takes the larger side and
//    scrolls inside, so it never covers its own trigger;
//  - choosing an item calls onSelect({ menu, trigger, item, value }) and closes the menu.
// The outside listener exists only while a menu is open (capture phase), so there is no close-then-reopen race.

import { esc } from './html.js';
import { menuItems } from './components.js';

const GAP = 4; // px between trigger and menu; layout maths only (the visual gap comes from CSS tokens)

// Places a fixed-position menu next to its trigger: below when it fits, else above, else the larger side with
// a scrolling menu. Never covers the trigger.
function placeMenu(menu, trigger) {
  const win = menu.ownerDocument.defaultView;
  const r = trigger.getBoundingClientRect();
  menu.style.position = 'fixed';
  menu.style.maxBlockSize = '';
  menu.style.insetInlineStart = '';
  const vh = win.innerHeight;
  const vw = win.innerWidth;
  const h = menu.offsetHeight;
  const w = menu.offsetWidth;
  const below = vh - r.bottom - GAP;
  const above = r.top - GAP;
  let top;
  if (h <= below) top = r.bottom + GAP;
  else if (h <= above) top = r.top - GAP - h;
  else if (below >= above) {
    top = r.bottom + GAP;
    menu.style.maxBlockSize = `${Math.max(0, below)}px`;
  } else {
    menu.style.maxBlockSize = `${Math.max(0, above)}px`;
    top = r.top - GAP - Math.min(h, above);
  }
  const left = Math.max(GAP, Math.min(r.right - w, vw - w - GAP));
  menu.style.top = `${Math.round(top)}px`;
  menu.style.left = `${Math.round(left)}px`;
}

export function menuController(doc = document, { onSelect } = {}) {
  let open = null; // { menu, trigger }

  const items = (menu) => [...menu.querySelectorAll('[role="menuitem"]:not([disabled])')];

  function close({ focus = false } = {}) {
    if (!open) return;
    const { menu, trigger } = open;
    menu.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    doc.removeEventListener('pointerdown', onOutside, true);
    doc.removeEventListener('keydown', onKey, true);
    open = null;
    if (focus) trigger.focus({ preventScroll: true });
  }

  function show(trigger) {
    const menu = doc.getElementById(trigger.getAttribute('aria-controls') || '');
    if (!menu) return;
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    placeMenu(menu, trigger);
    open = { menu, trigger };
    doc.addEventListener('pointerdown', onOutside, true);
    doc.addEventListener('keydown', onKey, true);
    if (menu.getAttribute('role') !== 'menu') return; // toggletip: keep focus where it is
    const first = items(menu)[0];
    if (first) first.focus({ preventScroll: true });
  }

  function onOutside(e) {
    if (!open) return;
    if (open.menu.contains(e.target) || open.trigger.contains(e.target)) return; // the trigger's own click toggles
    close();
  }

  function onKey(e) {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close({ focus: true });
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const list = items(open.menu);
      if (!list.length) return;
      e.preventDefault();
      const i = list.indexOf(doc.activeElement);
      const next = e.key === 'ArrowDown' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
      list[next].focus({ preventScroll: true });
    }
  }

  function onClick(e) {
    const tip = e.target.closest('[data-rds-toggletip][aria-controls]');
    if (tip) {
      const same = open && open.trigger === tip;
      close();
      if (!same) show(tip);
      return;
    }
    const trigger = e.target.closest('[aria-haspopup="menu"][aria-controls]');
    if (trigger) {
      const same = open && open.trigger === trigger;
      close();
      if (!same) show(trigger);
      return;
    }
    const item = open && e.target.closest('[role="menuitem"]');
    if (item && open.menu.contains(item)) {
      const detail = { menu: open.menu, trigger: open.trigger, item, value: item.getAttribute('data-value') };
      close({ focus: true });
      if (onSelect) onSelect(detail);
    }
  }

  doc.addEventListener('click', onClick);
  return {
    close,
    isOpen: () => Boolean(open),
    destroy() {
      close();
      doc.removeEventListener('click', onClick);
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------
// openMenu(anchor, { title, items }): a menu mounted next to the anchor and removed when it closes. Call it from the
// anchor's click handler: a second call on the same anchor closes the menu (toggle). One dynamic menu is open at a
// time. Items: { label, onSelect, attrs, tone: 'danger', divider, disabled, href, value }.
// Escape and a tap outside close it; Escape and a choice return focus to the anchor. Focus moves to the first item.
// ---------------------------------------------------------------------------------------------------------------
let menuSeq = 0;
let activeMenu = null; // { anchor, close }

/**
 * @param {HTMLElement} anchor  the button that opens the menu (gets aria-expanded and aria-controls while open)
 * @param {{ title?: string, items: Array<{ label: string, onSelect?: (d: object) => void, attrs?: object,
 *   tone?: 'danger', divider?: boolean, disabled?: boolean, href?: string, value?: string }> }} o
 * @returns {{ close: (o?: { focus?: boolean }) => void, el: HTMLElement } | null}  null when the call closed the menu
 */
export function openMenu(anchor, { title, items = [] } = {}) {
  if (activeMenu && activeMenu.anchor === anchor) {
    activeMenu.close({ focus: true });
    return null;
  }
  if (activeMenu) activeMenu.close();

  const doc = anchor.ownerDocument;
  const rid = `rds-menu-${++menuSeq}`;
  const menuId = `${rid}-m`;
  const indexed = items.map((it, i) => ({ ...it, attrs: { ...(it.attrs || {}), 'data-rds-i': i } }));
  const head = title ? `<h3 class="rds-menu__title" id="${esc(rid)}-t">${esc(title)}</h3>` : '';
  const labelled = title ? ` aria-labelledby="${esc(rid)}-t"` : '';
  doc.body.insertAdjacentHTML('beforeend', `<div class="rds-menu" id="${esc(rid)}">${head}<div role="menu" id="${esc(menuId)}"${labelled}>${menuItems(indexed)}</div></div>`);
  const el = doc.getElementById(rid);
  const prevControls = anchor.getAttribute('aria-controls');

  anchor.setAttribute('aria-expanded', 'true');
  anchor.setAttribute('aria-controls', menuId);
  placeMenu(el, anchor);

  function close({ focus = false } = {}) {
    if (activeMenu !== state) return;
    activeMenu = null;
    doc.removeEventListener('pointerdown', onOutside, true);
    doc.removeEventListener('keydown', onKey, true);
    el.removeEventListener('click', onClick);
    el.remove();
    anchor.setAttribute('aria-expanded', 'false');
    if (prevControls === null) anchor.removeAttribute('aria-controls');
    else anchor.setAttribute('aria-controls', prevControls);
    if (focus) anchor.focus({ preventScroll: true });
  }

  function onOutside(e) {
    if (el.contains(e.target) || anchor.contains(e.target)) return; // the anchor's own tap toggles via openMenu()
    close();
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      close({ focus: true });
      return;
    }
    if (e.key === 'Tab') {
      close();
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const list = [...el.querySelectorAll('[role="menuitem"]:not([disabled])')];
      if (!list.length) return;
      e.preventDefault();
      const i = list.indexOf(doc.activeElement);
      const next = e.key === 'ArrowDown' ? (i + 1) % list.length : (i - 1 + list.length) % list.length;
      list[next].focus({ preventScroll: true });
    }
  }

  function onClick(e) {
    const btn = e.target.closest('[role="menuitem"]');
    if (!btn || !el.contains(btn) || btn.disabled) return;
    const item = indexed[Number(btn.getAttribute('data-rds-i'))];
    close({ focus: true });
    if (item && item.onSelect) item.onSelect({ item, value: item.value, trigger: anchor });
  }

  const state = { anchor, close };
  activeMenu = state;
  doc.addEventListener('pointerdown', onOutside, true);
  doc.addEventListener('keydown', onKey, true);
  el.addEventListener('click', onClick);
  const first = el.querySelector('[role="menuitem"]:not([disabled])');
  if (first) first.focus({ preventScroll: true });
  return { close: (o) => close(o), el };
}

// ---------------------------------------------------------------------------------------------------------------
// Sheets: a native <dialog class="rds-sheet-d"> opened modal. Shared by openSheet() and sheetController().
// Focus goes back to the opener when the sheet closes by any route; onClose({ id, dialog, returnValue }) runs then.
// ---------------------------------------------------------------------------------------------------------------
function showSheet(doc, id, { onClose, opener } = {}) {
  const dlg = doc.getElementById(id);
  if (!dlg || dlg.open) return false;
  const back = opener || doc.activeElement;
  dlg.addEventListener('close', () => {
    if (back && back.isConnected) back.focus({ preventScroll: true });
    if (onClose) onClose({ id, dialog: dlg, returnValue: dlg.returnValue });
  }, { once: true });
  dlg.showModal();
  return true;
}

/**
 * Opens a sheet by id (no controller needed). Focus returns to whatever had focus; onClose runs when it closes.
 * @param {string} id
 * @param {{ onClose?: (d: { id: string, dialog: HTMLElement, returnValue: string }) => void }} [o]
 */
export function openSheet(id, o = {}) {
  return showSheet(document, id, o);
}

/**
 * Sheet behaviour: [data-rds-open="<id>"] opens that sheet; [data-rds-close] (and closeSelector, if given) closes
 * the sheet that holds it; [data-rds-confirm] confirms; a tap on the backdrop closes; Escape closes (browser).
 * @param {Document} [doc]
 * @param {{ onConfirm?: (d: { dialog: HTMLElement }) => void, closeSelector?: string,
 *   onClose?: Record<string, (d: object) => void> }} [o]
 *   closeSelector: extra close markers, e.g. '[data-fpx]', in addition to [data-rds-close].
 *   onClose: per-sheet callbacks by id, used when the sheet is opened by a data-rds-open click or open(id).
 */
export function sheetController(doc = document, { onConfirm, closeSelector, onClose = {} } = {}) {
  function onClick(e) {
    const opener = e.target.closest('[data-rds-open]');
    if (opener) {
      const id = opener.getAttribute('data-rds-open');
      e.preventDefault();
      showSheet(doc, id, { opener, onClose: onClose[id] });
      return;
    }
    const dlg = e.target.closest('dialog.rds-sheet-d');
    if (!dlg) return;
    if (e.target.closest('[data-rds-close]') || (closeSelector && e.target.closest(closeSelector))) dlg.close('cancel');
    else if (e.target.closest('[data-rds-confirm]')) {
      dlg.close('confirm');
      if (onConfirm) onConfirm({ dialog: dlg });
    } else if (e.target === dlg) dlg.close('cancel'); // tap on the backdrop
  }
  doc.addEventListener('click', onClick);
  return {
    /** Opens the sheet modal; focus returns to the opener on close. options.onClose: per-open callback. */
    open(id, o = {}) {
      return showSheet(doc, id, { onClose: o.onClose || onClose[id], opener: o.opener });
    },
    destroy: () => doc.removeEventListener('click', onClick),
  };
}
