import { useRef, useState } from 'react';
import { DOUBLE_PRESS_MAX_DISTANCE_PX, DOUBLE_PRESS_MS } from '../../shared/constants.js';
import { idsInRect, isDoublePress, rectFromPoints, sameIds } from './selection.js';

// Рамка выделения: два быстрых нажатия на пустом месте, второе не отпускать и тянуть.
// Объекты ищутся по атрибуту data-item-id в DOM, поэтому рамка работает с любым типом.
export default function useMarquee({ areaRef, onSelectMany }) {
  const lastPressRef = useRef(null);
  const startRef = useRef(null);
  const idsRef = useRef([]);
  const [box, setBox] = useState(null);

  // true — это второе нажатие подряд, началась рамка (сдвиг поля не нужен)
  function tryStart(event) {
    const press = { t: event.timeStamp, x: event.clientX, y: event.clientY };
    const isSecond = isDoublePress(lastPressRef.current, press, DOUBLE_PRESS_MS, DOUBLE_PRESS_MAX_DISTANCE_PX);
    lastPressRef.current = isSecond ? null : press;
    if (!isSecond) return false;
    event.currentTarget.setPointerCapture(event.pointerId);
    startRef.current = { x: event.clientX, y: event.clientY };
    idsRef.current = [];
    onSelectMany([]);
    return true;
  }

  // true — рамка тянется, событие обработано
  function move(event) {
    const start = startRef.current;
    if (!start) return false;
    const area = areaRef.current.getBoundingClientRect();
    const rect = rectFromPoints(start, { x: event.clientX, y: event.clientY });
    setBox({
      left: rect.left - area.left,
      top: rect.top - area.top,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
    });
    const entries = [...areaRef.current.querySelectorAll('.infinite-content > [data-item-id]')].map((el) => ({
      id: el.dataset.itemId,
      rect: el.getBoundingClientRect(),
    }));
    const ids = idsInRect(entries, rect);
    if (!sameIds(ids, idsRef.current)) {
      idsRef.current = ids;
      onSelectMany(ids);
    }
    return true;
  }

  function end() {
    startRef.current = null;
    setBox(null);
  }

  return { box, isSelecting: box !== null, tryStart, move, end };
}
