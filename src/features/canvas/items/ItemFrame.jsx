import useItemDrag from '../useItemDrag.js';

// Общая оболочка объекта с корневым div (карточка, ссылка, группа): место на поле,
// data-item-id для рамки выделения, выбор и перетаскивание. Текст и картинка
// сами владеют корневым элементом (contentEditable и img) и берут useItemDrag напрямую.
export default function ItemFrame({ item, className, zoom, isSelected, onSelect, onMove, style, children }) {
  const drag = useItemDrag({ id: item.id, zoom, isEditing: false, onSelect, onMove });
  return (
    <div
      data-item-id={item.id}
      className={`${className}${isSelected ? ' selected' : ''}`}
      style={{ left: item.x, top: item.y, ...style }}
      onClick={(event) => event.stopPropagation()}
      {...drag}
    >
      {children}
    </div>
  );
}
