import { log } from './log.js';

// Необработанные ошибки и отказы промисов тоже попадают в журнал
export function installErrorLogging() {
  window.addEventListener('error', (event) => {
    log(event.error ?? new Error(event.message), 'window.onerror', { file: event.filename, line: event.lineno });
  });
  window.addEventListener('unhandledrejection', (event) => {
    log(event.reason, 'unhandledrejection', {});
  });
}
