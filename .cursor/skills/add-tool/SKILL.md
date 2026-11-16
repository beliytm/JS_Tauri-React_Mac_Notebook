# add-tool: новый инструмент в баре

1. Иконка: строка в `src/shared/icons.js` (контур для viewBox 16).
2. Подпись: `STRINGS.toolbar.{name}` в `src/shared/strings.js`.
3. Строка в `TOOLS` в `src/features/toolbar/tools.js`: id, title, icon, creates (тип объекта или null).
4. Если creates != null: тип должен быть в `canvas/items/registry.js` (skill add-item-type).
Toolbar.jsx и Workspace.jsx не менять.

менял X -> этот тест: tools.js -> `src/Workspace.test.jsx` (кнопка и создание), в конце `npm run check`.
