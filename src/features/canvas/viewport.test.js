import { describe, expect, it } from 'vitest';
import { centerPlacement, fitPastedSize, panBy, pinchMetrics, pinchView, screenToWorld, zoomAt } from './viewport.js';

describe('viewport', () => {
  it('panBy сдвигает вид', () => {
    expect(panBy({ x: 1, y: 2, zoom: 1 }, 10, -2)).toEqual({ x: 11, y: 0, zoom: 1 });
  });

  it('zoomAt: точка под курсором остаётся на месте', () => {
    const view = { x: 30, y: 40, zoom: 1 };
    const before = screenToWorld(view, 200, 150);
    const next = zoomAt(view, 200, 150, -100);
    const after = screenToWorld(next, 200, 150);
    expect(next.zoom).toBeGreaterThan(1);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('zoomAt: масштаб ограничен пределами', () => {
    expect(zoomAt({ x: 0, y: 0, zoom: 1 }, 0, 0, 100000).zoom).toBe(0.1);
    expect(zoomAt({ x: 0, y: 0, zoom: 1 }, 0, 0, -100000).zoom).toBe(8);
  });

  it('fitPastedSize: Retina делится на pixelRatio, широкие ужимаются', () => {
    expect(fitPastedSize(800, 400, 2, 600)).toEqual({ w: 400, h: 200 });
    expect(fitPastedSize(3000, 1500, 1, 600)).toEqual({ w: 600, h: 300 });
  });

  it('centerPlacement: объект по центру видимой области', () => {
    expect(centerPlacement({ x: 0, y: 0, zoom: 1 }, 800, 600, 100, 50)).toEqual({ x: 350, y: 275 });
    expect(centerPlacement({ x: -100, y: 0, zoom: 2 }, 800, 600, 100, 50)).toEqual({ x: 200, y: 125 });
  });

  it('pinchMetrics: центр и расстояние', () => {
    expect(pinchMetrics({ x: 0, y: 0 }, { x: 6, y: 8 })).toEqual({ cx: 3, cy: 4, dist: 10 });
  });

  it('pinchView: разведение пальцев увеличивает, точка под центром не уходит', () => {
    const view = { x: 20, y: 30, zoom: 1 };
    const prev = { cx: 100, cy: 100, dist: 50 };
    const next = { cx: 100, cy: 100, dist: 100 };
    const out = pinchView(view, prev, next);
    expect(out.zoom).toBe(2);
    const before = screenToWorld(view, 100, 100);
    const after = screenToWorld(out, 100, 100);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it('pinchView: сдвиг центра двигает вид, нулевое расстояние ничего не ломает', () => {
    const view = { x: 0, y: 0, zoom: 1 };
    const moved = pinchView(view, { cx: 50, cy: 50, dist: 40 }, { cx: 70, cy: 60, dist: 40 });
    expect(moved).toEqual({ zoom: 1, x: 20, y: 10 });
    expect(pinchView(view, { cx: 0, cy: 0, dist: 0 }, { cx: 5, cy: 5, dist: 10 })).toBe(view);
  });
});
