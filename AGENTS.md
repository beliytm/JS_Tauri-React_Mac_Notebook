# Карта проекта

Notebook: блокнот для Mac. Текст, картинки, ссылки и карточки на бесконечном поле, как в Figma.
Стек: Tauri 2 (Rust) + React + Vite. Платформа: macOS (iOS подготовлен, не проверен).
Дизайн как в `JS_React-Node_Site_AdminPanel` (тёмный, Geist Mono, тонкие рамки).
Не трогать: `PROTECTED.md`. Публичные id не переименовывать.

## Правила кода
Фича = папка `src/features/{name}/`, стили и тесты рядом. `src/Workspace.jsx` только собирает фичи.
Логика в хуках, чистая логика в `*Model.js`, `viewport.js`, `selection.js`, `groupLayout.js` (их тестируют).
Фичи друг друга не импортируют (исключение: storage берёт чистые модели canvas). Связь через реестры:
`toolbar/tools.js`, `canvas/items/registry.js`, `canvas/items/fieldKinds.js`.
Общее в `src/shared/`: `constants.js` (числа), `strings.js` (все подписи), `icons.js` + `Icon.jsx` (иконки),
`log.js` (ошибки только через `log()`), `clipboard.js`, `openUrl.js`, `ErrorBoundary.jsx`.
Числа не писать в коде, русские подписи не писать в компонентах: в `constants.js` и `strings.js`.
Файл больше ~400 строк или функция больше ~80 строк: делить по смыслу.

## Проверка (обязательно перед "готово")
`npm run check` = линтер + формат + тесты + сборка. Rust: `npm run check:all` (добавляет `cargo test`).
Форматирование правит `npm run format`. UI менял: ещё посмотреть в окне или на `http://localhost:1420`.
После правки хуков горячее обновление может сломать открытое окно: перезапустить `npm run tauri dev` или ⌘R.

## Задача -> папка -> skill -> тест

| Задача | Папка | Skill | Тест |
|--------|-------|-------|------|
| Новый тип объекта на поле | `canvas/items/` · `canvas/INDEX.md` | `add-item-type` | `canvas/itemsModel.test.js` `Workspace.test.jsx` |
| Новый вид ячейки карточки «Поле» | `canvas/items/fieldKinds.js` + `strings.js` | `add-field-kind` | `fieldsModel.test.js` `fieldFormat.test.js` |
| Новый инструмент в баре | `toolbar/tools.js` + `strings.js` + `icons.js` | `add-tool` | `Workspace.test.jsx` |
| Сдвиг, масштаб, щипок, вставка картинки | `canvas/` (`viewport.js`, `useViewport.js`, `usePasteImage.js`) | | `canvas/viewport.test.js` |
| Выбор, перемещение, удаление, ⌘A | `canvas/useCanvasItems.js`, `itemsModel.js` | | `canvas/itemsModel.test.js` |
| Рамка выделения (два быстрых нажатия) | `canvas/useMarquee.js`, `selection.js` | | `canvas/selection.test.js` |
| Объединить / разъединить | `canvas/items/GroupItem.jsx`, `groupLayout.js`, `itemsModel.js` | | `groupLayout.test.js` `Workspace.test.jsx` |
| Ссылки (инструмент и ячейка) | `canvas/items/LinkItem.jsx`, `LinkRow.jsx`, `linkUtils.js`, `shared/openUrl.js` | | `linkUtils.test.js` |
| Заметки (список, имя, удаление) | `features/notes/` | | `notes/notesModel.test.js` |
| Сохранение, загрузка, чистка картинок | `features/storage/` · `storage/DOCS.md` | | `storage/storage.test.js` |
| Файлы, журнал, чистка (Rust) | `src-tauri/src/lib.rs` (`main.rs` только вызывает `run()`) | | `cargo test` |
| Падение интерфейса, журнал | `shared/ErrorBoundary.jsx`, `shared/log.js` | | `shared/ErrorBoundary.test.jsx` |
| Стили: общие, цвета, макет телефона | `styles/base.css` (`@media max-width: 500px`) | | |
| Стили объектов | `canvas/canvas.css` (поле) и `canvas/items/*.css` (по типам) | | |
| Права окна, настройки окна | `src-tauri/capabilities/default.json`, `tauri.conf.json` | | |

## Журнал ошибок
Все `log()` идут в консоль, а в окне Tauri ещё и в файл
`~/Library/Application Support/com.beliytm.notebook/log.jsonl` (формат `{f,e,c,ctx}`, до 512 КБ, потом `log.old.jsonl`).
Необработанные ошибки и падения React тоже пишутся туда. При разборе бага сначала читать этот файл.

## iOS (подготовлено, на телефоне не проверялось)
Готово: `lib.rs` с `mobile_entry_point`, жесты, выезжающая панель, safe-area, кнопки «картинка» и «удалить» (при `hover: none`).
Первый запуск: Xcode + `rustup target add aarch64-apple-ios aarch64-apple-ios-sim`, затем `npm run tauri ios init` и `npm run tauri ios dev`.
`src-tauri/gen/` не коммитится. Правка для Mac не должна ломать телефон: не опираться только на hover и только на клавиши.
Данные между Mac и телефоном не синхронизируются.
