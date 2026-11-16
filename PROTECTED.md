# Защищённые пути

Не удалять и не переписывать без явной просьбы владельца.

- формат `state.json` (`version`, `notes`, `activeId`, `items`) и `images/{id}.txt`: данные пользователя
- `STATE_VERSION` в `src/shared/constants.js`: менять только вместе с миграцией старых файлов
- команды Rust `load_state`, `save_state`, `load_image`, `save_image`: публичные имена
- `check_id` и `write_atomic` в `src-tauri/src/main.rs`: защита путей и целостность файлов
- id заметок и объектов (`n…`, `t…`, `i…`): не переименовывать
- `src-tauri/capabilities/default.json`: права окна (core, opener); без `opener:default` ссылки в окне не откроются
- команды Rust `append_log`, `cleanup_images` и отсрочка 7 дней в `cleanup_dir`: защита от потери картинок
- `check_id`: все id из JS идут в имена файлов
- формат `shared/log.js` `{f,e,c,ctx}` и файл `log.jsonl`: по нему разбирают баги
