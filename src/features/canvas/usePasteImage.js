import { useEffect } from 'react';
import { imageFromFile } from './imageFile.js';

// ⌘V: картинка из буфера (например скриншот) ложится в центр видимой области
export default function usePasteImage({ areaRef, viewRef, onAddImage }) {
  useEffect(() => {
    async function handlePaste(event) {
      const target = event.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      const file = [...(event.clipboardData?.items ?? [])]
        .find((entry) => entry.kind === 'file' && entry.type.startsWith('image/'))
        ?.getAsFile();
      if (!file) return;
      event.preventDefault();
      const image = await imageFromFile(file, areaRef.current, viewRef.current);
      if (image) onAddImage(image);
    }
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  });
}
