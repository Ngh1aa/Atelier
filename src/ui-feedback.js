/**
 * UI Feedback Tool v0.2
 * ---------------------
 * Công cụ ghi nhận feedback UI/UX trực tiếp trên trang web.
 * Bật / tắt bằng cách nhấn đồng thời Q + W + E.
 *
 * Changelog v0.2:
 *   - Fix: đổi `const CSS` → `STYLESHEET` để không shadow `window.CSS`
 *   - Fix: thống nhất event flow qua host delegation, loại bỏ double-fire
 *   - New: dark mode (auto-detect hoặc config `theme`)
 *   - New: animations (modal fade, panel slide, toast slide, toolbar pulse)
 *   - New: drag & drop toolbar
 *   - New: filter & search trong panel
 *   - New: resolve / unresolve status trên mỗi comment
 *   - New: timestamp hiển thị trên comment items
 *   - New: undo delete (toast + hoàn tác)
 *   - New: improved markdown export (status, summary)
 *   - New: Escape đóng modal/panel
 */

const DEFAULTS = {
  shortcut: ['q', 'w', 'e'],
  storageKey: 'ui-feedback-session',
  accent: '#f5a623',
  position: 'right',
  theme: 'auto', // 'light' | 'dark' | 'auto'
};

/* ── helpers ─────────────────────────────────────────────────────────── */

function escapeMarkdown(value) {
  return String(value || '').replace(/[\\`*_{}\[\]()#+.!|>-]/g, '\\$&');
}

function formatDate(date) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function safeText(value, max = 180) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function isEditable(target) {
  return (
    target instanceof HTMLElement &&
    (target.matches('input, textarea, select, [contenteditable="true"]') ||
      Boolean(target.closest('input, textarea, select, [contenteditable="true"]')))
  );
}

function cssPath(element) {
  if (!(element instanceof Element)) return '';
  const parts = [];
  let node = element;
  while (node && node.nodeType === 1 && node !== document.body && parts.length < 6) {
    let part = node.tagName.toLowerCase();
    if (node.id) {
      // Use window.CSS explicitly to avoid any scope issues
      part += `#${window.CSS.escape(node.id)}`;
      parts.unshift(part);
      break;
    }
    const classes = [...node.classList].filter(Boolean).slice(0, 2);
    if (classes.length) part += `.${classes.map(window.CSS.escape).join('.')}`;
    const siblings = node.parentElement
      ? [...node.parentElement.children].filter((s) => s.tagName === node.tagName)
      : [];
    if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`;
    parts.unshift(part);
    node = node.parentElement;
  }
  return parts.join(' > ');
}

function targetLabel(element) {
  if (!(element instanceof Element)) return 'Element chưa xác định';
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = [...element.classList]
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => `.${n}`)
    .join('');
  return `${tag}${id}${classes}`;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c],
  );
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

function detectTheme(preference) {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/* ── icons ───────────────────────────────────────────────────────────── */

const ICONS = {
  clipboard:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M9 9h6M9 13h6M9 17h4"/></svg>',
  comment:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z"/><path d="M9 10.5h6M12 8v5"/></svg>',
  pencil:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"/><path d="m13.8 6.7 3.5 3.5M4 20.8l3.5-.8"/></svg>',
  close:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  download:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M4 20h16"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v5M14 11v5M8 7l1 13h6l1-13M9 7l1-3h4l1 3"/></svg>',
  edit:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5Z"/><path d="m13.8 6.7 3.5 3.5"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>',
  undo:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10h13a4 4 0 0 1 0 8H9"/><path d="M7 6l-4 4 4 4"/></svg>',
  search:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></svg>',
  filter:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M7 12h10M10 18h4"/></svg>',
  grip:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="6" r="1.2"/><circle cx="15" cy="6" r="1.2"/><circle cx="9" cy="12" r="1.2"/><circle cx="15" cy="12" r="1.2"/><circle cx="9" cy="18" r="1.2"/><circle cx="15" cy="18" r="1.2"/></svg>',
};

/* ── stylesheet ──────────────────────────────────────────────────────── */
/* Renamed from `CSS` to `STYLESHEET` to avoid shadowing `window.CSS`. */

const STYLESHEET = `
:host { all: initial; }
* { box-sizing: border-box; }
button, input, textarea, select { font: inherit; }
button { cursor: pointer; }

/* ── theme tokens ── */
.ui-feedback-root {
  --_bg: #ffffff;
  --_bg-alt: #fafafa;
  --_bg-hover: #f6f6f6;
  --_bg-panel: #fff;
  --_bg-item: #fff;
  --_bg-input: transparent;
  --_bg-badge: #d11b51;
  --_bg-toolbar: #121212;
  --_bg-toolbar-hover: #282828;
  --_text: #171717;
  --_text-secondary: #777;
  --_text-muted: #888;
  --_text-toolbar: #fff;
  --_border: #e5e5e5;
  --_border-panel: #dedede;
  --_border-modal: #e1e1e1;
  --_border-group: #ededed;
  --_shadow: rgba(0,0,0,.18);
  --_shadow-heavy: rgba(0,0,0,.27);
  --_scrim: rgba(0,0,0,.18);
  color: var(--_text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.4;
}

.ui-feedback-root.is-dark {
  --_bg: #1a1a1a;
  --_bg-alt: #222;
  --_bg-hover: #2a2a2a;
  --_bg-panel: #1e1e1e;
  --_bg-item: #252525;
  --_bg-input: #2a2a2a;
  --_bg-toolbar: #0a0a0a;
  --_bg-toolbar-hover: #1e1e1e;
  --_text: #e8e8e8;
  --_text-secondary: #999;
  --_text-muted: #777;
  --_text-toolbar: #e8e8e8;
  --_border: #333;
  --_border-panel: #333;
  --_border-modal: #383838;
  --_border-group: #333;
  --_shadow: rgba(0,0,0,.4);
  --_shadow-heavy: rgba(0,0,0,.55);
  --_scrim: rgba(0,0,0,.45);
}

.ui-feedback-root [hidden] { display: none !important; }

/* ── animations ── */
@keyframes uiFeedbackFadeIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes uiFeedbackSlideIn {
  from { opacity: 0; transform: translateY(-50%) translateX(18px); }
  to   { opacity: 1; transform: translateY(-50%) translateX(0); }
}
@keyframes uiFeedbackToastIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes uiFeedbackToastOut {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(12px); }
}
@keyframes uiFeedbackPulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.12); }
}
@keyframes uiFeedbackToolbarIn {
  from { opacity: 0; transform: translateY(-50%) translateX(20px); }
  to   { opacity: 1; transform: translateY(-50%) translateX(0); }
}

