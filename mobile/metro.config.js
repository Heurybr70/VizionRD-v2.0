const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// shared/ está un nivel arriba de mobile/
const sharedRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// Incluir shared/ en el watcher para que Metro resuelva ../shared/...
config.watchFolders = [sharedRoot];

// SOLO node_modules de mobile/ — evita que firebase se cargue dos veces
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// Resolver módulos desde mobile/ con prioridad absoluta
config.resolver.extraNodeModules = new Proxy({}, {
  get: (target, name) => path.resolve(projectRoot, 'node_modules', name),
});

module.exports = config;
