# storage

Сохранение заметок и объектов поля. Автосохранение через 300 мс после правки.

## Формат (папка данных приложения macOS)

state.json = { version, notes, activeId, items }; в items у картинок нет src
images/{id}.txt = data URL картинки (отдельный файл на картинку)
Запись атомарная (tmp + rename). Картинки пишутся раньше state.json.

## Команды Rust (src-tauri/src/main.rs)

load_state() -> строка JSON или пусто
save_state(json), load_image(id), save_image(id, data)
id: только буквы, цифры, - и _ (check_id)

## JS

storage.js = loadWorkspace, saveWorkspace; бэкенд Tauri или localStorage (в браузере)
storageModel.js = serialize/parse (чистые функции)
useAutosave.js = запись с задержкой
Битый или чужой state.json -> загрузка вернёт null, старт с DEFAULT_WORKSPACE.

## Миграции при чтении (STATE_VERSION не менялся)

Карточка «Поле» раньше хранила address/date/time в объекте; теперь cells: [{id, kind, value}].
Старый формат превращается в новый при загрузке (`migrateFieldsItem`), потерь нет.

Группа (type group) хранит children; картинки внутри групп тоже выносятся в images/{id}.

## Чистка картинок

После каждого успешного сохранения бэкенд получает id всех нужных картинок (включая внутри групп) и удаляет
остальные файлы images/. Rust-команда `cleanup_images` трогает только файлы, не менявшиеся больше 7 дней
(защита, если состояние не загрузилось). Сбой чистки не считается сбоем сохранения.

## Как менять формат данных

1. Старый формат оставить читаемым: миграция в `parseWorkspace` (как `migrateFieldsItem`), без потери данных.
2. Ломающее изменение: поднять `STATE_VERSION` и написать миграцию из прошлой версии.
3. Тест в `storage.test.js` на старый формат, затем `npm run check:all`.
4. Записать изменение здесь и в `PROTECTED.md`.

## Ограничения

Картинка хранится как data URL (больше файла примерно на треть).
