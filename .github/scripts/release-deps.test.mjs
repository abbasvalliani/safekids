// Tests for release-deps.mjs against a throwaway git repo.
//   node --test .github/scripts/release-deps.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'release-deps.mjs');
const BOT = ['infinitelogic-renovate[bot]', '12345+infinitelogic-renovate[bot]@users.noreply.github.com'];
const HUMAN = ['Some Human', 'human@example.com'];

function fixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-deps-'));
  const g = (...a) => execFileSync('git', a, { cwd: dir, encoding: 'utf8' }).trim();
  const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(dir, f)), { recursive: true }); fs.writeFileSync(path.join(dir, f), s); };
  const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8');
  const commit = (who, msg) => {
    g('add', '-A');
    execFileSync('git', ['-c', `user.name=${who[0]}`, '-c', `user.email=${who[1]}`, 'commit', '-q', '-m', msg],
      { cwd: dir, env: { ...process.env, GIT_AUTHOR_NAME: who[0], GIT_AUTHOR_EMAIL: who[1] } });
  };
  const run = (...extra) => {
    try {
      return { code: 0, out: execFileSync('node', [SCRIPT, ...extra], { cwd: dir, encoding: 'utf8', env: { ...process.env, GITHUB_REPOSITORY: 'o/r', // CI runners have no git identity
        GIT_AUTHOR_NAME: 'rel', GIT_AUTHOR_EMAIL: 'rel@x', GIT_COMMITTER_NAME: 'rel', GIT_COMMITTER_EMAIL: 'rel@x' } }) };
    } catch (e) { return { code: e.status, out: `${e.stdout}${e.stderr}` }; }
  };
  g('init', '-q', '-b', 'main');
  write('.github/release-deps.json', JSON.stringify({
    repo: 'o/r', commitMessage: 'chore(release): {tag}', ciWorkflows: [],
    components: [
      { name: 'api', tag: 'api@{version}', paths: ['apps/api', 'libs/shared', 'package.json', 'pnpm-lock.yaml'],
        versionFiles: [{ path: 'apps/api/package.json', type: 'package-json' }], changelog: 'apps/api/CHANGELOG.md' },
      { name: 'web', tag: 'web@{version}', paths: ['apps/web', 'package.json', 'pnpm-lock.yaml'],
        versionFiles: [{ path: 'apps/web/package.json', type: 'package-json' }] },
      { name: 'img', tag: 'img@{version}', paths: ['docker/img.Dockerfile'] },
      { name: 'py', tag: 'py@{version}', paths: ['apps/py'],
        versionFiles: [{ path: 'apps/py/pyproject.toml', type: 'pyproject' }, { path: 'apps/py/uv.lock', type: 'uv-lock' }] },
    ],
  }, null, 2));
  write('package.json', JSON.stringify({ name: 'root', private: true, devDependencies: { typescript: '5.0.0' } }, null, 2) + '\n');
  write('apps/api/package.json', JSON.stringify({ name: 'api', version: '1.0.0', scripts: { build: 'x' }, dependencies: { a: '1.0.0' } }, null, 2) + '\n');
  write('apps/web/package.json', JSON.stringify({ name: 'web', version: '2.0.0', dependencies: { b: '1.0.0' } }, null, 2) + '\n');
  write('apps/api/src/main.ts', 'export {};\n');
  write('apps/api/CHANGELOG.md', '\n\n## [1.0.0](x) (2026-01-01)\n');
  write('pnpm-lock.yaml', "lockfileVersion: '9.0'\n\nimporters:\n\n  .:\n    devDependencies:\n      typescript:\n        version: 5.0.0\n\n  apps/api:\n    dependencies:\n      a:\n        version: 1.0.0\n\n  apps/web:\n    dependencies:\n      b:\n        version: 1.0.0\n\npackages:\n\n  a@1.0.0: {}\n  b@1.0.0: {}\n  c@1.0.0: {}\n");
  write('docker/img.Dockerfile', 'FROM debian:13@sha256:' + 'a'.repeat(64) + '\nRUN echo hi\n');
  write('.github/workflows/build.yml', 'jobs:\n  b:\n    steps:\n      - uses: actions/checkout@aaaa # v1\n      - run: echo\n');
  write('apps/py/pyproject.toml', '[project]\nname = "py"\nversion = "0.3.0"\ndescription = "d"\ndependencies = [\n    "httpx>=0.27.0",\n]\n');
  write('apps/py/uv.lock', 'version = 1\n\n[[package]]\nname = "httpx"\nversion = "0.27.0"\n\n[[package]]\nname = "py"\nversion = "0.3.0"\nsource = { editable = "." }\n');
  commit(HUMAN, 'init');
  g('tag', 'py@0.3.0');
  g('tag', 'api@1.0.0'); g('tag', 'web@2.0.0'); g('tag', 'img@0.1.0');
  return { dir, g, write, read, commit, run };
}