/* ── toolbar ── */
.ui-feedback-toolbar {
  position: fixed;
  z-index: 2147483000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  animation: uiFeedbackToolbarIn .32s cubic-bezier(.4,0,.2,1) both;
  touch-action: none;
  user-select: none;
}

.ui-feedback-toolbar-grip {
  width: 32px;
  height: 18px;
  display: grid;
  place-items: center;
  cursor: grab;
  color: #555;
  opacity: .5;
  transition: opacity .18s ease;
  border: 0;
  background: transparent;
  padding: 0;
}
.ui-feedback-toolbar-grip:hover { opacity: 1; }
.ui-feedback-toolbar-grip:active { cursor: grabbing; }
.ui-feedback-toolbar-grip svg { width: 16px; height: 16px; stroke: currentColor; fill: currentColor; stroke-width: 0; }

.ui-feedback-tool {
  width: 54px;
  height: 54px;
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: var(--_text-toolbar);
  background: var(--_bg-toolbar);
  box-shadow: 0 10px 26px var(--_shadow);
  transition: transform .18s ease, background .18s ease, box-shadow .18s ease;
  position: relative;
}
.ui-feedback-tool:hover,
.ui-feedback-tool:focus-visible {
  transform: translateY(-2px);
  background: var(--_bg-toolbar-hover);
  box-shadow: 0 14px 28px var(--_shadow-heavy);
  outline: 3px solid color-mix(in srgb, var(--ui-feedback-accent), transparent 65%);
  outline-offset: 2px;
}
.ui-feedback-tool.is-active {
  background: var(--ui-feedback-accent);
  color: #141414;
}
.ui-feedback-tool svg {
  width: 22px;
  height: 22px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.ui-feedback-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 21px;
  height: 21px;
  padding: 0 5px;
  display: grid;
  place-items: center;
  border-radius: 99px;
  color: #fff;
  background: var(--_bg-badge);
  font-size: 11px;
  font-weight: 800;
  border: 2px solid var(--_bg-panel);
}
.ui-feedback-badge.is-pulse {
  animation: uiFeedbackPulse .4s ease;
}

