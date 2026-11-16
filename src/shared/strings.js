// Все подписи интерфейса в одном месте. Правка текста или второй язык = правка только этого файла.
export const STRINGS = {
  notes: {
    menu: 'Заметки',
    none: 'Нет заметок',
    add: '+ Новая заметка',
    rename: 'Переименовать',
    remove: 'Удалить заметку',
    newTitle: 'Новая заметка',
    emptyHint: 'пусто',
  },
  toolbar: {
    label: 'Инструменты',
    select: 'Выбрать',
    text: 'Текст',
    link: 'Ссылка',
    fields: 'Поле',
  },
  canvas: {
    addImage: 'Добавить картинку',
    deleteSelected: 'Удалить выбранное',
    resetView: 'Сбросить вид',
    merge: (count) => `Объединить (${count})`,
    ungroup: 'Разъединить',
  },
  link: {
    placeholder: 'Вставь ссылку',
    open: (label) => `Открыть ссылку: ${label}`,
    edit: 'Изменить ссылку',
    copy: 'Копировать ссылку',
    remove: 'Удалить',
  },
  fields: {
    addCell: 'Добавить ячейку',
    removeCell: 'Удалить ячейку',
    removeCellOf: (label) => `Удалить ячейку: ${label}`,
    copy: 'Копировать',
    copyCellOf: (label) => `Копировать: ${label}`,
  },
  kinds: {
    price: 'Цена',
    address: 'Адрес',
    date: 'Дата',
    time: 'Время',
    link: 'Ссылка',
  },
  crash: {
    title: 'Что-то сломалось.',
    reload: 'Перезагрузить',
    hint: 'Данные сохранены. Подробности в журнале log.jsonl.',
  },
};
