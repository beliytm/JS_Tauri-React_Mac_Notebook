import { formatDateInput, formatTimeInput } from './fieldFormat.js';
import { STRINGS } from '../../../shared/strings.js';

// Виды ячеек карточки «Поле». Новый вид = одна запись здесь (она сразу попадёт в меню «+»).
// label — подпись; format — автоформат ввода; isLink — ячейка-ссылка (необязательно).
export const FIELD_KINDS = [
  { id: 'price', label: STRINGS.kinds.price },
  { id: 'address', label: STRINGS.kinds.address },
  { id: 'date', label: STRINGS.kinds.date, format: formatDateInput },
  { id: 'time', label: STRINGS.kinds.time, format: formatTimeInput },
  // isLink: после ввода вместо длинной ссылки показывается короткая подпись (домен)
  { id: 'link', label: STRINGS.kinds.link, isLink: true },
];

// Какие ячейки у новой карточки
export const DEFAULT_KIND_IDS = ['address', 'date', 'time'];

export function getFieldKind(id) {
  return FIELD_KINDS.find((kind) => kind.id === id) ?? { id, label: id };
}
