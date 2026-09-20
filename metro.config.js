const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web implementation loads a wa-sqlite .wasm file; Metro needs to
// know to treat it as an asset. (Web is not an officially supported platform for
// this app — see README — but this makes `npm run web` boot far enough to preview
// UI in a regular browser during development.)
config.resolver.assetExts.push('wasm');

module.exports = withNativeWind(config, { input: './src/global.css' });
