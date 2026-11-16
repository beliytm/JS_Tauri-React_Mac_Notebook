# canvas

Бесконечное поле: сдвиг, масштаб, объекты (текст, картинки, ссылки, карточки «Поле», группы).

## Файлы

Canvas.jsx = разметка поля; рисует объекты по реестру
items/registry.js = типы объектов (Component, create, startsEditing, renderKey)
items/TextItem.jsx, ImageItem.jsx = текст и картинка (свой корневой элемент: contentEditable / img)
items/FieldsItem.jsx = карточка с ячейками; части: FieldCell.jsx (ячейка), AddCellMenu.jsx («+»), LinkRow.jsx (свёрнутая ссылка)
items/LinkItem.jsx = отдельная ссылка; items/GroupItem.jsx = группа («Объединить»), типы детей берёт через `getItemType`
items/ItemFrame.jsx = общая оболочка с div-корнем (место, data-item-id, выбор, перетаскивание); используют Fields, Link, Group
items/useCopy.js = копирование с галочкой; items/stopDrag.js = клик по кнопке не тянет объект
items/fieldKinds.js = виды ячеек; fieldsModel.js = логика ячеек; fieldFormat.js = автоформат даты и времени; linkUtils.js = подпись и адрес ссылки
useCanvasItems.js = объекты по заметкам, выбор, правка, Delete
useViewport.js = вид (сдвиг, колесо, щипок на трекпаде, два пальца); математика в viewport.js
usePasteImage.js = ⌘V картинка из буфера; imageFile.js = файл -> объект картинки (общее для ⌘V и кнопки на телефоне)
useItemDrag.js = выбор и перетаскивание объекта (двигается вся выделенная группа)
useMarquee.js, selection.js = рамка выделения: два быстрых нажатия на пустом месте, второе тянуть; объекты находятся по `data-item-id`
itemsModel.js, viewport.js, groupLayout.js = чистая логика (тесты рядом); группы: groupItems/ungroupItem
canvas.css = стили поля (сетка, рамка выделения, кнопки, обводка); items/*.css = стили по типам

## Контракт компонента типа

props: item, zoom, getItemType, isSelected, isEditing, onSelect, onMove, onChange(id, patch), onRemove(id), onStartEdit, onCommit
Объект: { id, type, x, y, ... }. id только буквы и цифры.
Корневой элемент компонента обязан иметь `data-item-id={item.id}` (по нему работает рамка выделения).

## Правила

Нового типа в Canvas.jsx не писать: запись в registry.js + компонент.
Подписи только из `shared/strings.js`, иконки из `shared/icons.js`.
Менял логику -> `npm run check`.
