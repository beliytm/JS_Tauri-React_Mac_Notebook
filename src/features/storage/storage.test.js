import { beforeEach, describe, expect, it } from 'vitest';
import { loadWorkspace, resetSavedImages, saveWorkspace } from './storage.js';
import { parseWorkspace, serializeWorkspace } from './storageModel.js';

function memoryBackend() {
  const files = { state: '', images: {}, imageWrites: 0, cleanedKeep: null };
  return {
    files,
    readState: async () => files.state,
    writeState: async (json) => {
      files.state = json;
    },
    readImage: async (id) => files.images[id] ?? '',
    cleanupImages: async (keep) => {
      files.cleanedKeep = keep;
    },
    writeImage: async (id, data) => {
      files.images[id] = data;
      files.imageWrites += 1;
    },
  };
}

const workspace = {
  notes: [{ id: 'n1', title: 'A', hint: '' }],
  activeId: 'n1',
  items: {
    n1: [
      { id: 't1', type: 'text', x: 1, y: 2, text: 'hi' },
      { id: 't2', type: 'text', x: 3, y: 4, text: '' },
      { id: 'i1', type: 'image', x: 0, y: 0, w: 10, h: 10, src: 'data:image/png;base64,AAA' },
    ],
  },
};

beforeEach(() => resetSavedImages());

describe('storageModel', () => {
  it('serialize: пустой текст отброшен, src картинки вынесен', () => {
    const { json, images } = serializeWorkspace(workspace);
    expect(images).toEqual([{ id: 'i1', src: 'data:image/png;base64,AAA' }]);
    expect(json).not.toContain('base64');
    expect(JSON.parse(json).items.n1).toHaveLength(2);
  });

  it('parse: мусор и чужая версия дают null', () => {
    expect(parseWorkspace('')).toBeNull();
    expect(parseWorkspace('{"version":99,"notes":[],"items":{}}')).toBeNull();
    expect(parseWorkspace('{"version":1,"notes":[]}')).toBeNull();
  });
});

describe('миграция карточек «Поле»', () => {
  it('parse: старая карточка превращается в карточку с ячейками', () => {
    const json = JSON.stringify({
      version: 1,
      notes: [],
      activeId: null,
      items: { n1: [{ id: 'f1', type: 'fields', x: 0, y: 0, address: 'Kyiv', date: '', time: '' }] },
    });
    const item = parseWorkspace(json).items.n1[0];
    expect(item.cells.map((c) => c.value)).toEqual(['Kyiv', '', '']);
    expect(item).not.toHaveProperty('address');
  });
});

describe('картинки внутри групп', () => {
  const grouped = {
    notes: [{ id: 'n1', title: 'A', hint: '' }],
    activeId: 'n1',
    items: {
      n1: [
        {
          id: 'g1',
          type: 'group',
          x: 0,
          y: 0,
          w: 300,
          children: [
            { id: 't1', type: 'text', x: 0, y: 0, text: 'hi' },
            { id: 'i9', type: 'image', x: 0, y: 0, w: 10, h: 10, src: 'data:image/png;base64,ZZZ' },
          ],
        },
      ],
    },
  };

  it('serialize: src вложенной картинки вынесен в файл', () => {
    const { json, images } = serializeWorkspace(grouped);
    expect(images).toEqual([{ id: 'i9', src: 'data:image/png;base64,ZZZ' }]);
    expect(json).not.toContain('base64');
  });

  it('сохранение и загрузка возвращают картинку внутри группы', async () => {
    const backend = memoryBackend();
    await saveWorkspace(grouped, backend);
    const loaded = await loadWorkspace(backend);
    const image = loaded.items.n1[0].children[1];
    expect(image.src).toBe('data:image/png;base64,ZZZ');
  });
});

describe('storage', () => {
  it('сохранение и загрузка возвращают то же (кроме пустого текста)', async () => {
    const backend = memoryBackend();
    await saveWorkspace(workspace, backend);
    const loaded = await loadWorkspace(backend);
    expect(loaded.notes).toEqual(workspace.notes);
    expect(loaded.items.n1.map((i) => i.id)).toEqual(['t1', 'i1']);
    expect(loaded.items.n1[1].src).toBe('data:image/png;base64,AAA');
  });

  it('картинка пишется один раз', async () => {
    const backend = memoryBackend();
    await saveWorkspace(workspace, backend);
    await saveWorkspace(workspace, backend);
    expect(backend.files.imageWrites).toBe(1);
  });

  it('повреждённый state.json даёт null, а не падение', async () => {
    const backend = memoryBackend();
    backend.files.state = '{not json';
    expect(await loadWorkspace(backend)).toBeNull();
  });
});

describe('чистка картинок', () => {
  it('после сохранения бэкенд получает id всех картинок, которые ещё нужны', async () => {
    const backend = memoryBackend();
    await saveWorkspace(workspace, backend);
    expect(backend.files.cleanedKeep).toEqual(['i1']);
  });

  it('если состояние не записалось, чистка не запускается', async () => {
    const backend = memoryBackend();
    backend.writeState = async () => {
      throw new Error('disk full');
    };
    await saveWorkspace(workspace, backend);
    expect(backend.files.cleanedKeep).toBeNull();
  });

  it('сбой чистки не ломает сохранение', async () => {
    const backend = memoryBackend();
    backend.cleanupImages = async () => {
      throw new Error('no access');
    };
    await saveWorkspace(workspace, backend);
    expect(JSON.parse(backend.files.state).version).toBe(1);
  });
});
