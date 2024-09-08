import assert from "assert";
import * as fs from "fs";
import { tmpdir } from "os";
import { DeferredPromise, timeout } from "../../../../base/common/async.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { getDriveLetter } from "../../../../base/common/extpath.js";
import { FileAccess } from "../../../../base/common/network.js";
import { basename, dirname, join } from "../../../../base/common/path.js";
import {
  isLinux,
  isMacintosh,
  isWindows
} from "../../../../base/common/platform.js";
import { extUriBiasedIgnorePathCase } from "../../../../base/common/resources.js";
import { ltrim } from "../../../../base/common/strings.js";
import { URI } from "../../../../base/common/uri.js";
import { Promises, RimRafMode } from "../../../../base/node/pfs.js";
import { addUNCHostToAllowlist } from "../../../../base/node/unc.js";
import { getRandomTestPath } from "../../../../base/test/node/testUtils.js";
import { FileChangeFilter, FileChangeType } from "../../common/files.js";
import { NodeJSWatcher } from "../../node/watcher/nodejs/nodejsWatcher.js";
import { watchFileContents } from "../../node/watcher/nodejs/nodejsWatcherLib.js";
import { TestParcelWatcher } from "./parcelWatcher.integrationTest.js";
suite.skip("File Watcher (node.js)", () => {
  class TestNodeJSWatcher extends NodeJSWatcher {
    suspendedWatchRequestPollingInterval = 100;
    _onDidWatch = this._register(new Emitter());
    onDidWatch = this._onDidWatch.event;
    onWatchFail = this._onDidWatchFail.event;
    getUpdateWatchersDelay() {
      return 0;
    }
    async doWatch(requests) {
      await super.doWatch(requests);
      for (const watcher2 of this.watchers) {
        await watcher2.instance.ready;
      }
      this._onDidWatch.fire();
    }
  }
  let testDir;
  let watcher;
  let loggingEnabled = false;
  function enableLogging(enable) {
    loggingEnabled = enable;
    watcher?.setVerboseLogging(enable);
  }
  enableLogging(false);
  setup(async () => {
    await createWatcher(void 0);
    testDir = URI.file(
      getRandomTestPath(tmpdir(), "vsctests", "filewatcher")
    ).fsPath;
    const sourceDir = FileAccess.asFileUri(
      "vs/platform/files/test/node/fixtures/service"
    ).fsPath;
    await Promises.copy(sourceDir, testDir, { preserveSymlinks: false });
  });
  async function createWatcher(accessor) {
    await watcher?.stop();
    watcher?.dispose();
    watcher = new TestNodeJSWatcher(accessor);
    watcher?.setVerboseLogging(loggingEnabled);
    watcher.onDidLogMessage((e) => {
      if (loggingEnabled) {
        console.log(
          `[non-recursive watcher test message] ${e.message}`
        );
      }
    });
    watcher.onDidError((e) => {
      if (loggingEnabled) {
        console.log(`[non-recursive watcher test error] ${e}`);
      }
    });
  }
  teardown(async () => {
    await watcher.stop();
    watcher.dispose();
    return Promises.rm(testDir).catch((error) => console.error(error));
  });
  function toMsg(type) {
    switch (type) {
      case FileChangeType.ADDED:
        return "added";
      case FileChangeType.DELETED:
        return "deleted";
      default:
        return "changed";
    }
  }
  async function awaitEvent(service, path, type, correlationId, expectedCount) {
    if (loggingEnabled) {
      console.log(
        `Awaiting change type '${toMsg(type)}' on file '${path}'`
      );
    }
    await new Promise((resolve) => {
      let counter = 0;
      const disposable = service.onDidChangeFile((events) => {
        for (const event of events) {
          if (extUriBiasedIgnorePathCase.isEqual(
            event.resource,
            URI.file(path)
          ) && event.type === type && (correlationId === null || event.cId === correlationId)) {
            counter++;
            if (typeof expectedCount === "number" && counter < expectedCount) {
              continue;
            }
            disposable.dispose();
            resolve();
            break;
          }
        }
      });
    });
  }
  test("basics (folder watch)", async () => {
    const request = { path: testDir, excludes: [], recursive: false };
    await watcher.watch([request]);
    assert.strictEqual(watcher.isSuspended(request), false);
    const instance = Array.from(watcher.watchers)[0].instance;
    assert.strictEqual(instance.isReusingRecursiveWatcher, false);
    assert.strictEqual(instance.failed, false);
    const newFilePath = join(testDir, "newFile.txt");
    let changeFuture = awaitEvent(
      watcher,
      newFilePath,
      FileChangeType.ADDED
    );
    await Promises.writeFile(newFilePath, "Hello World");
    await changeFuture;
    const newFolderPath = join(testDir, "New Folder");
    changeFuture = awaitEvent(watcher, newFolderPath, FileChangeType.ADDED);
    await fs.promises.mkdir(newFolderPath);
    await changeFuture;
    let renamedFilePath = join(testDir, "renamedFile.txt");
    changeFuture = Promise.all([
      awaitEvent(watcher, newFilePath, FileChangeType.DELETED),
      awaitEvent(watcher, renamedFilePath, FileChangeType.ADDED)
    ]);
    await Promises.rename(newFilePath, renamedFilePath);
    await changeFuture;
    let renamedFolderPath = join(testDir, "Renamed Folder");
    changeFuture = Promise.all([
      awaitEvent(watcher, newFolderPath, FileChangeType.DELETED),
      awaitEvent(watcher, renamedFolderPath, FileChangeType.ADDED)
    ]);
    await Promises.rename(newFolderPath, renamedFolderPath);
    await changeFuture;
    const caseRenamedFilePath = join(testDir, "RenamedFile.txt");
    changeFuture = Promise.all([
      awaitEvent(watcher, renamedFilePath, FileChangeType.DELETED),
      awaitEvent(watcher, caseRenamedFilePath, FileChangeType.ADDED)
    ]);
    await Promises.rename(renamedFilePath, caseRenamedFilePath);
    await changeFuture;
    renamedFilePath = caseRenamedFilePath;
    const caseRenamedFolderPath = join(testDir, "REnamed Folder");
    changeFuture = Promise.all([
      awaitEvent(watcher, renamedFolderPath, FileChangeType.DELETED),
      awaitEvent(watcher, caseRenamedFolderPath, FileChangeType.ADDED)
    ]);
    await Promises.rename(renamedFolderPath, caseRenamedFolderPath);
    await changeFuture;
    renamedFolderPath = caseRenamedFolderPath;
    const movedFilepath = join(testDir, "movedFile.txt");
    changeFuture = Promise.all([
      awaitEvent(watcher, renamedFilePath, FileChangeType.DELETED),
      awaitEvent(watcher, movedFilepath, FileChangeType.ADDED)
    ]);
    await Promises.rename(renamedFilePath, movedFilepath);
    await changeFuture;
    const movedFolderpath = join(testDir, "Moved Folder");
    changeFuture = Promise.all([
      awaitEvent(watcher, renamedFolderPath, FileChangeType.DELETED),
      awaitEvent(watcher, movedFolderpath, FileChangeType.ADDED)
    ]);
    await Promises.rename(renamedFolderPath, movedFolderpath);
    await changeFuture;
    const copiedFilepath = join(testDir, "copiedFile.txt");
    changeFuture = awaitEvent(
      watcher,
      copiedFilepath,
      FileChangeType.ADDED
    );
    await fs.promises.copyFile(movedFilepath, copiedFilepath);
    await changeFuture;
    const copiedFolderpath = join(testDir, "Copied Folder");
    changeFuture = awaitEvent(
      watcher,
      copiedFolderpath,
      FileChangeType.ADDED
    );
    await Promises.copy(movedFolderpath, copiedFolderpath, {
      preserveSymlinks: false
    });
    await changeFuture;
    changeFuture = awaitEvent(
      watcher,
      copiedFilepath,
      FileChangeType.UPDATED
    );
    await Promises.writeFile(copiedFilepath, "Hello Change");
    await changeFuture;
    const anotherNewFilePath = join(testDir, "anotherNewFile.txt");
    changeFuture = awaitEvent(
      watcher,
      anotherNewFilePath,
      FileChangeType.ADDED
    );
    await Promises.writeFile(anotherNewFilePath, "Hello Another World");
    await changeFuture;
    changeFuture = awaitEvent(
      watcher,
      copiedFilepath,
      FileChangeType.DELETED
    );
    await fs.promises.unlink(copiedFilepath);
    await changeFuture;
    changeFuture = awaitEvent(
      watcher,
      copiedFolderpath,
      FileChangeType.DELETED
    );
    await fs.promises.rmdir(copiedFolderpath);
    await changeFuture;
    watcher.dispose();
  });
  test("basics (file watch)", async () => {
    const filePath = join(testDir, "lorem.txt");
    const request = { path: filePath, excludes: [], recursive: false };
    await watcher.watch([request]);
    assert.strictEqual(watcher.isSuspended(request), false);
    const instance = Array.from(watcher.watchers)[0].instance;
    assert.strictEqual(instance.isReusingRecursiveWatcher, false);
    assert.strictEqual(instance.failed, false);
    let changeFuture = awaitEvent(
      watcher,
      filePath,
      FileChangeType.UPDATED
    );
    await Promises.writeFile(filePath, "Hello Change");
    await changeFuture;
    changeFuture = awaitEvent(watcher, filePath, FileChangeType.DELETED);
    await fs.promises.unlink(filePath);
    await changeFuture;
    await Promises.writeFile(filePath, "Hello Change");
    await watcher.watch([]);
    await watcher.watch([
      { path: filePath, excludes: [], recursive: false }
    ]);
    changeFuture = awaitEvent(watcher, filePath, FileChangeType.DELETED);
    await Promises.rename(filePath, `${filePath}-moved`);
    await changeFuture;
  });
  test("atomic writes (folder watch)", async () => {
    await watcher.watch([
      { path: testDir, excludes: [], recursive: false }
    ]);
    const newFilePath = join(testDir, "lorem.txt");
    const changeFuture = awaitEvent(
      watcher,
      newFilePath,
      FileChangeType.UPDATED
    );
    await fs.promises.unlink(newFilePath);
    Promises.writeFile(newFilePath, "Hello Atomic World");
    await changeFuture;
  });
  test("atomic writes (file watch)", async () => {
    const filePath = join(testDir, "lorem.txt");
    await watcher.watch([
      { path: filePath, excludes: [], recursive: false }
    ]);
    const newFilePath = join(filePath);
    const changeFuture = awaitEvent(
      watcher,
      newFilePath,
      FileChangeType.UPDATED
    );
    await fs.promises.unlink(newFilePath);
    Promises.writeFile(newFilePath, "Hello Atomic World");
    await changeFuture;
  });
  test("multiple events (folder watch)", async () => {
    await watcher.watch([
      { path: testDir, excludes: [], recursive: false }
    ]);
    const newFilePath1 = join(testDir, "newFile-1.txt");
    const newFilePath2 = join(testDir, "newFile-2.txt");
    const newFilePath3 = join(testDir, "newFile-3.txt");
    const addedFuture1 = awaitEvent(
      watcher,
      newFilePath1,
      FileChangeType.ADDED
    );
    const addedFuture2 = awaitEvent(
      watcher,
      newFilePath2,
      FileChangeType.ADDED
    );
    const addedFuture3 = awaitEvent(
      watcher,
      newFilePath3,
      FileChangeType.ADDED
    );
    await Promise.all([
      await Promises.writeFile(newFilePath1, "Hello World 1"),
      await Promises.writeFile(newFilePath2, "Hello World 2"),
      await Promises.writeFile(newFilePath3, "Hello World 3")
    ]);
    await Promise.all([addedFuture1, addedFuture2, addedFuture3]);
    const changeFuture1 = awaitEvent(
      watcher,
      newFilePath1,
      FileChangeType.UPDATED
    );
    const changeFuture2 = awaitEvent(
      watcher,
      newFilePath2,
      FileChangeType.UPDATED
    );
    const changeFuture3 = awaitEvent(
      watcher,
      newFilePath3,
      FileChangeType.UPDATED
    );
    await Promise.all([
      await Promises.writeFile(newFilePath1, "Hello Update 1"),
      await Promises.writeFile(newFilePath2, "Hello Update 2"),
      await Promises.writeFile(newFilePath3, "Hello Update 3")
    ]);
    await Promise.all([changeFuture1, changeFuture2, changeFuture3]);
    const copyFuture1 = awaitEvent(
      watcher,
      join(testDir, "newFile-1-copy.txt"),
      FileChangeType.ADDED
    );
    const copyFuture2 = awaitEvent(
      watcher,
      join(testDir, "newFile-2-copy.txt"),
      FileChangeType.ADDED
    );
    const copyFuture3 = awaitEvent(
      watcher,
      join(testDir, "newFile-3-copy.txt"),
      FileChangeType.ADDED
    );
    await Promise.all([
      Promises.copy(
        join(testDir, "newFile-1.txt"),
        join(testDir, "newFile-1-copy.txt"),
        { preserveSymlinks: false }
      ),
      Promises.copy(
        join(testDir, "newFile-2.txt"),
        join(testDir, "newFile-2-copy.txt"),
        { preserveSymlinks: false }
      ),
      Promises.copy(
        join(testDir, "newFile-3.txt"),
        join(testDir, "newFile-3-copy.txt"),
        { preserveSymlinks: false }
      )
    ]);
    await Promise.all([copyFuture1, copyFuture2, copyFuture3]);
    const deleteFuture1 = awaitEvent(
      watcher,
      newFilePath1,
      FileChangeType.DELETED
    );
    const deleteFuture2 = awaitEvent(
      watcher,
      newFilePath2,
      FileChangeType.DELETED
    );
    const deleteFuture3 = awaitEvent(
      watcher,
      newFilePath3,
      FileChangeType.DELETED
    );
    await Promise.all([
      await fs.promises.unlink(newFilePath1),
      await fs.promises.unlink(newFilePath2),
      await fs.promises.unlink(newFilePath3)
    ]);
    await Promise.all([deleteFuture1, deleteFuture2, deleteFuture3]);
  });
  test("multiple events (file watch)", async () => {
    const filePath = join(testDir, "lorem.txt");
    await watcher.watch([
      { path: filePath, excludes: [], recursive: false }
    ]);
    const changeFuture1 = awaitEvent(
      watcher,
      filePath,
      FileChangeType.UPDATED
    );
    await Promise.all([
      await Promises.writeFile(filePath, "Hello Update 1"),
      await Promises.writeFile(filePath, "Hello Update 2"),
      await Promises.writeFile(filePath, "Hello Update 3")
    ]);
    await Promise.all([changeFuture1]);
  });
  test("excludes can be updated (folder watch)", async () => {
    await watcher.watch([
      { path: testDir, excludes: ["**"], recursive: false }
    ]);
    await watcher.watch([
      { path: testDir, excludes: [], recursive: false }
    ]);
    return basicCrudTest(join(testDir, "files-excludes.txt"));
  });
  test("excludes are ignored (file watch)", async () => {
    const filePath = join(testDir, "lorem.txt");
    await watcher.watch([
      { path: filePath, excludes: ["**"], recursive: false }
    ]);
    return basicCrudTest(filePath, true);
  });
  test("includes can be updated (folder watch)", async () => {
    await watcher.watch([
      {
        path: testDir,
        excludes: [],
        includes: ["nothing"],
        recursive: false
      }
    ]);
    await watcher.watch([
      { path: testDir, excludes: [], recursive: false }
    ]);
    return basicCrudTest(join(testDir, "files-includes.txt"));
  });
  test("non-includes are ignored (file watch)", async () => {
    const filePath = join(testDir, "lorem.txt");
    await watcher.watch([
      {
        path: filePath,
        excludes: [],
        includes: ["nothing"],
        recursive: false
      }
    ]);
    return basicCrudTest(filePath, true);
  });
  test("includes are supported (folder watch)", async () => {
    await watcher.watch([
      {
        path: testDir,
        excludes: [],
        includes: ["**/files-includes.txt"],
        recursive: false
      }
    ]);
    return basicCrudTest(join(testDir, "files-includes.txt"));
  });
  test("includes are supported (folder watch, relative pattern explicit)", async () => {
    await watcher.watch([
      {
        path: testDir,
        excludes: [],
        includes: [{ base: testDir, pattern: "files-includes.txt" }],
        recursive: false
      }
    ]);
    return basicCrudTest(join(testDir, "files-includes.txt"));
  });
  test("includes are supported (folder watch, relative pattern implicit)", async () => {
    await watcher.watch([
      {
        path: testDir,
        excludes: [],
        includes: ["files-includes.txt"],
        recursive: false
      }
    ]);
    return basicCrudTest(join(testDir, "files-includes.txt"));
  });
  test("correlationId is supported", async () => {
    const correlationId = Math.random();
    await watcher.watch([
      { correlationId, path: testDir, excludes: [], recursive: false }
    ]);
    return basicCrudTest(
      join(testDir, "newFile.txt"),
      void 0,
      correlationId
    );
  });
  (isWindows ? test.skip : test)("symlink support (folder watch)", async () => {
    const link = join(testDir, "deep-linked");
    const linkTarget = join(testDir, "deep");
    await fs.promises.symlink(linkTarget, link);
    await watcher.watch([{ path: link, excludes: [], recursive: false }]);
    return basicCrudTest(join(link, "newFile.txt"));
  });
  async function basicCrudTest(filePath, skipAdd, correlationId, expectedCount, awaitWatchAfterAdd) {
    let changeFuture;
    if (!skipAdd) {
      changeFuture = awaitEvent(
        watcher,
        filePath,
        FileChangeType.ADDED,
        correlationId,
        expectedCount
      );
      await Promises.writeFile(filePath, "Hello World");
      await changeFuture;
      if (awaitWatchAfterAdd) {
        await Event.toPromise(watcher.onDidWatch);
      }
    }
    changeFuture = awaitEvent(
      watcher,
      filePath,
      FileChangeType.UPDATED,
      correlationId,
      expectedCount
    );
    await Promises.writeFile(filePath, "Hello Change");
    await changeFuture;
    changeFuture = awaitEvent(
      watcher,
      filePath,
      FileChangeType.DELETED,
      correlationId,
      expectedCount
    );
    await fs.promises.unlink(await Promises.realpath(filePath));
    await changeFuture;
  }
  (isWindows ? test.skip : test)("symlink support (file watch)", async () => {
    const link = join(testDir, "lorem.txt-linked");
    const linkTarget = join(testDir, "lorem.txt");
    await fs.promises.symlink(linkTarget, link);
    await watcher.watch([{ path: link, excludes: [], recursive: false }]);
    return basicCrudTest(link, true);
  });
  (isWindows ? test : test.skip)(
    "unc support (folder watch)",
    async () => {
      addUNCHostToAllowlist("localhost");
      const uncPath = `\\\\localhost\\${getDriveLetter(testDir)?.toLowerCase()}$\\${ltrim(testDir.substr(testDir.indexOf(":") + 1), "\\")}`;
      await watcher.watch([
        { path: uncPath, excludes: [], recursive: false }
      ]);
      return basicCrudTest(join(uncPath, "newFile.txt"));
    }
  );
  (isWindows ? test : test.skip)(
    "unc support (file watch)",
    async () => {
      addUNCHostToAllowlist("localhost");
      const uncPath = `\\\\localhost\\${getDriveLetter(testDir)?.toLowerCase()}$\\${ltrim(testDir.substr(testDir.indexOf(":") + 1), "\\")}\\lorem.txt`;
      await watcher.watch([
        { path: uncPath, excludes: [], recursive: false }
      ]);
      return basicCrudTest(uncPath, true);
    }
  );
  (isLinux ? test.skip : test)(
    "wrong casing (folder watch)",
    async () => {
      const wrongCase = join(
        dirname(testDir),
        basename(testDir).toUpperCase()
      );
      await watcher.watch([
        { path: wrongCase, excludes: [], recursive: false }
      ]);
      return basicCrudTest(join(wrongCase, "newFile.txt"));
    }
  );
  (isLinux ? test.skip : test)(
    "wrong casing (file watch)",
    async () => {
      const filePath = join(testDir, "LOREM.txt");
      await watcher.watch([
        { path: filePath, excludes: [], recursive: false }
      ]);
      return basicCrudTest(filePath, true);
    }
  );
  test("invalid path does not explode", async () => {
    const invalidPath = join(testDir, "invalid");
    await watcher.watch([
      { path: invalidPath, excludes: [], recursive: false }
    ]);
  });
  test("watchFileContents", async () => {
    const watchedPath = join(testDir, "lorem.txt");
    const cts = new CancellationTokenSource();
    const readyPromise = new DeferredPromise();
    const chunkPromise = new DeferredPromise();
    const watchPromise = watchFileContents(
      watchedPath,
      () => chunkPromise.complete(),
      () => readyPromise.complete(),
      cts.token
    );
    await readyPromise.p;
    Promises.writeFile(watchedPath, "Hello World");
    await chunkPromise.p;
    cts.cancel();
    return watchPromise;
  });
  test("watching same or overlapping paths supported when correlation is applied", async () => {
    await watcher.watch([
      { path: testDir, excludes: [], recursive: false, correlationId: 1 }
    ]);
    await basicCrudTest(join(testDir, "newFile_1.txt"), void 0, null, 1);
    await watcher.watch([
      { path: testDir, excludes: [], recursive: false, correlationId: 1 },
      { path: testDir, excludes: [], recursive: false, correlationId: 2 },
      {
        path: testDir,
        excludes: [],
        recursive: false,
        correlationId: void 0
      }
    ]);
    await basicCrudTest(join(testDir, "newFile_2.txt"), void 0, null, 3);
    await basicCrudTest(
      join(testDir, "otherNewFile.txt"),
      void 0,
      null,
      3
    );
  });
  test("watching missing path emits watcher fail event", async () => {
    const onDidWatchFail = Event.toPromise(watcher.onWatchFail);
    const folderPath = join(testDir, "missing");
    watcher.watch([{ path: folderPath, excludes: [], recursive: true }]);
    await onDidWatchFail;
  });
  test("deleting watched path emits watcher fail and delete event when correlated (file watch)", async () => {
    const filePath = join(testDir, "lorem.txt");
    await watcher.watch([
      {
        path: filePath,
        excludes: [],
        recursive: false,
        correlationId: 1
      }
    ]);
    const instance = Array.from(watcher.watchers)[0].instance;
    const onDidWatchFail = Event.toPromise(watcher.onWatchFail);
    const changeFuture = awaitEvent(
      watcher,
      filePath,
      FileChangeType.DELETED,
      1
    );
    fs.promises.unlink(filePath);
    await onDidWatchFail;
    await changeFuture;
    assert.strictEqual(instance.failed, true);
  });
  (isMacintosh || isWindows ? test.skip : test)(
    "deleting watched path emits watcher fail and delete event when correlated (folder watch)",
    async () => {
      const folderPath = join(testDir, "deep");
      await watcher.watch([
        {
          path: folderPath,
          excludes: [],
          recursive: false,
          correlationId: 1
        }
      ]);
      const onDidWatchFail = Event.toPromise(watcher.onWatchFail);
      const changeFuture = awaitEvent(
        watcher,
        folderPath,
        FileChangeType.DELETED,
        1
      );
      Promises.rm(folderPath, RimRafMode.UNLINK);
      await onDidWatchFail;
      await changeFuture;
    }
  );
  test("correlated watch requests support suspend/resume (file, does not exist in beginning)", async () => {
    const filePath = join(testDir, "not-found.txt");
    const onDidWatchFail = Event.toPromise(watcher.onWatchFail);
    const request = {
      path: filePath,
      excludes: [],
      recursive: false,
      correlationId: 1
    };
    await watcher.watch([request]);
    await onDidWatchFail;
    assert.strictEqual(watcher.isSuspended(request), "polling");
    await basicCrudTest(filePath, void 0, 1, void 0, true);
    await basicCrudTest(filePath, void 0, 1, void 0, true);
  });
  test("correlated watch requests support suspend/resume (file, exists in beginning)", async () => {
    const filePath = join(testDir, "lorem.txt");
    const request = {
      path: filePath,
      excludes: [],
      recursive: false,
      correlationId: 1
    };
    await watcher.watch([request]);
    const onDidWatchFail = Event.toPromise(watcher.onWatchFail);
    await basicCrudTest(filePath, true, 1);
    await onDidWatchFail;
    assert.strictEqual(watcher.isSuspended(request), "polling");
    await basicCrudTest(filePath, void 0, 1, void 0, true);
  });
  test("correlated watch requests support suspend/resume (folder, does not exist in beginning)", async () => {
    let onDidWatchFail = Event.toPromise(watcher.onWatchFail);
    const folderPath = join(testDir, "not-found");
    const request = {
      path: folderPath,
      excludes: [],
      recursive: false,
      correlationId: 1
    };
    await watcher.watch([request]);
    await onDidWatchFail;
    assert.strictEqual(watcher.isSuspended(request), "polling");
    let changeFuture = awaitEvent(
      watcher,
      folderPath,
      FileChangeType.ADDED,
      1
    );
    let onDidWatch = Event.toPromise(watcher.onDidWatch);
    await fs.promises.mkdir(folderPath);
    await changeFuture;
    await onDidWatch;
    assert.strictEqual(watcher.isSuspended(request), false);
    const filePath = join(folderPath, "newFile.txt");
    await basicCrudTest(filePath, void 0, 1);
    if (!isMacintosh) {
      onDidWatchFail = Event.toPromise(watcher.onWatchFail);
      await fs.promises.rmdir(folderPath);
      await onDidWatchFail;
      changeFuture = awaitEvent(
        watcher,
        folderPath,
        FileChangeType.ADDED,
        1
      );
      onDidWatch = Event.toPromise(watcher.onDidWatch);
      await fs.promises.mkdir(folderPath);
      await changeFuture;
      await onDidWatch;
      await timeout(500);
      await basicCrudTest(filePath, void 0, 1);
    }
  });
  (isMacintosh ? test.skip : test)(
    "correlated watch requests support suspend/resume (folder, exists in beginning)",
    async () => {
      const folderPath = join(testDir, "deep");
      await watcher.watch([
        {
          path: folderPath,
          excludes: [],
          recursive: false,
          correlationId: 1
        }
      ]);
      const filePath = join(folderPath, "newFile.txt");
      await basicCrudTest(filePath, void 0, 1);
      const onDidWatchFail = Event.toPromise(watcher.onWatchFail);
      await Promises.rm(folderPath);
      await onDidWatchFail;
      const changeFuture = awaitEvent(
        watcher,
        folderPath,
        FileChangeType.ADDED,
        1
      );
      const onDidWatch = Event.toPromise(watcher.onDidWatch);
      await fs.promises.mkdir(folderPath);
      await changeFuture;
      await onDidWatch;
      await timeout(500);
      await basicCrudTest(filePath, void 0, 1);
    }
  );
  test("parcel watcher reused when present for non-recursive file watching (uncorrelated)", () => testParcelWatcherReused(void 0));
  test("parcel watcher reused when present for non-recursive file watching (correlated)", () => testParcelWatcherReused(2));
  function createParcelWatcher() {
    const recursiveWatcher = new TestParcelWatcher();
    recursiveWatcher.setVerboseLogging(loggingEnabled);
    recursiveWatcher.onDidLogMessage((e) => {
      if (loggingEnabled) {
        console.log(`[recursive watcher test message] ${e.message}`);
      }
    });
    recursiveWatcher.onDidError((e) => {
      if (loggingEnabled) {
        console.log(`[recursive watcher test error] ${e.error}`);
      }
    });
    return recursiveWatcher;
  }
  async function testParcelWatcherReused(correlationId) {
    const recursiveWatcher = createParcelWatcher();
    await recursiveWatcher.watch([
      { path: testDir, excludes: [], recursive: true, correlationId: 1 }
    ]);
    const recursiveInstance = Array.from(recursiveWatcher.watchers)[0];
    assert.strictEqual(recursiveInstance.subscriptionsCount, 0);
    await createWatcher(recursiveWatcher);
    const filePath = join(testDir, "deep", "conway.js");
    await watcher.watch([
      { path: filePath, excludes: [], recursive: false, correlationId }
    ]);
    const { instance } = Array.from(watcher.watchers)[0];
    assert.strictEqual(instance.isReusingRecursiveWatcher, true);
    assert.strictEqual(recursiveInstance.subscriptionsCount, 1);
    let changeFuture = awaitEvent(
      watcher,
      filePath,
      isMacintosh ? FileChangeType.ADDED : FileChangeType.UPDATED,
      correlationId
    );
    await Promises.writeFile(filePath, "Hello World");
    await changeFuture;
    await recursiveWatcher.stop();
    recursiveWatcher.dispose();
    await timeout(500);
    changeFuture = awaitEvent(
      watcher,
      filePath,
      FileChangeType.UPDATED,
      correlationId
    );
    await Promises.writeFile(filePath, "Hello World");
    await changeFuture;
    assert.strictEqual(instance.isReusingRecursiveWatcher, false);
  }
  test("correlated watch requests support suspend/resume (file, does not exist in beginning, parcel watcher reused)", async () => {
    const recursiveWatcher = createParcelWatcher();
    await recursiveWatcher.watch([
      { path: testDir, excludes: [], recursive: true }
    ]);
    await createWatcher(recursiveWatcher);
    const filePath = join(testDir, "not-found-2.txt");
    const onDidWatchFail = Event.toPromise(watcher.onWatchFail);
    const request = {
      path: filePath,
      excludes: [],
      recursive: false,
      correlationId: 1
    };
    await watcher.watch([request]);
    await onDidWatchFail;
    assert.strictEqual(watcher.isSuspended(request), true);
    const changeFuture = awaitEvent(
      watcher,
      filePath,
      FileChangeType.ADDED,
      1
    );
    await Promises.writeFile(filePath, "Hello World");
    await changeFuture;
    assert.strictEqual(watcher.isSuspended(request), false);
  });
  test("event type filter (file watch)", async () => {
    const filePath = join(testDir, "lorem.txt");
    const request = {
      path: filePath,
      excludes: [],
      recursive: false,
      filter: FileChangeFilter.UPDATED | FileChangeFilter.DELETED,
      correlationId: 1
    };
    await watcher.watch([request]);
    let changeFuture = awaitEvent(
      watcher,
      filePath,
      FileChangeType.UPDATED,
      1
    );
    await Promises.writeFile(filePath, "Hello Change");
    await changeFuture;
    changeFuture = awaitEvent(watcher, filePath, FileChangeType.DELETED, 1);
    await fs.promises.unlink(filePath);
    await changeFuture;
  });
  test("event type filter (folder watch)", async () => {
    const request = {
      path: testDir,
      excludes: [],
      recursive: false,
      filter: FileChangeFilter.UPDATED | FileChangeFilter.DELETED,
      correlationId: 1
    };
    await watcher.watch([request]);
    const filePath = join(testDir, "lorem.txt");
    let changeFuture = awaitEvent(
      watcher,
      filePath,
      FileChangeType.UPDATED,
      1
    );
    await Promises.writeFile(filePath, "Hello Change");
    await changeFuture;
    changeFuture = awaitEvent(watcher, filePath, FileChangeType.DELETED, 1);
    await fs.promises.unlink(filePath);
    await changeFuture;
  });
});
