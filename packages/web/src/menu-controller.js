// Pop-up menu behaviour for menu() markup. One controller per document:
//  - a trigger (aria-haspopup="menu", aria-controls="<menu id>") toggles its menu: a second tap closes it;
//  - tapping another trigger closes the first menu and opens the new one;
//  - Escape closes and returns focus to the trigger; a tap outside the menu and its trigger closes it;
//  - the menu opens below the trigger when it fits, else above; if neither fits it takes the larger side and
//    scrolls inside, so it never covers its own trigger;
//  - choosing an item calls onSelect({ menu, trigger, item, value }) and closes the menu.
// The outside listener exists only while a menu is open (capture phase), so there is no close-then-reopen race.

const GAP = 4; // px between trigger and menu; layout maths only (the visual gap comes from CSS tokens)

export function menuController(doc = document, { onSelect } = {}) {
  let open = null; // { menu, trigger }

  const items = (menu) => [...menu.querySelectorAll('[role="menuitem"]:not([disabled])')];

  function place(menu, trigger) {
    const win = doc.defaultView;
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
    place(menu, trigger);
    open = { menu, trigger };
    doc.addEventListener('pointerdown', onOutside, true);
    doc.addEventListener('keydown', onKey, true);
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

/** Sheet/confirm behaviour: open with showModal(), close buttons ([data-rds-close]) and Escape close it. */
export function sheetController(doc = document, { onConfirm } = {}) {
  function onClick(e) {
    const dlg = e.target.closest('dialog.rds-sheet-d');
    if (!dlg) return;
    if (e.target.closest('[data-rds-close]')) dlg.close('cancel');
    else if (e.target.closest('[data-rds-confirm]')) {
      dlg.close('confirm');
      if (onConfirm) onConfirm({ dialog: dlg });
    } else if (e.target === dlg) dlg.close('cancel'); // tap on the backdrop
  }
  doc.addEventListener('click', onClick);
  return {
    open: (id) => doc.getElementById(id)?.showModal(),
    destroy: () => doc.removeEventListener('click', onClick),
  };
}
