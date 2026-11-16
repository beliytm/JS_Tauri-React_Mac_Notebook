import { STATE_VERSION } from '../../shared/constants.js';
import { pruneEmptyByNote } from '../canvas/itemsModel.js';
import { migrateFieldsItem } from '../canvas/items/fieldsModel.js';

// Формат файла state.json: { version, notes, activeId, items }.
// Картинки в JSON без src: сами данные лежат в отдельных файлах images/{id}.

// Картинки бывают и внутри групп, поэтому обход рекурсивный
function stripItem(item, images) {
  if (item.type === 'group') return { ...item, children: item.children.map((child) => stripItem(child, images)) };
  if (item.type !== 'image') return item;
  images.push({ id: item.id, src: item.src });
  const { src, ...rest } = item;
  return rest;
}

function restoreItem(item) {
  if (item.type === 'group') return { ...item, children: item.children.map(restoreItem) };
  return item.type === 'image' ? { ...item, src: '' } : migrateFieldsItem(item);
}

// Все объекты-картинки, включая вложенные в группы
export function collectImages(itemsByNote) {
  const found = [];
  const visit = (item) =>
    item.type === 'group' ? item.children.forEach(visit) : item.type === 'image' && found.push(item);
  Object.values(itemsByNote).flat().forEach(visit);
  return found;
}

export function serializeWorkspace({ notes, activeId, items }) {
  const images = [];
  const cleanItems = {};
  for (const [noteId, list] of Object.entries(pruneEmptyByNote(items))) {
    cleanItems[noteId] = list.map((item) => stripItem(item, images));
  }
  const json = JSON.stringify({ version: STATE_VERSION, notes, activeId, items: cleanItems });
  return { json, images };
}

// null — файла нет, он повреждён или другой версии
export function parseWorkspace(json) {
  if (!json) return null;
  const data = JSON.parse(json);
  const isValid =
    data?.version === STATE_VERSION &&
    Array.isArray(data.notes) &&
    data.items !== null &&
    typeof data.items === 'object';
  if (!isValid) return null;
  const items = {};
  for (const [noteId, list] of Object.entries(data.items)) {
    items[noteId] = list.map(restoreItem);
  }
  return { notes: data.notes, activeId: data.activeId ?? null, items };
}
