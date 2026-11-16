import { useState } from 'react';
import { GROUP_PADDING_PX } from '../../../shared/constants.js';
import { commitText, removeItems, updateItem } from '../itemsModel.js';
import ItemFrame from './ItemFrame.jsx';
import './group.css';

// Группа («Объединить»): рамка, внутри объекты столбиком, одной ширины.
// Двигается целиком за рамку или за любой объект внутри. Содержимое работает как обычно:
// ячейки, копирование, открытие ссылок, правка текста. Типы внутри берутся из реестра
// через getItemType (его передаёт Canvas, чтобы не было цикла импортов).
export default function GroupItem({ item, zoom, isSelected, onSelect, onMove, onChange, getItemType }) {
  const [editingChildId, setEditingChildId] = useState(null);
  function setChildren(children) {
    onChange(item.id, { children });
  }

  return (
    <ItemFrame
      item={item}
      className="group-item"
      zoom={zoom}
      isSelected={isSelected}
      onSelect={onSelect}
      onMove={onMove}
      style={{ width: item.w + GROUP_PADDING_PX * 2 }}
    >
      {item.children.map((child) => {
        const definition = getItemType(child.type);
        if (!definition) return null;
        const { Component } = definition;
        return (
          <Component
            key={definition.renderKey(child)}
            item={child}
            zoom={zoom}
            isSelected={false}
            isEditing={child.id === editingChildId}
            // Любое действие над содержимым выбирает и двигает всю группу
            onSelect={() => onSelect(item.id)}
            onMove={(_id, dx, dy) => onMove(item.id, dx, dy)}
            onChange={(id, patch) => setChildren(updateItem(item.children, id, patch))}
            onRemove={(id) => setChildren(removeItems(item.children, [id]))}
            onStartEdit={setEditingChildId}
            onCommit={(id, value) => {
              setEditingChildId(null);
              setChildren(commitText(item.children, id, value));
            }}
            getItemType={getItemType}
          />
        );
      })}
    </ItemFrame>
  );
}
