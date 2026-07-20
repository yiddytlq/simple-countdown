import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../ErrorBoundary';

function Throw(): never {
  throw new Error('boom');
}

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  vi.restoreAllMocks();
  window.title = '';
});

describe('ErrorBoundary', () => {
  it('renders the fallback UI when a child throws instead of crashing', () => {
    render(
      <ErrorBoundary>
        <Throw />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('The countdown ran into an unexpected error.')).toBeInTheDocument();
  });

  it('logs the caught error via componentDidCatch', () => {
    render(
      <ErrorBoundary>
        <Throw />
      </ErrorBoundary>,
    );

    expect(console.error).toHaveBeenCalled();
  });

  it('shows window.title in the fallback heading when set', () => {
    window.title = 'Launch party';

    render(
      <ErrorBoundary>
        <Throw />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Launch party')).toBeInTheDocument();
  });

  it('renders children unchanged when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>All good</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText('All good')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });
});
