import { useState } from 'react';
import Icon from '../../../shared/Icon.jsx';
import { FIELD_KINDS } from './fieldKinds.js';
import { stopDrag } from './stopDrag.js';
import { STRINGS } from '../../../shared/strings.js';

// Кнопка «+» внизу карточки: открывает выбор вида новой ячейки
export default function AddCellMenu({ onAdd }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fields-add" onPointerDown={stopDrag}>
      <button
        type="button"
        className="fields-add-btn"
        title={STRINGS.fields.addCell}
        aria-label={STRINGS.fields.addCell}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <Icon name="plus" />
      </button>
      {isOpen && (
        <div className="fields-kinds">
          {FIELD_KINDS.map((kind) => (
            <button
              key={kind.id}
              type="button"
              className="fields-kind"
              onClick={() => {
                onAdd(kind.id);
                setIsOpen(false);
              }}
            >
              {kind.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
