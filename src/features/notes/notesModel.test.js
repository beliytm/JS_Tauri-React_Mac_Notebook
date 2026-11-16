import { describe, expect, it } from 'vitest';
import { addNote, removeNote, renameNote, selectNote } from './notesModel.js';

const base = {
  notes: [
    { id: 'a', title: 'A', hint: '' },
    { id: 'b', title: 'B', hint: '' },
  ],
  activeId: 'a',
};

describe('notesModel', () => {
  it('addNote: добавляет в конец и делает активной', () => {
    const next = addNote(base, 'c');
    expect(next.notes.map((n) => n.id)).toEqual(['a', 'b', 'c']);
    expect(next.activeId).toBe('c');
  });

  it('selectNote: меняет только активную', () => {
    expect(selectNote(base, 'b')).toEqual({ ...base, activeId: 'b' });
  });

  it('renameNote: пустое название не принимается', () => {
    expect(renameNote(base, 'a', '   ')).toBe(base);
    expect(renameNote(base, 'a', ' Новое ').notes[0].title).toBe('Новое');
  });

  it('removeNote: удалили активную — активна первая из оставшихся', () => {
    const next = removeNote(base, 'a');
    expect(next.activeId).toBe('b');
    expect(next.notes).toHaveLength(1);
  });

  it('removeNote: удалили неактивную — активная та же', () => {
    expect(removeNote(base, 'b').activeId).toBe('a');
  });

  it('removeNote: удалили последнюю — активной нет', () => {
    const one = { notes: [base.notes[0]], activeId: 'a' };
    expect(removeNote(one, 'a')).toEqual({ notes: [], activeId: null });
  });
});
