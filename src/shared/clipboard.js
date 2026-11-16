import { log } from './log.js';

// Копирование через временное поле: работает сразу по клику, без запроса разрешений.
function copyViaField(text) {
  const field = document.createElement('textarea');
  field.value = text;
  field.style.position = 'fixed';
  field.style.opacity = '0';
  document.body.appendChild(field);
  field.select();
  try {
    return document.execCommand('copy');
  } finally {
    field.remove();
  }
}

// Вызывать из обработчика клика. Сначала временное поле (не зависает на разрешениях),
// при отказе — Clipboard API. true — получилось.
export async function copyText(text) {
  try {
    if (copyViaField(text)) return true;
  } catch (fieldError) {
    log(fieldError, "document.execCommand('copy')", { length: text.length });
  }
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (apiError) {
    log(apiError, 'await navigator.clipboard.writeText(text)', { length: text.length });
    return false;
  }
}
