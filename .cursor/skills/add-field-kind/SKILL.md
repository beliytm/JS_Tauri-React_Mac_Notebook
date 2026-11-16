# add-field-kind: новый вид ячейки в карточке «Поле» (телефон, e-mail, ...)

1. Подпись: `STRINGS.kinds.{id}` в `src/shared/strings.js`.
2. Запись в `FIELD_KINDS` в `canvas/items/fieldKinds.js`: id, label, format (автоформат, необязательно),
   isLink (если ячейка-ссылка). Меню «+» подхватит вид само.
3. Автоформат: чистая функция в `items/fieldFormat.js` + тест в `fieldFormat.test.js`.
4. Старые карточки не ломаются: ячейки хранят `kind` строкой, неизвестный вид показывается по id.
FieldsItem.jsx менять не нужно.

менял X -> этот тест: fieldFormat.js -> `fieldFormat.test.js`; fieldKinds.js -> `fieldsModel.test.js`; в конце `npm run check`.
