import { invoke } from '@tauri-apps/api/core';

// Лог в формате GPT-LOGGER: одна JSON-строка {f,e,c,ctx}.
// В консоль всегда; в окне Tauri ещё и в файл log.jsonl (папка данных приложения).
export function log(error, code, vars = {}) {
  const where = (error?.stack ?? '').split('\n')[1]?.trim() ?? '';
  const ctx = Object.entries(vars)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
  const line = JSON.stringify({ f: where, e: String(error?.message ?? error), c: code, ctx });
  console.error(line);
  if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
    // Сбой самого журнала логировать нечем: только консоль, иначе получится цикл
    invoke('append_log', { line }).catch((writeError) => console.error(`log file write failed: ${writeError}`));
  }
}
