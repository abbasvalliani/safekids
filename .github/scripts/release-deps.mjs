#!/usr/bin/env node
// release-deps — cut a PATCH release of a component when, and only when, every
// commit that reached it since its last release tag is a Renovate dependency
// update. Driven by .github/workflows/release-deps.yml; config lives in
// .github/release-deps.json. No npm dependencies: node >= 20, git, and (for the
// CI gate and GitHub releases) the gh CLI.
//
//   node .github/scripts/release-deps.mjs                 # dry run: print the plan
//   node .github/scripts/release-deps.mjs --check-ci      # ... and require green CI on HEAD
//   node .github/scripts/release-deps.mjs --execute       # make the release commits + tags locally
//   node .github/scripts/release-deps.mjs --execute --push  # ... and push them (one tag per push)
//
// Other flags: --ref <rev> (default HEAD), --config <file>, --json <file> (write the plan),
// --expect-sha <sha> (refuse to run unless --ref resolves to it).
//
// THE RULES, per component (see .github/release-deps.json for its paths):
//   1. Its last release tag (highest X.Y.Z matching its tag format) must be an
//      ancestor of HEAD. No tag, or a tag off main's history -> no release.
//   2. Every commit in <tag>..HEAD that touches the component's paths must be
//      either NEUTRAL (only `version` fields / CHANGELOG.md changed — a release
//      commit; or a merge commit that adds nothing of its own) or a BOT-DEP
//      commit: authored by the Renovate bot AND touching only dependency files,
//      each verified by content, not just by name:
//        package.json        only dependency maps (+ packageManager) changed
//        pnpm-lock.yaml, pnpm-workspace.yaml, uv.lock, requirements*.txt
//        pyproject.toml      only dependency-spec lines changed (not version/name/…)
//        Dockerfile*         only image refs changed (FROM, ARG <x>=<ref>@sha256:…, COPY --from=<ref>)
//        .github/workflows/*.yml  only `uses:` lines changed
//        renovate.json(5) / .github/renovate.json(5)
//      ANY other commit touching the component's paths blocks its release.
//   3. At least one BOT-DEP commit must change a file under the component's paths
//      (.github/** and renovate config never trigger a release: they do not change
//      the shipped artifact). For a root pnpm-lock.yaml, only the importers whose
//      entries changed count (a change confined to transitive packages counts for all).
//   4. The version file must not be AHEAD of the tag (that is a human release in
//      progress). Next version = patch + 1 of max(tag, file).
//   5. --check-ci: every workflow in `ciWorkflows` must have a completed, successful
//      push run for HEAD. No run at all is an ERROR (exit 2), never "not yet".
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------- utilities
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };

function git(a, { allowFail = false, trim = true } = {}) {
  try {
    const out = execFileSync('git', a, { encoding: 'utf8', maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'pipe'] });
    return trim ? out.trim() : out;
  } catch (e) {
    if (allowFail) return null;
    throw new Error(`git ${a.join(' ')} failed: ${e.stderr || e.message}`);
  }
}
const show = (rev, file) => git(['show', `${rev}:${file}`], { allowFail: true, trim: false });

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const parseV = (s) => { const m = SEMVER.exec(s || ''); return m ? m.slice(1).map(Number) : null; };
const cmpV = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
const fmtV = (v) => v.join('.');
const under = (file, p) => p === '.' || file === p || file.startsWith(p.endsWith('/') ? p : p + '/');
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------------------------------------------------------------- config
const cfgPath = opt('--config', '.github/release-deps.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const BOT = cfg.bot || 'infinitelogic-renovate[bot]';
const BOT_EMAIL = new RegExp(`^\\d+\\+${esc(BOT)}@users\\.noreply\\.github\\.com$`);
const REPO = process.env.GITHUB_REPOSITORY || cfg.repo;
const ref = opt('--ref', 'HEAD');
const head = git(['rev-parse', `${ref}^{commit}`]);
const expect = opt('--expect-sha');
if (expect && expect !== head) { console.error(`::error::${ref} is ${head}, expected ${expect}`); process.exit(2); }

const NON_TRIGGER = (f) => f.startsWith('.github/') || /^(\.github\/)?renovate\.json5?$/.test(f) || /^\.renovaterc/.test(f);

// ---------------------------------------------------------------- file classifiers
// Each returns 'version' (release bookkeeping only), 'dep' (dependency-only) or 'other'.
const DEP_KEYS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies',
  'bundleDependencies', 'bundledDependencies', 'overrides', 'resolutions', 'packageManager'];

