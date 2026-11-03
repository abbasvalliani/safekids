'use strict';
// minimatch v3 exported the matcher itself (`require('minimatch')(path, pattern)`).
// minimatch >= 10 only has named exports, and every release before 11.0.1 carries
// GHSA-g3hv-75wg-m249 (DoS via globparts amplification). The v3 consumers in this
// tree (glob 7, test-exclude 6, fork-ts-checker-webpack-plugin, @eslint/eslintrc,
// eslint-plugin-import / -react / -jsx-a11y, jake, node-dir) use the callable
// default and/or the Minimatch class, so this re-exposes the patched matcher
// callable, with v3's statics (Minimatch, filter, GLOBSTAR, ...).
// Same approach as snowlawnpro tools/minimatch3-compat, plus glob 7 support.
const mm = require('minimatch');

// glob 7 walks `new Minimatch(p).set` itself, in minimatch 3's shape: literal
// parts are strings, `**` is the GLOBSTAR object (glob 7 also join()s rows, which
// throws on minimatch 11's Symbol), and every magic part is a RegExp-like with
// `_glob` (the source segment, for the dot-file check) usable in
// `entry.match(part)`. minimatch 11 puts a Symbol and its own Matcher objects
// there, so the v3 class exposes a translated copy as `set` and swaps minimatch
// 11's own rows back in while minimatch itself matches.
const GLOBSTAR = {};
const toV3Part = (part) => {
  if (part === mm.GLOBSTAR) return GLOBSTAR;
  if (part && typeof part === 'object' && typeof part.test === 'function') {
    return {
      _glob: part.pattern,
      test: (s) => part.test(s),
      [Symbol.match]: (s) => (part.test(s) ? [s] : null),
      toString: () => String(part),
    };
  }
  return part;
};

class Minimatch extends mm.Minimatch {
  constructor(pattern, options) {
    super(pattern, options);
    this._v11Set = this.set;
    this.set = (this.set || []).map((row) => row.map(toV3Part));
  }
  #withV11Set(fn) {
    const v3Set = this.set;
    this.set = this._v11Set;
    try {
      return fn();
    } finally {
      this.set = v3Set;
    }
  }
  match(f, partial) {
    return this.#withV11Set(() => super.match(f, partial));
  }
  matchOne(file, pattern, partial) {
    return this.#withV11Set(() => super.matchOne(file, pattern, partial));
  }
}

const minimatch = (path, pattern, options) => mm.minimatch(path, pattern, options);
Object.assign(minimatch, mm, {
  default: minimatch,
  minimatch,
  Minimatch,
  GLOBSTAR,
  // eslint-plugin-import's no-internal-modules only calls .test(path) on the result.
  makeRe: (pattern, options) => {
    if (typeof mm.makeRe === 'function') return mm.makeRe(pattern, options);
    const m = new mm.Minimatch(pattern, options);
    return { test: (path) => m.match(path) };
  },
});
module.exports = minimatch;
