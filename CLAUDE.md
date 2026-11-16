# Правила для любого GPT

Полный текст только в `docs/00_GPT-RULES.md`, `docs/01_GPT-LOGGER.md`, `docs/02_GPT-MODULAR.md`.
Карта папок — `AGENTS.md`. Сюда правила не копировать.

## Экономия токенов
Задача: строка в `AGENTS.md` через grep -> только нужные файлы.
Читать `grep -n` / `sed -n`, не весь файл; вывод команд резать `tail`/`grep`.
Одно решение, без обзора вариантов.

Перед «готово»: `npm run check` (Rust: `npm run check:all`). Подписи только в `src/shared/strings.js`.
