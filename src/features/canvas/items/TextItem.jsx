import { useEffect, useRef } from 'react';
import useItemDrag from '../useItemDrag.js';
import './text.css';

// Текстовый блок на поле. Правка: новый блок сразу в режиме ввода,
// существующий — по двойному клику. Esc или клик в сторону — готово.
export default function TextItem({ item, zoom, isEditing, isSelected, onSelect, onMove, onStartEdit, onCommit }) {
  const ref = useRef(null);
  const drag = useItemDrag({ id: item.id, zoom, isEditing, onSelect, onMove });

  useEffect(() => {
    if (!isEditing) return;
    const el = ref.current;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }, [isEditing]);

  return (
    <div
      ref={ref}
      data-item-id={item.id}
      className={`text-item${isEditing ? ' editing' : ''}${isSelected ? ' selected' : ''}`}
      style={{ left: item.x, top: item.y }}
      contentEditable={isEditing ? 'plaintext-only' : false}
      suppressContentEditableWarning
      {...drag}
      onClick={(event) => event.stopPropagation()}
      onDoubleClick={() => onStartEdit(item.id)}
      onBlur={() => isEditing && onCommit(item.id, ref.current.innerText.trim())}
      onKeyDown={(event) => event.key === 'Escape' && ref.current.blur()}
    >
      {item.text}
    </div>
  );
}
