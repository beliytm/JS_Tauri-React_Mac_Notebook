// Объекты поля: [{id, type, x, y, ...}]. Чистые функции без React.

export function addItem(list, item) {
  return [...list, item];
}

export function moveItem(list, id, dx, dy) {
  return list.map((item) => (item.id === id ? { ...item, x: item.x + dx, y: item.y + dy } : item));
}

// Меняет поля объекта (patch — частичный объект)
export function updateItem(list, id, patch) {
  return list.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function removeItem(list, id) {
  return list.filter((item) => item.id !== id);
}

// Несколько объектов сразу (выделение рамкой)
export function moveItems(list, ids, dx, dy) {
  return list.map((item) => (ids.includes(item.id) ? { ...item, x: item.x + dx, y: item.y + dy } : item));
}

export function removeItems(list, ids) {
  return list.filter((item) => !ids.includes(item.id));
}

// «Объединить»: выбранные объекты (в порядке ids) становятся одной группой-столбиком.
// Если среди них уже есть группа, её содержимое вливается в новую.
export function groupItems(list, ids, layout, groupId) {
  if (ids.length < 2) return list;
  const byId = new Map(list.map((item) => [item.id, item]));
  const children = ids.flatMap((id) => {
    const item = byId.get(id);
    if (!item) return [];
    return item.type === 'group' ? item.children : [item];
  });
  const rest = list.filter((item) => !ids.includes(item.id));
  return [...rest, { id: groupId, type: 'group', x: layout.x, y: layout.y, w: layout.w, children }];
}

// «Разъединить»: содержимое группы возвращается на поле на своих местах (placements)
export function ungroupItem(list, groupId, placements) {
  const group = list.find((item) => item.id === groupId);
  if (!group || group.type !== 'group') return list;
  const placed = group.children.map((child) => {
    const place = placements.find((p) => p.id === child.id);
    if (!place) return child;
    const moved = { ...child, x: place.x, y: place.y };
    return child.type === 'image' ? { ...moved, w: place.w, h: place.h } : moved;
  });
  return [...list.filter((item) => item.id !== groupId), ...placed];
}

// Пустой текст после правки удаляется
export function commitText(list, id, value) {
  return list.flatMap((item) => {
    if (item.id !== id) return [item];
    return value ? [{ ...item, text: value }] : [];
  });
}

// Пустые тексты и ссылки (создали и ничего не ввели) выбрасываются
export function pruneEmpty(list) {
  return list.filter((item) => {
    if (item.type === 'text') return item.text;
    if (item.type === 'link') return item.url;
    if (item.type === 'group') return item.children.length > 0;
    return true;
  });
}

export function pruneEmptyByNote(itemsByNote) {
  return Object.fromEntries(Object.entries(itemsByNote).map(([noteId, list]) => [noteId, pruneEmpty(list)]));
}

export function dropNoteItems(itemsByNote, noteId) {
  return Object.fromEntries(Object.entries(itemsByNote).filter(([key]) => key !== noteId));
}
