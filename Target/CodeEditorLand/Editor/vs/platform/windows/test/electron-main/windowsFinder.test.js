import assert from "assert";
import { Event } from "../../../../base/common/event.js";
import { FileAccess } from "../../../../base/common/network.js";
import { join } from "../../../../base/common/path.js";
import { extUriBiasedIgnorePathCase } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { toWorkspaceFolders } from "../../../workspaces/common/workspaces.js";
import { findWindowOnFile } from "../../electron-main/windowsFinder.js";
suite("WindowsFinder", () => {
  const fixturesFolder = FileAccess.asFileUri(
    "vs/platform/windows/test/electron-main/fixtures"
  ).fsPath;
  const testWorkspace = {
    id: Date.now().toString(),
    configPath: URI.file(join(fixturesFolder, "workspaces.json"))
  };
  const testWorkspaceFolders = toWorkspaceFolders(
    [
      { path: join(fixturesFolder, "vscode_workspace_1_folder") },
      { path: join(fixturesFolder, "vscode_workspace_2_folder") }
    ],
    testWorkspace.configPath,
    extUriBiasedIgnorePathCase
  );
  const localWorkspaceResolver = async (workspace) => {
    return workspace === testWorkspace ? {
      id: testWorkspace.id,
      configPath: workspace.configPath,
      folders: testWorkspaceFolders
    } : void 0;
  };
  function createTestCodeWindow(options) {
    return new class {
      onWillLoad = Event.None;
      onDidMaximize = Event.None;
      onDidUnmaximize = Event.None;
      onDidTriggerSystemContextMenu = Event.None;
      onDidSignalReady = Event.None;
      onDidClose = Event.None;
      onDidDestroy = Event.None;
      onDidEnterFullScreen = Event.None;
      onDidLeaveFullScreen = Event.None;
      whenClosedOrLoaded = Promise.resolve();
      id = -1;
      win = null;
      config;
      openedWorkspace = options.openedFolderUri ? { id: "", uri: options.openedFolderUri } : options.openedWorkspace;
      backupPath;
      remoteAuthority;
      isExtensionDevelopmentHost = false;
      isExtensionTestHost = false;
      lastFocusTime = options.lastFocusTime;
      isFullScreen = false;
      isReady = true;
      ready() {
        throw new Error("Method not implemented.");
      }
      setReady() {
        throw new Error("Method not implemented.");
      }
      addTabbedWindow(window) {
        throw new Error("Method not implemented.");
      }
      load(config, options2) {
        throw new Error("Method not implemented.");
      }
      reload(cli) {
        throw new Error("Method not implemented.");
      }
      focus(options2) {
        throw new Error("Method not implemented.");
      }
      close() {
        throw new Error("Method not implemented.");
      }
      getBounds() {
        throw new Error("Method not implemented.");
      }
      send(channel, ...args) {
        throw new Error("Method not implemented.");
      }
      sendWhenReady(channel, token, ...args) {
        throw new Error("Method not implemented.");
      }
      toggleFullScreen() {
        throw new Error("Method not implemented.");
      }
      setRepresentedFilename(name) {
        throw new Error("Method not implemented.");
      }
      getRepresentedFilename() {
        throw new Error("Method not implemented.");
      }
      setDocumentEdited(edited) {
        throw new Error("Method not implemented.");
      }
      isDocumentEdited() {
        throw new Error("Method not implemented.");
      }
      handleTitleDoubleClick() {
        throw new Error("Method not implemented.");
      }
      updateTouchBar(items) {
        throw new Error("Method not implemented.");
      }
      serializeWindowState() {
        throw new Error("Method not implemented");
      }
      updateWindowControls(options2) {
        throw new Error("Method not implemented.");
      }
      notifyZoomLevel(level) {
        throw new Error("Method not implemented.");
      }
      matches(webContents) {
        throw new Error("Method not implemented.");
      }
      dispose() {
      }
    }();
  }
  const vscodeFolderWindow = createTestCodeWindow({
    lastFocusTime: 1,
    openedFolderUri: URI.file(join(fixturesFolder, "vscode_folder"))
  });
  const lastActiveWindow = createTestCodeWindow({
    lastFocusTime: 3,
    openedFolderUri: void 0
  });
  const noVscodeFolderWindow = createTestCodeWindow({
    lastFocusTime: 2,
    openedFolderUri: URI.file(join(fixturesFolder, "no_vscode_folder"))
  });
  const windows = [
    vscodeFolderWindow,
    lastActiveWindow,
    noVscodeFolderWindow
  ];
  test("New window without folder when no windows exist", async () => {
    assert.strictEqual(
      await findWindowOnFile(
        [],
        URI.file("nonexisting"),
        localWorkspaceResolver
      ),
      void 0
    );
    assert.strictEqual(
      await findWindowOnFile(
        [],
        URI.file(join(fixturesFolder, "no_vscode_folder", "file.txt")),
        localWorkspaceResolver
      ),
      void 0
    );
  });
  test("Existing window with folder", async () => {
    assert.strictEqual(
      await findWindowOnFile(
        windows,
        URI.file(join(fixturesFolder, "no_vscode_folder", "file.txt")),
        localWorkspaceResolver
      ),
      noVscodeFolderWindow
    );
    assert.strictEqual(
      await findWindowOnFile(
        windows,
        URI.file(join(fixturesFolder, "vscode_folder", "file.txt")),
        localWorkspaceResolver
      ),
      vscodeFolderWindow
    );
    const window = createTestCodeWindow({
      lastFocusTime: 1,
      openedFolderUri: URI.file(
        join(fixturesFolder, "vscode_folder", "nested_folder")
      )
    });
    assert.strictEqual(
      await findWindowOnFile(
        [window],
        URI.file(
          join(
            fixturesFolder,
            "vscode_folder",
            "nested_folder",
            "subfolder",
            "file.txt"
          )
        ),
        localWorkspaceResolver
      ),
      window
    );
  });
  test("More specific existing window wins", async () => {
    const window = createTestCodeWindow({
      lastFocusTime: 2,
      openedFolderUri: URI.file(join(fixturesFolder, "no_vscode_folder"))
    });
    const nestedFolderWindow = createTestCodeWindow({
      lastFocusTime: 1,
      openedFolderUri: URI.file(
        join(fixturesFolder, "no_vscode_folder", "nested_folder")
      )
    });
    assert.strictEqual(
      await findWindowOnFile(
        [window, nestedFolderWindow],
        URI.file(
          join(
            fixturesFolder,
            "no_vscode_folder",
            "nested_folder",
            "subfolder",
            "file.txt"
          )
        ),
        localWorkspaceResolver
      ),
      nestedFolderWindow
    );
  });
  test("Workspace folder wins", async () => {
    const window = createTestCodeWindow({
      lastFocusTime: 1,
      openedWorkspace: testWorkspace
    });
    assert.strictEqual(
      await findWindowOnFile(
        [window],
        URI.file(
          join(
            fixturesFolder,
            "vscode_workspace_2_folder",
            "nested_vscode_folder",
            "subfolder",
            "file.txt"
          )
        ),
        localWorkspaceResolver
      ),
      window
    );
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
