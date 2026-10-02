const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// The video workspace has its own dependencies and is never part of the app
// bundle. Without this, Metro crawls video/node_modules on every build.
const videoDir = path.join(__dirname, 'video').replace(/[\\/]/g, '[\\\\/]');
const existing = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
  new RegExp(`^${videoDir}[\\\\/].*`),
];

module.exports = config;
