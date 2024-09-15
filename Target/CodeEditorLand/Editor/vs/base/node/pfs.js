var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as fs from "fs";
import { tmpdir } from "os";
import { promisify } from "util";
import { ResourceQueue, timeout } from "../common/async.js";
import { isEqualOrParent, isRootOrDriveLetter, randomPath } from "../common/extpath.js";
import { normalizeNFC } from "../common/normalization.js";
import { join } from "../common/path.js";
import { isLinux, isMacintosh, isWindows } from "../common/platform.js";
import { extUriBiasedIgnorePathCase } from "../common/resources.js";
import { URI } from "../common/uri.js";
var RimRafMode = /* @__PURE__ */ ((RimRafMode2) => {
  RimRafMode2[RimRafMode2["UNLINK"] = 0] = "UNLINK";
  RimRafMode2[RimRafMode2["MOVE"] = 1] = "MOVE";
  return RimRafMode2;
})(RimRafMode || {});
async function rimraf(path, mode = 0 /* UNLINK */, moveToPath) {
  if (isRootOrDriveLetter(path)) {
    throw new Error("rimraf - will refuse to recursively delete root");
  }
  if (mode === 0 /* UNLINK */) {
    return rimrafUnlink(path);
  }
  return rimrafMove(path, moveToPath);
}
__name(rimraf, "rimraf");
async function rimrafMove(path, moveToPath = randomPath(tmpdir())) {
  try {
    try {
      await fs.promises.rename(path, moveToPath);
    } catch (error) {
      if (error.code === "ENOENT") {
        return;
      }
      return rimrafUnlink(path);
    }
    rimrafUnlink(moveToPath).catch((error) => {
    });
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}
__name(rimrafMove, "rimrafMove");
async function rimrafUnlink(path) {
  return fs.promises.rm(path, { recursive: true, force: true, maxRetries: 3 });
}
__name(rimrafUnlink, "rimrafUnlink");
function rimrafSync(path) {
  if (isRootOrDriveLetter(path)) {
    throw new Error("rimraf - will refuse to recursively delete root");
  }
  fs.rmSync(path, { recursive: true, force: true, maxRetries: 3 });
}
__name(rimrafSync, "rimrafSync");
async function readdir(path, options) {
  return handleDirectoryChildren(await (options ? safeReaddirWithFileTypes(path) : fs.promises.readdir(path)));
}
__name(readdir, "readdir");
async function safeReaddirWithFileTypes(path) {
  try {
    return await fs.promises.readdir(path, { withFileTypes: true });
  } catch (error) {
    console.warn("[node.js fs] readdir with filetypes failed with error: ", error);
  }
  const result = [];
  const children = await readdir(path);
  for (const child of children) {
    let isFile = false;
    let isDirectory = false;
    let isSymbolicLink = false;
    try {
      const lstat = await fs.promises.lstat(join(path, child));
      isFile = lstat.isFile();
      isDirectory = lstat.isDirectory();
      isSymbolicLink = lstat.isSymbolicLink();
    } catch (error) {
      console.warn("[node.js fs] unexpected error from lstat after readdir: ", error);
    }
    result.push({
      name: child,
      isFile: /* @__PURE__ */ __name(() => isFile, "isFile"),
      isDirectory: /* @__PURE__ */ __name(() => isDirectory, "isDirectory"),
      isSymbolicLink: /* @__PURE__ */ __name(() => isSymbolicLink, "isSymbolicLink")
    });
  }
  return result;
}
__name(safeReaddirWithFileTypes, "safeReaddirWithFileTypes");
function readdirSync(path) {
  return handleDirectoryChildren(fs.readdirSync(path));
}
__name(readdirSync, "readdirSync");
function handleDirectoryChildren(children) {
  return children.map((child) => {
    if (typeof child === "string") {
      return isMacintosh ? normalizeNFC(child) : child;
    }
    child.name = isMacintosh ? normalizeNFC(child.name) : child.name;
    return child;
  });
}
__name(handleDirectoryChildren, "handleDirectoryChildren");
async function readDirsInDir(dirPath) {
  const children = await readdir(dirPath);
  const directories = [];
  for (const child of children) {
    if (await SymlinkSupport.existsDirectory(join(dirPath, child))) {
      directories.push(child);
    }
  }
  return directories;
}
__name(readDirsInDir, "readDirsInDir");
function whenDeleted(path, intervalMs = 1e3) {
  return new Promise((resolve) => {
    let running = false;
    const interval = setInterval(() => {
      if (!running) {
        running = true;
        fs.access(path, (err) => {
          running = false;
          if (err) {
            clearInterval(interval);
            resolve(void 0);
          }
        });
      }
    }, intervalMs);
  });
}
__name(whenDeleted, "whenDeleted");
var SymlinkSupport;
((SymlinkSupport2) => {
  async function stat(path) {
    let lstats;
    try {
      lstats = await fs.promises.lstat(path);
      if (!lstats.isSymbolicLink()) {
        return { stat: lstats };
      }
    } catch (error) {
    }
    try {
      const stats = await fs.promises.stat(path);
      return { stat: stats, symbolicLink: lstats?.isSymbolicLink() ? { dangling: false } : void 0 };
    } catch (error) {
      if (error.code === "ENOENT" && lstats) {
        return { stat: lstats, symbolicLink: { dangling: true } };
      }
      if (isWindows && error.code === "EACCES") {
        try {
          const stats = await fs.promises.stat(await fs.promises.readlink(path));
          return { stat: stats, symbolicLink: { dangling: false } };
        } catch (error2) {
          if (error2.code === "ENOENT" && lstats) {
            return { stat: lstats, symbolicLink: { dangling: true } };
          }
          throw error2;
        }
      }
      throw error;
    }
  }
  SymlinkSupport2.stat = stat;
  __name(stat, "stat");
  async function existsFile(path) {
    try {
      const { stat: stat2, symbolicLink } = await SymlinkSupport2.stat(path);
      return stat2.isFile() && symbolicLink?.dangling !== true;
    } catch (error) {
    }
    return false;
  }
  SymlinkSupport2.existsFile = existsFile;
  __name(existsFile, "existsFile");
  async function existsDirectory(path) {
    try {
      const { stat: stat2, symbolicLink } = await SymlinkSupport2.stat(path);
      return stat2.isDirectory() && symbolicLink?.dangling !== true;
    } catch (error) {
    }
    return false;
  }
  SymlinkSupport2.existsDirectory = existsDirectory;
  __name(existsDirectory, "existsDirectory");
})(SymlinkSupport || (SymlinkSupport = {}));
const writeQueues = new ResourceQueue();
function writeFile(path, data, options) {
  return writeQueues.queueFor(URI.file(path), () => {
    const ensuredOptions = ensureWriteOptions(options);
    return new Promise((resolve, reject) => doWriteFileAndFlush(path, data, ensuredOptions, (error) => error ? reject(error) : resolve()));
  }, extUriBiasedIgnorePathCase);
}
__name(writeFile, "writeFile");
let canFlush = true;
function configureFlushOnWrite(enabled) {
  canFlush = enabled;
}
__name(configureFlushOnWrite, "configureFlushOnWrite");
function doWriteFileAndFlush(path, data, options, callback) {
  if (!canFlush) {
    return fs.writeFile(path, data, { mode: options.mode, flag: options.flag }, callback);
  }
  fs.open(path, options.flag, options.mode, (openError, fd) => {
    if (openError) {
      return callback(openError);
    }
    fs.writeFile(fd, data, (writeError) => {
      if (writeError) {
        return fs.close(fd, () => callback(writeError));
      }
      fs.fdatasync(fd, (syncError) => {
        if (syncError) {
          console.warn("[node.js fs] fdatasync is now disabled for this session because it failed: ", syncError);
          configureFlushOnWrite(false);
        }
        return fs.close(fd, (closeError) => callback(closeError));
      });
    });
  });
}
__name(doWriteFileAndFlush, "doWriteFileAndFlush");
function writeFileSync(path, data, options) {
  const ensuredOptions = ensureWriteOptions(options);
  if (!canFlush) {
    return fs.writeFileSync(path, data, { mode: ensuredOptions.mode, flag: ensuredOptions.flag });
  }
  const fd = fs.openSync(path, ensuredOptions.flag, ensuredOptions.mode);
  try {
    fs.writeFileSync(fd, data);
    try {
      fs.fdatasyncSync(fd);
    } catch (syncError) {
      console.warn("[node.js fs] fdatasyncSync is now disabled for this session because it failed: ", syncError);
      configureFlushOnWrite(false);
    }
  } finally {
    fs.closeSync(fd);
  }
}
__name(writeFileSync, "writeFileSync");
function ensureWriteOptions(options) {
  if (!options) {
    return { mode: 438, flag: "w" };
  }
  return {
    mode: typeof options.mode === "number" ? options.mode : 438,
    flag: typeof options.flag === "string" ? options.flag : "w"
  };
}
__name(ensureWriteOptions, "ensureWriteOptions");
async function rename(source, target, windowsRetryTimeout = 6e4) {
  if (source === target) {
    return;
  }
  try {
    if (isWindows && typeof windowsRetryTimeout === "number") {
      await renameWithRetry(source, target, Date.now(), windowsRetryTimeout);
    } else {
      await fs.promises.rename(source, target);
    }
  } catch (error) {
    if (source.toLowerCase() !== target.toLowerCase() && error.code === "EXDEV" || source.endsWith(".")) {
      await copy(source, target, {
        preserveSymlinks: false
        /* copying to another device */
      });
      await rimraf(source, 1 /* MOVE */);
    } else {
      throw error;
    }
  }
}
__name(rename, "rename");
async function renameWithRetry(source, target, startTime, retryTimeout, attempt = 0) {
  try {
    return await fs.promises.rename(source, target);
  } catch (error) {
    if (error.code !== "EACCES" && error.code !== "EPERM" && error.code !== "EBUSY") {
      throw error;
    }
    if (Date.now() - startTime >= retryTimeout) {
      console.error(`[node.js fs] rename failed after ${attempt} retries with error: ${error}`);
      throw error;
    }
    if (attempt === 0) {
      let abortRetry = false;
      try {
        const { stat } = await SymlinkSupport.stat(target);
        if (!stat.isFile()) {
          abortRetry = true;
        }
      } catch (error2) {
      }
      if (abortRetry) {
        throw error;
      }
    }
    await timeout(Math.min(100, attempt * 10));
    return renameWithRetry(source, target, startTime, retryTimeout, attempt + 1);
  }
}
__name(renameWithRetry, "renameWithRetry");
async function copy(source, target, options) {
  return doCopy(source, target, { root: { source, target }, options, handledSourcePaths: /* @__PURE__ */ new Set() });
}
__name(copy, "copy");
const COPY_MODE_MASK = 511;
async function doCopy(source, target, payload) {
  if (payload.handledSourcePaths.has(source)) {
    return;
  } else {
    payload.handledSourcePaths.add(source);
  }
  const { stat, symbolicLink } = await SymlinkSupport.stat(source);
  if (symbolicLink) {
    if (payload.options.preserveSymlinks) {
      try {
        return await doCopySymlink(source, target, payload);
      } catch (error) {
      }
    }
    if (symbolicLink.dangling) {
      return;
    }
  }
  if (stat.isDirectory()) {
    return doCopyDirectory(source, target, stat.mode & COPY_MODE_MASK, payload);
  } else {
    return doCopyFile(source, target, stat.mode & COPY_MODE_MASK);
  }
}
__name(doCopy, "doCopy");
async function doCopyDirectory(source, target, mode, payload) {
  await fs.promises.mkdir(target, { recursive: true, mode });
  const files = await readdir(source);
  for (const file of files) {
    await doCopy(join(source, file), join(target, file), payload);
  }
}
__name(doCopyDirectory, "doCopyDirectory");
async function doCopyFile(source, target, mode) {
  await fs.promises.copyFile(source, target);
  await fs.promises.chmod(target, mode);
}
__name(doCopyFile, "doCopyFile");
async function doCopySymlink(source, target, payload) {
  let linkTarget = await fs.promises.readlink(source);
  if (isEqualOrParent(linkTarget, payload.root.source, !isLinux)) {
    linkTarget = join(payload.root.target, linkTarget.substr(payload.root.source.length + 1));
  }
  await fs.promises.symlink(linkTarget, target);
}
__name(doCopySymlink, "doCopySymlink");
const Promises = new class {
  //#region Implemented by node.js
  get read() {
    return (fd, buffer, offset, length, position) => {
      return new Promise((resolve, reject) => {
        fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer2) => {
          if (err) {
            return reject(err);
          }
          return resolve({ bytesRead, buffer: buffer2 });
        });
      });
    };
  }
  get write() {
    return (fd, buffer, offset, length, position) => {
      return new Promise((resolve, reject) => {
        fs.write(fd, buffer, offset, length, position, (err, bytesWritten, buffer2) => {
          if (err) {
            return reject(err);
          }
          return resolve({ bytesWritten, buffer: buffer2 });
        });
      });
    };
  }
  get fdatasync() {
    return promisify(fs.fdatasync);
  }
  // not exposed as API in 20.x yet
  get open() {
    return promisify(fs.open);
  }
  // changed to return `FileHandle` in promise API
  get close() {
    return promisify(fs.close);
  }
  // not exposed as API due to the `FileHandle` return type of `open`
  get realpath() {
    return promisify(fs.realpath);
  }
  // `fs.promises.realpath` will use `fs.realpath.native` which we do not want
  //#endregion
  //#region Implemented by us
  async exists(path) {
    try {
      await fs.promises.access(path);
      return true;
    } catch {
      return false;
    }
  }
  get readdir() {
    return readdir;
  }
  get readDirsInDir() {
    return readDirsInDir;
  }
  get writeFile() {
    return writeFile;
  }
  get rm() {
    return rimraf;
  }
  get rename() {
    return rename;
  }
  get copy() {
    return copy;
  }
  //#endregion
}();
export {
  Promises,
  RimRafMode,
  SymlinkSupport,
  configureFlushOnWrite,
  readdirSync,
  rimrafSync,
  whenDeleted,
  writeFileSync
};
//# sourceMappingURL=pfs.js.map
