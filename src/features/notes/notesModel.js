import { EMPTY_NOTE_HINT, NEW_NOTE_TITLE } from '../../shared/constants.js';

// Состояние заметок: { notes: [{id,title,hint}], activeId }

export function addNote(state, id) {
  const note = { id, title: NEW_NOTE_TITLE, hint: EMPTY_NOTE_HINT };
  return { notes: [...state.notes, note], activeId: id };
}

export function selectNote(state, id) {
  return { ...state, activeId: id };
}

// Пустое название не принимается — остаётся старое
export function renameNote(state, id, title) {
  const next = title.trim();
  if (!next) return state;
  return { ...state, notes: state.notes.map((note) => (note.id === id ? { ...note, title: next } : note)) };
}

// Удалили активную — активной становится первая из оставшихся (или null)
export function removeNote(state, id) {
  const notes = state.notes.filter((note) => note.id !== id);
  const activeId = id === state.activeId ? (notes[0]?.id ?? null) : state.activeId;
  return { notes, activeId };
}
