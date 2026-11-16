// Реестр инструментов. Новый инструмент = одна строка здесь.
// creates — тип объекта, который инструмент создаёт кликом по полю (см. canvas/items/registry.js).
import { DEFAULT_TOOL_ID } from '../../shared/constants.js';
import { STRINGS } from '../../shared/strings.js';

export const TOOLS = [
  { id: 'select', title: STRINGS.toolbar.select, icon: 'select', creates: null },
  { id: 'text', title: STRINGS.toolbar.text, icon: 'text', creates: 'text' },
  { id: 'link', title: STRINGS.toolbar.link, icon: 'link', creates: 'link' },
  { id: 'fields', title: STRINGS.toolbar.fields, icon: 'fields', creates: 'fields' },
];

export function getTool(id) {
  return TOOLS.find((tool) => tool.id === id) ?? TOOLS.find((tool) => tool.id === DEFAULT_TOOL_ID);
}
