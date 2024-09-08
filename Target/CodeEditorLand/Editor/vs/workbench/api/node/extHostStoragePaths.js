import * as fs from "fs";
import { IntervalTimer, timeout } from "../../../base/common/async.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { Schemas } from "../../../base/common/network.js";
import * as path from "../../../base/common/path.js";
import { URI } from "../../../base/common/uri.js";
import { Promises } from "../../../base/node/pfs.js";
import { ExtensionStoragePaths as CommonExtensionStoragePaths } from "../common/extHostStoragePaths.js";
class ExtensionStoragePaths extends CommonExtensionStoragePaths {
  _workspaceStorageLock = null;
  async _getWorkspaceStorageURI(storageName) {
    const workspaceStorageURI = await super._getWorkspaceStorageURI(
      storageName
    );
    if (workspaceStorageURI.scheme !== Schemas.file) {
      return workspaceStorageURI;
    }
    if (this._environment.skipWorkspaceStorageLock) {
      this._logService.info(
        `Skipping acquiring lock for ${workspaceStorageURI.fsPath}.`
      );
      return workspaceStorageURI;
    }
    const workspaceStorageBase = workspaceStorageURI.fsPath;
    let attempt = 0;
    do {
      let workspaceStoragePath;
      if (attempt === 0) {
        workspaceStoragePath = workspaceStorageBase;
      } else {
        workspaceStoragePath = /[/\\]$/.test(workspaceStorageBase) ? `${workspaceStorageBase.substr(0, workspaceStorageBase.length - 1)}-${attempt}` : `${workspaceStorageBase}-${attempt}`;
      }
      await mkdir(workspaceStoragePath);
      const lockfile = path.join(workspaceStoragePath, "vscode.lock");
      const lock = await tryAcquireLock(
        this._logService,
        lockfile,
        false
      );
      if (lock) {
        this._workspaceStorageLock = lock;
        process.on("exit", () => {
          lock.dispose();
        });
        return URI.file(workspaceStoragePath);
      }
      attempt++;
    } while (attempt < 10);
    return workspaceStorageURI;
  }
  onWillDeactivateAll() {
    this._workspaceStorageLock?.setWillRelease(6e3);
  }
}
async function mkdir(dir) {
  try {
    await fs.promises.stat(dir);
    return;
  } catch {
  }
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch {
  }
}
const MTIME_UPDATE_TIME = 1e3;
const STALE_LOCK_TIME = 10 * 60 * 1e3;
class Lock extends Disposable {
  constructor(logService, filename) {
    super();
    this.logService = logService;
    this.filename = filename;
    this._timer = this._register(new IntervalTimer());
    this._timer.cancelAndSet(async () => {
      const contents = await readLockfileContents(logService, filename);
      if (!contents || contents.pid !== process.pid) {
        logService.info(
          `Lock '${filename}': The lock was lost unexpectedly.`
        );
        this._timer.cancel();
      }
      try {
        await fs.promises.utimes(filename, /* @__PURE__ */ new Date(), /* @__PURE__ */ new Date());
      } catch (err) {
        logService.error(err);
        logService.info(`Lock '${filename}': Could not update mtime.`);
      }
    }, MTIME_UPDATE_TIME);
  }
  _timer;
  dispose() {
    super.dispose();
    try {
      fs.unlinkSync(this.filename);
    } catch (err) {
    }
  }
  async setWillRelease(timeUntilReleaseMs) {
    this.logService.info(
      `Lock '${this.filename}': Marking the lockfile as scheduled to be released in ${timeUntilReleaseMs} ms.`
    );
    try {
      const contents = {
        pid: process.pid,
        willReleaseAt: Date.now() + timeUntilReleaseMs
      };
      await Promises.writeFile(this.filename, JSON.stringify(contents), {
        flag: "w"
      });
    } catch (err) {
      this.logService.error(err);
    }
  }
}
async function tryAcquireLock(logService, filename, isSecondAttempt) {
  try {
    const contents2 = {
      pid: process.pid,
      willReleaseAt: 0
    };
    await Promises.writeFile(filename, JSON.stringify(contents2), {
      flag: "wx"
    });
  } catch (err) {
    logService.error(err);
  }
  const contents = await readLockfileContents(logService, filename);
  if (!contents || contents.pid !== process.pid) {
    if (isSecondAttempt) {
      logService.info(
        `Lock '${filename}': Could not acquire lock, giving up.`
      );
      return null;
    }
    logService.info(
      `Lock '${filename}': Could not acquire lock, checking if the file is stale.`
    );
    return checkStaleAndTryAcquireLock(logService, filename);
  }
  logService.info(`Lock '${filename}': Lock acquired.`);
  return new Lock(logService, filename);
}
async function readLockfileContents(logService, filename) {
  let contents;
  try {
    contents = await fs.promises.readFile(filename);
  } catch (err) {
    logService.error(err);
    return null;
  }
  try {
    return JSON.parse(String(contents));
  } catch (err) {
    logService.error(err);
    return null;
  }
}
async function readmtime(logService, filename) {
  let stats;
  try {
    stats = await fs.promises.stat(filename);
  } catch (err) {
    logService.error(err);
    return 0;
  }
  return stats.mtime.getTime();
}
function processExists(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}
async function checkStaleAndTryAcquireLock(logService, filename) {
  const contents = await readLockfileContents(logService, filename);
  if (!contents) {
    logService.info(
      `Lock '${filename}': Could not read pid of lock holder.`
    );
    return tryDeleteAndAcquireLock(logService, filename);
  }
  if (contents.willReleaseAt) {
    let timeUntilRelease = contents.willReleaseAt - Date.now();
    if (timeUntilRelease < 5e3) {
      if (timeUntilRelease > 0) {
        logService.info(
          `Lock '${filename}': The lockfile is scheduled to be released in ${timeUntilRelease} ms.`
        );
      } else {
        logService.info(
          `Lock '${filename}': The lockfile is scheduled to have been released.`
        );
      }
      while (timeUntilRelease > 0) {
        await timeout(Math.min(100, timeUntilRelease));
        const mtime = await readmtime(logService, filename);
        if (mtime === 0) {
          return tryDeleteAndAcquireLock(logService, filename);
        }
        timeUntilRelease = contents.willReleaseAt - Date.now();
      }
      return tryDeleteAndAcquireLock(logService, filename);
    }
  }
  if (!processExists(contents.pid)) {
    logService.info(
      `Lock '${filename}': The pid ${contents.pid} appears to be gone.`
    );
    return tryDeleteAndAcquireLock(logService, filename);
  }
  const mtime1 = await readmtime(logService, filename);
  const elapsed1 = Date.now() - mtime1;
  if (elapsed1 <= STALE_LOCK_TIME) {
    logService.info(
      `Lock '${filename}': The lock does not look stale, elapsed: ${elapsed1} ms, giving up.`
    );
    return null;
  }
  logService.info(
    `Lock '${filename}': The lock looks stale, waiting for 2s.`
  );
  await timeout(2e3);
  const mtime2 = await readmtime(logService, filename);
  const elapsed2 = Date.now() - mtime2;
  if (elapsed2 <= STALE_LOCK_TIME) {
    logService.info(
      `Lock '${filename}': The lock does not look stale, elapsed: ${elapsed2} ms, giving up.`
    );
    return null;
  }
  logService.info(
    `Lock '${filename}': The lock looks stale even after waiting for 2s.`
  );
  return tryDeleteAndAcquireLock(logService, filename);
}
async function tryDeleteAndAcquireLock(logService, filename) {
  logService.info(`Lock '${filename}': Deleting a stale lock.`);
  try {
    await fs.promises.unlink(filename);
  } catch (err) {
  }
  return tryAcquireLock(logService, filename, true);
}
export {
  ExtensionStoragePaths
};
