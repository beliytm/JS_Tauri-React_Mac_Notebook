import { useState } from 'react';
import Icon from '../../shared/Icon.jsx';
import './notes.css';
import { STRINGS } from '../../shared/strings.js';

// Боковая панель: список заметок, переименование, удаление, добавление
export default function NotesSidebar({ notes, activeId, onSelect, onAdd, onRename, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState('');

  function startRename(note) {
    setEditingId(note.id);
    setDraftTitle(note.title);
  }

  function commitRename() {
    onRename(editingId, draftTitle);
    setEditingId(null);
  }

  return (
    <aside className="sidebar">
      <div className="brand">Notebook</div>
      <nav className="nav">
        {notes.map((note) => (
          <div className="nav-item" key={note.id}>
            <a
              draggable="false"
              href={`#${note.id}`}
              className={note.id === activeId ? 'active' : ''}
              onClick={(event) => {
                event.preventDefault();
                onSelect(note.id);
              }}
            >
              {editingId === note.id ? (
                <input
                  className="nav-edit"
                  autoFocus
                  value={draftTitle}
                  onChange={(event) => setDraftTitle(event.target.value)}
                  onClick={(event) => event.preventDefault()}
                  onBlur={commitRename}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') commitRename();
                    if (event.key === 'Escape') setEditingId(null);
                  }}
                />
              ) : (
                note.title
              )}
              <span>{note.hint}</span>
            </a>
            <div className="nav-actions">
              <button
                className="nav-btn"
                type="button"
                title={STRINGS.notes.rename}
                aria-label={STRINGS.notes.rename}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => startRename(note)}
              >
                <Icon name="edit" />
              </button>
              <button
                className="nav-btn nav-del"
                type="button"
                title={STRINGS.notes.remove}
                aria-label={STRINGS.notes.remove}
                onClick={() => onDelete(note.id)}
              >
                <Icon name="remove" />
              </button>
            </div>
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="btn" type="button" onClick={onAdd}>
          {STRINGS.notes.add}
        </button>
      </div>
    </aside>
  );
}
