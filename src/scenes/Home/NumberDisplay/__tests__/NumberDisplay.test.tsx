import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NumberDisplay from '../index';

function mockMatchMedia(reduced: boolean): void {
  const impl = (query: string): MediaQueryList => ({
    matches: reduced && query === '(prefers-reduced-motion: reduce)',
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
  vi.stubGlobal('matchMedia', vi.fn(impl));
}

function reel(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[style*="translateY"]');
  if (el === null) {
    throw new Error('reel element not found');
  }
  return el;
}

describe('NumberDisplay reduced-motion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('skips the random intro roll and shows the real value immediately when reduced motion is preferred', () => {
    mockMatchMedia(true);
    // Would otherwise pick digit 5 as the random intro start.
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const { container } = render(<NumberDisplay value={7} />);

    // Intro is skipped: the reel sits on the real value (7) from first paint, not the random 5.
    expect(reel(container)).toHaveStyle({ transform: 'translateY(-700%)' });
  });

  it('starts on the random intro position when motion is allowed', () => {
    mockMatchMedia(false);
    // Pins the random intro start to digit 5.
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    const { container } = render(<NumberDisplay value={7} />);

    // Intro is active: the reel starts on the random 5 before rolling to the real value.
    expect(reel(container)).toHaveStyle({ transform: 'translateY(-500%)' });
  });
});
