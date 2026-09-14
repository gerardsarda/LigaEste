import { STICKERS, TEAM_ORDER, SPECIAL_SECTIONS } from '../data.js';
import { THEMES, DEFAULT_THEME } from '../themes.js';
import { getEntry, setObtenido, setRepes, getTeamStats } from '../state.js';
import { icon } from '../icons.js';

function stickerCard(sticker) {
  const entry = getEntry(sticker.id);
  const isRepe = entry.obtenido && entry.repes > 0;
  const isMissing = !entry.obtenido;

  const border = isMissing
    ? 'border border-dashed border-outline/40 hover:border-primary-container'
    : isRepe
      ? 'border border-secondary-container/40 hover:border-secondary'
      : 'border border-outline-variant/30 hover:border-primary-container/40';
  const bg = isMissing ? 'bg-surface-container-lowest' : 'bg-surface-container';

  let footer;
  if (isMissing) {
    footer = `
      <span class="inline-flex items-center gap-1 text-error font-label-sm text-label-sm font-bold">
        ${icon('radio_button_unchecked', 'w-4 h-4')} FALTA
      </span>
      <button type="button" data-action="marcar" class="text-label-sm font-label-sm text-primary-container uppercase hover:underline flex items-center gap-0.5">
        ${icon('add', 'w-3.5 h-3.5')} Marcar
      </button>`;
  } else if (isRepe) {
    footer = `
      <span class="inline-flex items-center gap-1 text-secondary font-label-sm text-label-sm font-bold">
        ${icon('swap_calls', 'w-4 h-4')} REPETIDO
      </span>
      <div class="flex items-center gap-1 bg-surface-container-low px-1 py-0.5 rounded">
        <button type="button" data-action="dec" class="w-5 h-5 flex items-center justify-center rounded bg-surface-container text-on-surface font-bold text-xs active:scale-90">-</button>
        <span class="font-label-sm text-label-sm text-primary px-1">${entry.repes}</span>
        <button type="button" data-action="inc" class="w-5 h-5 flex items-center justify-center rounded bg-primary-container text-on-primary font-bold text-xs active:scale-90">+</button>
      </div>`;
  } else {
    footer = `
      <span class="inline-flex items-center gap-1 text-primary-container font-label-sm text-label-sm font-bold">
        ${icon('check_circle', 'w-4 h-4')} TINC
      </span>
      <div class="flex items-center gap-1 bg-surface-container-low px-1 py-0.5 rounded">
        <span class="font-label-sm text-label-sm text-on-surface-variant px-1">x1</span>
        <button type="button" data-action="inc" class="w-5 h-5 flex items-center justify-center rounded bg-primary-container text-on-primary font-bold text-xs active:scale-90">+</button>
      </div>`;
  }

  return `
  <div class="sticker-card relative flex flex-col justify-between p-space-sm ${bg} rounded-xl shadow-sm ${border} transition-all"
       data-id="${sticker.id}" data-status="${isMissing ? 'missing' : isRepe ? 'repe' : 'owned'}">
    <div class="flex items-start justify-between gap-1 mb-space-xs">
      <span class="px-1.5 py-0.5 rounded ${isMissing ? 'bg-surface-container-highest text-on-surface-variant' : 'bg-primary-container text-on-primary'} font-label-sm text-label-sm font-bold shadow">#${sticker.numero}</span>
      ${isRepe ? `<span class="font-label-sm text-label-sm uppercase px-1.5 py-0.5 rounded-full bg-secondary-container text-secondary font-bold">x${entry.repes}</span>` : ''}
    </div>
    <div class="mb-space-sm">
      <span class="font-headline-md text-headline-md ${isMissing ? 'text-on-surface/70' : 'text-primary'} block leading-tight">${sticker.nombre}</span>
      <span class="font-body-sm text-body-sm text-on-surface-variant">${sticker.edicion}</span>
    </div>
    <div class="flex items-center justify-between pt-space-xs border-t border-surface-container-highest">
      ${footer}
    </div>
  </div>`;
}

