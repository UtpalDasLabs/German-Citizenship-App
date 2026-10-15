/**
 * ffmpeg and ffprobe from Remotion's compositor package for this machine
 * (Linux in CI, macOS locally), falling back to whatever is on the PATH.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VIDEO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = {
  'linux-x64': 'compositor-linux-x64-gnu',
  'linux-arm64': 'compositor-linux-arm64-gnu',
  'darwin-arm64': 'compositor-darwin-arm64',
  'darwin-x64': 'compositor-darwin-x64',
}[`${process.platform}-${process.arch}`];

export function ffbin(name) {
  const bundled = PACKAGE && path.join(VIDEO, 'node_modules', '@remotion', PACKAGE, name);
  return bundled && existsSync(bundled) ? bundled : name;
}
