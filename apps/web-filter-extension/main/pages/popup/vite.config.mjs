import {
  ROOT_DIR,
  MAIN_DIR,
  OUT_DIR,
  withCommonConfig,
} from '../../../withCommonConfig.mjs';
import path, { resolve } from 'node:path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { withPageConfig } from '../../../../../dist/libs/extension-vite-config';
import deepmerge from 'deepmerge';

const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(__filename);

const outDir = resolve(OUT_DIR, 'pages', 'popup');
const srcDir = resolve(MAIN_DIR, 'pages', 'popup', 'src');

export default withPageConfig({
  ...deepmerge(withCommonConfig(), {
    root: resolve(_dirname),
    resolve: {
      alias: {
        '@src': srcDir,
      },
    },
    build: {
      rolldownOptions: {
        external: ['chrome'],
        input: {
          main: resolve(_dirname, 'index.html'),
        },
      },
    },
    outDir: resolve(_dirname, '..', '..', 'dist'),
    publicDir: resolve(_dirname, 'public'),
  }),
});
