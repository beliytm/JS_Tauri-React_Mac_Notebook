import { describe, expect, it } from 'vitest';
import { formatDateInput, formatTimeInput } from './fieldFormat.js';

describe('formatDateInput', () => {
  it('21122026 -> 21.12.2026', () => {
    expect(formatDateInput('21122026')).toBe('21.12.2026');
  });

  it('набор по цифрам: точка появляется на следующей цифре', () => {
    expect(formatDateInput('21')).toBe('21');
    expect(formatDateInput('211')).toBe('21.1');
    expect(formatDateInput('21122')).toBe('21.12.2');
  });

  it('стирание: 21.1 -> 21. -> 21', () => {
    expect(formatDateInput('21.')).toBe('21');
  });

  it('уже с точками остаётся тем же', () => {
    expect(formatDateInput('21.12.2026')).toBe('21.12.2026');
  });

  it('лишние цифры отрезаются', () => {
    expect(formatDateInput('2112202699')).toBe('21.12.2026');
  });

  it('текст с буквами не трогаем', () => {
    expect(formatDateInput('завтра')).toBe('завтра');
    expect(formatDateInput('21/12')).toBe('21/12');
  });
});

describe('formatTimeInput', () => {
  it('1830 -> 18:30', () => {
    expect(formatTimeInput('1830')).toBe('18:30');
  });

  it('набор по цифрам: двоеточие появляется на следующей цифре', () => {
    expect(formatTimeInput('18')).toBe('18');
    expect(formatTimeInput('183')).toBe('18:3');
  });

  it('стирание: 18: -> 18', () => {
    expect(formatTimeInput('18:')).toBe('18');
  });

  it('уже с двоеточием остаётся тем же, лишние цифры отрезаются', () => {
    expect(formatTimeInput('18:30')).toBe('18:30');
    expect(formatTimeInput('183099')).toBe('18:30');
  });

  it('текст с буквами не трогаем', () => {
    expect(formatTimeInput('вечером')).toBe('вечером');
    expect(formatTimeInput('18.30')).toBe('18.30');
  });
});
