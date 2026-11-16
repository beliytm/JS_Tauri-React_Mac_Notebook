import { makeId } from '../../../shared/ids.js';
import { DEFAULT_KIND_IDS } from './fieldKinds.js';

// Ячейки карточки «Поле»: [{ id, kind, value }]. Чистые функции.

export function createCell(kind) {
  return { id: makeId('c'), kind, value: '' };
}

export function defaultCells() {
  return DEFAULT_KIND_IDS.map(createCell);
}

export function addCell(cells, kind) {
  return [...cells, createCell(kind)];
}

export function removeCell(cells, id) {
  return cells.filter((cell) => cell.id !== id);
}

export function updateCell(cells, id, value) {
  return cells.map((cell) => (cell.id === id ? { ...cell, value } : cell));
}

// Старые карточки хранили address/date/time прямо в объекте
export function cellsFromLegacy(item) {
  return DEFAULT_KIND_IDS.map((kind) => ({ id: makeId('c'), kind, value: item[kind] ?? '' }));
}

export function migrateFieldsItem(item) {
  if (item.type !== 'fields' || Array.isArray(item.cells)) return item;
  const { address, date, time, ...rest } = item;
  return { ...rest, cells: cellsFromLegacy(item) };
}
