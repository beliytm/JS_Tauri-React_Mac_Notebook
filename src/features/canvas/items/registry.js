// Реестр типов объектов поля. Новый тип = компонент + одна запись здесь.
// Component получает: item, zoom, isSelected, isEditing, onSelect, onMove, onStartEdit, onCommit.
// create — фабрика объекта; startsEditing — сразу открыть ввод; renderKey — когда перемонтировать.
import { makeId } from '../../../shared/ids.js';
import ImageItem from './ImageItem.jsx';
import FieldsItem from './FieldsItem.jsx';
import GroupItem from './GroupItem.jsx';
import LinkItem from './LinkItem.jsx';
import { defaultCells } from './fieldsModel.js';
import TextItem from './TextItem.jsx';

export const ITEM_TYPES = {
  text: {
    Component: TextItem,
    startsEditing: true,
    create: ({ x, y }) => ({ id: makeId('t'), type: 'text', x, y, text: '' }),
    // Текст правится в DOM напрямую, поэтому после сохранения блок пересоздаётся
    renderKey: (item) => `${item.id}:${item.text}`,
  },
  image: {
    Component: ImageItem,
    startsEditing: false,
    create: ({ x, y, src, w, h }) => ({ id: makeId('i'), type: 'image', x, y, src, w, h }),
    renderKey: (item) => item.id,
  },
  link: {
    Component: LinkItem,
    startsEditing: false,
    create: ({ x, y }) => ({ id: makeId('l'), type: 'link', x, y, url: '' }),
    renderKey: (item) => item.id,
  },
  // Создаётся только кнопкой «Объединить» (create нет), а не инструментом
  group: {
    Component: GroupItem,
    startsEditing: false,
    renderKey: (item) => item.id,
  },
  fields: {
    Component: FieldsItem,
    startsEditing: false,
    create: ({ x, y }) => ({ id: makeId('f'), type: 'fields', x, y, cells: defaultCells() }),
    renderKey: (item) => item.id,
  },
};

export function getItemType(type) {
  return ITEM_TYPES[type] ?? null;
}
