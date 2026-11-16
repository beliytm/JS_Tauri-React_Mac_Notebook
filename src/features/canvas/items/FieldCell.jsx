import Icon from '../../../shared/Icon.jsx';
import { stopDrag } from './stopDrag.js';
import { STRINGS } from '../../../shared/strings.js';

// Одна ячейка карточки «Поле»: подпись, поле ввода, кнопки «удалить» и «копировать»
export default function FieldCell({
  cell,
  kind,
  isCopied,
  registerRef,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  onCopy,
  onRemove,
}) {
  return (
    <label>
      {kind.label}
      <span className="field-cell">
        <textarea
          rows={1}
          ref={(el) => registerRef(cell.id, el)}
          value={cell.value}
          onChange={(event) => onChange((kind.format ?? String)(event.target.value))}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onPointerDown={stopDrag}
        />
        <button
          type="button"
          className="field-btn field-remove"
          title={STRINGS.fields.removeCell}
          aria-label={STRINGS.fields.removeCellOf(kind.label)}
          onPointerDown={stopDrag}
          onClick={(event) => {
            event.preventDefault();
            onRemove();
          }}
        >
          <Icon name="remove" />
        </button>
        <button
          type="button"
          className={`field-btn field-copy${isCopied ? ' copied' : ''}`}
          title={STRINGS.fields.copy}
          aria-label={STRINGS.fields.copyCellOf(kind.label)}
          disabled={!cell.value}
          onPointerDown={stopDrag}
          onClick={(event) => {
            event.preventDefault();
            onCopy();
          }}
        >
          <Icon name={isCopied ? 'check' : 'copy'} />
        </button>
      </span>
    </label>
  );
}
