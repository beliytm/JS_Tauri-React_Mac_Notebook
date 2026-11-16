import { Component } from 'react';
import { log } from './log.js';
import { STRINGS } from './strings.js';

// Если интерфейс упал, вместо пустого окна показываем сообщение и кнопку «Перезагрузить»
export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const where = (info?.componentStack ?? '').trim().split('\n')[0] ?? '';
    log(error, 'React render', { component: where });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="crash">
        <p>{STRINGS.crash.title}</p>
        <button type="button" className="btn" onClick={() => window.location.reload()}>
          {STRINGS.crash.reload}
        </button>
        <p className="crash-hint">{STRINGS.crash.hint}</p>
      </div>
    );
  }
}
