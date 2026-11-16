import { useEffect, useRef, useState } from 'react';
import ItemFrame from './ItemFrame.jsx';
import LinkRow from './LinkRow.jsx';
import { stopDrag } from './stopDrag.js';
import useCopy from './useCopy.js';
import './link.css';
import './linkRow.css';
import { STRINGS } from '../../../shared/strings.js';

// Ссылка на поле: после ввода вместо длинного адреса короткая подпись (домен).
// Клик по подписи открывает ссылку; рядом: изменить, копировать, удалить.
export default function LinkItem({ item, zoom, isSelected, onSelect, onMove, onChange, onRemove }) {
  const inputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const { copiedKey, copy } = useCopy();
  const isInputShown = isEditing || !item.url;

  // Только что созданная ссылка выбрана: сразу курсор в поле
  useEffect(() => {
    if (isSelected) setIsEditing(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isInputShown) inputRef.current?.focus();
  }, [isInputShown]);

  return (
    <ItemFrame
      item={item}
      className="link-item"
      zoom={zoom}
      isSelected={isSelected}
      onSelect={onSelect}
      onMove={onMove}
    >
      {isInputShown ? (
        <input
          ref={inputRef}
          className="link-input"
          type="text"
          placeholder={STRINGS.link.placeholder}
          value={item.url}
          onChange={(event) => onChange(item.id, { url: event.target.value })}
          onFocus={() => {
            onSelect(item.id);
            setIsEditing(true);
          }}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
          onPointerDown={stopDrag}
        />
      ) : (
        <LinkRow
          value={item.url}
          isCopied={copiedKey === 'link'}
          removeTitle={STRINGS.link.remove}
          onEdit={() => setIsEditing(true)}
          onCopy={() => copy('link', item.url)}
          onRemove={() => onRemove(item.id)}
        />
      )}
    </ItemFrame>
  );
}
