const baseConfig =
  require('../../../jest.config').default ?? require('../../../jest.config');

module.exports = {
  ...baseConfig,
  rootDir: __dirname,
  testMatch: ['<rootDir>/**/*.test.{ts,tsx}'],
};
