import { defineConfig } from 'vite';
import {
  OUT_DIR,
  MODELS_DIR,
  NODE_MODULES_DIR,
  withCommonConfig,
  MAIN_DIR,
} from '../../withCommonConfig.mjs';
import { resolve } from 'node:path';
import deepmerge from 'deepmerge';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import makeManifestPlugin from './utils/plugins/make-manifest-plugin';
import {
  watchPublicPlugin,
  watchRebuildPlugin,
} from '../../../../dist/libs/extension-hmr';
import {
  isDev,
  isProduction,
  watchOption,
} from '../../../../dist/libs/extension-vite-config';

const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(__filename);

const outDir = resolve(OUT_DIR);

export default defineConfig({
  ...deepmerge(withCommonConfig(), {
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: `${NODE_MODULES_DIR}/onnxruntime-web/dist/*.wasm`,
            dest: `${outDir}/`,
          },
          {
            src: `${MODELS_DIR}/*`,
            dest: `${outDir}/models`,
          },
          {
            src: `${NODE_MODULES_DIR}/@inboxsdk/core/pageWorld.js`,
            dest: `${outDir}`,
          },
        ],
      }),
      ...(isDev ? [watchPublicPlugin()] : []),
      makeManifestPlugin({ outDir: OUT_DIR }),
      ...(isDev ? [watchRebuildPlugin({ reload: true })] : []),
    ],
  }),
  publicDir: resolve(_dirname, 'public'),
  build: {
    lib: {
      formats: ['iife'],
      entry: resolve(_dirname, 'src/index.ts'),
      name: 'BackgroundScript',
      fileName: 'background',
    },
    outDir,
    emptyOutDir: false,
    sourcemap: isDev,
    minify: isProduction,
    reportCompressedSize: isProduction,
    watch: watchOption,
    rolldownOptions: {
      external: ['chrome'],
    },
  },
});
