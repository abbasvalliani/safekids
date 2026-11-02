// ESM files may declare their own `require` (`createRequire(import.meta.url)`),
// which would shadow the require() calls that the CommonJS transform emits.
// Used by the ESM-to-CommonJS transform in jest.preset.js.
module.exports = function renameModuleLevelRequire() {
  return {
    name: 'rename-module-level-require',
    visitor: {
      Program(path) {
        if (path.scope.hasOwnBinding('require')) {
          path.scope.rename('require', path.scope.generateUid('esmRequire'));
        }
      },
    },
  };
};
