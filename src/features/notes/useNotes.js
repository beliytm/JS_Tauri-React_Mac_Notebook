import { useState } from 'react';
import { makeId } from '../../shared/ids.js';
import { addNote, removeNote, renameNote, selectNote } from './notesModel.js';

export default function useNotes(initial) {
  const [state, setState] = useState({ notes: initial.notes, activeId: initial.activeId });

  return {
    notes: state.notes,
    activeId: state.activeId,
    activeNote: state.notes.find((note) => note.id === state.activeId),
    add: () => setState((prev) => addNote(prev, makeId('n'))),
    select: (id) => setState((prev) => selectNote(prev, id)),
    rename: (id, title) => setState((prev) => renameNote(prev, id, title)),
    remove: (id) => setState((prev) => removeNote(prev, id)),
  };
}
