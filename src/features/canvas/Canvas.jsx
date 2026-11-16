import { useRef } from 'react';
import Icon from '../../shared/Icon.jsx';
import './canvas.css';
import { GRID_SIZE, MIN_VISIBLE_GRID_PX } from '../../shared/constants.js';
import { imageFromFile } from './imageFile.js';
import { groupLayout, placementsFromRects } from './groupLayout.js';
import { getItemType } from './items/registry.js';
import usePasteImage from './usePasteImage.js';
import useMarquee from './useMarquee.js';
import useViewport from './useViewport.js';
import { screenToWorld } from './viewport.js';
import { STRINGS } from '../../shared/strings.js';

// Бесконечное поле как в Figma. Объекты рисуются по реестру типов (items/registry.js).
// createType — тип, который создаётся кликом (из выбранного инструмента), иначе null.
export default function Canvas({
  items,
  createType,
  selectedIds,
  editingId,
  onCreate,
  onAddImage,
  onSelect,
  onSelectMany,
  onGroup,
  onUngroup,
  onMove,
  onChange,
  onRemove,
  onStartEdit,
  onCommit,
  onDeleteSelected,
}) {
  const { areaRef, viewRef, view, isDragging, startPan, movePan, endPan, resetView } = useViewport();
  usePasteImage({ areaRef, viewRef, onAddImage });
  const marquee = useMarquee({ areaRef, onSelectMany });
  const fileInputRef = useRef(null);

  // Кнопка «картинка» на телефоне: выбор из фото вместо ⌘V
  async function handlePickImage(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const image = await imageFromFile(file, areaRef.current, viewRef.current);
    if (image) onAddImage(image);
  }

  function handlePointerDown(event) {
    if (createType) return;
    if (marquee.tryStart(event)) return;
    onSelect(null);
    startPan(event);
  }

  // Рамки объектов на экране по их id (только объекты верхнего уровня)
  function measure(ids, root = areaRef.current.querySelector('.infinite-content')) {
    return ids
      .map((id) => ({ id, rect: root.querySelector(`:scope > [data-item-id="${id}"]`)?.getBoundingClientRect() }))
      .filter((entry) => entry.rect);
  }

  function handleMerge() {
    const area = areaRef.current.getBoundingClientRect();
    onGroup(groupLayout(measure(selectedIds), area, view));
  }

  // Разъединить: каждый элемент возвращается на поле туда, где он сейчас стоит
  function handleUngroup(group) {
    const area = areaRef.current.getBoundingClientRect();
    const groupEl = areaRef.current.querySelector(`.infinite-content > [data-item-id="${group.id}"]`);
    const entries = measure(
      group.children.map((child) => child.id),
      groupEl,
    );
    onUngroup(group.id, placementsFromRects(entries, area, view));
  }

  const selectedGroup =
    selectedIds.length === 1 ? items.find((item) => item.id === selectedIds[0] && item.type === 'group') : null;

  // Клик, а не pointerdown: иначе фокус на новом блоке сразу собьётся
  function handleClick(event) {
    if (!createType) return;
    const rect = areaRef.current.getBoundingClientRect();
    const { x, y } = screenToWorld(view, event.clientX - rect.left, event.clientY - rect.top);
    onCreate(createType, x, y);
  }

  const gridPx = GRID_SIZE * view.zoom;
  const isGridVisible = gridPx >= MIN_VISIBLE_GRID_PX;

  return (
    <div
      ref={areaRef}
      className={`infinite${isDragging ? ' is-dragging' : ''}${createType ? ' is-creating' : ''}${marquee.isSelecting ? ' is-selecting' : ''}`}
      style={{
        backgroundSize: `${gridPx}px ${gridPx}px`,
        backgroundPosition: `${view.x}px ${view.y}px`,
        backgroundImage: isGridVisible ? 'radial-gradient(circle, var(--grid-dot) 1px, transparent 1px)' : 'none',
      }}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={(event) => marquee.move(event) || movePan(event)}
      onPointerUp={(event) => {
        marquee.end();
        endPan(event);
      }}
      onPointerCancel={(event) => {
        marquee.end();
        endPan(event);
      }}
    >
      <div
        className="infinite-content"
        style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})` }}
      >
        {items.map((item) => {
          const definition = getItemType(item.type);
          if (!definition) return null;
          const { Component } = definition;
          return (
            <Component
              key={definition.renderKey(item)}
              item={item}
              zoom={view.zoom}
              isSelected={selectedIds.includes(item.id)}
              isEditing={item.id === editingId}
              onSelect={onSelect}
              onMove={onMove}
              onChange={onChange}
              onRemove={onRemove}
              getItemType={getItemType}
              onStartEdit={onStartEdit}
              onCommit={onCommit}
            />
          );
        })}
      </div>
      {(selectedIds.length >= 2 || selectedGroup) && (
        <div className="selection-bar" onPointerDown={(event) => event.stopPropagation()}>
          {selectedGroup ? (
            <button type="button" className="selection-btn" onClick={() => handleUngroup(selectedGroup)}>
              {STRINGS.canvas.ungroup}
            </button>
          ) : (
            <button type="button" className="selection-btn" onClick={handleMerge}>
              {STRINGS.canvas.merge(selectedIds.length)}
            </button>
          )}
        </div>
      )}
      {marquee.box && <div className="marquee" style={marquee.box} />}
      <div className="touch-actions" onPointerDown={(event) => event.stopPropagation()}>
        <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePickImage} />
        <button
          type="button"
          className="touch-btn"
          title={STRINGS.canvas.addImage}
          aria-label={STRINGS.canvas.addImage}
          onClick={() => fileInputRef.current.click()}
        >
          <Icon name="image" size={16} />
        </button>
        <button
          type="button"
          className="touch-btn"
          title={STRINGS.canvas.deleteSelected}
          aria-label={STRINGS.canvas.deleteSelected}
          disabled={selectedIds.length === 0}
          onClick={onDeleteSelected}
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
      <button
        className="zoom-badge"
        type="button"
        title={STRINGS.canvas.resetView}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={resetView}
      >
        {Math.round(view.zoom * 100)}%
      </button>
    </div>
  );
}
