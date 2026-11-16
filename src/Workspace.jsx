import { useState } from 'react';
import Icon from './shared/Icon.jsx';
import Canvas from './features/canvas/Canvas.jsx';
import useCanvasItems from './features/canvas/useCanvasItems.js';
import NotesSidebar from './features/notes/NotesSidebar.jsx';
import useNotes from './features/notes/useNotes.js';
import useAutosave from './features/storage/useAutosave.js';
import Toolbar from './features/toolbar/Toolbar.jsx';
import { getTool } from './features/toolbar/tools.js';
import { DEFAULT_TOOL_ID } from './shared/constants.js';
import { STRINGS } from './shared/strings.js';

// Сборка экрана: заметки + поле + инструменты. Логика — в хуках фич.
export default function Workspace({ initial }) {
  const notes = useNotes(initial);
  const canvas = useCanvasItems({ initialItems: initial.items, activeId: notes.activeId });
  const [toolId, setToolId] = useState(DEFAULT_TOOL_ID);
  const tool = getTool(toolId);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useAutosave({ notes: notes.notes, activeId: notes.activeId, items: canvas.itemsByNote });

  // После создания объекта инструмент возвращается на «Выбрать»
  function handleCreate(type, x, y) {
    canvas.createItem(type, { x, y });
    setToolId(DEFAULT_TOOL_ID);
  }

  function handleAddImage(image) {
    canvas.createItem('image', image);
    setToolId(DEFAULT_TOOL_ID);
  }

  function handleDeleteNote(id) {
    notes.remove(id);
    canvas.dropNote(id);
  }

  return (
    <div className={`layout${isMenuOpen ? ' menu-open' : ''}`}>
      <NotesSidebar
        notes={notes.notes}
        activeId={notes.activeId}
        onSelect={(id) => {
          notes.select(id);
          setIsMenuOpen(false);
        }}
        onAdd={notes.add}
        onRename={notes.rename}
        onDelete={handleDeleteNote}
      />
      <main className="canvas">
        <Canvas
          items={canvas.items}
          createType={tool.creates}
          selectedIds={canvas.selectedIds}
          editingId={canvas.editingId}
          onCreate={handleCreate}
          onAddImage={handleAddImage}
          onSelect={canvas.select}
          onSelectMany={canvas.selectMany}
          onGroup={canvas.groupSelected}
          onUngroup={canvas.ungroup}
          onMove={canvas.moveItem}
          onDeleteSelected={canvas.deleteSelected}
          onChange={canvas.updateItem}
          onRemove={canvas.removeItem}
          onStartEdit={canvas.startEdit}
          onCommit={canvas.commitText}
        />
        <button type="button" className="menu-btn" aria-label={STRINGS.notes.menu} onClick={() => setIsMenuOpen(true)}>
          <Icon name="menu" size={16} />
        </button>
        <Toolbar activeTool={toolId} onChange={setToolId} />
        <div className="canvas-title">{notes.activeNote ? notes.activeNote.title : STRINGS.notes.none}</div>
      </main>
      <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)} />
    </div>
  );
}
