const MAX_DATE_DIGITS = 8;
const MAX_TIME_DIGITS = 4;

// Цифры 21122026 -> 21.12.2026. Точка ставится, когда набрана следующая цифра,
// поэтому стирать можно как обычно. Если в тексте есть буквы или другие знаки
// (например «завтра»), он остаётся как есть.
export function formatDateInput(raw) {
  if (!/^[\d.]*$/.test(raw)) return raw;
  const digits = raw.replace(/\D/g, '').slice(0, MAX_DATE_DIGITS);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean);
  return parts.join('.');
}

// Цифры 1830 -> 18:30. Двоеточие ставится на следующей цифре. Буквы и другие знаки не трогаем.
export function formatTimeInput(raw) {
  if (!/^[\d:]*$/.test(raw)) return raw;
  const digits = raw.replace(/\D/g, '').slice(0, MAX_TIME_DIGITS);
  return [digits.slice(0, 2), digits.slice(2)].filter(Boolean).join(':');
}
