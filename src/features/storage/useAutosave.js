import { useEffect, useRef } from 'react';
import { AUTOSAVE_DELAY_MS } from '../../shared/constants.js';
import { saveWorkspace } from './storage.js';

// Сохраняет через паузу после последней правки; при старте не пишет
export default function useAutosave({ notes, activeId, items }) {
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return undefined;
    }
    const timer = setTimeout(() => saveWorkspace({ notes, activeId, items }), AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [notes, activeId, items]);
}
