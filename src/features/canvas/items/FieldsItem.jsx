import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import AddCellMenu from './AddCellMenu.jsx';
import FieldCell from './FieldCell.jsx';
import ItemFrame from './ItemFrame.jsx';
import LinkRow from './LinkRow.jsx';
import { getFieldKind } from './fieldKinds.js';
import { addCell, removeCell, updateCell } from './fieldsModel.js';
import useCopy from './useCopy.js';
import './fields.css';
import './linkRow.css';
import { STRINGS } from '../../../shared/strings.js';

// Один и тот же пустой список, чтобы зависимости эффектов не менялись на каждом рендере
const EMPTY_CELLS = [];

// Карточка с ячейками (адрес, дата, время, цена, ссылка...). Ячейки растут под текст,
// «+» внизу выбирает вид новой ячейки. Ячейка-ссылка после ввода сворачивается в домен.
export default function FieldsItem({ item, zoom, isSelected, onSelect, onMove, onChange }) {
  const cells = item.cells ?? EMPTY_CELLS;
  const cellRefs = useRef({});
  const focusCellIdRef = useRef(null);
  const [editingLinkId, setEditingLinkId] = useState(null);
  const { copiedKey, copy } = useCopy();

  // Ячейка растёт под текст: длинный адрес виден целиком
  useLayoutEffect(() => {
    for (const el of Object.values(cellRefs.current)) {
      if (!el) continue;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
    // Только что добавленная ячейка (или ссылка по карандашу) получает курсор
    if (focusCellIdRef.current) {
      cellRefs.current[focusCellIdRef.current]?.focus();
      focusCellIdRef.current = null;
    }
  }, [cells, editingLinkId]);

  // Только что созданная карточка выбрана: курсор в первую ячейку
  useEffect(() => {
    if (isSelected && cells[0]) cellRefs.current[cells[0].id]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setCells(next) {
    onChange(item.id, { cells: next });
  }

  function handleAdd(kindId) {
    const next = addCell(cells, kindId);
    focusCellIdRef.current = next[next.length - 1].id;
    setCells(next);
  }

  function startLinkEdit(cellId) {
    focusCellIdRef.current = cellId;
    setEditingLinkId(cellId);
  }

  return (
    <ItemFrame
      item={item}
      className="fields-item"
      zoom={zoom}
      isSelected={isSelected}
      onSelect={onSelect}
      onMove={onMove}
    >
      {cells.map((cell) => {
        const kind = getFieldKind(cell.kind);
        const isCopied = copiedKey === cell.id;
        const onRemove = () => setCells(removeCell(cells, cell.id));

        if (kind.isLink && cell.value && editingLinkId !== cell.id) {
          return (
            <div className="field-row" key={cell.id}>
              <span className="field-label">{kind.label}</span>
              <LinkRow
                value={cell.value}
                isCopied={isCopied}
                removeTitle={STRINGS.fields.removeCell}
                onEdit={() => startLinkEdit(cell.id)}
                onCopy={() => copy(cell.id, cell.value)}
                onRemove={onRemove}
              />
            </div>
          );
        }

        return (
          <FieldCell
            key={cell.id}
            cell={cell}
            kind={kind}
            isCopied={isCopied}
            registerRef={(id, el) => {
              cellRefs.current[id] = el;
            }}
            onChange={(value) => setCells(updateCell(cells, cell.id, value))}
            onFocus={() => {
              onSelect(item.id);
              if (kind.isLink) setEditingLinkId(cell.id);
            }}
            onBlur={() => kind.isLink && setEditingLinkId(null)}
            onKeyDown={(event) => {
              // В ссылке Enter завершает ввод, а не переносит строку
              if (kind.isLink && event.key === 'Enter') {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }}
            onCopy={() => copy(cell.id, cell.value)}
            onRemove={onRemove}
          />
        );
      })}
      <AddCellMenu onAdd={handleAdd} />
    </ItemFrame>
  );
}
