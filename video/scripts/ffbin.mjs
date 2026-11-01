/**
 * ffmpeg and ffprobe from Remotion's compositor package for this machine
 * (Linux in CI), falling back to whatever is on the PATH. On macOS the
 * bundled binaries only run inside Remotion (they need its libraries), so
 * each one is tried once before it is used.
 */
import { execFileSync } from 'node:child_process';
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

const runs = (bin) => {
  try {
    execFileSync(bin, ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

export function ffbin(name) {
  const bundled = PACKAGE && path.join(VIDEO, 'node_modules', '@remotion', PACKAGE, name);
  return bundled && existsSync(bundled) && runs(bundled) ? bundled : name;
}
