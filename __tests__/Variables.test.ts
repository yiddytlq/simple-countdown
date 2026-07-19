// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
});
