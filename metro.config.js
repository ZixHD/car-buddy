const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// expo-sqlite's web implementation loads a wa-sqlite .wasm file; Metro needs to
// know to treat it as an asset. (Web is not an officially supported platform for
// this app — see README — but this makes `npm run web` boot far enough to preview
// UI in a regular browser during development.)
config.resolver.assetExts.push('wasm');

// Tried adding Cross-Origin-Opener-Policy/Cross-Origin-Embedder-Policy headers
// here via config.server.enhanceMiddleware to unlock SharedArrayBuffer (which
// expo-sqlite's web backend needs) — confirmed via a direct header check that
// Expo's dev server (this SDK) serves the HTML document through its own internal
// route handler, not this Metro middleware hook, so the headers never reach the
// page and window.crossOriginIsolated stays false. Not pursuing further; see
// README's "Web is not supported" note.

module.exports = withNativeWind(config, { input: './src/global.css' });
