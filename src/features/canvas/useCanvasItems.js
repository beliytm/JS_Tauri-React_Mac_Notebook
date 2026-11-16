import { useEffect, useState } from 'react';
import { makeId } from '../../shared/ids.js';
import {
  addItem,
  commitText,
  dropNoteItems,
  groupItems,
  moveItems,
  pruneEmptyByNote,
  removeItems,
  ungroupItem,
  updateItem,
} from './itemsModel.js';
import { getItemType } from './items/registry.js';

// Объекты поля по заметкам, выбор и правка. activeId — какая заметка открыта.
export default function useCanvasItems({ initialItems, activeId }) {
  const [itemsByNote, setItemsByNote] = useState(initialItems);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Другая заметка: сбрасываем выбор и правку, недописанные пустые тексты убираем
  useEffect(() => {
    setSelectedIds([]);
    setEditingId(null);
    setItemsByNote((prev) => pruneEmptyByNote(prev));
  }, [activeId]);

  function updateActive(update) {
    setItemsByNote((prev) => ({ ...prev, [activeId]: update(prev[activeId] ?? []) }));
  }

  function deleteSelected() {
    updateActive((list) => removeItems(list, selectedIds));
    setSelectedIds([]);
  }

  // Клик по объекту: если он уже в выделении, группа остаётся (чтобы тянуть всех вместе)
  function select(id) {
    if (id === null) setSelectedIds([]);
    else setSelectedIds((prev) => (prev.includes(id) ? prev : [id]));
  }

  // Delete/Backspace стирает выбранное, ⌘A выделяет всё, но не пока печатаем или переименовываем
  useEffect(() => {
    function handleKeyDown(event) {
      const isDeleteKey = event.key === 'Delete' || event.key === 'Backspace';
      const isTyping = ['INPUT', 'TEXTAREA'].includes(event.target.tagName) || event.target.isContentEditable;
      if (isDeleteKey && selectedIds.length > 0 && !isTyping) {
        event.preventDefault();
        deleteSelected();
      }
      // ⌘A / Ctrl+A: выделить всё на поле
      const isSelectAll = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'a';
      if (isSelectAll && !isTyping) {
        event.preventDefault();
        setSelectedIds((itemsByNote[activeId] ?? []).map((item) => item.id));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    items: itemsByNote[activeId] ?? [],
    itemsByNote,
    selectedIds,
    editingId,
    select,
    selectMany: setSelectedIds,
    deleteSelected,
    startEdit: setEditingId,
    createItem(type, args) {
      const definition = getItemType(type);
      if (!definition || !activeId) return;
      const item = definition.create(args);
      updateActive((list) => addItem(list, item));
      setSelectedIds(definition.startsEditing ? [] : [item.id]);
      setEditingId(definition.startsEditing ? item.id : null);
    },
    // «Объединить»: layout = { ids, x, y, w } из groupLayout()
    groupSelected(layout) {
      const groupId = makeId('g');
      updateActive((list) => groupItems(list, layout.ids, layout, groupId));
      setSelectedIds([groupId]);
    },
    ungroup(groupId, placements) {
      updateActive((list) => ungroupItem(list, groupId, placements));
      setSelectedIds(placements.map((place) => place.id));
    },
    updateItem: (id, patch) => updateActive((list) => updateItem(list, id, patch)),
    removeItem: (id) => {
      updateActive((list) => removeItems(list, [id]));
      setSelectedIds([]);
    },
    // Тянут объект из выделения — двигается вся группа
    moveItem: (id, dx, dy) =>
      updateActive((list) => moveItems(list, selectedIds.includes(id) ? selectedIds : [id], dx, dy)),
    commitText(id, value) {
      setEditingId(null);
      setSelectedIds(value ? [id] : []);
      updateActive((list) => commitText(list, id, value));
    },
    dropNote: (noteId) => setItemsByNote((prev) => dropNoteItems(prev, noteId)),
  };
}
