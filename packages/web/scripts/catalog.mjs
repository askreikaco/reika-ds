// Catalogue page: every @reika-ds/web component x variant, rendered twice (light and dark) side by side.
// Example data is invented. The page links tokens.css + web.css from the same folder (dist/).
import * as W from '../src/index.js';

const { raw } = W;
const tile = (ch, n) => raw(`<span class="cat-tile" style="background:var(--rk-tile-${n})">${W.esc(ch)}</span>`);
const sex = (s) => raw(`<span class="cat-sex cat-sex--${s}" aria-label="${s === 'm' ? 'Nam' : 'Nữ'}"></span>`);
const people = [
  { title: 'Văn An', meta: 'Con · ruột · thứ 1', leading: tile('A', 1), badges: sex('m'), href: '#a' },
  { title: 'Thị Bình', meta: 'Vợ · cưới 1952', leading: tile('B', 2), badges: sex('f'), href: '#b' },
  { title: 'Hữu Cường', meta: 'Rể · chồng Thị Dung', leading: tile('C', 3), badges: sex('m'), href: '#c' },
];

function block(title, html) {
  return `<section class="cat-block"><h3 class="cat-h">${W.esc(title)}</h3><div class="cat-demo">${html}</div></section>`;
}

function all(theme) {
  const n = theme === 'dark' ? 'd' : 'l';
  const out = [];
  out.push(block('listItem · row', W.list(people, { variant: 'row', label: 'Row' })));
  out.push(block('listItem · row + action (no chevron)', W.list(people.map((p, i) => ({ ...p, action: { label: `Tùy chọn cho ${p.title}`, icon: 'overflow-menu-horizontal', haspopup: 'menu', controls: `m-${n}-${i}` } })), { label: 'Row with action' }) + people.map((p, i) => W.menu({ id: `m-${n}-${i}`, label: p.title, items: [{ label: 'Sửa quan hệ', value: 'edit' }, { label: 'Xem trên cây', value: 'tree' }, { label: 'Xóa quan hệ', value: 'del', tone: 'danger' }] })).join('')));
  out.push(block('listItem · card (with code + years)', W.list(people.map((p) => ({ ...p, meta: `${p.meta} · 1931–2017`, badges: [p.badges, raw(' '), raw(W.tag('A-3.2.1', { size: 'sm' }))] })), { variant: 'card', label: 'Card' })));
  out.push(block('listItem · compact (pickers)', W.list(people.map((p) => ({ ...p, show: { chevron: false } })), { variant: 'compact', label: 'Compact' })));
  out.push(block('listItem · tree (depth)', W.list(people.map((p, i) => ({ ...p, depth: i })), { variant: 'tree', label: 'Tree' })));
  out.push(block('listItem · minimal (no leading)', W.list(people.map((p) => ({ ...p, show: { leading: false } })), { variant: 'row', label: 'Minimal' })));
  out.push(block('listItem · table-row', W.list(people.map((p) => ({ title: p.title, href: p.href, cells: [p.meta, '1931', 'Họ An'] })), { variant: 'table-row', head: ['Tên', 'Quan hệ', 'Sinh', 'Họ'], label: 'Table' })));
  out.push(block('section · card + toolbar + count', W.section({ title: 'Quan hệ', count: '3 người', toolbar: raw(W.toolbar({ search: { label: 'Tìm trong quan hệ', placeholder: 'Tìm trong quan hệ' }, actions: [{ label: 'Lọc', icon: 'filter' }, { label: 'Thêm', icon: 'add' }] })), body: raw(W.list(people.slice(0, 2))) })));
  out.push(block('section · fold (open)', W.section({ title: 'Chắt', count: 2, fold: { open: true }, body: raw(W.list(people.slice(0, 2), { variant: 'compact' })) })));
  out.push(block('section · plain', W.section({ title: 'Thông tin', variant: 'plain', body: 'Plain section body text.' })));
  out.push(block('toolbar · search + actions + count', W.toolbar({ search: { label: 'Tìm người', placeholder: 'Tìm người trong sách' }, actions: [{ label: 'Lọc', icon: 'filter' }, { label: 'Chia sẻ', icon: 'share' }], count: '394 người' })));
  out.push(block('tag · tones and sizes', ['gray', 'info', 'success', 'warning', 'error', 'accent'].map((t) => W.tag(t, { tone: t })).join(' ') + '<br>' + ['gray', 'info', 'error'].map((t) => W.tag(`${t} sm`, { tone: t, size: 'sm' })).join(' ') + '<br>' + W.tag('Chip', { as: 'button', pressed: true }) + ' ' + W.tag('Chip', { as: 'button', pressed: false })));
  out.push(block('iconButton', ['edit', 'add', 'filter', 'share', 'close', 'overflow-menu-vertical'].map((i) => W.iconButton({ label: i, icon: i })).join('') + W.iconButton({ label: 'pressed', icon: 'filter', pressed: true }) + W.iconButton({ label: 'danger', icon: 'close', tone: 'danger' })));
  out.push(block('button', ['primary', 'outline', 'ghost', 'danger'].map((v) => W.button(v, { variant: v })).join(' ')));
  out.push(block('timeline · card / band / quiet', W.timeline([
    { date: '1931', title: 'Ra đời', kind: 'Bản thân' },
    { date: '1931', variant: 'band', title: 'Thời vua Bảo Đại (1926–1945)', tag: raw(W.tag('Lịch sử', { size: 'sm' })), href: '#src', external: true },
    { date: '1945', sub: 'lúc 14 tuổi', variant: 'quiet', title: 'Tuyên ngôn độc lập', tag: raw(W.tag('Lịch sử', { size: 'sm' })), href: '#src', external: true },
    { date: '1952', sub: 'lúc 21 tuổi', title: 'Kết hôn với Thị Bình', kind: 'Gia đình', body: 'Ghi chú ngắn.' },
  ], { label: 'Timeline' })));
  out.push(block('emptyState · block / inline', W.emptyState({ title: 'Chưa có ai', text: 'Thêm người đầu tiên để bắt đầu.', action: raw(W.button('Thêm người')) }) + W.emptyState({ title: 'Không tìm thấy', variant: 'inline' })));
  out.push(block('menu (static preview)', W.menu({ id: `mp-${n}`, label: 'Văn An', items: [{ label: 'Sửa quan hệ', value: 'e' }, { label: 'Xem trên cây', value: 't' }, { label: 'Xóa quan hệ', value: 'd', tone: 'danger' }] }).replace(' hidden', ' data-preview')));
  out.push(block('infoTip · toggletip (tap or click; Escape closes)', W.infoTip('Ghi chú chi tiết: nội dung này chỉ hiện khi bấm vào ⓘ.', { id: `tip-${n}`, label: 'Giải thích' })));
  out.push(block('sheet / confirm', W.button('Mở xác nhận', { variant: 'outline', attrs: { 'data-open': `cf-${n}` } }) + W.confirm({ id: `cf-${n}`, title: 'Xóa quan hệ?', message: 'Có thể khôi phục từ lịch sử sửa.', confirmLabel: 'Xóa', cancelLabel: 'Hủy', danger: true })));
  return out.join('');
}