const status = (out, name) => (new RegExp(`\\[(\\w+)\\] ${name}:`).exec(out) || [])[1];

test('bot dependency bump in apps/api releases api only', () => {
  const f = fixture();
  f.write('apps/api/package.json', f.read('apps/api/package.json').replace('"a": "1.0.0"', '"a": "1.0.1"'));
  f.write('pnpm-lock.yaml', f.read('pnpm-lock.yaml').replace('      a:\n        version: 1.0.0', '      a:\n        version: 1.0.1'));
  f.commit(BOT, 'fix(deps): update a to 1.0.1');
  const { out } = f.run();
  assert.equal(status(out, 'api'), 'RELEASE', out);
  assert.match(out, /-> api@1\.0\.1/);
  assert.equal(status(out, 'web'), 'SKIP', out);
  assert.equal(status(out, 'img'), 'SKIP', out);
});

test('a human commit in the component blocks it', () => {
  const f = fixture();
  f.write('apps/api/package.json', f.read('apps/api/package.json').replace('"a": "1.0.0"', '"a": "1.0.1"'));
  f.commit(BOT, 'fix(deps): update a');
  f.write('apps/api/src/main.ts', 'export const x = 1;\n');
  f.commit(HUMAN, 'feat: x');
  assert.equal(status(f.run().out, 'api'), 'BLOCKED');
});

test('a human commit to ANOTHER component does not block', () => {
  const f = fixture();
  f.write('apps/api/package.json', f.read('apps/api/package.json').replace('"a": "1.0.0"', '"a": "1.0.1"'));
  f.commit(BOT, 'fix(deps): update a');
  f.write('apps/web/index.ts', 'x\n');
  f.commit(HUMAN, 'feat(web): x');
  const { out } = f.run();
  assert.equal(status(out, 'api'), 'RELEASE', out);
  assert.equal(status(out, 'web'), 'BLOCKED', out);
});

test('bot commit touching source code or package.json scripts is blocked', () => {
  for (const mutate of [
    (f) => f.write('apps/api/src/main.ts', 'export const y = 2;\n'),
    (f) => f.write('apps/api/package.json', f.read('apps/api/package.json').replace('"build": "x"', '"build": "y"')),
  ]) {
    const f = fixture(); mutate(f); f.commit(BOT, 'chore(deps): sneaky');
    assert.equal(status(f.run().out, 'api'), 'BLOCKED');
  }
});

test('an impostor with the bot name but a different email is not the bot', () => {
  const f = fixture();
  f.write('apps/api/package.json', f.read('apps/api/package.json').replace('"a": "1.0.0"', '"a": "1.0.1"'));
  f.commit(['infinitelogic-renovate[bot]', 'me@example.com'], 'fix(deps): update a');
  assert.equal(status(f.run().out, 'api'), 'BLOCKED');
});

test('Dockerfile: FROM digest bump releases; a RUN change blocks', () => {
  const f = fixture();
  f.write('docker/img.Dockerfile', f.read('docker/img.Dockerfile').replace('a'.repeat(64), 'b'.repeat(64)));
  f.commit(BOT, 'chore(deps): update debian digest');
  assert.equal(status(f.run().out, 'img'), 'RELEASE');
  f.write('docker/img.Dockerfile', f.read('docker/img.Dockerfile').replace('echo hi', 'echo bye'));
  f.commit(BOT, 'chore(deps): nope');
  assert.equal(status(f.run().out, 'img'), 'BLOCKED');
});

test('workflow-only `uses:` bumps neither block nor trigger', () => {
  const f = fixture();
  f.write('.github/workflows/build.yml', f.read('.github/workflows/build.yml').replace('aaaa # v1', 'bbbb # v2'));
  f.commit(BOT, 'chore(deps): update actions/checkout');
  const { out } = f.run();
  for (const c of ['api', 'web', 'img']) assert.equal(status(out, c), 'SKIP', out);
});

test('root lockfile: only the changed importer is released; transitive-only change releases all', () => {
  const f = fixture();
  f.write('apps/web/package.json', f.read('apps/web/package.json').replace('"b": "1.0.0"', '"b": "1.0.1"'));
  f.write('pnpm-lock.yaml', f.read('pnpm-lock.yaml').replace('      b:\n        version: 1.0.0', '      b:\n        version: 1.0.1'));
  f.commit(BOT, 'fix(deps): update b');
  let { out } = f.run();
  assert.equal(status(out, 'web'), 'RELEASE', out);
  assert.equal(status(out, 'api'), 'SKIP', out);
  const g = fixture();
  g.write('pnpm-lock.yaml', g.read('pnpm-lock.yaml').replace('  c@1.0.0: {}', '  c@1.0.1: {}'));
  g.commit(BOT, 'chore(deps): lock file maintenance');
  ({ out } = g.run());
  assert.equal(status(out, 'web'), 'RELEASE', out);
  assert.equal(status(out, 'api'), 'RELEASE', out);
});

