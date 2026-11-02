/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path, { resolve } from 'path';
import makeManifest from '../../tools/extension/plugins/make-manifest';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import customDynamicImport from '../../tools/extension/plugins/custom-dynamic-import';
import addHmr from '../../tools/extension/plugins/add-hmr';
import watchRebuild from '../../tools/extension/plugins/watch-rebuild';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import process from 'process';

// import postcss from 'rollup-plugin-postcss';
// import {
//   createStyleImportPlugin,
//   AndDesignVueResolve,
//   VantResolve,
//   ElementPlusResolve,
//   NutuiResolve,
//   AntdResolve,
// } from 'vite-plugin-style-import'

const rootDir = resolve(__dirname);
const rootProjectDir = resolve(rootDir, '../..');
const nodeModulesDir = resolve(rootProjectDir, 'node_modules');
const modelsDir = resolve(rootProjectDir, 'model_files');
const manifestFile = resolve(rootDir, 'manifest.mjs');
const srcDir = resolve(rootDir, 'src');
const testUtilsDir = resolve(rootDir, 'test-utils', 'app');
const pagesDir = resolve(srcDir, 'pages');
const assetsDir = resolve(srcDir, 'assets');
const outDir = resolve(
  rootDir,
  '../../dist/apps/web-filter-extension-companion',
);
const publicDir = resolve(rootDir, 'public');
const sharedDir = resolve(srcDir, 'shared');

const APP_ENV = process.env.APP_ENV || 'production';
let API_URL = process.env.API_URL;
let PUBLIC_URL = process.env.PUBLIC_URL;
let NODE_ENV = process.env.NODE_ENV;

const isProduction = APP_ENV === 'production';
const isDev = !isProduction;

if (!PUBLIC_URL) {
  PUBLIC_URL = isProduction
    ? 'https://app.safekids.ai'
    : 'http://localhost:5200';
}

if (!API_URL) {
  API_URL = isProduction ? 'https://api.safekids.ai' : 'http://localhost:3000';
}

// ENABLE HMR IN BACKGROUND SCRIPT
const enableHmrInBackgroundScript = true;
const cacheInvalidationKeyRef = { current: generateKey() };

export default defineConfig({
  resolve: {
    alias: {
      '@root': rootDir,
      '@src': srcDir,
      '@shared': sharedDir,
      '@assets': assetsDir,
      '@pages': pagesDir,
      '@public': publicDir,
      '@test-utils': testUtilsDir,
    },
  },
  define: {
    'import.meta.env.APP_ENV': JSON.stringify(APP_ENV),
    'import.meta.env.API_URL': JSON.stringify(API_URL),
  },
  plugins: [
    react(),
    nxViteTsPaths(),
    makeManifest({ getCacheInvalidationKey }, outDir, manifestFile),
    customDynamicImport(),
    addHmr({ background: enableHmrInBackgroundScript, view: true }),
    isDev && watchRebuild({ afterWriteBundle: regenerateCacheInvalidationKey }),
  ],
  publicDir,
  build: {
    outDir,
    /** Can slow down build speed. */
    // sourcemap: isDev,
    minify: isProduction,
    modulePreload: false,
    reportCompressedSize: isProduction,
    emptyOutDir: !isDev,
    rolldownOptions: {
      // plugins: [
      //   chromeExtension(),
      //   simpleReloader()
      // ],
      input: {
        background: resolve(pagesDir, 'background', 'index.ts'),
        popup: resolve(pagesDir, 'popup', 'index.html'),
        content: resolve(pagesDir, 'content', 'index.ts'),
      },
      output: {
        // manualChunks: {} (Rolldown only takes a function; {} never split anything)
        entryFileNames: 'src/pages/[name]/index.js',
        chunkFileNames: isDev
          ? 'assets/js/[name].js'
          : 'assets/js/[name].[hash].js',
        assetFileNames: (assetInfo) => {
          const { name } = path.parse(assetInfo.name);
          const assetFileName =
            name === 'contentStyle'
              ? `${name}${getCacheInvalidationKey()}`
              : name;
          return `assets/[ext]/${assetFileName}.chunk.[ext]`;
        },
      },
      plugins: [],
    },
  },
});

function getCacheInvalidationKey() {
  return cacheInvalidationKeyRef.current;
}

function regenerateCacheInvalidationKey() {
  cacheInvalidationKeyRef.current = generateKey();
  return cacheInvalidationKeyRef;
}

function generateKey(): string {
  return `${Date.now().toFixed()}`;
}
