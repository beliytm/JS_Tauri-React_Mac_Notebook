import Icon from '../../shared/Icon.jsx';
import './toolbar.css';
import { TOOLS } from './tools.js';
import { STRINGS } from '../../shared/strings.js';

// Верхний бар инструментов
export default function Toolbar({ activeTool, onChange }) {
  return (
    <div className="toolbar" role="toolbar" aria-label={STRINGS.toolbar.label}>
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          type="button"
          className={`tool${tool.id === activeTool ? ' active' : ''}`}
          title={tool.title}
          aria-label={tool.title}
          aria-pressed={tool.id === activeTool}
          onClick={() => onChange(tool.id)}
        >
          <Icon name={tool.icon} size={16} />
        </button>
      ))}
    </div>
  );
}
