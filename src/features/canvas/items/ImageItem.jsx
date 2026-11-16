import useItemDrag from '../useItemDrag.js';
import './image.css';

export default function ImageItem({ item, zoom, isSelected, onSelect, onMove }) {
  const drag = useItemDrag({ id: item.id, zoom, isEditing: false, onSelect, onMove });
  return (
    <img
      data-item-id={item.id}
      className={`image-item${isSelected ? ' selected' : ''}`}
      src={item.src}
      alt=""
      draggable={false}
      style={{ left: item.x, top: item.y, width: item.w, height: item.h }}
      onClick={(event) => event.stopPropagation()}
      {...drag}
    />
  );
}
