// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('..', import.meta.url));
const entrypoint = join(root, 'docker-entrypoint.sh');

let dir: string;

/**
 * Run docker-entrypoint.sh outside a container. nginx is stubbed so `nginx -t`
 * passes and the final `exec nginx` returns instead of serving; every path the
 * script takes before that is the real one.
 */
function runEntrypoint(env: Record<string, string> = {}) {
  const bin = join(dir, 'bin');
  const html = join(dir, 'html');
  const conf = join(dir, 'default.conf');
  mkdirSync(bin, { recursive: true });
  mkdirSync(html, { recursive: true });
  copyFileSync(join(root, 'public', 'variables.js'), join(html, 'variables.js'));

  writeFileSync(join(bin, 'nginx'), '#!/bin/sh\nexit 0\n');
  chmodSync(join(bin, 'nginx'), 0o755);

  const result = spawnSync('sh', [entrypoint], {
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: bin + delimiter + (process.env.PATH ?? ''),
      HTML_DIR: html,
      TEMPLATE: join(root, 'nginx.conf'),
      CONF: conf,
      VARIABLES_SH: join(root, 'variables.sh'),
      TIMER_TARGET: '2026-12-31T23:59:59Z',
      ...env,
    },
  });
  return { ...result, conf: readFileSync(conf, 'utf8') };
}

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'entrypoint-test-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

// The entrypoint is POSIX sh and renders an nginx config; both need a real shell.
describe.skipIf(process.platform === 'win32')('docker-entrypoint.sh', () => {
  describe('access logging', () => {
    it('logs only failed requests by default', () => {
      const { status, conf } = runEntrypoint();

      expect(status).toBe(0);
      // A successful GET here is almost always an uptime probe; at one every few
      // seconds that is megabytes a day of "the monitor is fine".
      expect(conf).toContain('access_log /dev/stdout main if=$status_failed;');
      expect(conf).toContain('map $status $status_failed');
    });

    it('logs every request at info', () => {
      const { conf } = runEntrypoint({ LOG_LEVEL: 'info' });

      expect(conf).toContain('access_log /dev/stdout main;');
      expect(conf).not.toContain('if=$status_failed;');
    });

    it('never access-logs the health endpoint, at any level', () => {
      for (const LOG_LEVEL of ['error', 'info', 'debug']) {
        const { conf } = runEntrypoint({ LOG_LEVEL });
        expect(conf).toMatch(/location = \/healthz \{\s*access_log off;/);
      }
    });
  });

  describe('error logging', () => {
    // Regression guard: an outage was diagnosed solely from nginx's
    // "signal 3 (SIGQUIT) received, shutting down", which is emitted at notice.
    // No LOG_LEVEL may drop the error_log below that, or the next one is silent.
    it.each(['error', 'info', 'debug'])(
      'keeps error_log at notice or lower for %s',
      (LOG_LEVEL) => {
        const { conf } = runEntrypoint({ LOG_LEVEL });

        expect(conf).toMatch(/error_log \/dev\/stderr (notice|info|debug);/);
      },
    );
  });

  describe('startup output', () => {
    it('reports the resolved config even at the quietest level', () => {
      const { stderr } = runEntrypoint({ LOG_LEVEL: 'error', TIMER_TITLE: 'Wedding' });

      expect(stderr).toContain('[entrypoint]');
      expect(stderr).toContain('TIMER_TITLE set');
      expect(stderr).toContain('starting nginx');
    });

    it('warns about a TIMER_* the image does not implement', () => {
      const { stderr } = runEntrypoint({ TIMER_NOT_A_REAL_SETTING: 'x' });

      expect(stderr).toContain('TIMER_NOT_A_REAL_SETTING');
    });

    it('falls back to the default level when LOG_LEVEL is nonsense', () => {
      const { status, stderr, conf } = runEntrypoint({ LOG_LEVEL: 'verbose' });

      expect(status).toBe(0);
      expect(stderr).toContain("unknown LOG_LEVEL 'verbose'");
      expect(conf).toContain('if=$status_failed;');
    });
  });
});
