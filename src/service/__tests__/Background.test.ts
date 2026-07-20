import { afterEach, describe, expect, it, vi } from 'vitest';
import { preloadImage, resolveBackground } from '../background';

describe('resolveBackground', () => {
  it('returns a valid URL string unchanged', () => {
    expect(resolveBackground('https://example.com/bg.jpg')).toBe('https://example.com/bg.jpg');
  });

  it('returns null for an empty string', () => {
    expect(resolveBackground('')).toBeNull();
  });

  it("returns null for the raw '__BACKGROUND__' placeholder", () => {
    expect(resolveBackground('__BACKGROUND__')).toBeNull();
  });
});

describe('preloadImage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves true when the image loads', async () => {
    class FakeImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      loadedSrc = '';
      set src(value: string) {
        this.loadedSrc = value;
        this.onload?.();
      }
    }
    vi.stubGlobal('Image', FakeImage);

    await expect(preloadImage('https://example.com/bg.jpg')).resolves.toBe(true);
  });

  it('resolves false when the image errors', async () => {
    class FakeImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      loadedSrc = '';
      set src(value: string) {
        this.loadedSrc = value;
        this.onerror?.();
      }
    }
    vi.stubGlobal('Image', FakeImage);

    await expect(preloadImage('https://example.com/broken.jpg')).resolves.toBe(false);
  });
});
