import { describe, expect, it } from 'vitest';
import { groupLayout, placementsFromRects, toWorldRect } from './groupLayout.js';

const area = { left: 100, top: 50 };
const view = { x: 20, y: 10, zoom: 2 };
const rect = (left, top, right, bottom) => ({ left, top, right, bottom });

describe('groupLayout', () => {
  it('toWorldRect: учитывает позицию поля, сдвиг и масштаб', () => {
    expect(toWorldRect(rect(160, 90, 360, 190), area, view)).toEqual({ x: 20, y: 15, w: 100, h: 50 });
  });

  it('groupLayout: порядок сверху вниз, угол и ширина по самому широкому', () => {
    const entries = [
      { id: 'low', rect: rect(300, 400, 740, 500) },
      { id: 'top', rect: rect(200, 100, 500, 160) },
    ];
    const layout = groupLayout(entries, area, { x: 0, y: 0, zoom: 1 });
    expect(layout.ids).toEqual(['top', 'low']);
    expect(layout).toMatchObject({ x: 100, y: 50, w: 440 });
  });

  it('groupLayout: ширина в пределах 220..480', () => {
    const narrow = groupLayout([{ id: 'a', rect: rect(100, 50, 150, 80) }], area, { x: 0, y: 0, zoom: 1 });
    const wide = groupLayout([{ id: 'a', rect: rect(100, 50, 1100, 80) }], area, { x: 0, y: 0, zoom: 1 });
    expect(narrow.w).toBe(220);
    expect(wide.w).toBe(480);
  });

  it('placementsFromRects: id сохраняются', () => {
    const placed = placementsFromRects([{ id: 'a', rect: rect(160, 90, 360, 190) }], area, view);
    expect(placed).toEqual([{ id: 'a', x: 20, y: 15, w: 100, h: 50 }]);
  });
});
