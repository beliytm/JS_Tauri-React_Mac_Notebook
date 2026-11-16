import { log } from './log.js';

// Открывает ссылку в браузере системы. В окне Tauri — через плагин opener,
// в обычном браузере (разработка) — новая вкладка. Только http и https.
export async function openUrl(href) {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    if ('__TAURI_INTERNALS__' in window) {
      const { openUrl: openWithSystem } = await import('@tauri-apps/plugin-opener');
      await openWithSystem(href);
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
    return true;
  } catch (error) {
    log(error, 'await openWithSystem(href)', { scheme: href.split(':')[0] });
    return false;
  }
}
