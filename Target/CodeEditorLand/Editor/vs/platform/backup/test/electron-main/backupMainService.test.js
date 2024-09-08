import assert from "assert";
import { createHash } from "crypto";
import * as fs from "fs";
import * as os from "os";
import { Schemas } from "../../../../base/common/network.js";
import * as path from "../../../../base/common/path.js";
import * as platform from "../../../../base/common/platform.js";
import { isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { Promises } from "../../../../base/node/pfs.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../base/test/common/utils.js";
import {
  flakySuite,
  getRandomTestPath
} from "../../../../base/test/node/testUtils.js";
import { TestConfigurationService } from "../../../configuration/test/common/testConfigurationService.js";
import { EnvironmentMainService } from "../../../environment/electron-main/environmentMainService.js";
import { OPTIONS, parseArgs } from "../../../environment/node/argv.js";
import { HotExitConfiguration } from "../../../files/common/files.js";
import { ConsoleMainLogger } from "../../../log/common/log.js";
import { LogService } from "../../../log/common/logService.js";
import product from "../../../product/common/product.js";
import { InMemoryTestStateMainService } from "../../../test/electron-main/workbenchTestServices.js";
import {
  isFolderBackupInfo
} from "../../common/backup.js";
import { BackupMainService } from "../../electron-main/backupMainService.js";
flakySuite("BackupMainService", () => {
  function assertEqualFolderInfos(actual, expected) {
    const withUriAsString = (f) => ({
      folderUri: f.folderUri.toString(),
      remoteAuthority: f.remoteAuthority
    });
    assert.deepStrictEqual(
      actual.map(withUriAsString),
      expected.map(withUriAsString)
    );
  }
  function toWorkspace(path2) {
    return {
      id: createHash("md5").update(sanitizePath(path2)).digest("hex"),
      // CodeQL [SM04514] Using MD5 to convert a file path to a fixed length
      configPath: URI.file(path2)
    };
  }
  function toWorkspaceBackupInfo(path2, remoteAuthority) {
    return {
      workspace: {
        id: createHash("md5").update(sanitizePath(path2)).digest("hex"),
        // CodeQL [SM04514] Using MD5 to convert a file path to a fixed length
        configPath: URI.file(path2)
      },
      remoteAuthority
    };
  }
  function toFolderBackupInfo(uri, remoteAuthority) {
    return { folderUri: uri, remoteAuthority };
  }
  function toSerializedWorkspace(ws) {
    return {
      id: ws.id,
      configURIPath: ws.configPath.toString()
    };
  }
  function ensureFolderExists(uri) {
    if (!fs.existsSync(uri.fsPath)) {
      fs.mkdirSync(uri.fsPath);
    }
    const backupFolder = service.toBackupPath(uri);
    return createBackupFolder(backupFolder);
  }
  async function ensureWorkspaceExists(workspace) {
    if (!fs.existsSync(workspace.configPath.fsPath)) {
      await Promises.writeFile(workspace.configPath.fsPath, "Hello");
    }
    const backupFolder = service.toBackupPath(workspace.id);
    await createBackupFolder(backupFolder);
    return workspace;
  }
  async function createBackupFolder(backupFolder) {
    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder);
      fs.mkdirSync(path.join(backupFolder, Schemas.file));
      await Promises.writeFile(
        path.join(backupFolder, Schemas.file, "foo.txt"),
        "Hello"
      );
    }
  }
  function readWorkspacesMetadata() {
    return stateMainService.getItem(
      "backupWorkspaces"
    );
  }
  function writeWorkspacesMetadata(data) {
    if (data) {
      stateMainService.setItem("backupWorkspaces", JSON.parse(data));
    } else {
      stateMainService.removeItem("backupWorkspaces");
    }
  }
  function sanitizePath(p) {
    return platform.isLinux ? p : p.toLowerCase();
  }
  const fooFile = URI.file(platform.isWindows ? "C:\\foo" : "/foo");
  const barFile = URI.file(platform.isWindows ? "C:\\bar" : "/bar");
  let service;
  let configService;
  let stateMainService;
  let environmentService;
  let testDir;
  let backupHome;
  let existingTestFolder1;
  setup(async () => {
    testDir = getRandomTestPath(
      os.tmpdir(),
      "vsctests",
      "backupmainservice"
    );
    backupHome = path.join(testDir, "Backups");
    existingTestFolder1 = URI.file(path.join(testDir, "folder1"));
    environmentService = new EnvironmentMainService(
      parseArgs(process.argv, OPTIONS),
      { _serviceBrand: void 0, ...product }
    );
    await fs.promises.mkdir(backupHome, { recursive: true });
    configService = new TestConfigurationService();
    stateMainService = new InMemoryTestStateMainService();
    service = new class TestBackupMainService extends BackupMainService {
      constructor() {
        super(
          environmentService,
          configService,
          new LogService(new ConsoleMainLogger()),
          stateMainService
        );
        this.backupHome = backupHome;
      }
      toBackupPath(arg) {
        const id = arg instanceof URI ? super.getFolderHash({ folderUri: arg }) : arg;
        return path.join(this.backupHome, id);
      }
      testGetFolderHash(folder) {
        return super.getFolderHash(folder);
      }
      testGetWorkspaceBackups() {
        return super.getWorkspaceBackups();
      }
      testGetFolderBackups() {
        return super.getFolderBackups();
      }
    }();
    return service.initialize();
  });
  teardown(() => {
    return Promises.rm(testDir);
  });
  test("service validates backup workspaces on startup and cleans up (folder workspaces)", async () => {
    service.registerFolderBackup(toFolderBackupInfo(fooFile));
    service.registerFolderBackup(toFolderBackupInfo(barFile));
    await service.initialize();
    assertEqualFolderInfos(service.testGetFolderBackups(), []);
    fs.mkdirSync(service.toBackupPath(fooFile));
    fs.mkdirSync(service.toBackupPath(barFile));
    service.registerFolderBackup(toFolderBackupInfo(fooFile));
    service.registerFolderBackup(toFolderBackupInfo(barFile));
    await service.initialize();
    assertEqualFolderInfos(service.testGetFolderBackups(), []);
    assert.ok(!fs.existsSync(service.toBackupPath(fooFile)));
    assert.ok(!fs.existsSync(service.toBackupPath(barFile)));
    fs.mkdirSync(service.toBackupPath(fooFile));
    fs.mkdirSync(service.toBackupPath(barFile));
    fs.mkdirSync(path.join(service.toBackupPath(fooFile), Schemas.file));
    fs.mkdirSync(
      path.join(service.toBackupPath(barFile), Schemas.untitled)
    );
    service.registerFolderBackup(toFolderBackupInfo(fooFile));
    service.registerFolderBackup(toFolderBackupInfo(barFile));
    await service.initialize();
    assertEqualFolderInfos(service.testGetFolderBackups(), []);
    assert.ok(!fs.existsSync(service.toBackupPath(fooFile)));
    assert.ok(!fs.existsSync(service.toBackupPath(barFile)));
    const fileBackups = path.join(
      service.toBackupPath(fooFile),
      Schemas.file
    );
    fs.mkdirSync(service.toBackupPath(fooFile));
    fs.mkdirSync(service.toBackupPath(barFile));
    fs.mkdirSync(fileBackups);
    service.registerFolderBackup(toFolderBackupInfo(fooFile));
    assert.strictEqual(service.testGetFolderBackups().length, 1);
    assert.strictEqual(service.getEmptyWindowBackups().length, 0);
    fs.writeFileSync(path.join(fileBackups, "backup.txt"), "");
    await service.initialize();
    assert.strictEqual(service.testGetFolderBackups().length, 0);
    assert.strictEqual(service.getEmptyWindowBackups().length, 1);
  });
  test("service validates backup workspaces on startup and cleans up (root workspaces)", async () => {
    service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
    service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath));
    await service.initialize();
    assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
    fs.mkdirSync(service.toBackupPath(fooFile));
    fs.mkdirSync(service.toBackupPath(barFile));
    service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
    service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath));
    await service.initialize();
    assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
    assert.ok(!fs.existsSync(service.toBackupPath(fooFile)));
    assert.ok(!fs.existsSync(service.toBackupPath(barFile)));
    fs.mkdirSync(service.toBackupPath(fooFile));
    fs.mkdirSync(service.toBackupPath(barFile));
    fs.mkdirSync(path.join(service.toBackupPath(fooFile), Schemas.file));
    fs.mkdirSync(
      path.join(service.toBackupPath(barFile), Schemas.untitled)
    );
    service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
    service.registerWorkspaceBackup(toWorkspaceBackupInfo(barFile.fsPath));
    await service.initialize();
    assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
    assert.ok(!fs.existsSync(service.toBackupPath(fooFile)));
    assert.ok(!fs.existsSync(service.toBackupPath(barFile)));
    const fileBackups = path.join(
      service.toBackupPath(fooFile),
      Schemas.file
    );
    fs.mkdirSync(service.toBackupPath(fooFile));
    fs.mkdirSync(service.toBackupPath(barFile));
    fs.mkdirSync(fileBackups);
    service.registerWorkspaceBackup(toWorkspaceBackupInfo(fooFile.fsPath));
    assert.strictEqual(service.testGetWorkspaceBackups().length, 1);
    assert.strictEqual(service.getEmptyWindowBackups().length, 0);
    fs.writeFileSync(path.join(fileBackups, "backup.txt"), "");
    await service.initialize();
    assert.strictEqual(service.testGetWorkspaceBackups().length, 0);
    assert.strictEqual(service.getEmptyWindowBackups().length, 1);
  });
  test("service supports to migrate backup data from another location", async () => {
    const backupPathToMigrate = service.toBackupPath(fooFile);
    fs.mkdirSync(backupPathToMigrate);
    fs.writeFileSync(
      path.join(backupPathToMigrate, "backup.txt"),
      "Some Data"
    );
    service.registerFolderBackup(
      toFolderBackupInfo(URI.file(backupPathToMigrate))
    );
    const workspaceBackupPath = await service.registerWorkspaceBackup(
      toWorkspaceBackupInfo(barFile.fsPath),
      backupPathToMigrate
    );
    assert.ok(fs.existsSync(workspaceBackupPath));
    assert.ok(fs.existsSync(path.join(workspaceBackupPath, "backup.txt")));
    assert.ok(!fs.existsSync(backupPathToMigrate));
    const emptyBackups = service.getEmptyWindowBackups();
    assert.strictEqual(0, emptyBackups.length);
  });
  test("service backup migration makes sure to preserve existing backups", async () => {
    const backupPathToMigrate = service.toBackupPath(fooFile);
    fs.mkdirSync(backupPathToMigrate);
    fs.writeFileSync(
      path.join(backupPathToMigrate, "backup.txt"),
      "Some Data"
    );
    service.registerFolderBackup(
      toFolderBackupInfo(URI.file(backupPathToMigrate))
    );
    const backupPathToPreserve = service.toBackupPath(barFile);
    fs.mkdirSync(backupPathToPreserve);
    fs.writeFileSync(
      path.join(backupPathToPreserve, "backup.txt"),
      "Some Data"
    );
    service.registerFolderBackup(
      toFolderBackupInfo(URI.file(backupPathToPreserve))
    );
    const workspaceBackupPath = await service.registerWorkspaceBackup(
      toWorkspaceBackupInfo(barFile.fsPath),
      backupPathToMigrate
    );
    assert.ok(fs.existsSync(workspaceBackupPath));
    assert.ok(fs.existsSync(path.join(workspaceBackupPath, "backup.txt")));
    assert.ok(!fs.existsSync(backupPathToMigrate));
    const emptyBackups = service.getEmptyWindowBackups();
    assert.strictEqual(1, emptyBackups.length);
    assert.strictEqual(
      1,
      fs.readdirSync(path.join(backupHome, emptyBackups[0].backupFolder)).length
    );
  });
  suite("loadSync", () => {
    test("getFolderBackupPaths() should return [] when workspaces.json doesn't exist", () => {
      assertEqualFolderInfos(service.testGetFolderBackups(), []);
    });
    test("getFolderBackupPaths() should return [] when folders in workspaces.json is absent", async () => {
      writeWorkspacesMetadata("{}");
      await service.initialize();
      assertEqualFolderInfos(service.testGetFolderBackups(), []);
    });
    test("getFolderBackupPaths() should return [] when folders in workspaces.json is not a string array", async () => {
      writeWorkspacesMetadata('{"folders":{}}');
      await service.initialize();
      assertEqualFolderInfos(service.testGetFolderBackups(), []);
      writeWorkspacesMetadata('{"folders":{"foo": ["bar"]}}');
      await service.initialize();
      assertEqualFolderInfos(service.testGetFolderBackups(), []);
      writeWorkspacesMetadata('{"folders":{"foo": []}}');
      await service.initialize();
      assertEqualFolderInfos(service.testGetFolderBackups(), []);
      writeWorkspacesMetadata('{"folders":{"foo": "bar"}}');
      await service.initialize();
      assertEqualFolderInfos(service.testGetFolderBackups(), []);
      writeWorkspacesMetadata('{"folders":"foo"}');
      await service.initialize();
      assertEqualFolderInfos(service.testGetFolderBackups(), []);
      writeWorkspacesMetadata('{"folders":1}');
      await service.initialize();
      assertEqualFolderInfos(service.testGetFolderBackups(), []);
    });
    test('getFolderBackupPaths() should return [] when files.hotExit = "onExitAndWindowClose"', async () => {
      const fi = toFolderBackupInfo(
        URI.file(fooFile.fsPath.toUpperCase())
      );
      service.registerFolderBackup(fi);
      assertEqualFolderInfos(service.testGetFolderBackups(), [fi]);
      configService.setUserConfiguration(
        "files.hotExit",
        HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE
      );
      await service.initialize();
      assertEqualFolderInfos(service.testGetFolderBackups(), []);
    });
    test("getWorkspaceBackups() should return [] when workspaces.json doesn't exist", () => {
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
    });
    test("getWorkspaceBackups() should return [] when folderWorkspaces in workspaces.json is absent", async () => {
      writeWorkspacesMetadata("{}");
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
    });
    test("getWorkspaceBackups() should return [] when rootWorkspaces in workspaces.json is not a object array", async () => {
      writeWorkspacesMetadata('{"rootWorkspaces":{}}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
      writeWorkspacesMetadata('{"rootWorkspaces":{"foo": ["bar"]}}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
      writeWorkspacesMetadata('{"rootWorkspaces":{"foo": []}}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
      writeWorkspacesMetadata('{"rootWorkspaces":{"foo": "bar"}}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
      writeWorkspacesMetadata('{"rootWorkspaces":"foo"}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
      writeWorkspacesMetadata('{"rootWorkspaces":1}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
    });
    test("getWorkspaceBackups() should return [] when workspaces in workspaces.json is not a object array", async () => {
      writeWorkspacesMetadata('{"workspaces":{}}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
      writeWorkspacesMetadata('{"workspaces":{"foo": ["bar"]}}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
      writeWorkspacesMetadata('{"workspaces":{"foo": []}}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
      writeWorkspacesMetadata('{"workspaces":{"foo": "bar"}}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
      writeWorkspacesMetadata('{"workspaces":"foo"}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
      writeWorkspacesMetadata('{"workspaces":1}');
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
    });
    test('getWorkspaceBackups() should return [] when files.hotExit = "onExitAndWindowClose"', async () => {
      const upperFooPath = fooFile.fsPath.toUpperCase();
      service.registerWorkspaceBackup(
        toWorkspaceBackupInfo(upperFooPath)
      );
      assert.strictEqual(service.testGetWorkspaceBackups().length, 1);
      assert.deepStrictEqual(
        service.testGetWorkspaceBackups().map((r) => r.workspace.configPath.toString()),
        [URI.file(upperFooPath).toString()]
      );
      configService.setUserConfiguration(
        "files.hotExit",
        HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE
      );
      await service.initialize();
      assert.deepStrictEqual(service.testGetWorkspaceBackups(), []);
    });
    test("getEmptyWorkspaceBackupPaths() should return [] when workspaces.json doesn't exist", () => {
      assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
    });
    test("getEmptyWorkspaceBackupPaths() should return [] when folderWorkspaces in workspaces.json is absent", async () => {
      writeWorkspacesMetadata("{}");
      await service.initialize();
      assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
    });
    test("getEmptyWorkspaceBackupPaths() should return [] when folderWorkspaces in workspaces.json is not a string array", async () => {
      writeWorkspacesMetadata('{"emptyWorkspaces":{}}');
      await service.initialize();
      assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
      writeWorkspacesMetadata('{"emptyWorkspaces":{"foo": ["bar"]}}');
      await service.initialize();
      assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
      writeWorkspacesMetadata('{"emptyWorkspaces":{"foo": []}}');
      await service.initialize();
      assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
      writeWorkspacesMetadata('{"emptyWorkspaces":{"foo": "bar"}}');
      await service.initialize();
      assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
      writeWorkspacesMetadata('{"emptyWorkspaces":"foo"}');
      await service.initialize();
      assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
      writeWorkspacesMetadata('{"emptyWorkspaces":1}');
      await service.initialize();
      assert.deepStrictEqual(service.getEmptyWindowBackups(), []);
    });
  });
  suite("dedupeFolderWorkspaces", () => {
    test("should ignore duplicates (folder workspace)", async () => {
      await ensureFolderExists(existingTestFolder1);
      const workspacesJson = {
        workspaces: [],
        folders: [
          { folderUri: existingTestFolder1.toString() },
          { folderUri: existingTestFolder1.toString() }
        ],
        emptyWindows: []
      };
      writeWorkspacesMetadata(JSON.stringify(workspacesJson));
      await service.initialize();
      const json = readWorkspacesMetadata();
      assert.deepStrictEqual(json.folders, [
        { folderUri: existingTestFolder1.toString() }
      ]);
    });
    test("should ignore duplicates on Windows and Mac (folder workspace)", async () => {
      await ensureFolderExists(existingTestFolder1);
      const workspacesJson = {
        workspaces: [],
        folders: [
          { folderUri: existingTestFolder1.toString() },
          { folderUri: existingTestFolder1.toString().toLowerCase() }
        ],
        emptyWindows: []
      };
      writeWorkspacesMetadata(JSON.stringify(workspacesJson));
      await service.initialize();
      const json = readWorkspacesMetadata();
      assert.deepStrictEqual(json.folders, [
        { folderUri: existingTestFolder1.toString() }
      ]);
    });
    test("should ignore duplicates on Windows and Mac (root workspace)", async () => {
      const workspacePath = path.join(testDir, "Foo.code-workspace");
      const workspacePath1 = path.join(testDir, "FOO.code-workspace");
      const workspacePath2 = path.join(testDir, "foo.code-workspace");
      const workspace1 = await ensureWorkspaceExists(
        toWorkspace(workspacePath)
      );
      const workspace2 = await ensureWorkspaceExists(
        toWorkspace(workspacePath1)
      );
      const workspace3 = await ensureWorkspaceExists(
        toWorkspace(workspacePath2)
      );
      const workspacesJson = {
        workspaces: [workspace1, workspace2, workspace3].map(
          toSerializedWorkspace
        ),
        folders: [],
        emptyWindows: []
      };
      writeWorkspacesMetadata(JSON.stringify(workspacesJson));
      await service.initialize();
      const json = readWorkspacesMetadata();
      assert.strictEqual(
        json.workspaces.length,
        platform.isLinux ? 3 : 1
      );
      if (platform.isLinux) {
        assert.deepStrictEqual(
          json.workspaces.map((r) => r.configURIPath),
          [
            URI.file(workspacePath).toString(),
            URI.file(workspacePath1).toString(),
            URI.file(workspacePath2).toString()
          ]
        );
      } else {
        assert.deepStrictEqual(
          json.workspaces.map((r) => r.configURIPath),
          [URI.file(workspacePath).toString()],
          "should return the first duplicated entry"
        );
      }
    });
  });
  suite("registerWindowForBackups", () => {
    test("should persist paths to workspaces.json (folder workspace)", async () => {
      service.registerFolderBackup(toFolderBackupInfo(fooFile));
      service.registerFolderBackup(toFolderBackupInfo(barFile));
      assertEqualFolderInfos(service.testGetFolderBackups(), [
        toFolderBackupInfo(fooFile),
        toFolderBackupInfo(barFile)
      ]);
      const json = readWorkspacesMetadata();
      assert.deepStrictEqual(json.folders, [
        { folderUri: fooFile.toString() },
        { folderUri: barFile.toString() }
      ]);
    });
    test("should persist paths to workspaces.json (root workspace)", async () => {
      const ws1 = toWorkspaceBackupInfo(fooFile.fsPath);
      service.registerWorkspaceBackup(ws1);
      const ws2 = toWorkspaceBackupInfo(barFile.fsPath);
      service.registerWorkspaceBackup(ws2);
      assert.deepStrictEqual(
        service.testGetWorkspaceBackups().map((b) => b.workspace.configPath.toString()),
        [fooFile.toString(), barFile.toString()]
      );
      assert.strictEqual(
        ws1.workspace.id,
        service.testGetWorkspaceBackups()[0].workspace.id
      );
      assert.strictEqual(
        ws2.workspace.id,
        service.testGetWorkspaceBackups()[1].workspace.id
      );
      const json = readWorkspacesMetadata();
      assert.deepStrictEqual(
        json.workspaces.map((b) => b.configURIPath),
        [fooFile.toString(), barFile.toString()]
      );
      assert.strictEqual(ws1.workspace.id, json.workspaces[0].id);
      assert.strictEqual(ws2.workspace.id, json.workspaces[1].id);
    });
  });
  test("should always store the workspace path in workspaces.json using the case given, regardless of whether the file system is case-sensitive (folder workspace)", async () => {
    service.registerFolderBackup(
      toFolderBackupInfo(URI.file(fooFile.fsPath.toUpperCase()))
    );
    assertEqualFolderInfos(service.testGetFolderBackups(), [
      toFolderBackupInfo(URI.file(fooFile.fsPath.toUpperCase()))
    ]);
    const json = readWorkspacesMetadata();
    assert.deepStrictEqual(json.folders, [
      { folderUri: URI.file(fooFile.fsPath.toUpperCase()).toString() }
    ]);
  });
  test("should always store the workspace path in workspaces.json using the case given, regardless of whether the file system is case-sensitive (root workspace)", async () => {
    const upperFooPath = fooFile.fsPath.toUpperCase();
    service.registerWorkspaceBackup(toWorkspaceBackupInfo(upperFooPath));
    assert.deepStrictEqual(
      service.testGetWorkspaceBackups().map((b) => b.workspace.configPath.toString()),
      [URI.file(upperFooPath).toString()]
    );
    const json = readWorkspacesMetadata();
    assert.deepStrictEqual(
      json.workspaces.map((b) => b.configURIPath),
      [URI.file(upperFooPath).toString()]
    );
  });
  suite("getWorkspaceHash", () => {
    (platform.isLinux ? test.skip : test)(
      "should ignore case on Windows and Mac",
      () => {
        const assertFolderHash = (uri1, uri2) => {
          assert.strictEqual(
            service.testGetFolderHash(toFolderBackupInfo(uri1)),
            service.testGetFolderHash(toFolderBackupInfo(uri2))
          );
        };
        if (platform.isMacintosh) {
          assertFolderHash(URI.file("/foo"), URI.file("/FOO"));
        }
        if (platform.isWindows) {
          assertFolderHash(URI.file("c:\\foo"), URI.file("C:\\FOO"));
        }
      }
    );
  });
  suite("mixed path casing", () => {
    test("should handle case insensitive paths properly (registerWindowForBackupsSync) (folder workspace)", () => {
      service.registerFolderBackup(toFolderBackupInfo(fooFile));
      service.registerFolderBackup(
        toFolderBackupInfo(URI.file(fooFile.fsPath.toUpperCase()))
      );
      if (platform.isLinux) {
        assert.strictEqual(service.testGetFolderBackups().length, 2);
      } else {
        assert.strictEqual(service.testGetFolderBackups().length, 1);
      }
    });
    test("should handle case insensitive paths properly (registerWindowForBackupsSync) (root workspace)", () => {
      service.registerWorkspaceBackup(
        toWorkspaceBackupInfo(fooFile.fsPath)
      );
      service.registerWorkspaceBackup(
        toWorkspaceBackupInfo(fooFile.fsPath.toUpperCase())
      );
      if (platform.isLinux) {
        assert.strictEqual(service.testGetWorkspaceBackups().length, 2);
      } else {
        assert.strictEqual(service.testGetWorkspaceBackups().length, 1);
      }
    });
  });
  suite("getDirtyWorkspaces", () => {
    test("should report if a workspace or folder has backups", async () => {
      const folderBackupPath = service.registerFolderBackup(
        toFolderBackupInfo(fooFile)
      );
      const backupWorkspaceInfo = toWorkspaceBackupInfo(fooFile.fsPath);
      const workspaceBackupPath = service.registerWorkspaceBackup(backupWorkspaceInfo);
      assert.strictEqual((await service.getDirtyWorkspaces()).length, 0);
      try {
        await fs.promises.mkdir(
          path.join(folderBackupPath, Schemas.file),
          { recursive: true }
        );
        await fs.promises.mkdir(
          path.join(workspaceBackupPath, Schemas.untitled),
          { recursive: true }
        );
      } catch (error) {
      }
      assert.strictEqual((await service.getDirtyWorkspaces()).length, 0);
      fs.writeFileSync(
        path.join(
          folderBackupPath,
          Schemas.file,
          "594a4a9d82a277a899d4713a5b08f504"
        ),
        ""
      );
      fs.writeFileSync(
        path.join(
          workspaceBackupPath,
          Schemas.untitled,
          "594a4a9d82a277a899d4713a5b08f504"
        ),
        ""
      );
      const dirtyWorkspaces = await service.getDirtyWorkspaces();
      assert.strictEqual(dirtyWorkspaces.length, 2);
      let found = 0;
      for (const dirtyWorkpspace of dirtyWorkspaces) {
        if (isFolderBackupInfo(dirtyWorkpspace)) {
          if (isEqual(fooFile, dirtyWorkpspace.folderUri)) {
            found++;
          }
        } else if (isEqual(
          backupWorkspaceInfo.workspace.configPath,
          dirtyWorkpspace.workspace.configPath
        )) {
          found++;
        }
      }
      assert.strictEqual(found, 2);
    });
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
