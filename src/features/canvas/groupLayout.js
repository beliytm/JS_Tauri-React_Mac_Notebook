import { GROUP_MAX_WIDTH, GROUP_MIN_WIDTH } from '../../shared/constants.js';

// Экранный прямоугольник (client) -> прямоугольник на поле { x, y, w, h }
export function toWorldRect(rect, area, view) {
  return {
    x: (rect.left - area.left - view.x) / view.zoom,
    y: (rect.top - area.top - view.y) / view.zoom,
    w: (rect.right - rect.left) / view.zoom,
    h: (rect.bottom - rect.top) / view.zoom,
  };
}

// entries: [{ id, rect }]. Объекты встанут столбиком сверху вниз, как лежали на поле;
// рамка стартует в левом верхнем углу всех, ширина по самому широкому (в пределах min..max)
export function groupLayout(entries, area, view) {
  const placed = entries.map((entry) => ({ id: entry.id, ...toWorldRect(entry.rect, area, view) }));
  placed.sort((a, b) => a.y - b.y || a.x - b.x);
  const widest = Math.max(...placed.map((p) => p.w));
  return {
    ids: placed.map((p) => p.id),
    x: Math.min(...placed.map((p) => p.x)),
    y: Math.min(...placed.map((p) => p.y)),
    w: Math.min(GROUP_MAX_WIDTH, Math.max(GROUP_MIN_WIDTH, widest)),
  };
}

// Положение каждого элемента на поле: нужно, чтобы «Разъединить» вернул их на места
export function placementsFromRects(entries, area, view) {
  return entries.map((entry) => ({ id: entry.id, ...toWorldRect(entry.rect, area, view) }));
}
