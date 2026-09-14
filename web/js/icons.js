// Iconos SVG inline (reemplazan la fuente Material Symbols de los mockups de
// Stitch para no depender de un webfont de iconos en el modo offline).
// Cada path usa currentColor, así que el color se controla con clases de texto.
const PATHS = {
  search: 'M10 4a6 6 0 1 0 3.76 10.66l5.29 5.29a1 1 0 0 0 1.42-1.42l-5.3-5.29A6 6 0 0 0 10 4Zm-4 6a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z',
  qr_code_scanner: 'M4 4h6v6H4V4Zm2 2v2h2V6H6Zm8-2h6v6h-6V4Zm2 2v2h2V6h-2ZM4 14h6v6H4v-6Zm2 2v2h2v-2H6ZM14 14h2v2h-2v-2Zm4 0h2v2h-2v-2ZM14 18h2v2h-2v-2Zm4 0h2v2h-2v-2Z',
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z',
  auto_awesome: 'M11 3v4l-3 1 3 1v4l1-3 3-1-3-1-1-4Zm7 6v3l-2 .7 2 .7v3l.8-2.4 2.2-.7-2.2-.7L18 9ZM6 12v3l-2.5.8L6 16.6V20l1-3.4 3-.9-3-.9L6 12Z',
  add_box: 'M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Zm6 4h2v4h4v2h-4v4h-2v-4H7v-2h4V7Z',
  swap_calls: 'M8 3 4 7l4 4V8h8V6H8V3Zm8 10-4 4 4 4v-3h8v-2h-8v-3Z',
  hourglass_top: 'M6 2h12v2l-4 5 4 5v2H6v-2l4-5-4-5V2Zm2 2.5 3 3.5h2l3-3.5H8ZM8 19.5h8L12.5 15h-1L8 19.5Z',
  apps: 'M5 5h3v3H5V5Zm5.5 0h3v3h-3V5ZM16 5h3v3h-3V5ZM5 10.5h3v3H5v-3Zm5.5 0h3v3h-3v-3Zm5.5 0h3v3h-3v-3ZM5 16h3v3H5v-3Zm5.5 0h3v3h-3v-3Zm5.5 0h3v3h-3v-3Z',
  verified: 'm12 2 2.4 1.9 3-.5 1 2.9 2.9 1-.5 3L23 12l-1.9 2.4.5 3-2.9 1-1 2.9-3-.5L12 23l-2.4-1.9-3 .5-1-2.9-2.9-1 .5-3L1 12l1.9-2.4-.5-3 2.9-1 1-2.9 3 .5L12 2Zm-1.1 13.4 5.7-5.7-1.4-1.4-4.3 4.3-2.1-2.1-1.4 1.4 3.5 3.5Z',
  pending: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM7 13a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z',
  bolt: 'M13 2 4 14h6l-1 8 9-12h-6l1-8Z',
  sort: 'M6 8h12l-6-6-6 6Zm12 8H6l6 6 6-6Z',
  chevron_right: 'm9 6 6 6-6 6-1.4-1.4L12.2 12 7.6 7.4 9 6Z',
  stars: 'm12 2 2.2 5.8L20 9l-4.6 3.9L16.8 19 12 15.8 7.2 19l1.4-6.1L4 9l5.8-1.2L12 2Z',
  shield: 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z',
  priority_high: 'M11 3h2l-.5 11h-1L11 3ZM12 17a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z',
  cancel: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm3.5 12.1-1.4 1.4L12 13.4l-2.1 2.1-1.4-1.4L10.6 12l-2.1-2.1 1.4-1.4L12 10.6l2.1-2.1 1.4 1.4L13.4 12l2.1 2.1Z',
  layers: 'm12 2 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5 0 0v0l-9 5-9-5Zm0 5 9 5 9-5-9 5-9-5Z',
  check_circle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.5 14.5L6 12l1.4-1.4 3.1 3.1 6.1-6.1L18 9Z',
  radio_button_unchecked: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z',
  star: 'm12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.1 5.9 20.6l1.4-6.8-5.1-4.7 6.9-.8L12 2Z',
  hotel_class: 'm12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.1 5.9 20.6l1.4-6.8-5.1-4.7 6.9-.8L12 2ZM4 20h16v2H4v-2Z',
  grid_view: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z',
  view_agenda: 'M4 4h16v6H4V4Zm0 8h16v2H4v-2Zm0 4h16v4H4v-4Z',
  swap_horizontal_circle: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-3 6 3-3v2h5v2h-5v2l-3-3Zm6 8-3 3v-2H7v-2h5v-2l3 3Z',
  analytics: 'M5 3v18h16v-2H7V3H5Zm4 12h2V9H9v6Zm4 0h2V5h-2v10Zm4 0h2v-4h-2v4Z',
  close: 'm6.4 5 12.6 12.6-1.4 1.4L5 6.4 6.4 5Zm12.6 1.4L6.4 19 5 17.6 17.6 5 19 6.4Z',
  add: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z',
  download: 'M5 20h14v-2H5v2Zm7-16v10.2l3.6-3.6 1.4 1.4-6 6-6-6 1.4-1.4L11 14.2V4h1Z',
  upload: 'M5 20h14v-2H5v2Zm6-16 6 6-1.4 1.4L12 7.8V18h-1V7.8L7.4 11.4 6 10l6-6Z',
};

export function icon(name, className = 'w-5 h-5') {
  const d = PATHS[name];
  if (!d) return '';
  return `<svg class="${className}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
}
