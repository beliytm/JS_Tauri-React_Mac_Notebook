// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import Workspace from './Workspace.jsx';

// jsdom не знает innerText: подменяем на textContent, как ведёт себя обычный текст
Object.defineProperty(HTMLElement.prototype, 'innerText', {
  get() {
    return this.textContent;
  },
  set(value) {
    this.textContent = value;
  },
  configurable: true,
});

const INITIAL = {
  notes: [{ id: 'n1', title: 'Первая', hint: 'пусто' }],
  activeId: 'n1',
  items: {},
};

function setup() {
  const view = render(<Workspace initial={INITIAL} />);
  const area = () => view.container.querySelector('.infinite');
  const query = (selector) => view.container.querySelectorAll(selector);
  const pickTool = (name) => fireEvent.click(screen.getByRole('button', { name }));
  // Инструмент + клик по полю: создаёт объект в этой точке
  const create = (toolName) => {
    pickTool(toolName);
    fireEvent.click(area(), { clientX: 100, clientY: 100 });
  };
  return { ...view, area, query, pickTool, create };
}

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('заметки', () => {
  it('новая заметка добавляется и удаляется', () => {
    const { query } = setup();
    expect(query('.nav-item')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: '+ Новая заметка' }));
    expect(query('.nav-item')).toHaveLength(2);
    const added = query('.nav-item')[1];
    fireEvent.click(within(added).getByRole('button', { name: 'Удалить заметку' }));
    expect(query('.nav-item')).toHaveLength(1);
  });
});

describe('текст', () => {
  it('клик по полю создаёт блок, после ввода и ухода фокуса текст остаётся', () => {
    const { create, query } = setup();
    create('Текст');
    const block = query('.text-item')[0];
    expect(block.getAttribute('contenteditable')).toBe('plaintext-only');
    block.textContent = 'Привет';
    fireEvent.blur(block);
    expect(query('.text-item')[0].textContent).toBe('Привет');
  });

  it('пустой текст после ухода фокуса исчезает', () => {
    const { create, query } = setup();
    create('Текст');
    fireEvent.blur(query('.text-item')[0]);
    expect(query('.text-item')).toHaveLength(0);
  });
});

describe('карточка «Поле»', () => {
  it('создаётся с ячейками адрес, дата, время; дата ставит точки сама', () => {
    const { create, query } = setup();
    create('Поле');
    const labels = [...query('.fields-item label')].map((l) => l.firstChild.textContent);
    expect(labels).toEqual(['Адрес', 'Дата', 'Время']);
    const cells = query('.fields-item textarea');
    fireEvent.change(cells[1], { target: { value: '21122026' } });
    fireEvent.change(cells[2], { target: { value: '1830' } });
    expect(query('.fields-item textarea')[1].value).toBe('21.12.2026');
    expect(query('.fields-item textarea')[2].value).toBe('18:30');
  });

  it('«+» добавляет ячейку выбранного вида', () => {
    const { create, query } = setup();
    create('Поле');
    fireEvent.click(screen.getByRole('button', { name: 'Добавить ячейку' }));
    fireEvent.click(screen.getByRole('button', { name: 'Цена' }));
    const labels = [...query('.fields-item label')].map((l) => l.firstChild.textContent);
    expect(labels).toEqual(['Адрес', 'Дата', 'Время', 'Цена']);
  });

  it('Backspace в ячейке стирает символ, а не карточку; Delete вне поля удаляет карточку', () => {
    const { create, query } = setup();
    create('Поле');
    const cell = query('.fields-item textarea')[0];
    fireEvent.keyDown(cell, { key: 'Backspace' });
    expect(query('.fields-item')).toHaveLength(1);
    fireEvent.keyDown(document.body, { key: 'Delete' });
    expect(query('.fields-item')).toHaveLength(0);
  });
});

describe('ссылка', () => {
  it('после ввода вместо длинного адреса остаётся домен', () => {
    const { create, query } = setup();
    create('Ссылка');
    const input = screen.getByPlaceholderText('Вставь ссылку');
    fireEvent.change(input, { target: { value: 'https://www.booking.com/hotel/pl/very-long-name.html?aid=1' } });
    fireEvent.blur(input);
    expect(query('.field-link-open span')[0].textContent).toBe('booking.com');
    expect(screen.queryByPlaceholderText('Вставь ссылку')).toBeNull();
  });
});

describe('объединить и разъединить', () => {
  it('⌘A выделяет всё, «Объединить» собирает группу, «Разъединить» возвращает объекты', () => {
    const { create, query } = setup();
    create('Поле');
    create('Ссылка');
    fireEvent.keyDown(document.body, { key: 'a', ctrlKey: true });
    fireEvent.click(screen.getByRole('button', { name: 'Объединить (2)' }));
    expect(query('.group-item')).toHaveLength(1);
    expect(query('.group-item > [data-item-id]')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Разъединить' }));
    expect(query('.group-item')).toHaveLength(0);
    expect(query('.infinite-content > [data-item-id]')).toHaveLength(2);
  });
});
