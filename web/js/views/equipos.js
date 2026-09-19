import { TEAM_ORDER, SPECIAL_SECTIONS } from '../data.js';
import { THEMES, DEFAULT_THEME } from '../themes.js';
import { getStats, getTeamStats, countsTowardTotal } from '../state.js';
import { icon } from '../icons.js';

function crestStyle(theme) {
  const border = theme.patternBorder ? `border: 1px solid ${theme.patternBorder};` : '';
  return `background: ${theme.pattern}; ${border}`;
}

function teamRow(equipo, index, { special = false } = {}) {
  const theme = THEMES[equipo] || DEFAULT_THEME;
  const { total, obtenidos, pct } = getTeamStats(equipo);
  const complete = pct >= 100;
  const faltan = total - obtenidos;
  const glow = complete
    ? `<div class="absolute -right-8 -top-8 w-24 h-24 bg-primary-container/15 rounded-full blur-xl pointer-events-none"></div>`
    : '';
  const badge = complete
    ? `<span class="bg-primary-container text-on-primary font-label-sm text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-tight flex items-center gap-0.5">${icon('stars', 'w-2.5 h-2.5')} COMPLETO</span>`
    : faltan === 1
      ? `<span class="bg-primary-container text-on-primary font-label-sm text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-tight flex items-center gap-0.5">${icon('priority_high', 'w-2.5 h-2.5')} SOLO FALTA 1</span>`
      : '';
  const barClass = complete
    ? 'h-full bg-primary-container rounded-full shadow-[0_0_8px_rgba(253,228,0,0.8)]'
    : 'h-full bg-primary-container rounded-full';

  return `
  <div class="team-row group relative ${complete ? 'bg-surface-container hover:bg-surface-container-high shadow-lg overflow-hidden' : 'bg-surface-container-low hover:bg-surface-container shadow-md'} rounded-xl p-space-sm transition-all duration-200 cursor-pointer"
       data-equipo="${encodeURIComponent(equipo)}" data-pct="${pct}">
    ${glow}
    <div class="flex items-center justify-between relative z-10">
      <div class="flex items-center gap-space-sm min-w-0">
        <div class="w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 shadow-inner flex" style="${crestStyle(theme)}"></div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            ${special ? '' : `<span class="font-label-sm text-label-sm text-on-surface-variant font-mono">${String(index + 1).padStart(2, '0')}</span>`}
            <span class="font-body-lg text-body-lg ${complete ? 'text-primary' : 'text-on-surface'} font-bold truncate">${equipo}</span>
            ${badge}
            ${special && !countsTowardTotal(equipo) ? '<span class="font-label-sm text-label-sm text-on-surface-variant uppercase border border-outline-variant/50 px-1.5 py-0.5 rounded">No cuenta</span>' : ''}
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="font-label-sm text-label-sm text-primary-container font-bold">${obtenidos} / ${total}</span>
            <span class="font-body-sm text-body-sm text-on-surface-variant text-[11px]">cromos conseguidos</span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-space-sm flex-shrink-0">
        <span class="font-headline-md text-headline-md ${complete ? 'text-primary-container' : 'text-on-surface'} font-black">${pct}%</span>
        <span class="text-on-surface-variant group-hover:text-primary-container group-hover:translate-x-0.5 transition-all">${icon('chevron_right', 'w-6 h-6')}</span>
      </div>
    </div>
    <div class="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-2.5">
      <div class="${barClass}" style="width: ${pct}%"></div>
    </div>
  </div>`;
}

