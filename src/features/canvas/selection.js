// Рамка выделения и двойное нажатие. Прямоугольники: { left, top, right, bottom }.

export function rectFromPoints(a, b) {
  return {
    left: Math.min(a.x, b.x),
    top: Math.min(a.y, b.y),
    right: Math.max(a.x, b.x),
    bottom: Math.max(a.y, b.y),
  };
}

export function rectsIntersect(a, b) {
  return a.left <= b.right && a.right >= b.left && a.top <= b.bottom && a.bottom >= b.top;
}

// entries: [{ id, rect }] -> id тех, кого рамка задевает хотя бы краем
export function idsInRect(entries, rect) {
  return entries.filter((entry) => rectsIntersect(entry.rect, rect)).map((entry) => entry.id);
}

// prev, next: { t, x, y } — время и место нажатий
export function isDoublePress(prev, next, maxMs, maxDistance) {
  if (!prev) return false;
  return next.t - prev.t <= maxMs && Math.hypot(next.x - prev.x, next.y - prev.y) <= maxDistance;
}

export function sameIds(a, b) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}