function classifyPackageJson(a, b) {
  let A, B;
  try { A = JSON.parse(a); B = JSON.parse(b); } catch { return 'other'; }
  const strip = (o, keys) => { const c = structuredClone(o); for (const k of keys) delete c[k];
    if (c.pnpm && keys.includes('overrides')) { const p = { ...c.pnpm }; delete p.overrides; c.pnpm = p; } return c; };
  const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);
  if (!same(strip(A, ['version', ...DEP_KEYS]), strip(B, ['version', ...DEP_KEYS]))) return 'other';
  return same(strip(A, ['version']), strip(B, ['version'])) ? 'version' : 'dep';
}

function changedLines(a, b) {
  // Multiset difference of lines, both directions — enough for line-shaped rules.
  const count = (s) => { const m = new Map(); for (const l of s.split('\n')) m.set(l, (m.get(l) || 0) + 1); return m; };
  const A = count(a), B = count(b), out = [];
  for (const [l, n] of A) if ((B.get(l) || 0) < n) out.push(l);
  for (const [l, n] of B) if ((A.get(l) || 0) < n) out.push(l);
  return out;
}

const PY_VERSION_LINE = /^\s*version\s*=\s*"[^"]*"\s*$/;
const PY_DEP_LINE = /^\s*"[A-Za-z0-9][A-Za-z0-9._-]*(\[[^\]]*\])?\s*(===|==|>=|<=|~=|!=|>|<)[^"]*"\s*,?\s*(#.*)?$/;
const PY_DEP_KEY = /^\s*(requires-python|requires)\s*=/;
function classifyPyproject(a, b) {
  const lines = changedLines(a, b);
  if (lines.every((l) => PY_VERSION_LINE.test(l))) return 'version';
  return lines.every((l) => PY_VERSION_LINE.test(l) || PY_DEP_LINE.test(l) || PY_DEP_KEY.test(l)) ? 'dep' : 'other';
}

