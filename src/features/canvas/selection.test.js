import { describe, expect, it } from 'vitest';
import { idsInRect, isDoublePress, rectFromPoints, rectsIntersect, sameIds } from './selection.js';

describe('selection', () => {
  it('rectFromPoints: рамка тянется в любую сторону', () => {
    expect(rectFromPoints({ x: 10, y: 20 }, { x: 4, y: 30 })).toEqual({ left: 4, top: 20, right: 10, bottom: 30 });
  });

  it('rectsIntersect: касание краем считается', () => {
    const box = { left: 0, top: 0, right: 10, bottom: 10 };
    expect(rectsIntersect(box, { left: 10, top: 5, right: 20, bottom: 8 })).toBe(true);
    expect(rectsIntersect(box, { left: 11, top: 0, right: 20, bottom: 10 })).toBe(false);
  });

  it('idsInRect: берёт только тех, кого задела рамка', () => {
    const entries = [
      { id: 'a', rect: { left: 0, top: 0, right: 10, bottom: 10 } },
      { id: 'b', rect: { left: 100, top: 100, right: 110, bottom: 110 } },
    ];
    expect(idsInRect(entries, { left: 5, top: 5, right: 50, bottom: 50 })).toEqual(['a']);
  });

  it('isDoublePress: быстро и рядом — да; долго или далеко — нет', () => {
    const first = { t: 1000, x: 100, y: 100 };
    expect(isDoublePress(first, { t: 1200, x: 104, y: 98 }, 350, 12)).toBe(true);
    expect(isDoublePress(first, { t: 1500, x: 100, y: 100 }, 350, 12)).toBe(false);
    expect(isDoublePress(first, { t: 1100, x: 200, y: 100 }, 350, 12)).toBe(false);
    expect(isDoublePress(null, { t: 1100, x: 100, y: 100 }, 350, 12)).toBe(false);
  });

  it('sameIds', () => {
    expect(sameIds(['a', 'b'], ['a', 'b'])).toBe(true);
    expect(sameIds(['a'], ['a', 'b'])).toBe(false);
  });
});
