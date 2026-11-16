import { MAX_PASTED_WIDTH } from '../../shared/constants.js';
import { log } from '../../shared/log.js';
import { centerPlacement, fitPastedSize } from './viewport.js';

// Файл картинки -> готовые данные для объекта (src, размер, место в центре видимой области).
// Общая часть для ⌘V и кнопки «добавить картинку» на телефоне. null — не удалось.
export function imageFromFile(file, area, view) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => {
      log(reader.error, 'reader.readAsDataURL(file)', { type: file.type });
      resolve(null);
    };
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => {
        log(new Error('image decode failed'), 'img.src = reader.result', { type: file.type });
        resolve(null);
      };
      img.onload = () => {
        const { w, h } = fitPastedSize(img.naturalWidth, img.naturalHeight, window.devicePixelRatio, MAX_PASTED_WIDTH);
        const rect = area.getBoundingClientRect();
        const { x, y } = centerPlacement(view, rect.width, rect.height, w, h);
        resolve({ src: reader.result, x, y, w, h });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
