import { STICKERS } from './data.js';

const STORAGE_KEY = 'liga-este-progreso';
const STICKER_IDS = new Set(STICKERS.map((s) => s.id));

// Secciones que se pueden marcar pero no cuentan para el total/porcentaje
// de la colección (no son parte del álbum oficial de 20 clubs + series).
export const EXCLUDED_SECTIONS = [
  'Cromos Conmemorativos -- Jugón 234',
  'Extra Sticker - Bronce',
  'Extra Sticker - Plata',
  'Extra Sticker - Oro',
];
const EXCLUDED_SET = new Set(EXCLUDED_SECTIONS);
export function countsTowardTotal(equipo) {
  return !EXCLUDED_SET.has(equipo);
}
const COUNTED_STICKERS = STICKERS.filter((s) => countsTowardTotal(s.equipo));

const STICKERS_BY_TEAM = new Map();
for (const s of STICKERS) {
  if (!STICKERS_BY_TEAM.has(s.equipo)) STICKERS_BY_TEAM.set(s.equipo, []);
  STICKERS_BY_TEAM.get(s.equipo).push(s);
}
export function getTeamStickers(equipo) {
  return STICKERS_BY_TEAM.get(equipo) || [];
}

// El estado se cachea en memoria (invalidado en cada escritura) para no
// volver a parsear el JSON de localStorage en cada llamada — las vistas de
// listado (Equipos/Stats) leen el estado decenas de veces por render.
let cache = null;

function readRaw() {
  if (cache) return cache;
  const raw = localStorage.getItem(STORAGE_KEY);
  cache = raw ? JSON.parse(raw) : {};
  return cache;
}

function writeRaw(state) {
  cache = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function emptyEntry() {
  return { obtenido: false, repes: 0 };
}

export async function initState() {
  if (localStorage.getItem(STORAGE_KEY) !== null) return;
  let seed = {};
  try {
    const res = await fetch('data/initial-progress.json');
    const records = await res.json();
    for (const r of records) {
      if (!STICKER_IDS.has(r.ID_Cromo)) continue;
      seed[r.ID_Cromo] = { obtenido: !!r.Obtenido, repes: Number(r.Repes) || 0 };
    }
  } catch {
    seed = {};
  }
  writeRaw(seed);
}

export function getEntry(id) {
  const state = readRaw();
  return state[id] ? { ...state[id] } : emptyEntry();
}

export function setObtenido(id, value) {
  const state = readRaw();
  const current = state[id] || emptyEntry();
  current.obtenido = !!value;
  if (!current.obtenido) current.repes = 0;
  state[id] = current;
  writeRaw(state);
}

export function setRepes(id, value) {
  const state = readRaw();
  const current = state[id] || emptyEntry();
  current.repes = Math.max(0, Number(value) || 0);
  if (current.repes > 0) current.obtenido = true;
  state[id] = current;
  writeRaw(state);
}

export function getStats() {
  const state = readRaw();
  let obtenidos = 0;
  let repes = 0;
  for (const s of COUNTED_STICKERS) {
    const entry = state[s.id];
    if (entry?.obtenido) obtenidos += 1;
    if (entry?.repes) repes += entry.repes;
  }
  return { total: COUNTED_STICKERS.length, obtenidos, faltan: COUNTED_STICKERS.length - obtenidos, repes };
}

export function getTeamStats(equipo) {
  const teamStickers = getTeamStickers(equipo);
  const state = readRaw();
  const obtenidos = teamStickers.filter((s) => state[s.id]?.obtenido).length;
  const total = teamStickers.length;
  const pct = total ? Math.round((obtenidos / total) * 1000) / 10 : 0;
  return { total, obtenidos, pct };
}

export function exportBackup() {
  const state = readRaw();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `liga-este-backup-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function importBackup(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('El archivo de backup no tiene el formato esperado.');
  }
  const cleaned = {};
  for (const [id, entry] of Object.entries(parsed)) {
    if (!STICKER_IDS.has(id)) continue;
    if (typeof entry !== 'object' || entry === null) continue;
    cleaned[id] = { obtenido: !!entry.obtenido, repes: Math.max(0, Number(entry.repes) || 0) };
  }
  writeRaw(cleaned);
}
