const nxPreset = require('@nx/jest/preset').default;

// Packages that ship ESM only (NestJS 12, uuid 12+, htmlparser2 12 and its
// dom* helpers, which sanitize-html loads). The unit tests run as CommonJS,
// and Jest can only load ESM from CommonJS through node:vm modules, which
// needs Node's --experimental-vm-modules flag. Instead, these packages are
// compiled to CommonJS by babel-jest (import.meta and import() included), so
// the suites run on plain Node without experimental flags.
const esmOnlyPackages = [
  '@nestjs',
  'uuid',
  'htmlparser2',
  'domhandler',
  'domutils',
  'dom-serializer',
  'domelementtype',
  'entities',
];

const esmTransform = [
  'babel-jest',
  {
    babelrc: false,
    configFile: false,
    plugins: [
      require.resolve('./tools/jest/babel-plugin-rename-module-require'),
      require.resolve('babel-plugin-transform-import-meta'),
      require.resolve('@babel/plugin-transform-export-namespace-from'),
      require.resolve('@babel/plugin-transform-modules-commonjs'),
    ],
  },
];

module.exports = {
  ...nxPreset,
  // Jest merges preset and project transforms with the project's keys first,
  // so the projects' ts-jest patterns exclude /node_modules/ and these files
  // fall through to this entry.
  transform: {
    [`node_modules/(\\.pnpm/[^/]+/node_modules/)?(${esmOnlyPackages.join('|')})/.+\\.m?js$`]:
      esmTransform,
  },
  // Everything in node_modules stays untransformed except the packages above.
  transformIgnorePatterns: [
    `/node_modules/(?!(\\.pnpm|${esmOnlyPackages.join('|')})(/|\\+|@))`,
  ],
};
