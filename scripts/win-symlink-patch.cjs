/**
 * Windows-only shim for the OpenNext packaging step.
 *
 * OpenNext copies the Next.js standalone output and recreates npm's symlinked
 * `node_modules` entries. On Windows, creating those links needs Developer Mode
 * or elevation, so `fs.symlink` fails with EPERM. Directory junctions need no
 * privileges and behave the same for module resolution, so retry with a
 * junction when a plain symlink is refused.
 *
 * Used only for local `opennextjs-cloudflare build`; it is never deployed.
 */
const fs = require("node:fs");

function isDir(target) {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

const originalSync = fs.symlinkSync;
fs.symlinkSync = function symlinkSync(target, path, type) {
  try {
    return originalSync.call(fs, target, path, type);
  } catch (error) {
    if (error && (error.code === "EPERM" || error.code === "EACCES") && isDir(target)) {
      return fs.linkSync ? originalSync.call(fs, target, path, "junction") : Promise.reject(error);
    }
    throw error;
  }
};

const original = fs.symlink;
fs.symlink = function symlink(target, path, type, callback) {
  const cb = typeof type === "function" ? type : callback;
  const linkType = typeof type === "string" ? type : undefined;

  if (typeof cb !== "function") {
    try {
      return fs.symlinkSync(target, path, linkType);
    } catch (error) {
      throw error;
    }
  }

  fs.symlinkSync(target, path, linkType);
  process.nextTick(() => cb(null));
};

const originalPromises = fs.promises.symlink;
fs.promises.symlink = async function symlinkAsync(target, path, type) {
  try {
    return await originalPromises.call(fs.promises, target, path, type);
  } catch (error) {
    if (error && (error.code === "EPERM" || error.code === "EACCES") && isDir(target)) {
      return originalPromises.call(fs.promises, target, path, "junction");
    }
    throw error;
  }
};
