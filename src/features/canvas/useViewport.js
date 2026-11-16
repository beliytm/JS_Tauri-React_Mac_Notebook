import { useEffect, useRef, useState } from 'react';
import { INITIAL_VIEW } from '../../shared/constants.js';
import { panBy, pinchMetrics, pinchView, zoomAt } from './viewport.js';

// Вид поля: сдвиг (перетаскивание, колесо), масштаб (⌘/Ctrl + колесо, щипок на трекпаде)
// и два пальца на телефоне (щипок = масштаб + сдвиг).
export default function useViewport() {
  const areaRef = useRef(null);
  const viewRef = useRef(INITIAL_VIEW);
  const dragRef = useRef(null);
  const pointersRef = useRef(new Map());
  const pinchRef = useRef(null);
  const [view, setView] = useState(INITIAL_VIEW);
  const [isDragging, setIsDragging] = useState(false);
  viewRef.current = view;

  useEffect(() => {
    const area = areaRef.current;
    // passive:false нужен, чтобы отменить масштаб страницы при щипке
    function handleWheel(event) {
      event.preventDefault();
      const rect = area.getBoundingClientRect();
      if (event.ctrlKey || event.metaKey) {
        const cx = event.clientX - rect.left;
        const cy = event.clientY - rect.top;
        setView((v) => zoomAt(v, cx, cy, event.deltaY));
      } else {
        setView((v) => panBy(v, -event.deltaX, -event.deltaY));
      }
    }
    area.addEventListener('wheel', handleWheel, { passive: false });
    return () => area.removeEventListener('wheel', handleWheel);
  }, []);

  // Первые два активных касания в координатах поля
  function currentPinch() {
    const rect = areaRef.current.getBoundingClientRect();
    const [a, b] = [...pointersRef.current.values()];
    return pinchMetrics({ x: a.x - rect.left, y: a.y - rect.top }, { x: b.x - rect.left, y: b.y - rect.top });
  }

  function startPan(event) {
    if (event.button !== 0 && event.button !== 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointersRef.current.size >= 2) {
      dragRef.current = null;
      pinchRef.current = currentPinch();
    } else {
      dragRef.current = { x: event.clientX, y: event.clientY };
    }
    setIsDragging(true);
  }

  function movePan(event) {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pinchRef.current && pointersRef.current.size >= 2) {
      const next = currentPinch();
      const prev = pinchRef.current;
      pinchRef.current = next;
      setView((v) => pinchView(v, prev, next));
      return;
    }
    const start = dragRef.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    dragRef.current = { x: event.clientX, y: event.clientY };
    setView((v) => panBy(v, dx, dy));
  }

  function endPan(event) {
    pointersRef.current.delete(event.pointerId);
    pinchRef.current = null;
    const [left] = [...pointersRef.current.values()];
    // Остался один палец: продолжаем сдвиг от его места, без скачка
    dragRef.current = left ? { x: left.x, y: left.y } : null;
    if (!left) setIsDragging(false);
  }

  return { areaRef, viewRef, view, isDragging, startPan, movePan, endPan, resetView: () => setView(INITIAL_VIEW) };
}
