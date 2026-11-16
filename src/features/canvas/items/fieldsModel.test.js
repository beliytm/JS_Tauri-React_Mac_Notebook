import { describe, expect, it } from 'vitest';
import { FIELD_KINDS } from './fieldKinds.js';
import { addCell, defaultCells, migrateFieldsItem, removeCell, updateCell } from './fieldsModel.js';

describe('fieldsModel', () => {
  it('defaultCells: адрес, дата, время, у всех разные id', () => {
    const cells = defaultCells();
    expect(cells.map((c) => c.kind)).toEqual(['address', 'date', 'time']);
    expect(new Set(cells.map((c) => c.id)).size).toBe(3);
  });

  it('addCell: добавляет пустую ячейку нужного вида в конец', () => {
    const next = addCell(defaultCells(), 'price');
    expect(next).toHaveLength(4);
    expect(next[3]).toMatchObject({ kind: 'price', value: '' });
  });

  it('updateCell / removeCell работают по id', () => {
    const cells = defaultCells();
    const updated = updateCell(cells, cells[1].id, '21.12.2026');
    expect(updated[1].value).toBe('21.12.2026');
    expect(updated[0]).toBe(cells[0]);
    expect(removeCell(cells, cells[0].id).map((c) => c.kind)).toEqual(['date', 'time']);
  });

  it('migrateFieldsItem: старая карточка получает ячейки с её значениями', () => {
    const old = { id: 'f1', type: 'fields', x: 1, y: 2, address: 'Kyiv', date: '21.12.2026', time: '16:00' };
    const next = migrateFieldsItem(old);
    expect(next.cells.map((c) => [c.kind, c.value])).toEqual([
      ['address', 'Kyiv'],
      ['date', '21.12.2026'],
      ['time', '16:00'],
    ]);
    expect(next).not.toHaveProperty('address');
    expect(next).toMatchObject({ id: 'f1', x: 1, y: 2 });
  });

  it('migrateFieldsItem: новые карточки и другие типы не трогает', () => {
    const fresh = { id: 'f2', type: 'fields', x: 0, y: 0, cells: [] };
    const text = { id: 't1', type: 'text', x: 0, y: 0, text: 'a' };
    expect(migrateFieldsItem(fresh)).toBe(fresh);
    expect(migrateFieldsItem(text)).toBe(text);
  });

  it('виды ячеек: цена, адрес, дата, время, ссылка', () => {
    expect(FIELD_KINDS.map((k) => k.id)).toEqual(['price', 'address', 'date', 'time', 'link']);
  });
});
