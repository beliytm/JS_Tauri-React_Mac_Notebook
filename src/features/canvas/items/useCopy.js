import { useEffect, useRef, useState } from 'react';
import { copyText } from '../../../shared/clipboard.js';
import { COPIED_FEEDBACK_MS } from '../../../shared/constants.js';

// Копирование в буфер с короткой галочкой. key — что именно скопировали (ячейка, ссылка).
export default function useCopy() {
  const timerRef = useRef(null);
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  async function copy(key, text) {
    if (!text || !(await copyText(text))) return;
    setCopiedKey(key);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopiedKey(null), COPIED_FEEDBACK_MS);
  }

  return { copiedKey, copy };
}