function teamPicker(root) {
  root.innerHTML = `
  <div class="flex flex-col gap-space-md">
    <span class="font-headline-md text-headline-md text-primary uppercase font-extrabold tracking-tight">Elige un equipo o sección</span>
    <div class="flex flex-col gap-space-xs">
      ${[...TEAM_ORDER, ...SPECIAL_SECTIONS].map((eq) => {
        const theme = THEMES[eq] || DEFAULT_THEME;
        const border = theme.patternBorder ? `border: 1px solid ${theme.patternBorder};` : '';
        return `
        <div class="flex items-center gap-space-sm bg-surface-container-low hover:bg-surface-container rounded-xl p-space-sm cursor-pointer transition-colors" data-pick="${encodeURIComponent(eq)}">
          <div class="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 shadow-inner" style="background: ${theme.pattern}; ${border}"></div>
          <span class="font-body-lg text-body-lg text-on-surface font-bold truncate">${eq}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;
  root.querySelectorAll('[data-pick]').forEach((el) => {
    el.addEventListener('click', () => { location.hash = `#/cromos/${el.dataset.pick}`; });
  });
}

export default function renderCromos(root, param) {
  if (!param) {
    teamPicker(root);
    return;
  }

  let equipo = param;
  let highlight = null;
  const qIndex = param.indexOf('?highlight=');
  if (qIndex !== -1) {
    equipo = param.slice(0, qIndex);
    highlight = param.slice(qIndex + '?highlight='.length);
  }

  const stickers = STICKERS.filter((s) => s.equipo === equipo).sort((a, b) => a.orden - b.orden);
  if (!stickers.length) {
    teamPicker(root);
    return;
  }
  const theme = THEMES[equipo] || DEFAULT_THEME;
  const border = theme.patternBorder ? `border: 1px solid ${theme.patternBorder};` : '';

  function repesTotal() {
    return stickers.reduce((sum, s) => sum + getEntry(s.id).repes, 0);
  }

  function renderBanner() {
    const { total, obtenidos, pct } = getTeamStats(equipo);
    const faltan = total - obtenidos;
    return `
    <div class="relative overflow-hidden rounded-xl bg-surface-container-high p-space-md shadow-xl">
      <div class="absolute -right-12 -top-12 w-48 h-48 bg-primary-container/15 rounded-full blur-3xl pointer-events-none"></div>
      <div class="absolute -left-10 -bottom-10 w-44 h-44 bg-secondary-container/40 rounded-full blur-2xl pointer-events-none"></div>
      <div class="relative z-10 flex flex-col gap-space-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-space-sm min-w-0">
            <div class="w-14 h-14 rounded-lg flex-shrink-0 shadow-md" style="background: ${theme.pattern}; ${border}"></div>
            <div class="flex flex-col min-w-0">
              <span class="font-headline-lg-mobile text-headline-lg-mobile uppercase tracking-tight text-primary truncate">${equipo}</span>
              <span class="font-label-sm text-label-sm uppercase tracking-widest text-secondary">LaLiga EA Sports 2026-27</span>
            </div>
          </div>
        </div>
        <div class="bg-surface-container-lowest/80 rounded-lg p-space-sm flex flex-col gap-space-xs mt-1">
          <div class="flex justify-between items-center">
            <span class="font-label-md text-label-md uppercase tracking-wider text-primary">Completado</span>
            <div class="flex items-center gap-1.5">
              <span class="font-headline-md text-headline-md text-primary-container leading-none">${obtenidos}<span class="text-on-surface-variant font-body-sm text-body-sm">/${total}</span></span>
              <span class="font-label-sm text-label-sm bg-secondary-container px-1.5 py-0.5 rounded text-secondary-fixed">${pct}%</span>
            </div>
          </div>
          <div class="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden p-0.5">
            <div class="h-full bg-gradient-to-r from-primary-container to-secondary rounded-full shadow-[0_0_10px_rgba(253,228,0,0.6)] transition-all duration-500" style="width: ${pct}%;"></div>
          </div>
          <div class="grid grid-cols-2 gap-space-sm pt-1">
            <div class="flex items-center justify-between bg-surface-container px-space-sm py-1.5 rounded">
              <span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">${icon('cancel', 'w-4 h-4')} Faltan:</span>
              <span class="font-label-md text-label-md text-error">${faltan}</span>
            </div>
            <div class="flex items-center justify-between bg-surface-container px-space-sm py-1.5 rounded">
              <span class="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">${icon('layers', 'w-4 h-4')} Repetidos:</span>
              <span class="font-label-md text-label-md text-secondary-fixed">${repesTotal()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function counts() {
    const owned = stickers.filter((s) => getEntry(s.id).obtenido).length;
    const missing = stickers.length - owned;
    const repe = stickers.filter((s) => getEntry(s.id).repes > 0).length;
    return { all: stickers.length, owned, missing, repe };
  }

  function renderFilters() {
    const c = counts();
    return `
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 sticky top-0 z-30 bg-surface/90 backdrop-blur-md" id="filter-container">
      <button class="filter-tab active px-3 py-1.5 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm uppercase tracking-wider transition-all" data-filter="all">Todos (${c.all})</button>
      <button class="filter-tab px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase tracking-wider transition-all" data-filter="owned">Tinc (${c.owned})</button>
      <button class="filter-tab px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase tracking-wider transition-all" data-filter="missing">Falta (${c.missing})</button>
      <button class="filter-tab px-3 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm uppercase tracking-wider transition-all" data-filter="repe">Repes (${c.repe})</button>
    </div>`;
  }

  function fullRender() {
    root.innerHTML = `
    <div class="flex flex-col w-full gap-space-md">
      ${renderBanner()}
      ${renderFilters()}
      <div class="grid grid-cols-2 gap-space-sm w-full" id="stickers-grid">
        ${stickers.map(stickerCard).join('')}
      </div>
    </div>`;
    wire();
  }

  function refreshCard(id) {
    const sticker = stickers.find((s) => s.id === id);
    const el = root.querySelector(`.sticker-card[data-id="${CSS.escape(id)}"]`);
    if (sticker && el) el.outerHTML = stickerCard(sticker);
    const banner = root.querySelector('.relative.overflow-hidden.rounded-xl.bg-surface-container-high');
    if (banner) banner.outerHTML = renderBanner();
    const filters = root.querySelector('#filter-container');
    if (filters) filters.outerHTML = renderFilters();
    wire();
    applyActiveFilter();
  }

  let activeFilter = 'all';
  function applyActiveFilter() {
    root.querySelectorAll('.sticker-card').forEach((card) => {
      const status = card.dataset.status;
      const show = activeFilter === 'all' ||
        (activeFilter === 'owned' && status !== 'missing') ||
        (activeFilter === 'missing' && status === 'missing') ||
        (activeFilter === 'repe' && status === 'repe');
      card.classList.toggle('hidden', !show);
    });
    root.querySelectorAll('.filter-tab').forEach((t) => {
      const active = t.dataset.filter === activeFilter;
      t.classList.toggle('bg-primary-container', active);
      t.classList.toggle('text-on-primary', active);
      t.classList.toggle('bg-surface-container-high', !active);
      t.classList.toggle('text-on-surface-variant', !active);
    });
  }

  function wire() {
    root.querySelectorAll('.filter-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        activeFilter = tab.dataset.filter;
        applyActiveFilter();
      });
    });
    root.querySelectorAll('.sticker-card [data-action]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.sticker-card');
        const id = card.dataset.id;
        const entry = getEntry(id);
        const action = btn.dataset.action;
        if (action === 'marcar') setObtenido(id, true);
        else if (action === 'inc') setRepes(id, entry.repes + 1);
        else if (action === 'dec') setRepes(id, Math.max(0, entry.repes - 1));
        refreshCard(id);
        window.dispatchEvent(new CustomEvent('liga-este:progress-changed'));
      });
    });
  }

  fullRender();
  applyActiveFilter();

  if (highlight) {
    const card = root.querySelector(`.sticker-card[data-id="${CSS.escape(highlight)}"]`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('ring-2', 'ring-primary-container');
      setTimeout(() => card.classList.remove('ring-2', 'ring-primary-container'), 2000);
    }
  }
}