export async function renderCatalog() {
  return `<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>@reika-ds/web catalogue</title>
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="web.css">
<style>
/* catalogue chrome only (not part of the library) */
body { margin: 0; background: var(--cds-background); color: var(--cds-text-primary); font-family: 'IBM Plex Sans', system-ui, sans-serif; font-size: var(--rk-fs-3); line-height: var(--rk-lh-3); }
.cat { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--rk-measure-text)), 1fr)); }
.cat-theme { display: grid; gap: var(--rk-sp-07); padding: var(--rk-sp-05); background: var(--cds-background); color: var(--cds-text-primary); min-inline-size: 0; }
.cat-title { margin: 0; font-size: var(--rk-fs-5); line-height: var(--rk-lh-5); font-weight: 400; }
.cat-block { display: grid; gap: var(--rk-sp-03); min-inline-size: 0; }
.cat-demo { min-inline-size: 0; display: flex; flex-wrap: wrap; align-items: center; gap: var(--rk-sp-03); }
.cat-demo > .rds-list, .cat-demo > .rds-section, .cat-demo > .rds-tbar, .cat-demo > .rds-timeline, .cat-demo > .rds-empty, .cat-demo > br { flex-basis: 100%; }
.cat-h { margin: 0; color: var(--cds-text-secondary); font-size: var(--rk-fs-1); line-height: var(--rk-lh-1); font-weight: 400; letter-spacing: var(--rk-ls-1); }
.cat-tile { display: inline-grid; place-items: center; inline-size: var(--rk-tile); block-size: var(--rk-tile); color: var(--cds-text-on-color); font-size: var(--rk-fs-4); }
.cat-sex { display: inline-block; inline-size: var(--rk-sp-04); block-size: var(--rk-sp-04); border: 1px solid var(--cds-icon-secondary); }
.cat-sex--f { border-radius: var(--rk-radius-pill); }
.rds-menu[data-preview] { position: static; display: block; max-inline-size: calc(var(--rk-sp-13) + var(--rk-sp-10)); }
</style>
</head>
<body>
<main class="cat">
<div class="cat-theme" data-theme="light"><h1 class="cat-title">@reika-ds/web · light</h1>${all('light')}</div>
<div class="cat-theme" data-theme="dark"><h1 class="cat-title">@reika-ds/web · dark</h1>${all('dark')}</div>
</main>
<script type="module">
import { menuController, sheetController } from './index.js';
menuController(document);
const sheets = sheetController(document);
document.addEventListener('click', (e) => { const b = e.target.closest('[data-open]'); if (b) sheets.open(b.getAttribute('data-open')); });
</script>
</body>
</html>
`;
}
