import assert from "assert";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { basename } from "../../../../base/common/path.js";
import { isLinux, isWindows } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import { mock } from "../../../../base/test/common/mock.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { FileSystemProviderCapabilities } from "../../../../platform/files/common/files.js";
import {
  NullLogService
} from "../../../../platform/log/common/log.js";
import { nullExtensionDescription as extensionDescriptor } from "../../../services/extensions/common/extensions.js";
import { ExcludeSettingOptions } from "../../../services/search/common/searchExtTypes.js";
import {
  MainContext
} from "../../common/extHost.protocol.js";
import { ExtHostRpcService } from "../../common/extHostRpcService.js";
import { RelativePattern } from "../../common/extHostTypes.js";
import { ExtHostWorkspace } from "../../common/extHostWorkspace.js";
import { TestRPCProtocol } from "../common/testRPCProtocol.js";
function createExtHostWorkspace(mainContext, data, logService) {
  const result = new ExtHostWorkspace(
    new ExtHostRpcService(mainContext),
    new class extends mock() {
      workspace = data;
    }(),
    new class extends mock() {
      getCapabilities() {
        return isLinux ? FileSystemProviderCapabilities.PathCaseSensitive : void 0;
      }
    }(),
    logService,
    new class extends mock() {
    }()
  );
  result.$initializeWorkspace(data, true);
  return result;
}
suite("ExtHostWorkspace", () => {
  ensureNoDisposablesAreLeakedInTestSuite();
  function assertAsRelativePath(workspace, input, expected, includeWorkspace) {
    const actual = workspace.getRelativePath(input, includeWorkspace);
    assert.strictEqual(actual, expected);
  }
  test("asRelativePath", () => {
    const ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        folders: [
          aWorkspaceFolderData(
            URI.file("/Coding/Applications/NewsWoWBot"),
            0
          )
        ],
        name: "Test"
      },
      new NullLogService()
    );
    assertAsRelativePath(
      ws,
      "/Coding/Applications/NewsWoWBot/bernd/das/brot",
      "bernd/das/brot"
    );
    assertAsRelativePath(
      ws,
      "/Apps/DartPubCache/hosted/pub.dartlang.org/convert-2.0.1/lib/src/hex.dart",
      "/Apps/DartPubCache/hosted/pub.dartlang.org/convert-2.0.1/lib/src/hex.dart"
    );
    assertAsRelativePath(ws, "", "");
    assertAsRelativePath(ws, "/foo/bar", "/foo/bar");
    assertAsRelativePath(ws, "in/out", "in/out");
  });
  test("asRelativePath, same paths, #11402", () => {
    const root = "/home/aeschli/workspaces/samples/docker";
    const input = "/home/aeschli/workspaces/samples/docker";
    const ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        folders: [aWorkspaceFolderData(URI.file(root), 0)],
        name: "Test"
      },
      new NullLogService()
    );
    assertAsRelativePath(ws, input, input);
    const input2 = "/home/aeschli/workspaces/samples/docker/a.file";
    assertAsRelativePath(ws, input2, "a.file");
  });
  test("asRelativePath, no workspace", () => {
    const ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      null,
      new NullLogService()
    );
    assertAsRelativePath(ws, "", "");
    assertAsRelativePath(ws, "/foo/bar", "/foo/bar");
  });
  test("asRelativePath, multiple folders", () => {
    const ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        folders: [
          aWorkspaceFolderData(URI.file("/Coding/One"), 0),
          aWorkspaceFolderData(URI.file("/Coding/Two"), 1)
        ],
        name: "Test"
      },
      new NullLogService()
    );
    assertAsRelativePath(ws, "/Coding/One/file.txt", "One/file.txt");
    assertAsRelativePath(
      ws,
      "/Coding/Two/files/out.txt",
      "Two/files/out.txt"
    );
    assertAsRelativePath(
      ws,
      "/Coding/Two2/files/out.txt",
      "/Coding/Two2/files/out.txt"
    );
  });
  test("slightly inconsistent behaviour of asRelativePath and getWorkspaceFolder, #31553", () => {
    const mrws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        folders: [
          aWorkspaceFolderData(URI.file("/Coding/One"), 0),
          aWorkspaceFolderData(URI.file("/Coding/Two"), 1)
        ],
        name: "Test"
      },
      new NullLogService()
    );
    assertAsRelativePath(mrws, "/Coding/One/file.txt", "One/file.txt");
    assertAsRelativePath(
      mrws,
      "/Coding/One/file.txt",
      "One/file.txt",
      true
    );
    assertAsRelativePath(mrws, "/Coding/One/file.txt", "file.txt", false);
    assertAsRelativePath(
      mrws,
      "/Coding/Two/files/out.txt",
      "Two/files/out.txt"
    );
    assertAsRelativePath(
      mrws,
      "/Coding/Two/files/out.txt",
      "Two/files/out.txt",
      true
    );
    assertAsRelativePath(
      mrws,
      "/Coding/Two/files/out.txt",
      "files/out.txt",
      false
    );
    assertAsRelativePath(
      mrws,
      "/Coding/Two2/files/out.txt",
      "/Coding/Two2/files/out.txt"
    );
    assertAsRelativePath(
      mrws,
      "/Coding/Two2/files/out.txt",
      "/Coding/Two2/files/out.txt",
      true
    );
    assertAsRelativePath(
      mrws,
      "/Coding/Two2/files/out.txt",
      "/Coding/Two2/files/out.txt",
      false
    );
    const srws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        folders: [aWorkspaceFolderData(URI.file("/Coding/One"), 0)],
        name: "Test"
      },
      new NullLogService()
    );
    assertAsRelativePath(srws, "/Coding/One/file.txt", "file.txt");
    assertAsRelativePath(srws, "/Coding/One/file.txt", "file.txt", false);
    assertAsRelativePath(
      srws,
      "/Coding/One/file.txt",
      "One/file.txt",
      true
    );
    assertAsRelativePath(
      srws,
      "/Coding/Two2/files/out.txt",
      "/Coding/Two2/files/out.txt"
    );
    assertAsRelativePath(
      srws,
      "/Coding/Two2/files/out.txt",
      "/Coding/Two2/files/out.txt",
      true
    );
    assertAsRelativePath(
      srws,
      "/Coding/Two2/files/out.txt",
      "/Coding/Two2/files/out.txt",
      false
    );
  });
  test("getPath, legacy", () => {
    let ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      { id: "foo", name: "Test", folders: [] },
      new NullLogService()
    );
    assert.strictEqual(ws.getPath(), void 0);
    ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      null,
      new NullLogService()
    );
    assert.strictEqual(ws.getPath(), void 0);
    ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      void 0,
      new NullLogService()
    );
    assert.strictEqual(ws.getPath(), void 0);
    ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        name: "Test",
        folders: [
          aWorkspaceFolderData(URI.file("Folder"), 0),
          aWorkspaceFolderData(URI.file("Another/Folder"), 1)
        ]
      },
      new NullLogService()
    );
    assert.strictEqual(ws.getPath().replace(/\\/g, "/"), "/Folder");
    ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        name: "Test",
        folders: [aWorkspaceFolderData(URI.file("/Folder"), 0)]
      },
      new NullLogService()
    );
    assert.strictEqual(ws.getPath().replace(/\\/g, "/"), "/Folder");
  });
  test("WorkspaceFolder has name and index", () => {
    const ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        folders: [
          aWorkspaceFolderData(URI.file("/Coding/One"), 0),
          aWorkspaceFolderData(URI.file("/Coding/Two"), 1)
        ],
        name: "Test"
      },
      new NullLogService()
    );
    const [one, two] = ws.getWorkspaceFolders();
    assert.strictEqual(one.name, "One");
    assert.strictEqual(one.index, 0);
    assert.strictEqual(two.name, "Two");
    assert.strictEqual(two.index, 1);
  });
  test("getContainingWorkspaceFolder", () => {
    const ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        name: "Test",
        folders: [
          aWorkspaceFolderData(URI.file("/Coding/One"), 0),
          aWorkspaceFolderData(URI.file("/Coding/Two"), 1),
          aWorkspaceFolderData(URI.file("/Coding/Two/Nested"), 2)
        ]
      },
      new NullLogService()
    );
    let folder = ws.getWorkspaceFolder(URI.file("/foo/bar"));
    assert.strictEqual(folder, void 0);
    folder = ws.getWorkspaceFolder(URI.file("/Coding/One/file/path.txt"));
    assert.strictEqual(folder.name, "One");
    folder = ws.getWorkspaceFolder(URI.file("/Coding/Two/file/path.txt"));
    assert.strictEqual(folder.name, "Two");
    folder = ws.getWorkspaceFolder(URI.file("/Coding/Two/Nest"));
    assert.strictEqual(folder.name, "Two");
    folder = ws.getWorkspaceFolder(URI.file("/Coding/Two/Nested/file"));
    assert.strictEqual(folder.name, "Nested");
    folder = ws.getWorkspaceFolder(URI.file("/Coding/Two/Nested/f"));
    assert.strictEqual(folder.name, "Nested");
    folder = ws.getWorkspaceFolder(URI.file("/Coding/Two/Nested"), true);
    assert.strictEqual(folder.name, "Two");
    folder = ws.getWorkspaceFolder(URI.file("/Coding/Two/Nested/"), true);
    assert.strictEqual(folder.name, "Two");
    folder = ws.getWorkspaceFolder(URI.file("/Coding/Two/Nested"));
    assert.strictEqual(folder.name, "Nested");
    folder = ws.getWorkspaceFolder(URI.file("/Coding/Two/Nested/"));
    assert.strictEqual(folder.name, "Nested");
    folder = ws.getWorkspaceFolder(URI.file("/Coding/Two"), true);
    assert.strictEqual(folder, void 0);
    folder = ws.getWorkspaceFolder(URI.file("/Coding/Two"), false);
    assert.strictEqual(folder.name, "Two");
  });
  test("Multiroot change event should have a delta, #29641", (done) => {
    const ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      { id: "foo", name: "Test", folders: [] },
      new NullLogService()
    );
    let finished = false;
    const finish = (error) => {
      if (!finished) {
        finished = true;
        done(error);
      }
    };
    let sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.deepStrictEqual(e.added, []);
        assert.deepStrictEqual(e.removed, []);
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({ id: "foo", name: "Test", folders: [] });
    sub.dispose();
    sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.deepStrictEqual(e.removed, []);
        assert.strictEqual(e.added.length, 1);
        assert.strictEqual(e.added[0].uri.toString(), "foo:bar");
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [aWorkspaceFolderData(URI.parse("foo:bar"), 0)]
    });
    sub.dispose();
    sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.deepStrictEqual(e.removed, []);
        assert.strictEqual(e.added.length, 1);
        assert.strictEqual(e.added[0].uri.toString(), "foo:bar2");
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [
        aWorkspaceFolderData(URI.parse("foo:bar"), 0),
        aWorkspaceFolderData(URI.parse("foo:bar2"), 1)
      ]
    });
    sub.dispose();
    sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.strictEqual(e.removed.length, 2);
        assert.strictEqual(e.removed[0].uri.toString(), "foo:bar");
        assert.strictEqual(e.removed[1].uri.toString(), "foo:bar2");
        assert.strictEqual(e.added.length, 1);
        assert.strictEqual(e.added[0].uri.toString(), "foo:bar3");
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [aWorkspaceFolderData(URI.parse("foo:bar3"), 0)]
    });
    sub.dispose();
    finish();
  });
  test("Multiroot change keeps existing workspaces live", () => {
    const ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        name: "Test",
        folders: [aWorkspaceFolderData(URI.parse("foo:bar"), 0)]
      },
      new NullLogService()
    );
    const firstFolder = ws.getWorkspaceFolders()[0];
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [
        aWorkspaceFolderData(URI.parse("foo:bar2"), 0),
        aWorkspaceFolderData(URI.parse("foo:bar"), 1, "renamed")
      ]
    });
    assert.strictEqual(ws.getWorkspaceFolders()[1], firstFolder);
    assert.strictEqual(firstFolder.index, 1);
    assert.strictEqual(firstFolder.name, "renamed");
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [
        aWorkspaceFolderData(URI.parse("foo:bar3"), 0),
        aWorkspaceFolderData(URI.parse("foo:bar2"), 1),
        aWorkspaceFolderData(URI.parse("foo:bar"), 2)
      ]
    });
    assert.strictEqual(ws.getWorkspaceFolders()[2], firstFolder);
    assert.strictEqual(firstFolder.index, 2);
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [aWorkspaceFolderData(URI.parse("foo:bar3"), 0)]
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [
        aWorkspaceFolderData(URI.parse("foo:bar3"), 0),
        aWorkspaceFolderData(URI.parse("foo:bar"), 1)
      ]
    });
    assert.notStrictEqual(firstFolder, ws.workspace.folders[0]);
  });
  test("updateWorkspaceFolders - invalid arguments", () => {
    let ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      { id: "foo", name: "Test", folders: [] },
      new NullLogService()
    );
    assert.strictEqual(
      false,
      ws.updateWorkspaceFolders(extensionDescriptor, null, null)
    );
    assert.strictEqual(
      false,
      ws.updateWorkspaceFolders(extensionDescriptor, 0, 0)
    );
    assert.strictEqual(
      false,
      ws.updateWorkspaceFolders(extensionDescriptor, 0, 1)
    );
    assert.strictEqual(
      false,
      ws.updateWorkspaceFolders(extensionDescriptor, 1, 0)
    );
    assert.strictEqual(
      false,
      ws.updateWorkspaceFolders(extensionDescriptor, -1, 0)
    );
    assert.strictEqual(
      false,
      ws.updateWorkspaceFolders(extensionDescriptor, -1, -1)
    );
    ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      {
        id: "foo",
        name: "Test",
        folders: [aWorkspaceFolderData(URI.parse("foo:bar"), 0)]
      },
      new NullLogService()
    );
    assert.strictEqual(
      false,
      ws.updateWorkspaceFolders(extensionDescriptor, 1, 1)
    );
    assert.strictEqual(
      false,
      ws.updateWorkspaceFolders(extensionDescriptor, 0, 2)
    );
    assert.strictEqual(
      false,
      ws.updateWorkspaceFolders(
        extensionDescriptor,
        0,
        1,
        asUpdateWorkspaceFolderData(URI.parse("foo:bar"))
      )
    );
  });
  test("updateWorkspaceFolders - valid arguments", (done) => {
    let finished = false;
    const finish = (error) => {
      if (!finished) {
        finished = true;
        done(error);
      }
    };
    const protocol = {
      getProxy: () => {
        return void 0;
      },
      set: () => {
        return void 0;
      },
      dispose: () => {
      },
      assertRegistered: () => {
      },
      drain: () => {
        return void 0;
      }
    };
    const ws = createExtHostWorkspace(
      protocol,
      { id: "foo", name: "Test", folders: [] },
      new NullLogService()
    );
    assert.strictEqual(
      true,
      ws.updateWorkspaceFolders(
        extensionDescriptor,
        0,
        0,
        asUpdateWorkspaceFolderData(URI.parse("foo:bar"))
      )
    );
    assert.strictEqual(1, ws.workspace.folders.length);
    assert.strictEqual(
      ws.workspace.folders[0].uri.toString(),
      URI.parse("foo:bar").toString()
    );
    const firstAddedFolder = ws.getWorkspaceFolders()[0];
    let gotEvent = false;
    let sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.deepStrictEqual(e.removed, []);
        assert.strictEqual(e.added.length, 1);
        assert.strictEqual(e.added[0].uri.toString(), "foo:bar");
        assert.strictEqual(e.added[0], firstAddedFolder);
        gotEvent = true;
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [aWorkspaceFolderData(URI.parse("foo:bar"), 0)]
    });
    assert.strictEqual(gotEvent, true);
    sub.dispose();
    assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder);
    assert.strictEqual(
      true,
      ws.updateWorkspaceFolders(
        extensionDescriptor,
        1,
        0,
        asUpdateWorkspaceFolderData(URI.parse("foo:bar1")),
        asUpdateWorkspaceFolderData(URI.parse("foo:bar2"))
      )
    );
    assert.strictEqual(3, ws.workspace.folders.length);
    assert.strictEqual(
      ws.workspace.folders[0].uri.toString(),
      URI.parse("foo:bar").toString()
    );
    assert.strictEqual(
      ws.workspace.folders[1].uri.toString(),
      URI.parse("foo:bar1").toString()
    );
    assert.strictEqual(
      ws.workspace.folders[2].uri.toString(),
      URI.parse("foo:bar2").toString()
    );
    const secondAddedFolder = ws.getWorkspaceFolders()[1];
    const thirdAddedFolder = ws.getWorkspaceFolders()[2];
    gotEvent = false;
    sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.deepStrictEqual(e.removed, []);
        assert.strictEqual(e.added.length, 2);
        assert.strictEqual(e.added[0].uri.toString(), "foo:bar1");
        assert.strictEqual(e.added[1].uri.toString(), "foo:bar2");
        assert.strictEqual(e.added[0], secondAddedFolder);
        assert.strictEqual(e.added[1], thirdAddedFolder);
        gotEvent = true;
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [
        aWorkspaceFolderData(URI.parse("foo:bar"), 0),
        aWorkspaceFolderData(URI.parse("foo:bar1"), 1),
        aWorkspaceFolderData(URI.parse("foo:bar2"), 2)
      ]
    });
    assert.strictEqual(gotEvent, true);
    sub.dispose();
    assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder);
    assert.strictEqual(ws.getWorkspaceFolders()[1], secondAddedFolder);
    assert.strictEqual(ws.getWorkspaceFolders()[2], thirdAddedFolder);
    assert.strictEqual(
      true,
      ws.updateWorkspaceFolders(extensionDescriptor, 2, 1)
    );
    assert.strictEqual(2, ws.workspace.folders.length);
    assert.strictEqual(
      ws.workspace.folders[0].uri.toString(),
      URI.parse("foo:bar").toString()
    );
    assert.strictEqual(
      ws.workspace.folders[1].uri.toString(),
      URI.parse("foo:bar1").toString()
    );
    gotEvent = false;
    sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.deepStrictEqual(e.added, []);
        assert.strictEqual(e.removed.length, 1);
        assert.strictEqual(e.removed[0], thirdAddedFolder);
        gotEvent = true;
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [
        aWorkspaceFolderData(URI.parse("foo:bar"), 0),
        aWorkspaceFolderData(URI.parse("foo:bar1"), 1)
      ]
    });
    assert.strictEqual(gotEvent, true);
    sub.dispose();
    assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder);
    assert.strictEqual(ws.getWorkspaceFolders()[1], secondAddedFolder);
    assert.strictEqual(
      true,
      ws.updateWorkspaceFolders(
        extensionDescriptor,
        0,
        2,
        asUpdateWorkspaceFolderData(URI.parse("foo:bar"), "renamed 1"),
        asUpdateWorkspaceFolderData(URI.parse("foo:bar1"), "renamed 2")
      )
    );
    assert.strictEqual(2, ws.workspace.folders.length);
    assert.strictEqual(
      ws.workspace.folders[0].uri.toString(),
      URI.parse("foo:bar").toString()
    );
    assert.strictEqual(
      ws.workspace.folders[1].uri.toString(),
      URI.parse("foo:bar1").toString()
    );
    assert.strictEqual(ws.workspace.folders[0].name, "renamed 1");
    assert.strictEqual(ws.workspace.folders[1].name, "renamed 2");
    assert.strictEqual(ws.getWorkspaceFolders()[0].name, "renamed 1");
    assert.strictEqual(ws.getWorkspaceFolders()[1].name, "renamed 2");
    gotEvent = false;
    sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.deepStrictEqual(e.added, []);
        assert.strictEqual(e.removed.length, 0);
        gotEvent = true;
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [
        aWorkspaceFolderData(URI.parse("foo:bar"), 0, "renamed 1"),
        aWorkspaceFolderData(URI.parse("foo:bar1"), 1, "renamed 2")
      ]
    });
    assert.strictEqual(gotEvent, true);
    sub.dispose();
    assert.strictEqual(ws.getWorkspaceFolders()[0], firstAddedFolder);
    assert.strictEqual(ws.getWorkspaceFolders()[1], secondAddedFolder);
    assert.strictEqual(ws.workspace.folders[0].name, "renamed 1");
    assert.strictEqual(ws.workspace.folders[1].name, "renamed 2");
    assert.strictEqual(ws.getWorkspaceFolders()[0].name, "renamed 1");
    assert.strictEqual(ws.getWorkspaceFolders()[1].name, "renamed 2");
    assert.strictEqual(
      true,
      ws.updateWorkspaceFolders(
        extensionDescriptor,
        0,
        2,
        asUpdateWorkspaceFolderData(URI.parse("foo:bar3")),
        asUpdateWorkspaceFolderData(URI.parse("foo:bar4"))
      )
    );
    assert.strictEqual(2, ws.workspace.folders.length);
    assert.strictEqual(
      ws.workspace.folders[0].uri.toString(),
      URI.parse("foo:bar3").toString()
    );
    assert.strictEqual(
      ws.workspace.folders[1].uri.toString(),
      URI.parse("foo:bar4").toString()
    );
    const fourthAddedFolder = ws.getWorkspaceFolders()[0];
    const fifthAddedFolder = ws.getWorkspaceFolders()[1];
    gotEvent = false;
    sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.strictEqual(e.added.length, 2);
        assert.strictEqual(e.added[0], fourthAddedFolder);
        assert.strictEqual(e.added[1], fifthAddedFolder);
        assert.strictEqual(e.removed.length, 2);
        assert.strictEqual(e.removed[0], firstAddedFolder);
        assert.strictEqual(e.removed[1], secondAddedFolder);
        gotEvent = true;
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [
        aWorkspaceFolderData(URI.parse("foo:bar3"), 0),
        aWorkspaceFolderData(URI.parse("foo:bar4"), 1)
      ]
    });
    assert.strictEqual(gotEvent, true);
    sub.dispose();
    assert.strictEqual(ws.getWorkspaceFolders()[0], fourthAddedFolder);
    assert.strictEqual(ws.getWorkspaceFolders()[1], fifthAddedFolder);
    assert.strictEqual(
      true,
      ws.updateWorkspaceFolders(
        extensionDescriptor,
        0,
        2,
        asUpdateWorkspaceFolderData(URI.parse("foo:bar4")),
        asUpdateWorkspaceFolderData(URI.parse("foo:bar3"))
      )
    );
    assert.strictEqual(2, ws.workspace.folders.length);
    assert.strictEqual(
      ws.workspace.folders[0].uri.toString(),
      URI.parse("foo:bar4").toString()
    );
    assert.strictEqual(
      ws.workspace.folders[1].uri.toString(),
      URI.parse("foo:bar3").toString()
    );
    assert.strictEqual(ws.getWorkspaceFolders()[0], fifthAddedFolder);
    assert.strictEqual(ws.getWorkspaceFolders()[1], fourthAddedFolder);
    gotEvent = false;
    sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.strictEqual(e.added.length, 0);
        assert.strictEqual(e.removed.length, 0);
        gotEvent = true;
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [
        aWorkspaceFolderData(URI.parse("foo:bar4"), 0),
        aWorkspaceFolderData(URI.parse("foo:bar3"), 1)
      ]
    });
    assert.strictEqual(gotEvent, true);
    sub.dispose();
    assert.strictEqual(ws.getWorkspaceFolders()[0], fifthAddedFolder);
    assert.strictEqual(ws.getWorkspaceFolders()[1], fourthAddedFolder);
    assert.strictEqual(fifthAddedFolder.index, 0);
    assert.strictEqual(fourthAddedFolder.index, 1);
    assert.strictEqual(
      true,
      ws.updateWorkspaceFolders(
        extensionDescriptor,
        2,
        0,
        asUpdateWorkspaceFolderData(URI.parse("foo:bar5"))
      )
    );
    assert.strictEqual(3, ws.workspace.folders.length);
    assert.strictEqual(
      ws.workspace.folders[0].uri.toString(),
      URI.parse("foo:bar4").toString()
    );
    assert.strictEqual(
      ws.workspace.folders[1].uri.toString(),
      URI.parse("foo:bar3").toString()
    );
    assert.strictEqual(
      ws.workspace.folders[2].uri.toString(),
      URI.parse("foo:bar5").toString()
    );
    const sixthAddedFolder = ws.getWorkspaceFolders()[2];
    gotEvent = false;
    sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.strictEqual(e.added.length, 1);
        assert.strictEqual(e.added[0], sixthAddedFolder);
        gotEvent = true;
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({
      id: "foo",
      name: "Test",
      folders: [
        aWorkspaceFolderData(URI.parse("foo:bar4"), 0),
        aWorkspaceFolderData(URI.parse("foo:bar3"), 1),
        aWorkspaceFolderData(URI.parse("foo:bar5"), 2)
      ]
    });
    assert.strictEqual(gotEvent, true);
    sub.dispose();
    assert.strictEqual(ws.getWorkspaceFolders()[0], fifthAddedFolder);
    assert.strictEqual(ws.getWorkspaceFolders()[1], fourthAddedFolder);
    assert.strictEqual(ws.getWorkspaceFolders()[2], sixthAddedFolder);
    finish();
  });
  test("Multiroot change event is immutable", (done) => {
    let finished = false;
    const finish = (error) => {
      if (!finished) {
        finished = true;
        done(error);
      }
    };
    const ws = createExtHostWorkspace(
      new TestRPCProtocol(),
      { id: "foo", name: "Test", folders: [] },
      new NullLogService()
    );
    const sub = ws.onDidChangeWorkspace((e) => {
      try {
        assert.throws(() => {
          e.added = [];
        });
      } catch (error) {
        finish(error);
      }
    });
    ws.$acceptWorkspaceData({ id: "foo", name: "Test", folders: [] });
    sub.dispose();
    finish();
  });
  test("`vscode.workspace.getWorkspaceFolder(file)` don't return workspace folder when file open from command line. #36221", () => {
    if (isWindows) {
      const ws = createExtHostWorkspace(
        new TestRPCProtocol(),
        {
          id: "foo",
          name: "Test",
          folders: [
            aWorkspaceFolderData(
              URI.file("c:/Users/marek/Desktop/vsc_test/"),
              0
            )
          ]
        },
        new NullLogService()
      );
      assert.ok(
        ws.getWorkspaceFolder(
          URI.file("c:/Users/marek/Desktop/vsc_test/a.txt")
        )
      );
      assert.ok(
        ws.getWorkspaceFolder(
          URI.file("C:/Users/marek/Desktop/vsc_test/b.txt")
        )
      );
    }
  });
  function aWorkspaceFolderData(uri, index, name = "") {
    return {
      uri,
      index,
      name: name || basename(uri.path)
    };
  }
  function asUpdateWorkspaceFolderData(uri, name) {
    return { uri, name };
  }
  suite("findFiles -", () => {
    test("string include", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.includePattern, "foo");
            assert.strictEqual(_includeFolder, null);
            assert.strictEqual(options.excludePattern, void 0);
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            assert.strictEqual(options.maxResults, 10);
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles(
        "foo",
        void 0,
        10,
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
    function testFindFilesInclude(pattern) {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.includePattern, "glob/**");
            assert.deepStrictEqual(
              _includeFolder ? URI.from(_includeFolder).toJSON() : null,
              URI.file("/other/folder").toJSON()
            );
            assert.strictEqual(options.excludePattern, void 0);
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles(
        pattern,
        void 0,
        10,
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    }
    test("RelativePattern include (string)", () => {
      return testFindFilesInclude(
        new RelativePattern("/other/folder", "glob/**")
      );
    });
    test("RelativePattern include (URI)", () => {
      return testFindFilesInclude(
        new RelativePattern(URI.file("/other/folder"), "glob/**")
      );
    });
    test("no excludes", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.includePattern, "glob/**");
            assert.deepStrictEqual(
              URI.revive(_includeFolder).toString(),
              URI.file("/other/folder").toString()
            );
            assert.strictEqual(options.excludePattern, void 0);
            assert.strictEqual(
              options.disregardExcludeSettings,
              true
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles(
        new RelativePattern("/other/folder", "glob/**"),
        null,
        10,
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
    test("with cancelled token", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token2) {
            mainThreadCalled = true;
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      const token = CancellationToken.Cancelled;
      return ws.findFiles(
        new RelativePattern("/other/folder", "glob/**"),
        null,
        10,
        new ExtensionIdentifier("test"),
        token
      ).then(() => {
        assert(!mainThreadCalled, "!mainThreadCalled");
      });
    });
    test("RelativePattern exclude", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            assert.strictEqual(options.excludePattern?.length, 1);
            assert.strictEqual(
              options.excludePattern[0].pattern,
              "glob/**"
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles(
        "",
        new RelativePattern(root, "glob/**"),
        10,
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
  });
  suite("findFiles2 -", () => {
    test("string include", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.filePattern, "foo");
            assert.strictEqual(options.includePattern, void 0);
            assert.strictEqual(_includeFolder, null);
            assert.strictEqual(options.excludePattern, void 0);
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            assert.strictEqual(options.maxResults, 10);
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2(
        "foo",
        { maxResults: 10, useDefaultExcludes: true },
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
    function testFindFiles2Include(pattern) {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.filePattern, "glob/**");
            assert.strictEqual(options.includePattern, void 0);
            assert.deepStrictEqual(
              _includeFolder ? URI.from(_includeFolder).toJSON() : null,
              URI.file("/other/folder").toJSON()
            );
            assert.strictEqual(options.excludePattern, void 0);
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2(
        pattern,
        { maxResults: 10 },
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    }
    test("RelativePattern include (string)", () => {
      return testFindFiles2Include(
        new RelativePattern("/other/folder", "glob/**")
      );
    });
    test("RelativePattern include (URI)", () => {
      return testFindFiles2Include(
        new RelativePattern(URI.file("/other/folder"), "glob/**")
      );
    });
    test("no excludes", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.filePattern, "glob/**");
            assert.strictEqual(options.includePattern, void 0);
            assert.deepStrictEqual(
              URI.revive(_includeFolder).toString(),
              URI.file("/other/folder").toString()
            );
            assert.strictEqual(options.excludePattern, void 0);
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2(
        new RelativePattern("/other/folder", "glob/**"),
        {},
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
    test("with cancelled token", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token2) {
            mainThreadCalled = true;
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      const token = CancellationToken.Cancelled;
      return ws.findFiles2(
        new RelativePattern("/other/folder", "glob/**"),
        {},
        new ExtensionIdentifier("test"),
        token
      ).then(() => {
        assert(!mainThreadCalled, "!mainThreadCalled");
      });
    });
    test("RelativePattern exclude", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            assert.strictEqual(options.excludePattern?.length, 1);
            assert.strictEqual(
              options.excludePattern[0].pattern,
              "glob/**"
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2(
        "",
        { exclude: new RelativePattern(root, "glob/**") },
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
    test("useIgnoreFiles", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            assert.strictEqual(options.disregardIgnoreFiles, false);
            assert.strictEqual(
              options.disregardGlobalIgnoreFiles,
              false
            );
            assert.strictEqual(
              options.disregardParentIgnoreFiles,
              false
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2(
        "",
        {
          useIgnoreFiles: true,
          useParentIgnoreFiles: true,
          useGlobalIgnoreFiles: true
        },
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
    test("use symlinks", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.ignoreSymlinks, false);
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2(
        "",
        { followSymlinks: true },
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
  });
  suite("findFiles2New -", () => {
    test("string include", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.filePattern, "foo");
            assert.strictEqual(options.includePattern, void 0);
            assert.strictEqual(_includeFolder, null);
            assert.strictEqual(options.excludePattern, void 0);
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            assert.strictEqual(options.maxResults, 10);
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2New(
        ["foo"],
        {
          maxResults: 10,
          useExcludeSettings: ExcludeSettingOptions.FilesExclude
        },
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
    function testFindFiles2NewInclude(pattern) {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.filePattern, "glob/**");
            assert.strictEqual(options.includePattern, void 0);
            assert.deepStrictEqual(
              _includeFolder ? URI.from(_includeFolder).toJSON() : null,
              URI.file("/other/folder").toJSON()
            );
            assert.strictEqual(options.excludePattern, void 0);
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2New(
        pattern,
        { maxResults: 10 },
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    }
    test("RelativePattern include (string)", () => {
      return testFindFiles2NewInclude([
        new RelativePattern("/other/folder", "glob/**")
      ]);
    });
    test("RelativePattern include (URI)", () => {
      return testFindFiles2NewInclude([
        new RelativePattern(URI.file("/other/folder"), "glob/**")
      ]);
    });
    test("no excludes", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.filePattern, "glob/**");
            assert.strictEqual(options.includePattern, void 0);
            assert.deepStrictEqual(
              URI.revive(_includeFolder).toString(),
              URI.file("/other/folder").toString()
            );
            assert.strictEqual(options.excludePattern, void 0);
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2New(
        [new RelativePattern("/other/folder", "glob/**")],
        {},
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
    test("with cancelled token", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token2) {
            mainThreadCalled = true;
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      const token = CancellationToken.Cancelled;
      return ws.findFiles2New(
        [new RelativePattern("/other/folder", "glob/**")],
        {},
        new ExtensionIdentifier("test"),
        token
      ).then(() => {
        assert(!mainThreadCalled, "!mainThreadCalled");
      });
    });
    test("RelativePattern exclude", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            assert.strictEqual(options.excludePattern?.length, 1);
            assert.strictEqual(
              options.excludePattern[0].pattern,
              "glob/**"
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2New(
        [""],
        { exclude: [new RelativePattern(root, "glob/**")] },
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
    test("useIgnoreFiles", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(
              options.disregardExcludeSettings,
              false
            );
            assert.strictEqual(options.disregardIgnoreFiles, false);
            assert.strictEqual(
              options.disregardGlobalIgnoreFiles,
              false
            );
            assert.strictEqual(
              options.disregardParentIgnoreFiles,
              false
            );
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2New(
        [""],
        {
          useIgnoreFiles: {
            local: true,
            parent: true,
            global: true
          }
        },
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
    test("use symlinks", () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          $startFileSearch(_includeFolder, options, token) {
            mainThreadCalled = true;
            assert.strictEqual(options.ignoreSymlinks, false);
            return Promise.resolve(null);
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      return ws.findFiles2New(
        [""],
        { followSymlinks: true },
        new ExtensionIdentifier("test")
      ).then(() => {
        assert(mainThreadCalled, "mainThreadCalled");
      });
    });
  });
  suite("findTextInFiles -", () => {
    test("no include", async () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          async $startTextSearch(query, folder, options, requestId, token) {
            mainThreadCalled = true;
            assert.strictEqual(query.pattern, "foo");
            assert.strictEqual(folder, null);
            assert.strictEqual(options.includePattern, void 0);
            assert.strictEqual(options.excludePattern, void 0);
            return null;
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      await ws.findTextInFiles(
        { pattern: "foo" },
        {},
        () => {
        },
        new ExtensionIdentifier("test")
      );
      assert(mainThreadCalled, "mainThreadCalled");
    });
    test("string include", async () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          async $startTextSearch(query, folder, options, requestId, token) {
            mainThreadCalled = true;
            assert.strictEqual(query.pattern, "foo");
            assert.strictEqual(folder, null);
            assert.strictEqual(options.includePattern, "**/files");
            assert.strictEqual(options.excludePattern, void 0);
            return null;
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      await ws.findTextInFiles(
        { pattern: "foo" },
        { include: "**/files" },
        () => {
        },
        new ExtensionIdentifier("test")
      );
      assert(mainThreadCalled, "mainThreadCalled");
    });
    test("RelativePattern include", async () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          async $startTextSearch(query, folder, options, requestId, token) {
            mainThreadCalled = true;
            assert.strictEqual(query.pattern, "foo");
            assert.deepStrictEqual(
              URI.revive(folder).toString(),
              URI.file("/other/folder").toString()
            );
            assert.strictEqual(options.includePattern, "glob/**");
            assert.strictEqual(options.excludePattern, void 0);
            return null;
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      await ws.findTextInFiles(
        { pattern: "foo" },
        { include: new RelativePattern("/other/folder", "glob/**") },
        () => {
        },
        new ExtensionIdentifier("test")
      );
      assert(mainThreadCalled, "mainThreadCalled");
    });
    test("with cancelled token", async () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          async $startTextSearch(query, folder, options, requestId, token2) {
            mainThreadCalled = true;
            return null;
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      const token = CancellationToken.Cancelled;
      await ws.findTextInFiles(
        { pattern: "foo" },
        {},
        () => {
        },
        new ExtensionIdentifier("test"),
        token
      );
      assert(!mainThreadCalled, "!mainThreadCalled");
    });
    test("RelativePattern exclude", async () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          async $startTextSearch(query, folder, options, requestId, token) {
            mainThreadCalled = true;
            assert.strictEqual(query.pattern, "foo");
            assert.deepStrictEqual(folder, null);
            assert.strictEqual(options.includePattern, void 0);
            assert.strictEqual(options.excludePattern?.length, 1);
            assert.strictEqual(
              options.excludePattern[0].pattern,
              "glob/**"
            );
            return null;
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      await ws.findTextInFiles(
        { pattern: "foo" },
        { exclude: new RelativePattern("/other/folder", "glob/**") },
        () => {
        },
        new ExtensionIdentifier("test")
      );
      assert(mainThreadCalled, "mainThreadCalled");
    });
  });
  suite("findTextInFilesNew -", () => {
    test("no include", async () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          async $startTextSearch(query, folder, options, requestId, token) {
            mainThreadCalled = true;
            assert.strictEqual(query.pattern, "foo");
            assert.strictEqual(folder, null);
            assert.strictEqual(options.includePattern, void 0);
            assert.strictEqual(options.excludePattern, void 0);
            return null;
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      await ws.findTextInFilesNew(
        { pattern: "foo" },
        {},
        new ExtensionIdentifier("test")
      ).complete;
      assert(mainThreadCalled, "mainThreadCalled");
    });
    test("string include", async () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          async $startTextSearch(query, folder, options, requestId, token) {
            mainThreadCalled = true;
            assert.strictEqual(query.pattern, "foo");
            assert.strictEqual(folder, null);
            assert.strictEqual(options.includePattern, "**/files");
            assert.strictEqual(options.excludePattern, void 0);
            return null;
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      await ws.findTextInFilesNew(
        { pattern: "foo" },
        { include: ["**/files"] },
        new ExtensionIdentifier("test")
      ).complete;
      assert(mainThreadCalled, "mainThreadCalled");
    });
    test("RelativePattern include", async () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          async $startTextSearch(query, folder, options, requestId, token) {
            mainThreadCalled = true;
            assert.strictEqual(query.pattern, "foo");
            assert.deepStrictEqual(
              URI.revive(folder).toString(),
              URI.file("/other/folder").toString()
            );
            assert.strictEqual(options.includePattern, "glob/**");
            assert.strictEqual(options.excludePattern, void 0);
            return null;
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      await ws.findTextInFilesNew(
        { pattern: "foo" },
        { include: [new RelativePattern("/other/folder", "glob/**")] },
        new ExtensionIdentifier("test")
      ).complete;
      assert(mainThreadCalled, "mainThreadCalled");
    });
    test("with cancelled token", async () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          async $startTextSearch(query, folder, options, requestId, token2) {
            mainThreadCalled = true;
            return null;
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      const token = CancellationToken.Cancelled;
      await ws.findTextInFilesNew(
        { pattern: "foo" },
        void 0,
        new ExtensionIdentifier("test"),
        token
      ).complete;
      assert(!mainThreadCalled, "!mainThreadCalled");
    });
    test("RelativePattern exclude", async () => {
      const root = "/project/foo";
      const rpcProtocol = new TestRPCProtocol();
      let mainThreadCalled = false;
      rpcProtocol.set(
        MainContext.MainThreadWorkspace,
        new class extends mock() {
          async $startTextSearch(query, folder, options, requestId, token) {
            mainThreadCalled = true;
            assert.strictEqual(query.pattern, "foo");
            assert.deepStrictEqual(folder, null);
            assert.strictEqual(options.includePattern, void 0);
            assert.strictEqual(options.excludePattern?.length, 1);
            assert.strictEqual(
              options.excludePattern[0].pattern,
              "glob/**"
            );
            return null;
          }
        }()
      );
      const ws = createExtHostWorkspace(
        rpcProtocol,
        {
          id: "foo",
          folders: [aWorkspaceFolderData(URI.file(root), 0)],
          name: "Test"
        },
        new NullLogService()
      );
      await ws.findTextInFilesNew(
        { pattern: "foo" },
        { exclude: [new RelativePattern("/other/folder", "glob/**")] },
        new ExtensionIdentifier("test")
      ).complete;
      assert(mainThreadCalled, "mainThreadCalled");
    });
  });
});
