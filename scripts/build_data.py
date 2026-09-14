"""Genera el catalogo de cromos y los temas de equipo para la PWA a partir del Excel.

Uso: python scripts/build_data.py
Lee checklist_este_2026_27.xlsx (hoja 'Checklist') y escribe:
  - web/js/data.js     catalogo de cromos, orden de equipos, secciones especiales
  - web/js/themes.js   colores y patrones visuales por equipo
Copia ademas coleccion_progreso_laliga.json -> web/data/initial-progress.json.
"""
import json
import shutil
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
EXCEL_FILE = ROOT / "checklist_este_2026_27.xlsx"
PROGRESS_FILE = ROOT / "coleccion_progreso_laliga.json"
WEB_JS = ROOT / "web" / "js"
WEB_DATA = ROOT / "web" / "data"

SPECIAL_SECTIONS = [
    "Cromos Conmemorativos -- Jugón 234",
    "ADN LaLiga - Prime",
    "La Liga Fantasy",
    "Draft 23",
    "Draft 23 - Kromix",
    "Últimos Fichajes",
    "Extra Sticker - Bronce",
    "Extra Sticker - Plata",
    "Extra Sticker - Oro",
]

# Colores por equipo/seccion, portados de app.py THEMES.
COLORS = {
    "D. Alavés": {"primary": "#005BAC", "secondary": "#1E293B", "text": "#FFFFFF", "accent": "#005BAC"},
    "Athletic Club": {"primary": "#EE2524", "secondary": "#111111", "text": "#FFFFFF", "accent": "#EE2524"},
    "Atlético de Madrid": {"primary": "#CB3524", "secondary": "#272E61", "text": "#FFFFFF", "accent": "#CB3524"},
    "FC Barcelona": {"primary": "#004D98", "secondary": "#A50044", "text": "#FFFFFF", "accent": "#EDBB00"},
    "Real Betis": {"primary": "#009543", "secondary": "#111111", "text": "#FFFFFF", "accent": "#009543"},
    "RC Celta": {"primary": "#8AC3EE", "secondary": "#0C2340", "text": "#0C2340", "accent": "#C4122F"},
    "RC Deportivo": {"primary": "#005BAC", "secondary": "#0A192F", "text": "#FFFFFF", "accent": "#005BAC"},
    "Elche CF": {"primary": "#007A33", "secondary": "#1E293B", "text": "#FFFFFF", "accent": "#007A33"},
    "RCD Espanyol": {"primary": "#007FC8", "secondary": "#1E293B", "text": "#FFFFFF", "accent": "#007FC8"},
    "Getafe CF": {"primary": "#005CA9", "secondary": "#0F172A", "text": "#FFFFFF", "accent": "#005CA9"},
    "Levante UD": {"primary": "#003366", "secondary": "#8B0000", "text": "#FFFFFF", "accent": "#CC0000"},
    "Real Madrid": {"primary": "#1E293B", "secondary": "#3B82F6", "text": "#FFFFFF", "accent": "#FEBE10"},
    "Málaga CF": {"primary": "#1D70B8", "secondary": "#0A2540", "text": "#FFFFFF", "accent": "#1D70B8"},
    "CA Osasuna": {"primary": "#0A1C2A", "secondary": "#D91A21", "text": "#FFFFFF", "accent": "#D91A21"},
    "R. Racing Club": {"primary": "#008751", "secondary": "#111111", "text": "#FFFFFF", "accent": "#008751"},
    "Rayo Vallecano": {"primary": "#D81E05", "secondary": "#1E293B", "text": "#FFFFFF", "accent": "#D81E05"},
    "Real Sociedad": {"primary": "#0067B1", "secondary": "#0B1D3A", "text": "#FFFFFF", "accent": "#0067B1"},
    "Sevilla FC": {"primary": "#D4001F", "secondary": "#111111", "text": "#FFFFFF", "accent": "#D4001F"},
    "Valencia CF": {"primary": "#111111", "secondary": "#FF6600", "text": "#FFFFFF", "accent": "#FF6600"},
    "Villarreal CF": {"primary": "#005187", "secondary": "#F5A623", "text": "#FFFFFF", "accent": "#FDE100"},
    "Cromos Conmemorativos -- Jugón 234": {"primary": "#2E1065", "secondary": "#581C87", "text": "#FFFFFF", "accent": "#C084FC"},
    "ADN LaLiga - Prime": {"primary": "#2D0A4E", "secondary": "#7928CA", "text": "#FFFFFF", "accent": "#FFE600"},
    "La Liga Fantasy": {"primary": "#064E3B", "secondary": "#059669", "text": "#FFFFFF", "accent": "#34D399"},
    "Draft 23": {"primary": "#0F172A", "secondary": "#334155", "text": "#FFFFFF", "accent": "#38BDF8"},
    "Draft 23 - Kromix": {"primary": "#1E1B4B", "secondary": "#4338CA", "text": "#FFFFFF", "accent": "#A855F7"},
    "Últimos Fichajes": {"primary": "#5B1238", "secondary": "#831843", "text": "#FFFFFF", "accent": "#F43F5E"},
    "Extra Sticker - Bronce": {"primary": "#451A03", "secondary": "#92400E", "text": "#FFFFFF", "accent": "#D97706"},
    "Extra Sticker - Plata": {"primary": "#1E293B", "secondary": "#64748B", "text": "#FFFFFF", "accent": "#E2E8F0"},
    "Extra Sticker - Oro": {"primary": "#422006", "secondary": "#854D0E", "text": "#FFFFFF", "accent": "#FACC15"},
}
DEFAULT_THEME_COLORS = {"primary": "#2E0854", "secondary": "#4C1D95", "text": "#FFFFFF", "accent": "#FFE600"}

