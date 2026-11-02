import type { Plugin } from 'vite';

// Vite 8 bundles with Rolldown, which has no `renderDynamicImport` hook. The
// hook only changed output for Firefox builds (everything else kept the plain
// `import(...)`), so the Firefox rewrite now runs on the rendered chunks: a
// dynamic import of a relative path in our own code is resolved against the
// extension root with browser.runtime.getURL.
export default function customDynamicImport(): Plugin {
  return {
    name: 'custom-dynamic-import',
    renderChunk(code, chunk) {
      if (!process.env.__FIREFOX__) {
        return null;
      }
      if (chunk.moduleIds.every((id) => id.includes('node_modules'))) {
        return null;
      }
      const rewritten = code.replace(
        /\bimport\((['"`])(\.{1,2}\/[^'"`]*)\1\)/g,
        (_match, quote: string, specifier: string) =>
          `import(browser.runtime.getURL('./') + ${quote}${specifier}${quote}.split('../').join(''))`,
      );
      return rewritten === code ? null : { code: rewritten, map: null };
    },
  };
}
