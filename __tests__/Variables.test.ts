// @vitest-environment node
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const script = join(root, 'variables.sh');
const template = join(root, 'public', 'variables.js');

let dir: string;

function runVariables(env: Record<string, string>) {
  return spawnSync('sh', [script, dir], {
    env: { ...process.env, TIMER_BACKGROUND: '', TIMER_TARGET: '', TIMER_TITLE: '', ...env },
    encoding: 'utf8',
  });
}

interface Injected {
  background: string;
  title: string;
  doneMessage: string;
  doneRedirectUrl: string;
  doneDelayMs: number;
}

/**
 * Evaluate the generated file the way the browser will. Asserting on evaluated
 * globals rather than on the source text is deliberate: a value can look
 * correct in the file and still be a syntax error that blanks the page.
 */
function evaluate(): Injected {
  const context = createContext({ window: {} });
  runInContext(readFileSync(join(dir, 'variables-final.js'), 'utf8'), context);
  return (context as { window: Injected }).window;
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'variables-test-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

// variables.sh needs a POSIX sh; the deployment targets (alpine, CI) are all Linux.
describe.skipIf(process.platform === 'win32')('variables.sh', () => {
  it('substitutes all TIMER_* placeholders and reports success', () => {
    copyFileSync(template, join(dir, 'variables.js'));

    const result = runVariables({
      TIMER_BACKGROUND: 'https://example.com/bg.jpg',
      TIMER_TARGET: '2026-12-31T23:59:59Z',
      TIMER_TITLE: 'New year',
    });

    expect(result.status).toBe(0);
    const final = readFileSync(join(dir, 'variables-final.js'), 'utf8');
    expect(final).toContain('https://example.com/bg.jpg');
    expect(final).toContain('2026-12-31T23:59:59Z');
    expect(final).toContain('New year');
    expect(final).not.toMatch(/__BACKGROUND__|__END__|__TITLE__/);
    expect(result.stdout).toContain('substituted TIMER_* placeholders');
  });

  it('replaces placeholders with empty strings when the env vars are unset', () => {
    copyFileSync(template, join(dir, 'variables.js'));

    const result = runVariables({});

    expect(result.status).toBe(0);
    const final = readFileSync(join(dir, 'variables-final.js'), 'utf8');
    expect(final).not.toMatch(/__BACKGROUND__|__END__|__TITLE__/);
    expect(final).toContain("window.background = '';");
  });

  it('fails loudly when the variables.js template is missing', () => {
    const result = runVariables({ TIMER_TARGET: '2026-12-31T23:59:59Z' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('[variables.sh] ERROR: cannot copy');
    expect(existsSync(join(dir, 'variables-final.js'))).toBe(false);
  });
  // Each case below either killed the container at startup or silently produced
  // a broken page under the previous sed implementation, which built
  // `s@__X__@$VALUE@g` out of user input using @ as the delimiter.
  describe('values containing shell or sed metacharacters', () => {
    it.each([
      ['TIMER_TITLE', 'Party @ midnight'],
      ['TIMER_BACKGROUND', 'https://user@cdn.example.com/a.jpg'],
      ['TIMER_DONE_REDIRECT_URL', 'https://user@host/next'],
      ['TIMER_DONE_MESSAGE', 'Ping @everyone'],
    ])('substitutes %s when the value contains @', (name, value) => {
      copyFileSync(template, join(dir, 'variables.js'));

      const result = runVariables({ [name]: value });

      expect(result.status).toBe(0);
      expect(readFileSync(join(dir, 'variables-final.js'), 'utf8')).toContain(value);
    });

    it('does not treat & as a backreference', () => {
      copyFileSync(template, join(dir, 'variables.js'));

      const result = runVariables({ TIMER_TITLE: 'Tom & Jerry' });

      expect(result.status).toBe(0);
      expect(evaluate().title).toBe('Tom & Jerry');
    });
  });

  describe('values needing escaping in the generated javascript', () => {
    it.each([
      ['an apostrophe', "Chesky's wedding"],
      ['a backslash', 'back\\slash'],
      ['a backslash before a quote', "a\\'b"],
    ])('emits valid javascript for %s', (_label, value) => {
      copyFileSync(template, join(dir, 'variables.js'));

      const result = runVariables({ TIMER_TITLE: value });

      expect(result.status).toBe(0);
      expect(evaluate().title).toBe(value);
    });

    it('does not let a value break out of its string literal', () => {
      copyFileSync(template, join(dir, 'variables.js'));

      const result = runVariables({ TIMER_TITLE: "'; window.pwned = true; x = '" });

      expect(result.status).toBe(0);
      const injected = evaluate();
      expect(injected.title).toBe("'; window.pwned = true; x = '");
      expect((injected as unknown as Record<string, unknown>).pwned).toBeUndefined();
    });

    it('leaves a value that looks like a placeholder alone', () => {
      copyFileSync(template, join(dir, 'variables.js'));

      const result = runVariables({ TIMER_BACKGROUND: '__TITLE__', TIMER_TITLE: 'real title' });

      expect(result.status).toBe(0);
      const injected = evaluate();
      expect(injected.background).toBe('__TITLE__');
      expect(injected.title).toBe('real title');
    });
  });

  it('fails loudly when the template has a placeholder with no TIMER_* mapping', () => {
    copyFileSync(template, join(dir, 'variables.js'));
    writeFileSync(join(dir, 'variables.js'), "window.foo = '__NOT_WIRED_UP__';\n", {
      flag: 'a',
    });

    const result = runVariables({});

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('__NOT_WIRED_UP__');
  });
});
