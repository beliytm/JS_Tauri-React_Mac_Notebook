import { invoke } from '@tauri-apps/api/core';
import { log } from '../../shared/log.js';
import { collectImages, parseWorkspace, serializeWorkspace } from './storageModel.js';

// Бэкенды хранения: Tauri (файлы в папке приложения) и localStorage (запуск в браузере).
const STATE_KEY = 'notebook:state';
const IMAGE_KEY_PREFIX = 'notebook:image:';

const tauriBackend = {
  readState: () => invoke('load_state'),
  writeState: (json) => invoke('save_state', { json }),
  readImage: (id) => invoke('load_image', { id }),
  writeImage: (id, data) => invoke('save_image', { id, data }),
  cleanupImages: (keep) => invoke('cleanup_images', { keep }),
};

const browserBackend = {
  readState: async () => localStorage.getItem(STATE_KEY) ?? '',
  writeState: async (json) => localStorage.setItem(STATE_KEY, json),
  readImage: async (id) => localStorage.getItem(IMAGE_KEY_PREFIX + id) ?? '',
  writeImage: async (id, data) => localStorage.setItem(IMAGE_KEY_PREFIX + id, data),
  cleanupImages: async (keep) => {
    const stale = Object.keys(localStorage).filter(
      (key) => key.startsWith(IMAGE_KEY_PREFIX) && !keep.includes(key.slice(IMAGE_KEY_PREFIX.length)),
    );
    stale.forEach((key) => localStorage.removeItem(key));
  },
};

export function pickBackend() {
  return '__TAURI_INTERNALS__' in window ? tauriBackend : browserBackend;
}

const savedImageIds = new Set();
let saveQueue = Promise.resolve();

// null — сохранённого состояния нет или его не удалось прочитать
export async function loadWorkspace(backend = pickBackend()) {
  try {
    const workspace = parseWorkspace(await backend.readState());
    if (!workspace) return null;
    const images = collectImages(workspace.items);
    await Promise.all(
      images.map(async (item) => {
        try {
          item.src = await backend.readImage(item.id);
          savedImageIds.add(item.id);
        } catch (error) {
          log(error, 'item.src = await backend.readImage(item.id)', { id: item.id });
        }
      }),
    );
    return workspace;
  } catch (error) {
    log(error, 'parseWorkspace(await backend.readState())', {});
    return null;
  }
}

// Файлы картинок, которых больше нет в состоянии, удаляются. Сбой чистки не считается сбоем сохранения.
async function cleanupUnusedImages(backend, images) {
  try {
    await backend.cleanupImages(images.map((image) => image.id));
  } catch (error) {
    log(error, 'await backend.cleanupImages(ids)', { images: images.length });
  }
}

// Записи идут по очереди. Картинки пишутся раньше состояния,
// чтобы state.json никогда не ссылался на отсутствующий файл.
export function saveWorkspace(workspace, backend = pickBackend()) {
  saveQueue = saveQueue.then(async () => {
    try {
      const { json, images } = serializeWorkspace(workspace);
      for (const image of images) {
        if (savedImageIds.has(image.id) || !image.src) continue;
        await backend.writeImage(image.id, image.src);
        savedImageIds.add(image.id);
      }
      await backend.writeState(json);
      await cleanupUnusedImages(backend, images);
    } catch (error) {
      log(error, 'await backend.writeState(json)', { notes: workspace.notes.length });
    }
  });
  return saveQueue;
}

// Только для тестов
export function resetSavedImages() {
  savedImageIds.clear();
}
