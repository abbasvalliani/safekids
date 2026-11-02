/* eslint-disable */
module.exports = {
  displayName: 'gmail-extension-background',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'jsdom',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/apps/gmail-extension-background',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
};
