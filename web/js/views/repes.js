import { STICKERS } from '../data.js';
import { getEntry, setRepes } from '../state.js';
import { icon } from '../icons.js';

function download(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function repeRow(sticker) {
  const entry = getEntry(sticker.id);
  return `
  <div class="repe-row flex items-center justify-between gap-space-sm bg-surface-container-low rounded-xl p-space-sm" data-id="${sticker.id}">
    <div class="flex flex-col min-w-0">
      <span class="font-body-lg text-body-lg text-on-surface font-bold truncate">${sticker.nombre}</span>
      <span class="font-label-sm text-label-sm text-on-surface-variant truncate">${sticker.equipo} · #${sticker.numero} · ${sticker.id}</span>
    </div>
    <div class="flex items-center gap-1 bg-surface-container px-1 py-0.5 rounded flex-shrink-0">
      <button type="button" data-action="dec" class="w-6 h-6 flex items-center justify-center rounded bg-surface-container-high text-on-surface font-bold active:scale-90">-</button>
      <span class="font-label-md text-label-md text-primary-container px-1 w-5 text-center">${entry.repes}</span>
      <button type="button" data-action="inc" class="w-6 h-6 flex items-center justify-center rounded bg-primary-container text-on-primary font-bold active:scale-90">+</button>
    </div>
  </div>`;
}

function faltaRow(sticker) {
  return `
  <div class="flex items-center justify-between gap-space-sm bg-surface-container-low rounded-xl p-space-sm">
    <div class="flex flex-col min-w-0">
      <span class="font-body-lg text-body-lg text-on-surface font-bold truncate">${sticker.nombre}</span>
      <span class="font-label-sm text-label-sm text-on-surface-variant truncate">${sticker.equipo} · #${sticker.numero} · ${sticker.id}</span>
    </div>
    <span class="font-label-sm text-label-sm text-error uppercase flex-shrink-0">${icon('radio_button_unchecked', 'w-4 h-4')}</span>
  </div>`;
}

export default function renderRepes(root) {
  root.innerHTML = `
  <div class="flex flex-col w-full gap-space-md">
    <div class="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container to-surface-container-high p-space-md shadow-xl border-l-4 border-primary-container">
      <span class="font-label-sm text-label-sm text-primary-container uppercase tracking-wider font-bold">Zona de intercambio</span>
      <div class="font-headline-md text-headline-md text-primary font-extrabold uppercase mt-0.5">Repetidos y faltantes</div>
      <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">Exporta tus listas en orden oficial para compartir con otros coleccionistas.</p>
    </div>

    <div class="flex items-center justify-between">
      <span class="font-headline-md text-headline-md text-primary uppercase font-extrabold tracking-tight" id="repes-heading">Repetidos (0)</span>
      <button id="export-repes" class="flex items-center gap-1.5 bg-surface-container-high text-primary-container font-label-sm text-label-sm uppercase tracking-wider px-3 py-1.5 rounded-lg">
        ${icon('download', 'w-4 h-4')} Exportar
      </button>
    </div>
    <div class="flex flex-col gap-space-xs" id="repes-list"></div>

    <div class="flex items-center justify-between mt-space-md">
      <span class="font-headline-md text-headline-md text-primary uppercase font-extrabold tracking-tight" id="faltantes-heading">Faltantes (0)</span>
      <button id="export-faltantes" class="flex items-center gap-1.5 bg-surface-container-high text-primary-container font-label-sm text-label-sm uppercase tracking-wider px-3 py-1.5 rounded-lg">
        ${icon('download', 'w-4 h-4')} Exportar
      </button>
    </div>
    <div class="relative flex items-center">
      <span class="absolute left-space-md text-on-surface-variant pointer-events-none">${icon('search', 'w-5 h-5')}</span>
      <input id="falta-search" class="w-full h-11 pl-11 pr-space-lg bg-surface-container-high text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm rounded-lg focus:outline-none" placeholder="Buscar en faltantes..." type="search">
    </div>
    <div class="flex flex-col gap-space-xs mb-space-lg" id="faltantes-list"></div>
  </div>`;

  const repesListEl = root.querySelector('#repes-list');
  const faltantesListEl = root.querySelector('#faltantes-list');
  const repesHeading = root.querySelector('#repes-heading');
  const faltantesHeading = root.querySelector('#faltantes-heading');

  function renderRepesList() {
    const repeStickers = STICKERS.filter((s) => getEntry(s.id).repes > 0).sort((a, b) => a.orden - b.orden);
    repesHeading.textContent = `Repetidos (${repeStickers.length})`;
    repesListEl.innerHTML = repeStickers.length
      ? repeStickers.map(repeRow).join('')
      : '<p class="font-body-sm text-body-sm text-on-surface-variant">No tienes cromos repetidos anotados todavía.</p>';

    repesListEl.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.repe-row');
        const id = row.dataset.id;
        const entry = getEntry(id);
        const next = btn.dataset.action === 'inc' ? entry.repes + 1 : Math.max(0, entry.repes - 1);
        setRepes(id, next);
        renderRepesList();
        window.dispatchEvent(new CustomEvent('liga-este:progress-changed'));
      });
    });
  }

  function renderFaltantesList(query = '') {
    const q = query.trim().toLowerCase();
    const faltantes = STICKERS
      .filter((s) => !getEntry(s.id).obtenido)
      .filter((s) => !q || s.nombre.toLowerCase().includes(q) || s.equipo.toLowerCase().includes(q))
      .sort((a, b) => a.orden - b.orden);
    faltantesHeading.textContent = `Faltantes (${STICKERS.filter((s) => !getEntry(s.id).obtenido).length})`;
    faltantesListEl.innerHTML = faltantes.length
      ? faltantes.map(faltaRow).join('')
      : '<p class="font-body-sm text-body-sm text-on-surface-variant">Nada que mostrar.</p>';
  }

  renderRepesList();
  renderFaltantesList();

  root.querySelector('#falta-search').addEventListener('input', (e) => renderFaltantesList(e.target.value));

  root.querySelector('#export-repes').addEventListener('click', () => {
    const repeStickers = STICKERS.filter((s) => getEntry(s.id).repes > 0).sort((a, b) => a.orden - b.orden);
    let txt = 'LISTA DE REPETIDOS - LIGA ESTE 2026-27 (ORDEN OFICIAL)\n';
    txt += '=========================================================\n';
    for (const s of repeStickers) {
      txt += `${s.equipo} -> Nº${s.numero} ${s.nombre} (${s.id}) [x${getEntry(s.id).repes}]\n`;
    }
    download('mis_repes_2026_27.txt', txt);
  });

  root.querySelector('#export-faltantes').addEventListener('click', () => {
    const faltantes = STICKERS.filter((s) => !getEntry(s.id).obtenido).sort((a, b) => a.orden - b.orden);
    let txt = 'LISTA DE FALTANTES - LIGA ESTE 2026-27 (ORDEN OFICIAL)\n';
    txt += '=========================================================\n';
    for (const s of faltantes) {
      txt += `${s.equipo} -> Nº${s.numero} ${s.nombre} (${s.id})\n`;
    }
    download('mis_faltantes_2026_27.txt', txt);
  });
}
