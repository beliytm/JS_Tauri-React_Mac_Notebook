import { useEffect, useState } from 'react';
import Workspace from './Workspace.jsx';
import { DEFAULT_WORKSPACE } from './shared/constants.js';
import { loadWorkspace } from './features/storage/storage.js';

// Загрузка сохранённого состояния, затем основной экран
export default function App() {
  const [initial, setInitial] = useState(null);

  useEffect(() => {
    loadWorkspace().then((saved) => setInitial(saved ?? DEFAULT_WORKSPACE));
  }, []);

  if (!initial) return <div className="boot" />;
  return <Workspace initial={initial} />;
}