test('version file ahead of the tag = a human release in progress: blocked', () => {
  const f = fixture();
  f.write('apps/api/package.json', f.read('apps/api/package.json').replace('"version": "1.0.0"', '"version": "1.1.0"'));
  f.commit(HUMAN, 'chore(release): api@1.1.0');   // version-only = neutral
  f.write('apps/api/package.json', f.read('apps/api/package.json').replace('"a": "1.0.0"', '"a": "1.0.1"'));
  f.commit(BOT, 'fix(deps): update a');
  const { out } = f.run();
  assert.equal(status(out, 'api'), 'BLOCKED', out);
  assert.match(out, /ahead of api@1\.0\.0/);
});

test('a tag that is not on main history is refused', () => {
  const f = fixture();
  f.g('checkout', '-q', '-b', 'side');
  f.write('apps/api/x', '1'); f.commit(HUMAN, 'side'); f.g('tag', 'api@1.0.5');
  f.g('checkout', '-q', 'main');
  f.write('apps/api/package.json', f.read('apps/api/package.json').replace('"a": "1.0.0"', '"a": "1.0.1"'));
  f.commit(BOT, 'fix(deps): update a');
  assert.match(f.run().out, /\[SKIP\] api: last tag api@1\.0\.5 is not an ancestor/);
});

test('a pure merge of a bot branch is neutral', () => {
  const f = fixture();
  f.g('checkout', '-q', '-b', 'renovate/a');
  f.write('apps/api/package.json', f.read('apps/api/package.json').replace('"a": "1.0.0"', '"a": "1.0.1"'));
  f.commit(BOT, 'fix(deps): update a');
  f.g('checkout', '-q', 'main');
  f.write('README.md', 'x'); f.commit(HUMAN, 'docs');
  execFileSync('git', ['-c', 'user.name=H', '-c', 'user.email=h@x', 'merge', '-q', '--no-ff', '-m', 'Merge pull request #1 from o/renovate/a', 'renovate/a'], { cwd: f.dir });
  assert.equal(status(f.run().out, 'api'), 'RELEASE');
});

test('--execute bumps, changelogs, commits and tags; the next run is a no-op', () => {
  const f = fixture();
  f.write('apps/api/package.json', f.read('apps/api/package.json').replace('"a": "1.0.0"', '"a": "1.0.1"'));
  f.commit(BOT, 'fix(deps): update a to 1.0.1');
  f.write('docker/img.Dockerfile', f.read('docker/img.Dockerfile').replace('a'.repeat(64), 'c'.repeat(64)));
  f.commit(BOT, 'chore(deps): update debian digest');
  const r = f.run('--execute');
  assert.equal(r.code, 0, r.out);
  assert.equal(JSON.parse(f.read('apps/api/package.json')).version, '1.0.1');
  assert.match(f.read('apps/api/CHANGELOG.md'), /## \[1\.0\.1\]\(https:\/\/github\.com\/o\/r\/compare\/api@1\.0\.0\.\.\.api@1\.0\.1\)[\s\S]*update a to 1\.0\.1/);
  assert.equal(f.g('log', '-1', '--format=%s', 'api@1.0.1'), 'chore(release): api@1.0.1');
  assert.equal(f.g('rev-parse', 'img@0.1.1^{commit}'), f.g('rev-parse', 'HEAD'));
  const again = f.run();
  for (const c of ['api', 'web', 'img']) assert.equal(status(again.out, c), 'SKIP', again.out);
});

test('python: dependency-line bump releases; pyproject + uv.lock self version both bumped; description edit blocks', () => {
  const f = fixture();
  f.write('apps/py/pyproject.toml', f.read('apps/py/pyproject.toml').replace('httpx>=0.27.0', 'httpx>=0.28.1'));
  f.write('apps/py/uv.lock', f.read('apps/py/uv.lock').replace('name = "httpx"\nversion = "0.27.0"', 'name = "httpx"\nversion = "0.28.1"'));
  f.commit(BOT, 'fix(deps): update httpx');
  const r = f.run('--execute');
  assert.equal(status(r.out, 'py'), 'RELEASE', r.out);
  assert.match(f.read('apps/py/pyproject.toml'), /^version = "0\.3\.1"$/m);
  assert.match(f.read('apps/py/uv.lock'), /name = "py"\nversion = "0\.3\.1"\nsource/);
  assert.match(f.read('apps/py/uv.lock'), /name = "httpx"\nversion = "0\.28\.1"/);
  const g = fixture();
  g.write('apps/py/pyproject.toml', g.read('apps/py/pyproject.toml').replace('description = "d"', 'description = "e"'));
  g.commit(BOT, 'chore(deps): nope');
  assert.equal(status(g.run().out, 'py'), 'BLOCKED');
});