export default function renderEquipos(root) {
  const stats = getStats();
  const pct = stats.total ? Math.round((stats.obtenidos / stats.total) * 1000) / 10 : 0;
  const circumference = 163.36;
  const offset = circumference * (1 - pct / 100);

  root.innerHTML = `
  <div class="flex flex-col w-full">
    <div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-secondary-container via-surface-container-high to-surface-container p-space-md shadow-xl mb-space-md">
      <div class="absolute -right-6 -bottom-8 w-32 h-32 rounded-full bg-primary-container/10 blur-2xl pointer-events-none"></div>
      <div class="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-secondary-container/40 blur-xl pointer-events-none"></div>
      <div class="relative z-10 flex flex-col gap-1">
        <span class="font-label-sm text-label-sm uppercase tracking-wider text-primary-container">TEMPORADA 2026-27</span>
        <span class="font-headline-md text-headline-md text-primary tracking-tight font-extrabold uppercase">RESUMEN DE COLECCIÓN</span>
        <span class="font-body-sm text-body-sm text-on-surface-variant">Recuento oficial de tu álbum Panini Este</span>
      </div>
      <div class="relative z-10 mt-space-md grid grid-cols-12 gap-space-sm items-center bg-surface-container-lowest/80 rounded-xl p-space-sm backdrop-blur-md">
        <div class="col-span-5 flex items-center gap-space-sm">
          <div class="relative w-16 h-16 flex-shrink-0 flex items-center justify-center">
            <svg class="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle class="stroke-surface-container-highest" cx="32" cy="32" fill="transparent" r="26" stroke-width="5"></circle>
              <circle class="stroke-primary-container" cx="32" cy="32" fill="transparent" r="26"
                stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" stroke-width="5"></circle>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span class="font-headline-md text-headline-md text-primary-container leading-none font-black text-[16px]">${pct}%</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant text-[8px] uppercase">Completo</span>
            </div>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="font-headline-lg-mobile text-headline-lg-mobile text-primary tracking-tight font-black leading-none">${stats.obtenidos}</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">de ${stats.total} cromos</span>
          </div>
        </div>
        <div class="col-span-7 grid grid-cols-2 gap-space-xs pl-space-xs">
          <div class="bg-surface-container-high rounded-lg p-2 flex flex-col justify-center">
            <div class="flex items-center gap-1 text-secondary">
              <span data-icon="swap_calls" data-size="sm"></span>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Repetidos</span>
            </div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="font-headline-md text-headline-md text-secondary font-black leading-none">${stats.repes}</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant">repes</span>
            </div>
          </div>
          <div class="bg-surface-container-high rounded-lg p-2 flex flex-col justify-center">
            <div class="flex items-center gap-1 text-primary-container">
              <span data-icon="hourglass_top" data-size="sm"></span>
              <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Faltan</span>
            </div>
            <div class="flex items-baseline gap-1 mt-0.5">
              <span class="font-headline-md text-headline-md text-primary-container font-black leading-none">${stats.faltan}</span>
              <span class="font-label-sm text-label-sm text-on-surface-variant">por conseguir</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 overflow-x-auto pb-space-sm mb-space-sm no-scrollbar">
      <button class="filter-pill active-pill flex-shrink-0 px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md uppercase tracking-wider shadow-[0_0_8px_rgba(253,228,0,0.5)] flex items-center gap-1.5" data-filter="all">
        <span data-icon="apps" data-size="sm"></span> Todos los equipos
      </button>
      <button class="filter-pill flex-shrink-0 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface hover:text-primary-container font-label-md text-label-md uppercase tracking-wider transition-colors flex items-center gap-1.5" data-filter="complete">
        <span data-icon="verified" data-size="sm"></span> Completos
      </button>
      <button class="filter-pill flex-shrink-0 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface hover:text-primary-container font-label-md text-label-md uppercase tracking-wider transition-colors flex items-center gap-1.5" data-filter="incomplete">
        <span data-icon="pending" data-size="sm"></span> Incompletos
      </button>
    </div>

    <div class="flex items-center justify-between px-1 mb-space-xs">
      <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-bold">${TEAM_ORDER.length} CLUBS OFICIALES LALIGA EA SPORTS</span>
      <span class="font-label-sm text-label-sm text-primary-container flex items-center gap-1"><span data-icon="sort" data-size="sm"></span> Orden oficial</span>
    </div>
    <div class="flex flex-col gap-space-xs" id="teams-list">
      ${TEAM_ORDER.map((eq, i) => teamRow(eq, i)).join('')}
    </div>

    <div class="mt-space-lg mb-space-sm flex items-center justify-between px-1">
      <div class="flex items-center gap-1.5">
        <span class="text-primary-container" data-icon="hotel_class" data-size="sm"></span>
        <span class="font-headline-md text-headline-md text-primary uppercase font-extrabold tracking-tight">SECCIONES ESPECIALES</span>
      </div>
      <span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Series limitadas</span>
    </div>
    <div class="flex flex-col gap-space-xs mb-space-lg" id="special-list">
      ${SPECIAL_SECTIONS.map((eq) => teamRow(eq, 0, { special: true })).join('')}
    </div>
  </div>`;

  root.querySelectorAll('[data-equipo]').forEach((row) => {
    row.addEventListener('click', () => {
      location.hash = `#/cromos/${row.dataset.equipo}`;
    });
  });

  const pills = root.querySelectorAll('.filter-pill');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => {
        p.classList.remove('active-pill', 'bg-primary-container', 'text-on-primary', 'shadow-[0_0_8px_rgba(253,228,0,0.5)]');
        p.classList.add('bg-surface-container-high', 'text-on-surface');
      });
      pill.classList.add('active-pill', 'bg-primary-container', 'text-on-primary', 'shadow-[0_0_8px_rgba(253,228,0,0.5)]');
      pill.classList.remove('bg-surface-container-high', 'text-on-surface');

      const filter = pill.dataset.filter;
      root.querySelectorAll('.team-row').forEach((r) => {
        const p = Number(r.dataset.pct);
        const show = filter === 'all' || (filter === 'complete' && p >= 100) || (filter === 'incomplete' && p < 100);
        r.classList.toggle('hidden', !show);
      });
    });
  });
}
