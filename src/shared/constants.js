import { STRINGS } from './strings.js';

// Все числа и значения по умолчанию — здесь, а не по коду
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;
export const ZOOM_SPEED = 0.01;
export const GRID_SIZE = 24;
export const MIN_VISIBLE_GRID_PX = 6;
export const MAX_PASTED_WIDTH = 600;
export const INITIAL_VIEW = { x: 0, y: 0, zoom: 1 };

export const NEW_NOTE_TITLE = STRINGS.notes.newTitle;
export const EMPTY_NOTE_HINT = STRINGS.notes.emptyHint;
export const DEFAULT_TOOL_ID = 'select';

export const AUTOSAVE_DELAY_MS = 300;
export const STATE_VERSION = 1;

export const DEFAULT_WORKSPACE = {
  notes: [
    { id: 'n1', title: 'Первая заметка', hint: 'текст и картинки' },
    { id: 'n2', title: 'Идеи', hint: EMPTY_NOTE_HINT },
  ],
  activeId: 'n1',
  items: {},
};
export const COPIED_FEEDBACK_MS = 1000;

// Рамка выделения: два быстрых нажатия, второе не отпускать и тянуть
export const DOUBLE_PRESS_MS = 350;
export const DOUBLE_PRESS_MAX_DISTANCE_PX = 12;

// Группа («Объединить»): ширина содержимого, поля внутри рамки
export const GROUP_MIN_WIDTH = 220;
export const GROUP_MAX_WIDTH = 480;
export const GROUP_PADDING_PX = 10;
