import { TEAM_ORDER, SPECIAL_SECTIONS } from '../data.js';
import { THEMES, DEFAULT_THEME } from '../themes.js';
import { getStats, getTeamStats } from '../state.js';
import { icon } from '../icons.js';

function kpiCard(label, value, valueClass, sub) {
  return `
  <div class="bg-surface-container-low border border-surface-container-highest rounded-xl p-space-sm text-center">
    <div class="font-label-sm text-label-sm text-on-surface-variant font-bold uppercase">${label}</div>
    <div class="font-headline-md text-headline-md ${valueClass} font-black my-1">${value}</div>
    <div class="font-label-sm text-label-sm text-on-surface-variant">${sub}</div>
  </div>`;
}

function sectionRow(equipo, isSpecial) {
  const theme = THEMES[equipo] || DEFAULT_THEME;
  const border = theme.patternBorder ? `border: 1px solid ${theme.patternBorder};` : '';
  const { total, obtenidos, pct } = getTeamStats(equipo);
  return `
  <div class="flex items-center gap-space-sm bg-surface-container-low rounded-xl p-space-sm cursor-pointer hover:bg-surface-container transition-colors" data-equipo="${encodeURIComponent(equipo)}">
    <div class="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 shadow-inner" style="background: ${theme.pattern}; ${border}"></div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <span class="font-body-md text-body-md text-on-surface font-bold truncate">${equipo}${isSpecial ? ' <span class=\'font-label-sm text-label-sm text-secondary\'>(especial)</span>' : ''}</span>
        <span class="font-label-md text-label-md text-primary-container font-bold flex-shrink-0">${pct}%</span>
      </div>
      <div class="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mt-1.5">
        <div class="h-full bg-primary-container rounded-full" style="width: ${pct}%"></div>
      </div>
      <span class="font-label-sm text-label-sm text-on-surface-variant">${obtenidos} / ${total}</span>
    </div>
  </div>`;
}

export default function renderStats(root) {
  const stats = getStats();
  const pct = stats.total ? Math.round((stats.obtenidos / stats.total) * 1000) / 10 : 0;

  const sections = [
    ...TEAM_ORDER.map((eq) => ({ eq, special: false })),
    ...SPECIAL_SECTIONS.map((eq) => ({ eq, special: true })),
  ]
    .map((s) => ({ ...s, pct: getTeamStats(s.eq).pct }))
    .sort((a, b) => b.pct - a.pct);

  root.innerHTML = `
  <div class="flex flex-col w-full gap-space-md">
    <div class="flex items-center gap-1.5">
      <span class="text-primary-container">${icon('analytics', 'w-6 h-6')}</span>
      <span class="font-headline-md text-headline-md text-primary uppercase font-extrabold tracking-tight">Estadísticas</span>
    </div>

    <div class="grid grid-cols-2 gap-space-sm">
      ${kpiCard('Total álbum', stats.total, 'text-on-surface', 'Cromos oficiales')}
      ${kpiCard('Conseguidos', stats.obtenidos, 'text-primary-container', `${pct}% completado`)}
      ${kpiCard('Faltantes', stats.faltan, 'text-error', 'Por pegar')}
      ${kpiCard('Repetidos', stats.repes, 'text-secondary', 'Para intercambio')}
    </div>

    <div class="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden p-0.5">
      <div class="h-full bg-gradient-to-r from-primary-container to-primary-fixed-dim rounded-full shadow-[0_0_10px_rgba(253,228,0,0.6)]" style="width: ${pct}%"></div>
    </div>

    <span class="font-headline-md text-headline-md text-primary uppercase font-extrabold tracking-tight mt-space-sm">Progreso por equipo y sección</span>
    <div class="flex flex-col gap-space-xs mb-space-lg" id="stats-list">
      ${sections.map((s) => sectionRow(s.eq, s.special)).join('')}
    </div>
  </div>`;

  root.querySelectorAll('[data-equipo]').forEach((row) => {
    row.addEventListener('click', () => { location.hash = `#/cromos/${row.dataset.equipo}`; });
  });
}
