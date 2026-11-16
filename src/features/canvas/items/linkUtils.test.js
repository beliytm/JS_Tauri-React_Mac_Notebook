import { describe, expect, it } from 'vitest';
import { linkLabel, normalizeUrl } from './linkUtils.js';

describe('normalizeUrl', () => {
  it('добавляет https:// если схемы нет', () => {
    expect(normalizeUrl('olx.ua/d/uk/obyavlenie/x-IDabc.html')).toBe('https://olx.ua/d/uk/obyavlenie/x-IDabc.html');
  });

  it('оставляет http и https как есть', () => {
    expect(normalizeUrl('http://example.com/a?b=1')).toBe('http://example.com/a?b=1');
    expect(normalizeUrl('https://example.com')).toBe('https://example.com/');
  });

  it('не ссылка: пустое, с пробелами, без точки, чужая схема', () => {
    expect(normalizeUrl('')).toBeNull();
    expect(normalizeUrl('привет мир')).toBeNull();
    expect(normalizeUrl('localhost')).toBeNull();
    expect(normalizeUrl('javascript:alert(1)')).toBeNull();
  });
});

describe('linkLabel', () => {
  it('показывает только домен без www', () => {
    expect(linkLabel('https://www.olx.ua/d/uk/obyavlenie/very-long-slug-IDabc.html?x=1')).toBe('olx.ua');
    expect(linkLabel('booking.com/hotel/pl/abc')).toBe('booking.com');
  });

  it('не ссылку обрезает до разумной длины', () => {
    expect(linkLabel('коротко')).toBe('коротко');
    expect(linkLabel('очень длинный текст который не ссылка совсем')).toBe('очень длинный текст кото…');
  });
});
