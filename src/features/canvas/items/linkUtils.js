const MAX_LABEL_LENGTH = 24;

// Ссылка без http(s) считается https://. null — на ссылку не похоже (пробелы, нет точки).
export function normalizeUrl(value) {
  const text = value.trim();
  if (!text || /\s/.test(text)) return null;
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`;
  try {
    const url = new URL(withScheme);
    if (!url.hostname.includes('.')) return null;
    return url.href;
  } catch {
    return null;
  }
}

// Короткая подпись вместо длинной ссылки: olx.ua, а не весь адрес
export function linkLabel(value) {
  const href = normalizeUrl(value);
  if (!href) {
    const text = value.trim();
    return text.length > MAX_LABEL_LENGTH ? `${text.slice(0, MAX_LABEL_LENGTH)}…` : text;
  }
  return new URL(href).hostname.replace(/^www\./, '');
}
