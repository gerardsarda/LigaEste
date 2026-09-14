import { initState, getStats } from './state.js';
import { exportBackup, importBackup } from './state.js';
import { icon } from './icons.js';
import { STICKERS } from './data.js';

const ICON_SIZES = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };

const views = {
  equipos: () => import('./views/equipos.js'),
  cromos: () => import('./views/cromos.js'),
  repes: () => import('./views/repes.js'),
  stats: () => import('./views/stats.js'),
};

export function injectIcons(scope = document) {
  scope.querySelectorAll('[data-icon]').forEach((el) => {
    const name = el.dataset.icon;
    const size = ICON_SIZES[el.dataset.size] || ICON_SIZES.md;
    el.innerHTML = icon(name, size);
  });
  scope.querySelectorAll('[data-icon-wrap]').forEach((el) => {
    const name = el.dataset.iconWrap;
    el.classList.add('text-on-primary');
    el.innerHTML = icon(name, ICON_SIZES.sm);
  });
}

function parseHash() {
  const hash = (location.hash || '#/equipos').replace(/^#\/?/, '');
  const [name, ...rest] = hash.split('/');
  const param = rest.length ? decodeURIComponent(rest.join('/')) : undefined;
  return { name: name || 'equipos', param };
}

async function renderRoute() {
  const root = document.getElementById('view-root');
  const { name, param } = parseHash();
  const loader = views[name] || views.equipos;
  try {
    const mod = await loader();
    root.innerHTML = '';
    await mod.default(root, param);
  } catch (err) {
    console.error(err);
    root.innerHTML = '<div class="py-space-xl text-center text-on-surface-variant">No se pudo cargar esta vista.</div>';
  }
  injectIcons(root);
  updateHeaderProgress();
  updateActiveNav(name);
  window.scrollTo(0, 0);
}

function updateHeaderProgress() {
  const { total, obtenidos } = getStats();
  const pct = total ? Math.round((obtenidos / total) * 1000) / 10 : 0;
  document.getElementById('album-count').textContent = `${obtenidos} / ${total}`;
  document.getElementById('album-pct').textContent = `(${pct}%)`;
  document.getElementById('album-bar').style.width = `${pct}%`;
}

function updateActiveNav(name) {
  document.querySelectorAll('#bottom-nav a').forEach((a) => {
    const active = a.dataset.path === name;
    a.classList.toggle('text-primary-container', active);
    a.classList.toggle('font-bold', active);
  });
}

function setupSearch() {
  const input = document.getElementById('global-search');
  const results = document.getElementById('search-results');

  function close() {
    results.classList.add('hidden');
    results.innerHTML = '';
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 2) {
      close();
      return;
    }
    const matches = STICKERS.filter((s) =>
      s.nombre.toLowerCase().includes(q) ||
      String(s.numero).toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    ).slice(0, 10);

    if (!matches.length) {
      results.innerHTML = '<div class="p-space-sm font-body-sm text-body-sm text-on-surface-variant">Sin resultados</div>';
      results.classList.remove('hidden');
      return;
    }

    results.innerHTML = matches.map((s) => `
      <button type="button" data-goto="${encodeURIComponent(s.equipo)}" data-id="${s.id}"
        class="w-full text-left px-space-sm py-2 flex items-center justify-between gap-space-sm hover:bg-surface-container-high transition-colors border-b border-surface-container-highest last:border-0">
        <span class="flex flex-col min-w-0">
          <span class="font-body-md text-body-md text-on-surface truncate">${s.nombre}</span>
          <span class="font-label-sm text-label-sm text-on-surface-variant truncate">${s.equipo}</span>
        </span>
        <span class="font-label-sm text-label-sm text-primary-container flex-shrink-0">#${s.numero}</span>
      </button>
    `).join('');
    results.classList.remove('hidden');
  });

  results.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-goto]');
    if (!btn) return;
    close();
    input.value = '';
    location.hash = `#/cromos/${btn.dataset.goto}?highlight=${btn.dataset.id}`;
  });

  document.addEventListener('click', (e) => {
    if (!results.contains(e.target) && e.target !== input) close();
  });
}

function setupBackupPanel() {
  const dialog = document.getElementById('backup-panel');
  const status = document.getElementById('backup-status');

  document.getElementById('open-backup').addEventListener('click', () => {
    status.textContent = '';
    dialog.showModal();
  });
  document.getElementById('close-backup').addEventListener('click', () => dialog.close());
  document.getElementById('export-backup-btn').addEventListener('click', () => exportBackup());
  document.getElementById('import-backup-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importBackup(file);
      status.textContent = 'Copia importada. Recargando...';
      setTimeout(() => location.reload(), 800);
    } catch (err) {
      status.textContent = 'No se pudo importar: ' + err.message;
    }
    e.target.value = '';
  });
}

window.addEventListener('liga-este:progress-changed', updateHeaderProgress);
window.addEventListener('hashchange', renderRoute);
window.addEventListener('DOMContentLoaded', async () => {
  injectIcons(document);
  setupSearch();
  setupBackupPanel();
  await initState();
  if (!location.hash) location.hash = '#/equipos';
  await renderRoute();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch((err) => console.warn('SW registration failed', err));
  }
});
