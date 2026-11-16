# add-item-type: новый тип объекта на поле

1. Компонент `src/features/canvas/items/{Name}Item.jsx`. Корень: `<ItemFrame className="{name}-item" ...>`
   (даёт data-item-id, выбор, перетаскивание; props см. `canvas/INDEX.md`). Кнопки и поля внутри:
   `onPointerDown={stopDrag}`. Нужен свой корень (img, contentEditable): `useItemDrag` и `data-item-id` вручную.
2. Стили в `items/{name}.css` (подключить в компоненте). Подписи в `shared/strings.js`, иконки в `shared/icons.js`.
3. Запись в `items/registry.js`: Component, create, startsEditing, renderKey.
4. Если создаётся инструментом: строка в `toolbar/tools.js` (skill add-tool).
5. Пустой объект после создания не нужен: правило в `pruneEmpty` (`itemsModel.js`) + тест.
6. Есть данные вне state.json (как src у картинки): `storageModel.js` (в т.ч. внутри групп) + `storage/DOCS.md`.
7. Тест компонента в `src/Workspace.test.jsx`.
Canvas.jsx и Workspace.jsx не менять.

менял X -> этот тест: itemsModel.js -> `canvas/itemsModel.test.js`; storageModel.js -> `storage/storage.test.js`;
компонент -> `src/Workspace.test.jsx`. В конце `npm run check`.
