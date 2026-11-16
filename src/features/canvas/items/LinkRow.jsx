import Icon from '../../../shared/Icon.jsx';
import { openUrl } from '../../../shared/openUrl.js';
import { linkLabel, normalizeUrl } from './linkUtils.js';
import { stopDrag } from './stopDrag.js';
import { STRINGS } from '../../../shared/strings.js';

// Ссылка в свёрнутом виде: короткая подпись (домен) и кнопки.
// Общая для ячейки «Ссылка» в карточке и для отдельной ссылки на поле.
export default function LinkRow({ value, isCopied, removeTitle, onEdit, onCopy, onRemove }) {
  const href = normalizeUrl(value);
  return (
    <span className="field-link">
      <button
        type="button"
        className="field-link-open"
        disabled={!href}
        aria-label={STRINGS.link.open(linkLabel(value))}
        onPointerDown={stopDrag}
        onClick={(event) => {
          event.preventDefault();
          if (href) openUrl(href);
        }}
      >
        <Icon name="open" />
        <span>{linkLabel(value)}</span>
      </button>
      <button
        type="button"
        className="link-btn"
        title={STRINGS.link.edit}
        aria-label={STRINGS.link.edit}
        onPointerDown={stopDrag}
        onClick={onEdit}
      >
        <Icon name="edit" />
      </button>
      <button
        type="button"
        className={`link-btn${isCopied ? ' copied' : ''}`}
        title={STRINGS.link.copy}
        aria-label={STRINGS.link.copy}
        onPointerDown={stopDrag}
        onClick={onCopy}
      >
        <Icon name={isCopied ? 'check' : 'copy'} />
      </button>
      <button
        type="button"
        className="link-btn link-remove"
        title={removeTitle}
        aria-label={removeTitle}
        onPointerDown={stopDrag}
        onClick={onRemove}
      >
        <Icon name="remove" />
      </button>
    </span>
  );
}
