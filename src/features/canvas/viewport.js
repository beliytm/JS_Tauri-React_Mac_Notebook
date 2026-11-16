import { MAX_ZOOM, MIN_ZOOM, ZOOM_SPEED } from '../../shared/constants.js';

// Вид поля: { x, y, zoom }. cx, cy — точка курсора относительно поля.

export function panBy(view, dx, dy) {
  return { ...view, x: view.x + dx, y: view.y + dy };
}

// Масштаб вокруг курсора: точка под курсором остаётся на месте
export function zoomAt(view, cx, cy, deltaY) {
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom * Math.exp(-deltaY * ZOOM_SPEED)));
  const ratio = zoom / view.zoom;
  return { zoom, x: cx - (cx - view.x) * ratio, y: cy - (cy - view.y) * ratio };
}

export function screenToWorld(view, px, py) {
  return { x: (px - view.x) / view.zoom, y: (py - view.y) / view.zoom };
}

// Скриншот Retina в нормальном размере и не шире maxWidth
export function fitPastedSize(naturalWidth, naturalHeight, pixelRatio, maxWidth) {
  const baseWidth = naturalWidth / pixelRatio;
  const scale = Math.min(1, maxWidth / baseWidth);
  return { w: baseWidth * scale, h: (naturalHeight / pixelRatio) * scale };
}

// Левый верхний угол объекта w×h в центре видимой области
export function centerPlacement(view, areaWidth, areaHeight, w, h) {
  const center = screenToWorld(view, areaWidth / 2, areaHeight / 2);
  return { x: center.x - w / 2, y: center.y - h / 2 };
}

// Два пальца: prev и next — { cx, cy, dist } (центр и расстояние между пальцами).
// Точка поля под центром остаётся под центром: это и сдвиг, и масштаб.
export function pinchView(view, prev, next) {
  if (prev.dist === 0) return view;
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom * (next.dist / prev.dist)));
  const world = screenToWorld(view, prev.cx, prev.cy);
  return { zoom, x: next.cx - world.x * zoom, y: next.cy - world.y * zoom };
}

// Центр и расстояние между двумя точками касания
export function pinchMetrics(a, b) {
  return { cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2, dist: Math.hypot(a.x - b.x, a.y - b.y) };
}
