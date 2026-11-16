import { describe, expect, it } from 'vitest';
import {
  addItem,
  commitText,
  dropNoteItems,
  groupItems,
  moveItem,
  moveItems,
  pruneEmptyByNote,
  removeItem,
  removeItems,
  ungroupItem,
  updateItem,
} from './itemsModel.js';

const text = { id: 't1', type: 'text', x: 10, y: 20, text: 'hi' };
const image = { id: 'i1', type: 'image', x: 0, y: 0, w: 5, h: 5, src: 'data:' };

describe('itemsModel', () => {
  it('addItem / removeItem', () => {
    expect(addItem([text], image)).toEqual([text, image]);
    expect(removeItem([text, image], 't1')).toEqual([image]);
  });

  it('moveItem: двигает только нужный объект', () => {
    const next = moveItem([text, image], 't1', 5, -5);
    expect(next[0]).toMatchObject({ x: 15, y: 15 });
    expect(next[1]).toBe(image);
  });

  it('moveItems / removeItems: группа объектов', () => {
    const moved = moveItems([text, image], ['t1', 'i1'], 1, 2);
    expect(moved[0]).toMatchObject({ x: 11, y: 22 });
    expect(moved[1]).toMatchObject({ x: 1, y: 2 });
    expect(removeItems([text, image], ['t1', 'i1'])).toEqual([]);
    expect(removeItems([text, image], ['t1'])).toEqual([image]);
  });

  it('groupItems: объекты становятся одной группой в заданном порядке', () => {
    const other = { id: 'x1', type: 'text', x: 0, y: 0, text: 'x' };
    const next = groupItems([text, image, other], ['i1', 't1'], { x: 5, y: 6, w: 300 }, 'g1');
    expect(next.map((i) => i.id)).toEqual(['x1', 'g1']);
    const group = next[1];
    expect(group).toMatchObject({ type: 'group', x: 5, y: 6, w: 300 });
    expect(group.children.map((c) => c.id)).toEqual(['i1', 't1']);
  });

  it('groupItems: одного объекта мало; группа в группе вливается', () => {
    expect(groupItems([text], ['t1'], { x: 0, y: 0, w: 1 }, 'g')).toEqual([text]);
    const g1 = groupItems([text, image], ['t1', 'i1'], { x: 0, y: 0, w: 300 }, 'g1');
    const other = { id: 'x1', type: 'text', x: 0, y: 0, text: 'x' };
    const merged = groupItems([...g1, other], ['g1', 'x1'], { x: 0, y: 0, w: 300 }, 'g2');
    expect(merged).toHaveLength(1);
    expect(merged[0].children.map((c) => c.id)).toEqual(['t1', 'i1', 'x1']);
  });

  it('ungroupItem: дети возвращаются на поле на своих местах, картинки со своим размером', () => {
    const g = groupItems([text, image], ['t1', 'i1'], { x: 0, y: 0, w: 300 }, 'g1');
    const placements = [
      { id: 't1', x: 100, y: 200, w: 50, h: 20 },
      { id: 'i1', x: 100, y: 240, w: 300, h: 150 },
    ];
    const back = ungroupItem(g, 'g1', placements);
    expect(back.map((i) => i.id)).toEqual(['t1', 'i1']);
    expect(back[0]).toMatchObject({ x: 100, y: 200 });
    expect(back[1]).toMatchObject({ x: 100, y: 240, w: 300, h: 150 });
    expect(ungroupItem(g, 'нет', placements)).toBe(g);
  });

  it('pruneEmptyByNote: пустая группа убирается', () => {
    expect(pruneEmptyByNote({ n: [{ id: 'g', type: 'group', children: [] }] }).n).toEqual([]);
  });

  it('updateItem: меняет только нужные поля нужного объекта', () => {
    const next = updateItem([text, image], 't1', { text: 'x' });
    expect(next[0]).toEqual({ ...text, text: 'x' });
    expect(next[1]).toBe(image);
  });

  it('commitText: пустое значение удаляет блок, непустое сохраняет', () => {
    expect(commitText([text], 't1', '')).toEqual([]);
    expect(commitText([text], 't1', 'new')[0].text).toBe('new');
  });

  it('pruneEmptyByNote: убирает пустой текст, картинки не трогает', () => {
    const empty = { ...text, id: 't2', text: '' };
    expect(pruneEmptyByNote({ n: [empty, image, text] }).n).toEqual([image, text]);
  });

  it('pruneEmptyByNote: пустая ссылка тоже убирается', () => {
    const emptyLink = { id: 'l1', type: 'link', x: 0, y: 0, url: '' };
    const link = { id: 'l2', type: 'link', x: 0, y: 0, url: 'olx.ua' };
    expect(pruneEmptyByNote({ n: [emptyLink, link] }).n).toEqual([link]);
  });

  it('dropNoteItems: убирает заметку целиком', () => {
    expect(dropNoteItems({ a: [text], b: [image] }, 'a')).toEqual({ b: [image] });
  });
});