const UV_SELF = /(\[\[package\]\]\nname = "[^"]+"\nversion = ")([^"]+)("\nsource = \{ (?:editable|virtual) = "\." \})/;
const classifyUvLock = (a, b) => (a.replace(UV_SELF, '$1$3') === b.replace(UV_SELF, '$1$3') ? 'version' : 'dep');

function normDockerfile(s) {
  return s.split('\n').map((l) => l
    .replace(/^(\s*FROM\s+(?:--platform=\S+\s+)?)(\S+)/i, '$1<IMG>')
    .replace(/^(\s*ARG\s+\w+=)(\S+@sha256:[0-9a-f]{64})\s*$/i, '$1<IMG>')
    .replace(/(--from=)(\S*[:@]\S*)/i, '$1<IMG>')).join('\n');
}
const classifyDockerfile = (a, b) => (normDockerfile(a) === normDockerfile(b) ? 'dep' : 'other');

const normWorkflow = (s) => s.split('\n').map((l) => l.replace(/^(\s*(?:-\s+)?uses:\s*).*$/, '$1<REF>')).join('\n');
const classifyWorkflow = (a, b) => (normWorkflow(a) === normWorkflow(b) ? 'dep' : 'other');

function classifyFile(sha, parent, file) {
  const base = path.posix.basename(file);
  const a = show(parent, file), b = show(sha, file);
  if (/^(\.github\/)?renovate\.json5?$/.test(file) || /^\.renovaterc/.test(file)) return 'dep';
  if (a === null || b === null) return 'other';           // added / deleted file
  if (base === 'CHANGELOG.md') return 'version';
  if (base === 'version.json') {
    try { const A = JSON.parse(a), B = JSON.parse(b); delete A.version; delete B.version;
      return JSON.stringify(A) === JSON.stringify(B) ? 'version' : 'other'; } catch { return 'other'; }
  }
  if (base === 'package.json') return classifyPackageJson(a, b);
  if (base === 'pnpm-lock.yaml' || base === 'pnpm-workspace.yaml') return 'dep';
  if (base === 'uv.lock') return classifyUvLock(a, b);
  if (/^requirements[\w.-]*\.txt$/.test(base)) return 'dep';
  if (base === 'pyproject.toml') return classifyPyproject(a, b);
  if (/^Dockerfile/.test(base) || /\.Dockerfile$/.test(base)) return classifyDockerfile(a, b);
  if (/^\.github\/workflows\/[^/]+\.ya?ml$/.test(file)) return classifyWorkflow(a, b);
  return 'other';
}

// ---------------------------------------------------------------- commit analysis
function importerBlocks(text) {
  const out = new Map(); if (!text) return out;
  const lines = text.split('\n'); let i = lines.indexOf('importers:'); if (i < 0) return out;
  let key = null, buf = [];
  for (i++; i < lines.length && !/^\S/.test(lines[i]); i++) {
    const m = /^ {2}('?)([^\s'][^']*?)\1:\s*$/.exec(lines[i]);
    if (m) { if (key !== null) out.set(key, buf.join('\n')); key = m[2]; buf = []; } else buf.push(lines[i]);
  }
  if (key !== null) out.set(key, buf.join('\n'));
  return out;
}

const cache = new Map();
function analyze(sha) {
  if (cache.has(sha)) return cache.get(sha);
  const [parentsStr, an, ae, subject] = git(['log', '-1', '--format=%P%x00%an%x00%ae%x00%s', sha]).split('\0');
  const parents = parentsStr ? parentsStr.split(' ') : [];
  const isBot = an === BOT && BOT_EMAIL.test(ae);
  const c = { sha, short: sha.slice(0, 8), author: `${an} <${ae}>`, subject, isBot, parents, files: [], lockImporters: null };
  if (parents.length > 1) {
    // A merge commit that brings nothing of its own (no conflict resolution, no
    // edits) has an empty combined diff. Its branch-side commits are in the range
    // and judged on their own.
    const cc = git(['diff-tree', '--cc', '--no-commit-id', '--name-only', '-r', sha]);
    c.files = cc ? cc.split('\n').map((f) => ({ path: f, cls: 'other' })) : [];
    c.verdict = c.files.length ? 'other' : 'neutral';
  } else {
    const parent = parents[0] || '4b825dc642cb6eb9a060e54bf8d69288fbee4904'; // empty tree
    const names = git(['diff-tree', '--no-commit-id', '--name-only', '-r', parent, sha]);
    c.files = (names ? names.split('\n') : []).map((f) => ({ path: f, cls: classifyFile(sha, parent, f) }));
    if (c.files.every((f) => f.cls === 'version')) c.verdict = 'neutral';
    else if (isBot && c.files.every((f) => f.cls === 'version' || f.cls === 'dep')) c.verdict = 'bot-dep';
    else c.verdict = 'other';
    if (c.files.some((f) => f.path === 'pnpm-lock.yaml')) {
      const A = importerBlocks(show(parent, 'pnpm-lock.yaml')), B = importerBlocks(show(sha, 'pnpm-lock.yaml'));
      c.lockImporters = [...new Set([...A.keys(), ...B.keys()])].filter((k) => A.get(k) !== B.get(k));
    }
  }
  cache.set(sha, c);
  return c;
}

function triggers(c, comp) {
  for (const f of c.files) {
    if (NON_TRIGGER(f.path) || f.cls === 'version' || !comp.paths.some((p) => under(f.path, p))) continue;
    if (f.path === 'pnpm-lock.yaml' && c.lockImporters && c.lockImporters.length) {
      if (c.lockImporters.some((k) => k === '.' || comp.paths.some((p) => under(k, p)))) return true;
      continue;
    }
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- version files
function readVersion(vf, rev) {
  const t = rev ? show(rev, vf.path) : fs.readFileSync(vf.path, 'utf8');
  if (t === null) return null;
  if (vf.type === 'package-json' || vf.type === 'version-json') return JSON.parse(t).version;
  if (vf.type === 'pyproject') return (/^version\s*=\s*"([^"]+)"/m.exec(t) || [])[1];
  if (vf.type === 'uv-lock') return (UV_SELF.exec(t) || [])[2];
  throw new Error(`unknown version file type ${vf.type}`);
}

function writeVersion(vf, from, to) {
  const t = fs.readFileSync(vf.path, 'utf8');
  let n;
  if (vf.type === 'package-json' || vf.type === 'version-json') n = t.replace(new RegExp(`("version"\\s*:\\s*")${esc(from)}(")`), `$1${to}$2`);
  else if (vf.type === 'pyproject') n = t.replace(new RegExp(`^(version\\s*=\\s*")${esc(from)}(")`, 'm'), `$1${to}$2`);
  else if (vf.type === 'uv-lock') n = t.replace(UV_SELF, (m, a, v, b) => (v === from ? `${a}${to}${b}` : m));
  if (n === t) throw new Error(`${vf.path}: version ${from} not found`);
  fs.writeFileSync(vf.path, n);
  if (readVersion(vf) !== to) throw new Error(`${vf.path}: version did not become ${to}`);
}

function prependChangelog(file, comp, prevTag, newTag, version, commits) {
  const old = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const date = new Date().toISOString().slice(0, 10);
  const entry = [`## [${version}](https://github.com/${REPO}/compare/${prevTag}...${newTag}) (${date})`, '',
    '### Dependencies', '',
    ...commits.map((c) => `* ${c.subject} ([${c.sha.slice(0, 7)}](https://github.com/${REPO}/commit/${c.sha}))`), ''].join('\n');
  const m = /^# [^\n]*\n+/.exec(old);
  const out = m ? `${m[0]}${entry}\n${old.slice(m[0].length)}` : `\n\n${entry}\n${old}`;
  fs.writeFileSync(file, out);
}

// ---------------------------------------------------------------- plan
function tagRegex(fmt) { const [pre, post] = fmt.split('{version}'); return new RegExp(`^${esc(pre)}(\\d+\\.\\d+\\.\\d+)${esc(post || '')}$`); }

function planComponent(comp) {
  const r = { name: comp.name, status: 'skip', reason: '', commits: [], blocking: [], triggering: [] };
  const re = tagRegex(comp.tag);
  const tags = git(['tag', '-l']).split('\n').map((t) => [t, re.exec(t)]).filter(([, m]) => m)
    .map(([t, m]) => ({ tag: t, v: parseV(m[1]) })).sort((x, y) => cmpV(y.v, x.v));
  if (!tags.length) return { ...r, reason: `no release tag matching ${comp.tag}` };
  const last = tags[0];
  r.lastTag = last.tag;
  const tagSha = git(['rev-list', '-n', '1', last.tag]);
  if (git(['merge-base', '--is-ancestor', tagSha, head], { allowFail: true }) === null)
    return { ...r, reason: `last tag ${last.tag} is not an ancestor of ${head.slice(0, 8)} (newer than / off main)` };
  const shas = git(['rev-list', '--reverse', `${tagSha}..${head}`]);
  if (!shas) return { ...r, reason: `nothing on main since ${last.tag}` };
  for (const sha of shas.split('\n')) {
    const c = analyze(sha);
    const relevant = c.files.some((f) => comp.paths.some((p) => under(f.path, p)));
    if (!relevant) continue;
    r.commits.push(c);
    if (c.verdict === 'other') r.blocking.push(c);
    else if (c.verdict === 'bot-dep' && triggers(c, comp)) r.triggering.push(c);
  }
  if (r.blocking.length) return { ...r, status: 'blocked', reason: `${r.blocking.length} non-Renovate/non-dependency commit(s) touch it since ${last.tag}` };
  if (!r.triggering.length) return { ...r, reason: `no Renovate dependency change in its paths since ${last.tag}` };
  let base = last.v;
  if (comp.versionFiles?.length) {
    const fv = parseV(readVersion(comp.versionFiles[0], head));
    if (!fv) return { ...r, status: 'blocked', reason: `cannot read X.Y.Z from ${comp.versionFiles[0].path}` };
    if (cmpV(fv, last.v) > 0) return { ...r, status: 'blocked', reason: `${comp.versionFiles[0].path} is ${fmtV(fv)}, ahead of ${last.tag}: a human release is in progress` };
    r.fileVersion = fmtV(fv);
  }
  const next = [base[0], base[1], base[2] + 1];
  r.version = fmtV(next);
  r.newTag = fill(comp.tag, { version: r.version });
  if (git(['rev-parse', '-q', '--verify', `refs/tags/${r.newTag}`], { allowFail: true }))
    return { ...r, status: 'blocked', reason: `tag ${r.newTag} already exists` };
  return { ...r, status: 'release', reason: `${r.triggering.length} Renovate commit(s) since ${last.tag}` };
}

function checkCi() {
  const problems = [];
  for (const wf of cfg.ciWorkflows || []) {
    let runs;
    try {
      runs = JSON.parse(execFileSync('gh', ['api', `repos/${REPO}/actions/workflows/${wf}/runs?head_sha=${head}&event=push&branch=main&per_page=50`],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })).workflow_runs || [];
    } catch (e) { return { ok: false, fatal: true, msg: `cannot query ${wf} runs: ${e.stderr || e.message}` }; }
    if (!runs.length) return { ok: false, fatal: true, msg: `${wf}: NO push run for ${head.slice(0, 8)} on main — treated as an error` };
    const latest = runs.sort((a, b) => b.run_number - a.run_number || b.run_attempt - a.run_attempt)[0];
    if (latest.status !== 'completed' || latest.conclusion !== 'success')
      problems.push(`${wf} run #${latest.run_number} is ${latest.status}/${latest.conclusion} (${latest.html_url})`);
  }
  return problems.length ? { ok: false, fatal: false, msg: problems.join('; ') } : { ok: true };
}

// ---------------------------------------------------------------- main
const plan = (cfg.components || []).map(planComponent);
console.log(`release-deps ${REPO} @ ${head.slice(0, 12)} (${ref}) — bot ${BOT}`);
for (const p of plan) {
  console.log(`\n[${p.status.toUpperCase()}] ${p.name}: ${p.reason}${p.status === 'release' ? ` -> ${p.newTag}` : ''}`);
  for (const c of (p.status === 'blocked' ? p.blocking : p.commits).slice(0, 8)) {
    const files = c.files.map((f) => `${f.path}${f.cls === 'other' ? '' : `(${f.cls})`}`);
    console.log(`    ${c.short} ${c.verdict.padEnd(7)} ${c.author} | ${c.subject.slice(0, 70)}${files.length ? `\n             files: ${files.slice(0, 6).join(', ')}${files.length > 6 ? ` …+${files.length - 6}` : ''}` : ''}`);
  }
  const shown = p.status === 'blocked' ? p.blocking.length : p.commits.length;
  if (shown > 8) console.log(`    … ${shown - 8} more`);
}
const releases = plan.filter((p) => p.status === 'release');
const out = { sha: head, releases: releases.map(({ name, newTag, version, lastTag }) => ({ name, newTag, version, lastTag })) };

if (releases.length && flag('--check-ci')) {
  const ci = checkCi();
  if (!ci.ok) {
    console.log(`\n${ci.fatal ? '::error::' : '::warning::'}CI gate on ${head.slice(0, 8)}: ${ci.msg} — releasing nothing.`);
    out.releases = []; out.ciBlocked = ci.msg;
    if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(out, null, 2));
    process.exit(ci.fatal ? 2 : 0);
  }
  console.log(`\nCI gate: ${(cfg.ciWorkflows || []).join(', ')} green on ${head.slice(0, 8)}`);
}
if (opt('--json')) fs.writeFileSync(opt('--json'), JSON.stringify(out, null, 2));
if (!releases.length) { console.log('\nNothing to release.'); process.exit(0); }
if (!flag('--execute')) { console.log(`\nDRY RUN — would release: ${releases.map((r) => r.newTag).join(', ')}`); process.exit(0); }

// ---------------------------------------------------------------- execute
if (git(['rev-parse', 'HEAD']) !== head) { console.error('::error::--execute needs --ref to be the checked-out HEAD'); process.exit(2); }
if (git(['status', '--porcelain'])) { console.error('::error::working tree not clean'); process.exit(2); }
const made = [];
for (const r of releases) {
  const comp = cfg.components.find((c) => c.name === r.name);
  if (comp.versionFiles?.length) {
    for (const vf of comp.versionFiles) writeVersion(vf, readVersion(vf), r.version);
    if (comp.changelog) prependChangelog(comp.changelog, comp, r.lastTag, r.newTag, r.version, r.triggering);
    git(['add', '--', ...comp.versionFiles.map((v) => v.path), ...(comp.changelog ? [comp.changelog] : [])]);
    const vars = { name: comp.name, version: r.version, tag: r.newTag };
    const body = [`Automated patch release by .github/workflows/release-deps.yml: every commit`,
      `that touches ${comp.name} since ${r.lastTag} is a Renovate dependency update.`, '',
      ...r.triggering.map((c) => `- ${c.short} ${c.subject}`)].join('\n');
    git(['commit', '-q', '-m', fill(cfg.commitMessage, vars), '-m', body]);
  }
  made.push(r);
}
for (const r of made) {
  // Tag each version-file component at its own release commit, tag-only ones at the final HEAD.
  const comp = cfg.components.find((c) => c.name === r.name);
  const at = comp.versionFiles?.length
    ? git(['log', '-1', '--format=%H', '--fixed-strings', `--grep=${fill(cfg.commitMessage, { name: comp.name, version: r.version, tag: r.newTag })}`, `${head}..HEAD`])
    : git(['rev-parse', 'HEAD']);
  if (!at) throw new Error(`cannot find the release commit for ${r.newTag}`);
  if (cfg.annotatedTags) git(['tag', '-a', r.newTag, '-m', fill(cfg.tagMessage || 'Release {version}', { version: r.version, tag: r.newTag, name: r.name }), at]);
  else git(['tag', r.newTag, at]);
  console.log(`tagged ${r.newTag} at ${at.slice(0, 8)}`);
}
if (!flag('--push')) { console.log('\n--execute without --push: commits and tags are local only.'); process.exit(0); }

// Main first (a non-fast-forward rejection aborts before any tag leaves), then ONE
// tag per push: GitHub drops the workflow events of a push carrying more than 3 tags.
if (git(['rev-parse', 'HEAD']) !== head) git(['push', 'origin', 'HEAD:refs/heads/main']);
for (const r of made) {
  git(['push', 'origin', `refs/tags/${r.newTag}`]);
  console.log(`pushed ${r.newTag}`);
  if (cfg.githubRelease) {
    const notes = [`Dependency-only patch release (Renovate). Since ${r.lastTag}:`, '',
      ...r.triggering.map((c) => `- ${c.short} ${c.subject}`)].join('\n');
    execFileSync('gh', ['release', 'create', r.newTag, '--repo', REPO, '--verify-tag',
      '--title', fill(cfg.githubRelease.name || 'Release {version}', { version: r.version, tag: r.newTag }), '--notes', notes],
      // A release created with the default GITHUB_TOKEN fires no `release` workflows; the deploys need RELEASE_TOKEN.
      { stdio: 'inherit', env: { ...process.env, GH_TOKEN: process.env.RELEASE_GH_TOKEN || process.env.GH_TOKEN } });
    console.log(`created GitHub release ${r.newTag}`);
  }
}