# Patrones visuales del escudo (crest swatch), portados literalmente de los
# style="background: ..." de los 20 clubs en /tmp/stitch1/code.html.
PATTERNS = {
    "D. Alavés": "repeating-linear-gradient(90deg, #004FA3 0px, #004FA3 11px, #FFFFFF 11px, #FFFFFF 22px)",
    "Athletic Club": "repeating-linear-gradient(90deg, #EE2523 0px, #EE2523 11px, #FFFFFF 11px, #FFFFFF 22px)",
    "Atlético de Madrid": "repeating-linear-gradient(90deg, #CB3524 0px, #CB3524 8px, #FFFFFF 8px, #FFFFFF 16px, #004FA3 16px, #004FA3 22px)",
    "FC Barcelona": "repeating-linear-gradient(90deg, #004D98 0px, #004D98 11px, #A50044 11px, #A50044 22px)",
    "Real Betis": "repeating-linear-gradient(90deg, #00954C 0px, #00954C 11px, #FFFFFF 11px, #FFFFFF 22px)",
    "RC Celta": "linear-gradient(135deg, #87CEEB 0%, #87CEEB 50%, #FFFFFF 50%, #FFFFFF 100%)",
    "RC Deportivo": "repeating-linear-gradient(90deg, #0055A5 0px, #0055A5 11px, #FFFFFF 11px, #FFFFFF 22px)",
    "Elche CF": "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 30%, #00853F 30%, #00853F 70%, #FFFFFF 70%, #FFFFFF 100%)",
    "RCD Espanyol": "repeating-linear-gradient(90deg, #007AC1 0px, #007AC1 11px, #FFFFFF 11px, #FFFFFF 22px)",
    "Getafe CF": "linear-gradient(135deg, #005CA9 0%, #005CA9 75%, #CB3524 75%, #CB3524 100%)",
    "Levante UD": "repeating-linear-gradient(90deg, #004D98 0px, #004D98 11px, #7A0026 11px, #7A0026 22px)",
    "Real Madrid": "#FFFFFF",
    "Málaga CF": "repeating-linear-gradient(90deg, #FFFFFF 0px, #FFFFFF 11px, #1C98D5 11px, #1C98D5 22px)",
    "CA Osasuna": "linear-gradient(135deg, #D91A2A 0%, #D91A2A 50%, #001F4D 50%, #001F4D 100%)",
    "R. Racing Club": "repeating-linear-gradient(90deg, #00853F 0px, #00853F 11px, #FFFFFF 11px, #FFFFFF 22px)",
    "Rayo Vallecano": "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 38%, #E61B2B 38%, #E61B2B 62%, #FFFFFF 62%, #FFFFFF 100%)",
    "Real Sociedad": "repeating-linear-gradient(90deg, #0067B1 0px, #0067B1 11px, #FFFFFF 11px, #FFFFFF 22px)",
    "Sevilla FC": "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 60%, #D4002C 60%, #D4002C 100%)",
    "Valencia CF": "linear-gradient(135deg, #FFFFFF 0%, #FFFFFF 40%, #180e27 40%, #180e27 60%, #FF8C00 60%, #FF8C00 100%)",
    "Villarreal CF": "#FFF200",
}
# Bordes especiales para los escudos que son un color solido (Madrid, Villarreal).
PATTERN_BORDERS = {
    "Real Madrid": "#FEBE10",
    "Villarreal CF": "#004A97",
}