/* ── panel ── */
.ui-feedback-panel {
  position: fixed;
  right: 88px;
  top: 50%;
  transform: translateY(-50%);
  width: min(420px, calc(100vw - 112px));
  max-height: min(680px, calc(100vh - 32px));
  overflow: hidden;
  z-index: 2147482999;
  border: 1px solid var(--_border-panel);
  border-radius: 14px;
  background: var(--_bg-panel);
  box-shadow: 0 22px 60px var(--_shadow-heavy);
  animation: uiFeedbackSlideIn .28s cubic-bezier(.4,0,.2,1) both;
}
.ui-feedback-panel__header {
  padding: 15px 16px;
  color: #111;
  background: var(--ui-feedback-accent);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.ui-feedback-panel__header strong { font-size: 15px; }
.ui-feedback-panel__actions { display: flex; gap: 5px; }

.ui-feedback-icon-button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 7px;
  display: grid;
  place-items: center;
  color: inherit;
  background: transparent;
}
.ui-feedback-icon-button:hover,
.ui-feedback-icon-button:focus-visible {
  background: rgba(0,0,0,.11);
  outline: none;
}
.ui-feedback-icon-button svg {
  width: 17px;
  height: 17px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ── panel search & filter bar ── */
.ui-feedback-panel__filter {
  display: flex;
  gap: 6px;
  padding: 10px 12px 4px;
  background: var(--_bg-alt);
  border-bottom: 1px solid var(--_border);
}
.ui-feedback-search-input {
  flex: 1;
  border: 1px solid var(--_border);
  border-radius: 7px;
  padding: 6px 10px 6px 30px;
  color: var(--_text);
  background: var(--_bg-panel);
  font-size: 12px;
  outline: none;
  transition: border-color .15s;
}
.ui-feedback-search-input:focus { border-color: var(--ui-feedback-accent); }
.ui-feedback-search-wrap {
  flex: 1;
  position: relative;
}
.ui-feedback-search-wrap svg {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  stroke: var(--_text-muted);
  fill: none;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  pointer-events: none;
}
.ui-feedback-filter-select {
  border: 1px solid var(--_border);
  border-radius: 7px;
  padding: 5px 8px;
  color: var(--_text);
  background: var(--_bg-panel);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  outline: none;
}
.ui-feedback-filter-select:focus { border-color: var(--ui-feedback-accent); }

.ui-feedback-panel__body {
  max-height: calc(min(680px, 100vh - 32px) - 110px);
  overflow: auto;
  padding: 10px;
  background: var(--_bg-alt);
}
.ui-feedback-empty {
  padding: 35px 18px;
  color: var(--_text-secondary);
  text-align: center;
}

.ui-feedback-group { margin-bottom: 10px; }
.ui-feedback-group__name {
  display: block;
  padding: 7px 9px;
  color: var(--_text-secondary);
  background: var(--_border-group);
  border-radius: 7px 7px 0 0;
  font-size: 12px;
  font-weight: 700;
}

.ui-feedback-item {
  padding: 12px;
  background: var(--_bg-item);
  border: 1px solid var(--_border);
  border-top: 0;
  transition: background .15s ease;
}
.ui-feedback-item:hover { background: var(--_bg-hover); }
.ui-feedback-item:last-child { border-radius: 0 0 7px 7px; }
.ui-feedback-item + .ui-feedback-item { border-top: 1px solid var(--_border); }

.ui-feedback-item.is-resolved {
  opacity: .55;
}
.ui-feedback-item.is-resolved .ui-feedback-item__comment {
  text-decoration: line-through;
  text-decoration-color: var(--_text-muted);
}

.ui-feedback-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 5px;
  color: var(--_text-secondary);
  font-size: 11px;
}
.ui-feedback-item__selector {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ui-feedback-item__time {
  color: var(--_text-muted);
  font-size: 10px;
  margin-bottom: 5px;
}
.ui-feedback-priority {
  padding: 2px 6px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  flex-shrink: 0;
}
.ui-feedback-priority--high   { color: #991b1b; background: #fee2e2; }
.ui-feedback-priority--medium { color: #92400e; background: #fef3c7; }
.ui-feedback-priority--low    { color: #166534; background: #dcfce7; }

.ui-feedback-resolve-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 7px;
  border-radius: 99px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  flex-shrink: 0;
}
.ui-feedback-resolve-badge.is-resolved { color: #166534; background: #dcfce7; }
.ui-feedback-resolve-badge.is-open     { color: #92400e; background: #fef3c7; }
.ui-feedback-resolve-badge svg { width: 10px; height: 10px; stroke: currentColor; fill: none; stroke-width: 2; }

.ui-feedback-item__comment {
  margin: 0;
  white-space: pre-wrap;
  color: var(--_text);
  font-size: 13px;
}
.ui-feedback-item__target {
  margin: 8px 0 0;
  color: var(--_text-muted);
  font-size: 11px;
}
.ui-feedback-item__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 7px;
}
.ui-feedback-mini {
  border: 0;
  padding: 4px 8px;
  border-radius: 5px;
  color: var(--_text-secondary);
  background: var(--_bg-alt);
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  transition: color .12s, background .12s;
}
.ui-feedback-mini:hover { color: var(--_text); background: var(--_border); }
.ui-feedback-mini svg { width: 12px; height: 12px; }
.ui-feedback-mini--resolve { color: #166534; }
.ui-feedback-mini--resolve:hover { background: #dcfce7; }

/* ── modal ── */
.ui-feedback-scrim {
  position: fixed;
  inset: 0;
  z-index: 2147482990;
  background: var(--_scrim);
  backdrop-filter: blur(2px);
  animation: uiFeedbackScrimIn .2s ease both;
}
@keyframes uiFeedbackScrimIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.ui-feedback-modal {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: min(430px, calc(100vw - 32px));
  z-index: 2147483010;
  border: 1px solid var(--_border-modal);
  border-radius: 14px;
  background: var(--_bg-panel);
  box-shadow: 0 30px 80px var(--_shadow-heavy);
  overflow: hidden;
  animation: uiFeedbackFadeIn .24s cubic-bezier(.4,0,.2,1) both;
}
.ui-feedback-modal__top {
  padding: 18px 20px 12px;
  border-bottom: 1px solid var(--_border);
}
.ui-feedback-modal__top h2 { margin: 0 0 7px; font-size: 16px; color: var(--_text); }
.ui-feedback-modal__top p { overflow: hidden; margin: 0; color: var(--_text-secondary); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.ui-feedback-modal__content { padding: 17px 20px; }
.ui-feedback-label { display: block; margin: 0 0 7px; color: var(--_text-secondary); font-size: 12px; font-weight: 700; }
.ui-feedback-field,
.ui-feedback-textarea,
.ui-feedback-select {
  width: 100%;
  border: 0;
  border-bottom: 2px solid var(--ui-feedback-accent);
  border-radius: 0;
  padding: 8px 0;
  color: var(--_text);
  background: var(--_bg-input);
  outline: none;
}
.ui-feedback-textarea { min-height: 94px; resize: vertical; }
.ui-feedback-field:focus,
.ui-feedback-textarea:focus,
.ui-feedback-select:focus {
  box-shadow: 0 2px 0 rgba(245,166,35,.3);
}
.ui-feedback-form-row { display: grid; grid-template-columns: 1fr 120px; gap: 18px; margin-top: 17px; }
.ui-feedback-modal__footer { display: flex; justify-content: flex-end; gap: 9px; padding: 0 20px 18px; }
.ui-feedback-button { min-width: 76px; border: 1px solid var(--_border); padding: 9px 16px; border-radius: 8px; color: var(--_text); background: var(--_bg-panel); transition: background .12s; }
.ui-feedback-button:hover { background: var(--_bg-hover); }
.ui-feedback-button--primary { border-color: var(--ui-feedback-accent); background: var(--ui-feedback-accent); color: #141414; }
.ui-feedback-button--primary:hover { filter: brightness(.95); }

/* ── toast ── */
.ui-feedback-toast {
  position: fixed;
  right: 22px;
  bottom: 20px;
  z-index: 2147483020;
  padding: 11px 15px;
  border-radius: 10px;
  color: #fff;
  background: #151515;
  box-shadow: 0 10px 25px rgba(0,0,0,.2);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: uiFeedbackToastIn .22s cubic-bezier(.4,0,.2,1) both;
}
.ui-feedback-toast.is-leaving {
  animation: uiFeedbackToastOut .22s ease forwards;
}
.ui-feedback-toast__undo {
  border: 0;
  padding: 4px 10px;
  border-radius: 5px;
  color: var(--ui-feedback-accent);
  background: rgba(255,255,255,.12);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: background .12s;
}
.ui-feedback-toast__undo:hover { background: rgba(255,255,255,.22); }

/* ── picker ── */
.ui-feedback-picking,
.ui-feedback-picking * { cursor: crosshair !important; }
.ui-feedback-picker-layer {
  position: fixed;
  inset: 0;
  z-index: 2147482990;
  background: transparent;
  cursor: crosshair;
}

/* ── responsive ── */
@media (max-width: 640px) {
  .ui-feedback-toolbar { gap: 9px; }
  .ui-feedback-tool { width: 48px; height: 48px; }
  .ui-feedback-panel { right: 70px; width: min(340px, calc(100vw - 84px)); }
  .ui-feedback-form-row { grid-template-columns: 1fr; gap: 12px; }
}
`;

/* ── main factory ────────────────────────────────────────────────────── */

export function createUIFeedback(options = {}) {
  if (typeof window === 'undefined' || typeof document === 'undefined') return null;
  if (window.__uiFeedbackInstance) return window.__uiFeedbackInstance;

  const config = {
    ...DEFAULTS,
    ...options,
    shortcut: (options.shortcut || DEFAULTS.shortcut).map((k) => k.toLowerCase()),
  };

  const pressed = new Set();
  const recentShortcutKeys = [];
  let shortcutTimer;

  const state = {
    active: false,
    picking: false,
    pickingLocked: false, // guard against double-fire
    mode: 'comment',
    panelOpen: false,
    modalOpen: false,
    target: null,
    highlight: null,
    comments: loadComments(),
    edits: [],
    deletedStack: [], // for undo
    filterPriority: 'all',
    searchQuery: '',
    theme: detectTheme(config.theme),
  };

  /* ── shadow DOM setup ── */
  const host = document.createElement('div');
  host.id = 'ui-feedback-host';
  host.dataset.uiFeedbackIgnore = 'true';
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = `<style>${STYLESHEET}</style><div class="ui-feedback-root${state.theme === 'dark' ? ' is-dark' : ''}" style="--ui-feedback-accent:${config.accent}"></div>`;
  const root = shadow.querySelector('.ui-feedback-root');
  document.documentElement.appendChild(host);

  // Listen for system theme changes
  if (config.theme === 'auto') {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      state.theme = e.matches ? 'dark' : 'light';
      root.classList.toggle('is-dark', state.theme === 'dark');
    });
  }

  /* ── toolbar drag state ── */
  let dragState = null;
  let toolbarPos = { right: 20, top: null }; // null = centered (50%)

  function getToolbarStyle() {
    const r = toolbarPos.right;
    if (toolbarPos.top !== null) {
      return `right:${r}px;top:${toolbarPos.top}px;transform:none;`;
    }
    return `right:${r}px;top:50%;transform:translateY(-50%);`;
  }

  /* ── persistence ── */
  function loadComments() {
    try {
      return JSON.parse(localStorage.getItem(config.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  function persist() {
    localStorage.setItem(config.storageKey, JSON.stringify(state.comments));
  }

  /* ── rendering ── */
  function renderToolbar() {
    if (!state.active) {
      root.innerHTML = '';
      return;
    }
    root.innerHTML = `${state.picking ? '<div class="ui-feedback-picker-layer" data-picker-layer aria-hidden="true"></div>' : ''}<div class="ui-feedback-toolbar" role="toolbar" aria-label="UI Feedback tools" style="${getToolbarStyle()}">
      <div class="ui-feedback-toolbar-grip" data-drag-handle aria-label="Kéo để di chuyển toolbar">${ICONS.grip}</div>
      <button class="ui-feedback-tool ${state.panelOpen ? 'is-active' : ''}" data-action="list" aria-label="Mở danh sách feedback" title="Danh sách feedback">${ICONS.clipboard}<span class="ui-feedback-badge" ${state.comments.length ? '' : 'hidden'}>${state.comments.length}</span></button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'comment' ? 'is-active' : ''}" data-action="comment" aria-label="Thêm comment" title="Thêm comment">${ICONS.comment}</button>
      <button class="ui-feedback-tool ${state.picking && state.mode === 'edit' ? 'is-active' : ''}" data-action="edit" aria-label="Sửa nội dung UI" title="Sửa nội dung UI">${ICONS.pencil}</button>
    </div>
    <div data-ui-feedback-panel></div>
    <div data-ui-feedback-modal></div>
    <div data-ui-feedback-toast></div>`;
    if (state.panelOpen) renderPanel();
    if (state.modalOpen) renderModal();
  }

  /* ── toolbar actions ── */
  let lastToolbarAction = '';
  let lastToolbarActionAt = 0;

  function dispatchToolbarAction(action) {
    if (action === 'activate') toggle();
    if (action === 'list') togglePanel();
    if (action === 'comment') beginPicking('comment');
    if (action === 'edit') beginPicking('edit');
  }

  function triggerToolbarAction(event, button) {
    const action = button?.dataset?.action;
    if (!action) return;
    const now = performance.now();
    if (action === lastToolbarAction && now - lastToolbarActionAt < 500) return;
    lastToolbarAction = action;
    lastToolbarActionAt = now;
    event.preventDefault();
    event.stopPropagation();
    dispatchToolbarAction(action);
  }

  /* ── panel ── */
  function togglePanel(force) {
    state.panelOpen = typeof force === 'boolean' ? force : !state.panelOpen;
    if (!state.panelOpen) {
      renderToolbar();
      return;
    }
    stopPicking();
    renderToolbar();
    renderPanel();
  }

  function getFilteredComments() {
    let items = state.comments;
    if (state.filterPriority !== 'all') {
      items = items.filter((c) => c.priority === state.filterPriority);
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      items = items.filter(
        (c) =>
          (c.comment || '').toLowerCase().includes(q) ||
          (c.selector || '').toLowerCase().includes(q) ||
          (c.tag || '').toLowerCase().includes(q) ||
          (c.targetText || '').toLowerCase().includes(q),
      );
    }
    return items;
  }

  function renderPanel() {
    const mount = root.querySelector('[data-ui-feedback-panel]');
    if (!mount || !state.panelOpen) return;
    const filtered = getFilteredComments();
    const grouped = filtered.reduce((groups, item) => {
      const key = item.page || location.pathname || '/';
      (groups[key] ||= []).push(item);
      return groups;
    }, {});
    const resolvedCount = state.comments.filter((c) => c.resolved).length;
    const openCount = state.comments.length - resolvedCount;
    const content = Object.entries(grouped)
      .map(
        ([page, items]) =>
          `<section class="ui-feedback-group"><span class="ui-feedback-group__name">${escapeHtml(page)} · ${items.length} mục</span>${items.map(renderItem).join('')}</section>`,
      )
      .join('');
    mount.innerHTML = `<aside class="ui-feedback-panel" aria-label="Danh sách feedback">
      <header class="ui-feedback-panel__header"><strong>Feedback (${openCount} mở · ${resolvedCount} xong) · Sửa (${state.edits.length})</strong><span class="ui-feedback-panel__actions"><button class="ui-feedback-icon-button" data-panel-action="export" aria-label="Xuất Markdown" title="Xuất Markdown">${ICONS.download}</button><button class="ui-feedback-icon-button" data-panel-action="close" aria-label="Đóng">${ICONS.close}</button></span></header>
      <div class="ui-feedback-panel__filter">
        <div class="ui-feedback-search-wrap">${ICONS.search}<input class="ui-feedback-search-input" data-panel-search type="text" placeholder="Tìm feedback…" value="${escapeAttribute(state.searchQuery)}" /></div>
        <select class="ui-feedback-filter-select" data-panel-filter aria-label="Lọc theo mức độ">
          <option value="all" ${state.filterPriority === 'all' ? 'selected' : ''}>Tất cả</option>
          <option value="high" ${state.filterPriority === 'high' ? 'selected' : ''}>Cao</option>
          <option value="medium" ${state.filterPriority === 'medium' ? 'selected' : ''}>Trung bình</option>
          <option value="low" ${state.filterPriority === 'low' ? 'selected' : ''}>Thấp</option>
        </select>
      </div>
      <div class="ui-feedback-panel__body">${content || `<div class="ui-feedback-empty">${state.searchQuery || state.filterPriority !== 'all' ? 'Không tìm thấy feedback phù hợp.' : 'Chưa có feedback. Chọn biểu tượng comment rồi bấm vào một phần tử trên trang.'}</div>`}</div>
    </aside>`;
    // Bind panel events through delegation
    mount.addEventListener('click', handlePanelClick);
    mount.addEventListener('input', handlePanelInput);
    mount.addEventListener('change', handlePanelChange);
  }

  function handlePanelClick(event) {
    const target = event.target.closest('[data-panel-action], [data-edit-comment], [data-delete-comment], [data-resolve-comment]');
    if (!target) return;
    event.stopPropagation();
    if (target.dataset.panelAction === 'close') togglePanel(false);
    else if (target.dataset.panelAction === 'export') exportMarkdown();
    else if (target.dataset.editComment) editComment(target.dataset.editComment);
    else if (target.dataset.deleteComment) deleteComment(target.dataset.deleteComment);
    else if (target.dataset.resolveComment) resolveComment(target.dataset.resolveComment);
  }

  function handlePanelInput(event) {
    if (event.target.matches('[data-panel-search]')) {
      state.searchQuery = event.target.value;
      // Re-render body only
      const body = root.querySelector('.ui-feedback-panel__body');
      if (body) {
        const filtered = getFilteredComments();
        const grouped = filtered.reduce((groups, item) => {
          const key = item.page || location.pathname || '/';
          (groups[key] ||= []).push(item);
          return groups;
        }, {});
        const content = Object.entries(grouped)
          .map(
            ([page, items]) =>
              `<section class="ui-feedback-group"><span class="ui-feedback-group__name">${escapeHtml(page)} · ${items.length} mục</span>${items.map(renderItem).join('')}</section>`,
          )
          .join('');
        body.innerHTML = content || `<div class="ui-feedback-empty">${state.searchQuery || state.filterPriority !== 'all' ? 'Không tìm thấy feedback phù hợp.' : 'Chưa có feedback.'}</div>`;
      }
    }
  }

  function handlePanelChange(event) {
    if (event.target.matches('[data-panel-filter]')) {
      state.filterPriority = event.target.value;
      renderPanel();
    }
  }

  function renderItem(item) {
    const priority = item.priority || 'medium';
    const resolved = item.resolved;
    const timeStr = relativeTime(item.updatedAt || item.createdAt);
    return `<article class="ui-feedback-item ${resolved ? 'is-resolved' : ''}">
      <div class="ui-feedback-item__meta">
        <span class="ui-feedback-item__selector" title="${escapeAttribute(item.selector)}">${escapeHtml(item.selector)}</span>
        <span class="ui-feedback-priority ui-feedback-priority--${priority}">${priority}</span>
        <span class="ui-feedback-resolve-badge ${resolved ? 'is-resolved' : 'is-open'}">${resolved ? `${ICONS.check} Xong` : 'Mở'}</span>
      </div>
      ${timeStr ? `<div class="ui-feedback-item__time">${escapeHtml(timeStr)}</div>` : ''}
      <p class="ui-feedback-item__comment">${escapeHtml(item.comment)}</p>
      <p class="ui-feedback-item__target">${escapeHtml(item.tag)} · ${escapeHtml(item.targetText || 'Không có nội dung xem trước')}</p>
      <div class="ui-feedback-item__actions">
        <button class="ui-feedback-mini ui-feedback-mini--resolve" data-resolve-comment="${item.id}" title="${resolved ? 'Mở lại' : 'Đánh dấu xong'}">${resolved ? ICONS.undo : ICONS.check} ${resolved ? 'Mở lại' : 'Xong'}</button>
        <button class="ui-feedback-mini" data-edit-comment="${item.id}">${ICONS.edit} Sửa</button>
        <button class="ui-feedback-mini" data-delete-comment="${item.id}">${ICONS.trash} Xóa</button>
      </div>
    </article>`;
  }

  /* ── picking ── */
  function beginPicking(mode) {
    state.panelOpen = false;
    state.mode = mode;
    state.picking = true;
    state.pickingLocked = false;
    root.classList.add('ui-feedback-picking');
    renderToolbar();
    showToast(mode === 'comment' ? 'Chọn phần tử để ghi comment' : 'Chọn phần tử để sửa nội dung');
  }

  function stopPicking() {
    state.picking = false;
    state.pickingLocked = false;
    root.classList.remove('ui-feedback-picking');
    clearHighlight();
  }

  function clearHighlight() {
    if (state.highlight) {
      state.highlight.element.setAttribute('style', state.highlight.style || '');
      if (!state.highlight.style) state.highlight.element.removeAttribute('style');
      state.highlight = null;
    }
  }

  function highlight(element) {
    if (!(element instanceof Element) || element.closest('#ui-feedback-host')) return;
    if (state.highlight?.element === element) return;
    clearHighlight();
    state.highlight = { element, style: element.getAttribute('style') };
    element.style.setProperty('outline', `2px solid ${config.accent}`, 'important');
    element.style.setProperty('outline-offset', '3px', 'important');
  }

  /* ── modal ── */
  function openModal(element, mode, existing = null) {
    stopPicking();
    state.target = element;
    state.mode = mode;
    state.modalOpen = true;
    renderToolbar();
    renderModal(existing);
    setTimeout(() => root.querySelector('[data-feedback-input]')?.focus(), 0);
  }

  function renderModal(existing = null) {
    const mount = root.querySelector('[data-ui-feedback-modal]');
    if (!mount || !state.modalOpen) return;
    const isEdit = state.mode === 'edit';
    const currentText = existing?.comment || (isEdit ? safeText(state.target?.textContent, 500) : '');
    const priorityValue = existing?.priority || 'medium';
    mount.innerHTML = `<div class="ui-feedback-scrim" data-modal-action="cancel"></div><section class="ui-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="ui-feedback-title"><div class="ui-feedback-modal__top"><h2 id="ui-feedback-title">${isEdit ? 'Sửa nội dung UI' : 'Ghi chú feedback'}</h2><p>${escapeHtml(targetLabel(state.target))} · ${escapeHtml(safeText(cssPath(state.target), 90))}</p></div><div class="ui-feedback-modal__content"><label class="ui-feedback-label" for="ui-feedback-input">${isEdit ? 'Nội dung hiển thị' : 'Element này cần sửa gì?'}</label>${isEdit ? `<input class="ui-feedback-field" data-feedback-input value="${escapeAttribute(currentText)}" />` : `<textarea class="ui-feedback-textarea" data-feedback-input placeholder="Ví dụ: Tăng khoảng cách giữa tiêu đề và danh sách…">${escapeHtml(currentText)}</textarea><div class="ui-feedback-form-row"><div><label class="ui-feedback-label" for="ui-feedback-priority">Mức độ ưu tiên</label><select id="ui-feedback-priority" class="ui-feedback-select" data-feedback-priority><option value="high" ${priorityValue === 'high' ? 'selected' : ''}>Cao</option><option value="medium" ${priorityValue === 'medium' ? 'selected' : ''}>Trung bình</option><option value="low" ${priorityValue === 'low' ? 'selected' : ''}>Thấp</option></select></div><div></div></div>`}</div><footer class="ui-feedback-modal__footer"><button class="ui-feedback-button" data-modal-action="cancel">Hủy</button><button class="ui-feedback-button ui-feedback-button--primary" data-modal-action="save">Lưu</button></footer></section>`;
    // Bind via delegation on mount
    mount.addEventListener('click', handleModalClick);
    mount.addEventListener('keydown', handleModalKeydown);
  }

  function handleModalClick(event) {
    const target = event.target.closest('[data-modal-action]');
    if (!target) return;
    event.stopPropagation();
    if (target.dataset.modalAction === 'cancel') closeModal();
    else if (target.dataset.modalAction === 'save') saveModal();
  }

  function handleModalKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
    }
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      saveModal();
    }
  }

  // Track existing item being edited
  let editingExisting = null;

  function openModalWithExisting(element, mode, existing) {
    editingExisting = existing || null;
    openModal(element, mode, existing);
  }

  function saveModal() {
    const input = root.querySelector('[data-feedback-input]');
    const value = input?.value?.trim() || '';
    if (!value) {
      input?.focus();
      showToast('Vui lòng nhập nội dung trước khi lưu');
      return;
    }
    const existing = editingExisting;
    if (state.mode === 'edit') {
      if (state.target) {
        state.target.textContent = value;
        state.edits.push({
          selector: cssPath(state.target),
          tag: targetLabel(state.target),
          value,
          updatedAt: new Date().toISOString(),
        });
      }
      showToast('Đã cập nhật nội dung trên trang');
    } else {
      const item = existing || { id: crypto.randomUUID(), createdAt: new Date().toISOString() };
      item.comment = value;
      item.priority = root.querySelector('[data-feedback-priority]')?.value || item.priority || 'medium';
      item.selector = cssPath(state.target);
      item.tag = targetLabel(state.target);
      item.targetText = safeText(state.target?.textContent, 120);
      item.page = location.pathname || '/';
      item.updatedAt = new Date().toISOString();
      if (!existing) state.comments.push(item);
      persist();
      showToast(existing ? 'Đã cập nhật feedback' : 'Đã lưu feedback');
      // Pulse the badge
      setTimeout(() => {
        const badge = root.querySelector('.ui-feedback-badge');
        if (badge) {
          badge.classList.remove('is-pulse');
          void badge.offsetWidth;
          badge.classList.add('is-pulse');
        }
      }, 50);
    }
    editingExisting = null;
    closeModal();
  }

  function closeModal() {
    state.modalOpen = false;
    state.target = null;
    editingExisting = null;
    renderToolbar();
  }

  /* ── comment CRUD ── */
  function editComment(id) {
    const item = state.comments.find((c) => c.id === id);
    if (!item) return;
    let target = null;
    try {
      target = document.querySelector(item.selector);
    } catch { /* selector may have changed */ }
    openModalWithExisting(target || document.body, 'comment', item);
  }

  function deleteComment(id) {
    const index = state.comments.findIndex((c) => c.id === id);
    if (index === -1) return;
    const deleted = state.comments.splice(index, 1)[0];
    state.deletedStack.push({ item: deleted, index });
    persist();
    renderToolbar();
    state.panelOpen = true;
    renderPanel();
    showToast('Đã xóa feedback', { undo: true });
  }

  function undoDelete() {
    const entry = state.deletedStack.pop();
    if (!entry) return;
    state.comments.splice(entry.index, 0, entry.item);
    persist();
    renderToolbar();
    state.panelOpen = true;
    renderPanel();
    showToast('Đã hoàn tác');
  }

  function resolveComment(id) {
    const item = state.comments.find((c) => c.id === id);
    if (!item) return;
    item.resolved = !item.resolved;
    item.updatedAt = new Date().toISOString();
    persist();
    renderPanel();
    showToast(item.resolved ? 'Đã đánh dấu xong' : 'Đã mở lại feedback');
  }

  /* ── export ── */
  function exportMarkdown() {
    const resolvedCount = state.comments.filter((c) => c.resolved).length;
    const openCount = state.comments.length - resolvedCount;
    const lines = [
      `# UI/UX Feedback`,
      '',
      `- **URL:** ${location.href}`,
      `- **Ngày xuất:** ${formatDate(new Date())}`,
      `- **Tổng feedback:** ${state.comments.length} (${openCount} mở, ${resolvedCount} đã xử lý)`,
      `- **Số chỉnh sửa nội dung:** ${state.edits.length}`,
      '',
    ];
    const grouped = state.comments.reduce((groups, item) => {
      const key = item.page || '/';
      (groups[key] ||= []).push(item);
      return groups;
    }, {});
    Object.entries(grouped).forEach(([page, items]) => {
      lines.push(`## ${page}`, '');
      items.forEach((item, index) => {
        const status = item.resolved ? '✅ Đã xử lý' : '⏳ Chưa xử lý';
        lines.push(
          `### ${index + 1}. ${escapeMarkdown(item.tag)}`,
          '',
          `- **Ưu tiên:** ${item.priority || 'medium'}`,
          `- **Selector:** \`${item.selector}\``,
          `- **Element:** ${escapeMarkdown(item.targetText || '')}`,
          `- **Feedback:** ${escapeMarkdown(item.comment)}`,
          `- **Trạng thái:** ${status}`,
          `- **Tạo lúc:** ${item.createdAt ? formatDate(new Date(item.createdAt)) : 'N/A'}`,
          `- **Cập nhật:** ${item.updatedAt ? formatDate(new Date(item.updatedAt)) : 'N/A'}`,
          '',
        );
      });
    });
    if (state.edits.length) {
      lines.push('## Lịch sử sửa nội dung', '');
      state.edits.forEach((edit) =>
        lines.push(`- **${escapeMarkdown(edit.tag)}** · \`${edit.selector}\` → ${escapeMarkdown(edit.value)}`),
      );
      lines.push('');
    }
    // Summary
    lines.push('---', '', '## Tóm tắt', '');
    lines.push(`| Mức độ | Mở | Xong | Tổng |`);
    lines.push(`|--------|-----|------|------|`);
    ['high', 'medium', 'low'].forEach((p) => {
      const all = state.comments.filter((c) => (c.priority || 'medium') === p);
      const res = all.filter((c) => c.resolved).length;
      const label = p === 'high' ? 'Cao' : p === 'medium' ? 'Trung bình' : 'Thấp';
      lines.push(`| ${label} | ${all.length - res} | ${res} | ${all.length} |`);
    });
    lines.push('');

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ui-feedback-${new Date().toISOString().slice(0, 10)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file Markdown');
  }

  /* ── toast ── */
  let toastTimer;
  function showToast(message, opts = {}) {
    const mount = root.querySelector('[data-ui-feedback-toast]');
    if (!mount) return;
    clearTimeout(toastTimer);
    const undoBtn = opts.undo
      ? `<button class="ui-feedback-toast__undo" data-toast-undo>Hoàn tác</button>`
      : '';
    mount.innerHTML = `<div class="ui-feedback-toast" role="status">${escapeHtml(message)}${undoBtn}</div>`;
    if (opts.undo) {
      mount.querySelector('[data-toast-undo]')?.addEventListener('click', (e) => {
        e.stopPropagation();
        undoDelete();
        mount.innerHTML = '';
      });
    }
    toastTimer = setTimeout(() => {
      const toast = mount.querySelector('.ui-feedback-toast');
      if (toast) {
        toast.classList.add('is-leaving');
        setTimeout(() => { mount.innerHTML = ''; }, 220);
      }
    }, opts.undo ? 5000 : 2400);
  }

  /* ── toggle ── */
  function toggle() {
    state.active = !state.active;
    state.panelOpen = false;
    state.modalOpen = false;
    stopPicking();
    renderToolbar();
    showToast(state.active ? 'UI Feedback đã bật' : 'UI Feedback đã tắt');
  }

  /* ── keyboard shortcut ── */
  function normalizeShortcutKey(event) {
    const fromCode = typeof event.code === 'string' && event.code.startsWith('Key') ? event.code.slice(3) : '';
    return (fromCode || event.key || '').toLowerCase();
  }

  function keydown(event) {
    // Escape closes modal or panel when active
    if (event.key === 'Escape' && state.active) {
      if (state.modalOpen) { closeModal(); event.preventDefault(); return; }
      if (state.panelOpen) { togglePanel(false); event.preventDefault(); return; }
      if (state.picking) { stopPicking(); renderToolbar(); event.preventDefault(); return; }
    }

    const key = normalizeShortcutKey(event);
    if (!config.shortcut.includes(key)) return;
    pressed.add(key);
    if (!event.repeat) {
      recentShortcutKeys.push(key);
      while (recentShortcutKeys.length > config.shortcut.length) recentShortcutKeys.shift();
      const simultaneous = config.shortcut.every((r) => pressed.has(r));
      const quickSequence = config.shortcut.every((r) => recentShortcutKeys.includes(r));
      if (simultaneous || quickSequence) {
        event.preventDefault();
        recentShortcutKeys.length = 0;
        clearTimeout(shortcutTimer);
        toggle();
      } else {
        clearTimeout(shortcutTimer);
        shortcutTimer = setTimeout(() => {
          recentShortcutKeys.length = 0;
        }, 1500);
      }
    }
  }

  function keyup(event) {
    pressed.delete(normalizeShortcutKey(event));
  }

  /* ── element picking ── */
  function elementAtPoint(clientX, clientY) {
    const picker = root.querySelector('[data-picker-layer]');
    if (picker) picker.style.display = 'none';
    const element = document.elementFromPoint(clientX, clientY);
    if (picker) picker.style.display = '';
    if (
      !(element instanceof Element) ||
      element === document.documentElement ||
      element === document.body ||
      element.closest('#ui-feedback-host')
    )
      return null;
    return element;
  }

  function pointerMove(event) {
    if (!state.picking) return;
    const element = elementAtPoint(event.clientX, event.clientY);
    if (element) highlight(element);
  }

  /* ── unified host-level event delegation ── */
  // All click/pointerdown events are handled here to prevent double-fire issues.
  function handleHostEvent(event) {
    const path = event.composedPath();

    // 1) toolbar buttons
    const button = path.find(
      (node) => node instanceof HTMLButtonElement && node.dataset?.action,
    );
    if (button) {
      triggerToolbarAction(event, button);
      return;
    }

    // 2) picker layer interactions
    if (!state.picking || state.pickingLocked) return;
    const picker = path.find(
      (node) => node instanceof Element && node.matches?.('[data-picker-layer]'),
    );
    if (!picker) return;

    const element = elementAtPoint(event.clientX, event.clientY);
    if (!element) return;

    event.preventDefault();
    event.stopPropagation();

    // Lock to prevent the companion click from also firing
    state.pickingLocked = true;
    setTimeout(() => { state.pickingLocked = false; }, 600);

    openModal(element, state.mode);
  }

  /* ── document-level picking fallback ── */
  // Only fires for elements NOT inside the shadow host, in case the picker
  // layer fails to intercept (e.g. on elements with pointer-events:none above it).
  function documentPickHandler(event) {
    if (!state.picking || state.pickingLocked) return;
    if (event.composedPath().includes(host)) return;
    const element = event.target instanceof Element ? event.target : null;
    if (!element || element === document.documentElement || element === document.body) return;
    event.preventDefault();
    event.stopPropagation();
    state.pickingLocked = true;
    setTimeout(() => { state.pickingLocked = false; }, 600);
    openModal(element, state.mode);
  }

  /* ── drag & drop toolbar ── */
  function handleDragStart(event) {
    const path = event.composedPath();
    const grip = path.find(
      (node) => node instanceof Element && node.matches?.('[data-drag-handle]'),
    );
    if (!grip) return;

    event.preventDefault();
    event.stopPropagation();

    const toolbar = root.querySelector('.ui-feedback-toolbar');
    if (!toolbar) return;

    const rect = toolbar.getBoundingClientRect();
    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      startRight: window.innerWidth - rect.right,
      startTop: rect.top,
    };

    function onMove(e) {
      if (!dragState) return;
      const dx = e.clientX - dragState.startX;
      const dy = e.clientY - dragState.startY;
      toolbarPos.right = Math.max(8, Math.min(window.innerWidth - 70, dragState.startRight - dx));
      toolbarPos.top = Math.max(40, Math.min(window.innerHeight - 100, dragState.startTop + dy));
      toolbar.style.cssText = getToolbarStyle();
    }

    function onEnd() {
      dragState = null;
      document.removeEventListener('pointermove', onMove, true);
      document.removeEventListener('pointerup', onEnd, true);
      document.removeEventListener('pointercancel', onEnd, true);
    }

    document.addEventListener('pointermove', onMove, true);
    document.addEventListener('pointerup', onEnd, true);
    document.addEventListener('pointercancel', onEnd, true);
  }

  /* ── dispose ── */
  function dispose() {
    stopPicking();
    document.removeEventListener('keydown', keydown, true);
    document.removeEventListener('keyup', keyup, true);
    window.removeEventListener('blur', blurHandler);
    document.removeEventListener('pointermove', pointerMove, true);
    document.removeEventListener('pointerdown', documentPickHandler, true);
    document.removeEventListener('click', documentPickHandler, true);
    host.removeEventListener('pointerdown', handleHostEvent, true);
    host.removeEventListener('click', handleHostEvent, true);
    host.removeEventListener('pointerdown', handleDragStart, true);
    host.remove();
    delete window.__uiFeedbackInstance;
  }

  /* ── bind global listeners ── */
  const blurHandler = () => pressed.clear();

  document.addEventListener('keydown', keydown, true);
  document.addEventListener('keyup', keyup, true);
  window.addEventListener('blur', blurHandler);
  document.addEventListener('pointermove', pointerMove, true);
  // Document-level pick fallback (capture)
  document.addEventListener('pointerdown', documentPickHandler, true);
  document.addEventListener('click', documentPickHandler, true);
  // Host-level delegation — handles toolbar buttons + picker layer
  host.addEventListener('pointerdown', handleHostEvent, true);
  host.addEventListener('click', handleHostEvent, true);
  // Drag
  host.addEventListener('pointerdown', handleDragStart, true);

  window.__uiFeedbackInstance = {
    toggle,
    exportMarkdown,
    getComments: () => [...state.comments],
    dispose,
  };
  renderToolbar();
  return window.__uiFeedbackInstance;
}

if (typeof window !== 'undefined') {
  window.UIFeedback = { createUIFeedback };
}
