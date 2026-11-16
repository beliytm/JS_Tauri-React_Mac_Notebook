// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from './ErrorBoundary.jsx';

afterEach(cleanup);

function Boom() {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  it('при падении показывает сообщение и кнопку «Перезагрузить»', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Что-то сломалось.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Перезагрузить' })).toBeTruthy();
    // ошибка записана в журнал в формате {f,e,c,ctx}
    const logged = spy.mock.calls.map((call) => String(call[0])).find((line) => line.includes('"c":"React render"'));
    expect(logged).toContain('"e":"boom"');
    spy.mockRestore();
  });

  it('без ошибок показывает содержимое', () => {
    render(
      <ErrorBoundary>
        <p>всё хорошо</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('всё хорошо')).toBeTruthy();
  });
});