def load_stickers():
    wb = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
    ws = wb["Checklist"]
    stickers = []
    orden = 0
    for row in ws.iter_rows(min_row=4, values_only=True):
        obtenido, id_cromo, numero, nombre, equipo, _completo, edicion, _repes = row
        if id_cromo is None:
            continue
        stickers.append({
            "id": str(id_cromo),
            "numero": str(numero) if numero is not None else "",
            "nombre": str(nombre) if nombre is not None else "",
            "equipo": str(equipo) if equipo is not None else "",
            "edicion": str(edicion) if edicion is not None else "",
            "orden": orden,
        })
        orden += 1
    return stickers


def build_team_order(stickers):
    order = []
    for s in stickers:
        if s["equipo"] not in order:
            order.append(s["equipo"])
    return order


def build_themes(team_order):
    themes = {}
    for equipo in team_order:
        colors = COLORS.get(equipo, DEFAULT_THEME_COLORS)
        theme = dict(colors)
        theme["pattern"] = PATTERNS.get(equipo, colors["secondary"])
        if equipo in PATTERN_BORDERS:
            theme["patternBorder"] = PATTERN_BORDERS[equipo]
        themes[equipo] = theme
    return themes


def write_js_module(path: Path, exports: dict):
    lines = []
    for name, value in exports.items():
        lines.append(f"export const {name} = {json.dumps(value, ensure_ascii=False, indent=2)};")
    path.write_text("\n\n".join(lines) + "\n", encoding="utf-8")


def main():
    if not EXCEL_FILE.exists():
        raise SystemExit(f"No se encuentra {EXCEL_FILE}")

    stickers = load_stickers()
    team_order = build_team_order(stickers)
    club_order = [t for t in team_order if t not in SPECIAL_SECTIONS]
    special_present = [t for t in team_order if t in SPECIAL_SECTIONS]
    themes = build_themes(team_order)

    WEB_JS.mkdir(parents=True, exist_ok=True)
    WEB_DATA.mkdir(parents=True, exist_ok=True)

    write_js_module(WEB_JS / "data.js", {
        "STICKERS": stickers,
        "TEAM_ORDER": club_order,
        "SPECIAL_SECTIONS": special_present,
    })
    write_js_module(WEB_JS / "themes.js", {
        "THEMES": themes,
        "DEFAULT_THEME": {**DEFAULT_THEME_COLORS, "pattern": DEFAULT_THEME_COLORS["secondary"]},
    })

    if PROGRESS_FILE.exists():
        shutil.copyfile(PROGRESS_FILE, WEB_DATA / "initial-progress.json")
    else:
        (WEB_DATA / "initial-progress.json").write_text("[]", encoding="utf-8")

    print(f"{len(stickers)} cromos, {len(club_order)} clubs + {len(special_present)} secciones especiales "
          f"-> {WEB_JS / 'data.js'}, {WEB_JS / 'themes.js'}")


if __name__ == "__main__":
    main()
