# Liga Este 2026-27 — PWA de checklist de cromos

## Contexto

Ya existe una app Streamlit (`app.py`) que lee `checklist_este_2026_27.xlsx` y guarda el
progreso en `coleccion_progreso_laliga.json`. El usuario quiere sustituirla (sin tocar
la Streamlit, que se deja tal cual) por una web app con el diseño ya generado en Stitch
(`DESIGN.md` + dos pantallas exportadas), que pueda:

- Usarse sin conexión.
- Instalarse en el móvil (Add to Home Screen).
- Guardar todo el estado en el propio dispositivo, sin base de datos ni backend.

## Alcance

Una PWA estática (HTML/CSS/JS vanilla) publicada en GitHub Pages, que reproduce las dos
pantallas diseñadas en Stitch (Equipos, Cromos por equipo) y añade dos pantallas nuevas
en el mismo lenguaje visual (Repes, Stats) para completar la navegación de 4 pestañas que
ya aparece en el diseño exportado.

Fuera de alcance: multi-usuario, sincronización entre dispositivos, edición del catálogo
de cromos desde la UI (se regenera desde el Excel si cambia).

## Arquitectura

```
LigaEste/
  app.py, checklist_este_2026_27.xlsx, coleccion_progreso_laliga.json   (sin tocar)
  scripts/
    build_data.py          # Excel -> web/js/data.js (catálogo + orden oficial)
  web/                      # la PWA
    index.html              # shell único, 4 vistas renderizadas por JS (SPA ligera)
    manifest.webmanifest
    sw.js
    css/styles.css          # Tailwind compilado una vez (npx tailwindcss), sin CDN
    fonts/                  # Anybody, Plus Jakarta Sans, Space Grotesk, Material Symbols (subset), auto-alojadas
    icons/                  # iconos de instalación (192/512/maskable) + favicon
    js/
      data.js               # catálogo generado (no se edita a mano)
      themes.js             # colores/gradientes por equipo (portado de app.py THEMES)
      state.js              # localStorage: getState/setObtenido/setRepes/export/import
      views/
        equipos.js
        cromos.js
        repes.js
        stats.js
      app.js                # router de las 4 vistas + registro del service worker
    data/
      initial-progress.json # copia de coleccion_progreso_laliga.json, siembra única de localStorage
```

Sin build runtime: `styles.css` se compila una vez con Tailwind CLI y se versiona; la app
en producción es HTML/CSS/JS servido tal cual.

## Datos

- **Catálogo** (`data.js`): id, número, nombre, equipo/sección, edición, orden oficial.
  Generado por `scripts/build_data.py` desde la hoja `Checklist` del Excel. Se puede
  regenerar si el Excel cambia.
- **Estado del usuario** (`localStorage`, clave `liga-este-progreso`): `{ [ID_Cromo]: { obtenido: bool, repes: int } }`.
  - Primera carga: si `localStorage` está vacío, se siembra desde `data/initial-progress.json`
    (tu progreso real: 150 conseguidos, 36 repes).
  - Cada toggle/cambio de repes escribe inmediatamente en `localStorage`.
- **Backup manual**: botón "Exportar copia" descarga el estado actual como JSON; "Importar
  copia" lee un JSON y sustituye el estado. Cubre cambio de dispositivo o borrado accidental
  de datos del navegador.

## Pantallas

1. **Equipos** (dashboard, diseño Stitch #1): progreso global del álbum, buscador de cromos,
   lista de 20 clubs en orden oficial con barra de progreso, secciones especiales debajo.
   Tocar un equipo navega a Cromos filtrado por ese equipo.
2. **Cromos** (diseño Stitch #2): banner del club con stats (completado/faltan/repes),
   pills de filtro (Todos/Tinc/Falta/Repes), grid de cromos. Tocar un cromo en Falta lo
   marca Tinc; stepper +/- edita repes. Accesible también sin equipo preseleccionado
   (selector de equipo/sección arriba).
3. **Repes** (nueva, mismo lenguaje visual): lista de cromos con repes > 0 (mercado de
   intercambio) y lista de faltantes, cada una exportable (texto/JSON) — equivalente a la
   pestaña "Mercado de Repes" de la Streamlit.
4. **Stats** (nueva): KPIs globales (total/conseguidos/faltan/repes/%), progreso por
   equipo y por sección especial.

Buscador del header: filtra cromos por nombre/dorsal/ID en todo el catálogo; un resultado
lleva directamente a su equipo en la vista Cromos.

## Offline / instalación

- `manifest.webmanifest`: nombre, iconos, `display: standalone`, colores del tema (fondo
  `#180e27`, acento `#FFE600`).
- `sw.js`: precachea el app shell completo (HTML, CSS, JS, fuentes, iconos, `data.js`,
  `initial-progress.json`) con cache versionada; estrategia cache-first con actualización
  en segundo plano. Los datos de usuario nunca pasan por el service worker (viven solo en
  `localStorage`).
- Requiere HTTPS para poder instalarse — por eso se publica en GitHub Pages en vez de
  abrirse como `file://`.

## Publicación

`git init` en el proyecto (o subcarpeta `web/` como raíz de Pages), commit, creación de
repo en GitHub y push, con GitHub Pages sirviendo `web/`. Se pedirá confirmación explícita
antes de crear el repo remoto y hacer el push inicial.

## Testing

- Verificación manual en el navegador (Chrome/Edge desktop vía preview local) de las 4
  vistas, toggles de estado, export/import y funcionamiento offline (DevTools > Offline).
- Sin suite automatizada: es una app de un solo usuario sin lógica de negocio compleja;
  el riesgo se cubre con verificación manual guiada antes de dar la tarea por completada.
