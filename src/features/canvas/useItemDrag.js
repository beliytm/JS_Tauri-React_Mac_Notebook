import { useRef } from 'react';

// Выбор и перетаскивание объекта на поле (с учётом масштаба)
export default function useItemDrag({ id, zoom, isEditing, onSelect, onMove }) {
  const dragRef = useRef(null);

  function onPointerDown(event) {
    event.stopPropagation();
    if (isEditing) return;
    onSelect(id);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerMove(event) {
    const start = dragRef.current;
    if (!start) return;
    onMove(id, (event.clientX - start.x) / zoom, (event.clientY - start.y) / zoom);
    dragRef.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp };
}
