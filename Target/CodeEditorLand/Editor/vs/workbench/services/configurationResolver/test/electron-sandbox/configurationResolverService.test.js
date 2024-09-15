var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { stub } from "sinon";
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../../base/common/network.js";
import { IPath, normalize } from "../../../../../base/common/path.js";
import * as platform from "../../../../../base/common/platform.js";
import { isObject } from "../../../../../base/common/types.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { Selection } from "../../../../../editor/common/core/selection.js";
import { EditorType } from "../../../../../editor/common/editorCommon.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IExtensionDescription } from "../../../../../platform/extensions/common/extensions.js";
import { IFormatterChangeEvent, ILabelService, ResourceLabelFormatter, Verbosity } from "../../../../../platform/label/common/label.js";
import { IWorkspace, IWorkspaceFolder, IWorkspaceIdentifier, Workspace } from "../../../../../platform/workspace/common/workspace.js";
import { testWorkspace } from "../../../../../platform/workspace/test/common/testWorkspace.js";
import { BaseConfigurationResolverService } from "../../browser/baseConfigurationResolverService.js";
import { IConfigurationResolverService } from "../../common/configurationResolver.js";
import { IExtensionService } from "../../../extensions/common/extensions.js";
import { IPathService } from "../../../path/common/pathService.js";
import { TestEditorService, TestQuickInputService } from "../../../../test/browser/workbenchTestServices.js";
import { TestContextService, TestExtensionService, TestStorageService } from "../../../../test/common/workbenchTestServices.js";
const mockLineNumber = 10;
class TestEditorServiceWithActiveEditor extends TestEditorService {
  static {
    __name(this, "TestEditorServiceWithActiveEditor");
  }
  get activeTextEditorControl() {
    return {
      getEditorType() {
        return EditorType.ICodeEditor;
      },
      getSelection() {
        return new Selection(mockLineNumber, 1, mockLineNumber, 10);
      }
    };
  }
  get activeEditor() {
    return {
      get resource() {
        return URI.parse("file:///VSCode/workspaceLocation/file");
      }
    };
  }
}
class TestConfigurationResolverService extends BaseConfigurationResolverService {
  static {
    __name(this, "TestConfigurationResolverService");
  }
}
const nullContext = {
  getAppRoot: /* @__PURE__ */ __name(() => void 0, "getAppRoot"),
  getExecPath: /* @__PURE__ */ __name(() => void 0, "getExecPath")
};
suite("Configuration Resolver Service", () => {
  let configurationResolverService;
  const envVariables = { key1: "Value for key1", key2: "Value for key2" };
  let mockCommandService;
  let editorService;
  let containingWorkspace;
  let workspace;
  let quickInputService;
  let labelService;
  let pathService;
  let extensionService;
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  setup(() => {
    mockCommandService = new MockCommandService();
    editorService = disposables.add(new TestEditorServiceWithActiveEditor());
    quickInputService = new TestQuickInputService();
    labelService = new MockLabelService();
    pathService = new MockPathService();
    extensionService = new TestExtensionService();
    containingWorkspace = testWorkspace(URI.parse("file:///VSCode/workspaceLocation"));
    workspace = containingWorkspace.folders[0];
    configurationResolverService = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), editorService, new MockInputsConfigurationService(), mockCommandService, new TestContextService(containingWorkspace), quickInputService, labelService, pathService, extensionService, disposables.add(new TestStorageService()));
  });
  teardown(() => {
    configurationResolverService = null;
  });
  test("substitute one", async () => {
    if (platform.isWindows) {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "abc ${workspaceFolder} xyz"), "abc \\VSCode\\workspaceLocation xyz");
    } else {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "abc ${workspaceFolder} xyz"), "abc /VSCode/workspaceLocation xyz");
    }
  });
  test("workspace folder with argument", async () => {
    if (platform.isWindows) {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "abc ${workspaceFolder:workspaceLocation} xyz"), "abc \\VSCode\\workspaceLocation xyz");
    } else {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "abc ${workspaceFolder:workspaceLocation} xyz"), "abc /VSCode/workspaceLocation xyz");
    }
  });
  test("workspace folder with invalid argument", () => {
    assert.rejects(async () => await configurationResolverService.resolveAsync(workspace, "abc ${workspaceFolder:invalidLocation} xyz"));
  });
  test("workspace folder with undefined workspace folder", () => {
    assert.rejects(async () => await configurationResolverService.resolveAsync(void 0, "abc ${workspaceFolder} xyz"));
  });
  test("workspace folder with argument and undefined workspace folder", async () => {
    if (platform.isWindows) {
      assert.strictEqual(await configurationResolverService.resolveAsync(void 0, "abc ${workspaceFolder:workspaceLocation} xyz"), "abc \\VSCode\\workspaceLocation xyz");
    } else {
      assert.strictEqual(await configurationResolverService.resolveAsync(void 0, "abc ${workspaceFolder:workspaceLocation} xyz"), "abc /VSCode/workspaceLocation xyz");
    }
  });
  test("workspace folder with invalid argument and undefined workspace folder", () => {
    assert.rejects(async () => await configurationResolverService.resolveAsync(void 0, "abc ${workspaceFolder:invalidLocation} xyz"));
  });
  test("workspace root folder name", async () => {
    assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "abc ${workspaceRootFolderName} xyz"), "abc workspaceLocation xyz");
  });
  test("current selected line number", async () => {
    assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "abc ${lineNumber} xyz"), `abc ${mockLineNumber} xyz`);
  });
  test("relative file", async () => {
    assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "abc ${relativeFile} xyz"), "abc file xyz");
  });
  test("relative file with argument", async () => {
    assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "abc ${relativeFile:workspaceLocation} xyz"), "abc file xyz");
  });
  test("relative file with invalid argument", () => {
    assert.rejects(async () => await configurationResolverService.resolveAsync(workspace, "abc ${relativeFile:invalidLocation} xyz"));
  });
  test("relative file with undefined workspace folder", async () => {
    if (platform.isWindows) {
      assert.strictEqual(await configurationResolverService.resolveAsync(void 0, "abc ${relativeFile} xyz"), "abc \\VSCode\\workspaceLocation\\file xyz");
    } else {
      assert.strictEqual(await configurationResolverService.resolveAsync(void 0, "abc ${relativeFile} xyz"), "abc /VSCode/workspaceLocation/file xyz");
    }
  });
  test("relative file with argument and undefined workspace folder", async () => {
    assert.strictEqual(await configurationResolverService.resolveAsync(void 0, "abc ${relativeFile:workspaceLocation} xyz"), "abc file xyz");
  });
  test("relative file with invalid argument and undefined workspace folder", () => {
    assert.rejects(async () => await configurationResolverService.resolveAsync(void 0, "abc ${relativeFile:invalidLocation} xyz"));
  });
  test("substitute many", async () => {
    if (platform.isWindows) {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "${workspaceFolder} - ${workspaceFolder}"), "\\VSCode\\workspaceLocation - \\VSCode\\workspaceLocation");
    } else {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "${workspaceFolder} - ${workspaceFolder}"), "/VSCode/workspaceLocation - /VSCode/workspaceLocation");
    }
  });
  test("substitute one env variable", async () => {
    if (platform.isWindows) {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "abc ${workspaceFolder} ${env:key1} xyz"), "abc \\VSCode\\workspaceLocation Value for key1 xyz");
    } else {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "abc ${workspaceFolder} ${env:key1} xyz"), "abc /VSCode/workspaceLocation Value for key1 xyz");
    }
  });
  test("substitute many env variable", async () => {
    if (platform.isWindows) {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}"), "\\VSCode\\workspaceLocation - \\VSCode\\workspaceLocation Value for key1 - Value for key2");
    } else {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}"), "/VSCode/workspaceLocation - /VSCode/workspaceLocation Value for key1 - Value for key2");
    }
  });
  test("disallows nested keys (#77289)", async () => {
    assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "${env:key1} ${env:key1${env:key2}}"), "Value for key1 ${env:key1${env:key2}}");
  });
  test("supports extensionDir", async () => {
    const getExtension = stub(extensionService, "getExtension");
    getExtension.withArgs("publisher.extId").returns(Promise.resolve({ extensionLocation: URI.file("/some/path") }));
    assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "${extensionInstallFolder:publisher.extId}"), URI.file("/some/path").fsPath);
  });
  test("substitute one env variable using platform case sensitivity", async () => {
    if (platform.isWindows) {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "${env:key1} - ${env:Key1}"), "Value for key1 - Value for key1");
    } else {
      assert.strictEqual(await configurationResolverService.resolveAsync(workspace, "${env:key1} - ${env:Key1}"), "Value for key1 - ");
    }
  });
  test("substitute one configuration variable", async () => {
    const configurationService = new TestConfigurationService({
      editor: {
        fontFamily: "foo"
      },
      terminal: {
        integrated: {
          fontFamily: "bar"
        }
      }
    });
    const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), disposables.add(new TestEditorServiceWithActiveEditor()), configurationService, mockCommandService, new TestContextService(), quickInputService, labelService, pathService, extensionService, disposables.add(new TestStorageService()));
    assert.strictEqual(await service.resolveAsync(workspace, "abc ${config:editor.fontFamily} xyz"), "abc foo xyz");
  });
  test("substitute configuration variable with undefined workspace folder", async () => {
    const configurationService = new TestConfigurationService({
      editor: {
        fontFamily: "foo"
      }
    });
    const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), disposables.add(new TestEditorServiceWithActiveEditor()), configurationService, mockCommandService, new TestContextService(), quickInputService, labelService, pathService, extensionService, disposables.add(new TestStorageService()));
    assert.strictEqual(await service.resolveAsync(void 0, "abc ${config:editor.fontFamily} xyz"), "abc foo xyz");
  });
  test("substitute many configuration variables", async () => {
    const configurationService = new TestConfigurationService({
      editor: {
        fontFamily: "foo"
      },
      terminal: {
        integrated: {
          fontFamily: "bar"
        }
      }
    });
    const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), disposables.add(new TestEditorServiceWithActiveEditor()), configurationService, mockCommandService, new TestContextService(), quickInputService, labelService, pathService, extensionService, disposables.add(new TestStorageService()));
    assert.strictEqual(await service.resolveAsync(workspace, "abc ${config:editor.fontFamily} ${config:terminal.integrated.fontFamily} xyz"), "abc foo bar xyz");
  });
  test("substitute one env variable and a configuration variable", async () => {
    const configurationService = new TestConfigurationService({
      editor: {
        fontFamily: "foo"
      },
      terminal: {
        integrated: {
          fontFamily: "bar"
        }
      }
    });
    const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), disposables.add(new TestEditorServiceWithActiveEditor()), configurationService, mockCommandService, new TestContextService(), quickInputService, labelService, pathService, extensionService, disposables.add(new TestStorageService()));
    if (platform.isWindows) {
      assert.strictEqual(await service.resolveAsync(workspace, "abc ${config:editor.fontFamily} ${workspaceFolder} ${env:key1} xyz"), "abc foo \\VSCode\\workspaceLocation Value for key1 xyz");
    } else {
      assert.strictEqual(await service.resolveAsync(workspace, "abc ${config:editor.fontFamily} ${workspaceFolder} ${env:key1} xyz"), "abc foo /VSCode/workspaceLocation Value for key1 xyz");
    }
  });
  test("substitute many env variable and a configuration variable", async () => {
    const configurationService = new TestConfigurationService({
      editor: {
        fontFamily: "foo"
      },
      terminal: {
        integrated: {
          fontFamily: "bar"
        }
      }
    });
    const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), disposables.add(new TestEditorServiceWithActiveEditor()), configurationService, mockCommandService, new TestContextService(), quickInputService, labelService, pathService, extensionService, disposables.add(new TestStorageService()));
    if (platform.isWindows) {
      assert.strictEqual(await service.resolveAsync(workspace, "${config:editor.fontFamily} ${config:terminal.integrated.fontFamily} ${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}"), "foo bar \\VSCode\\workspaceLocation - \\VSCode\\workspaceLocation Value for key1 - Value for key2");
    } else {
      assert.strictEqual(await service.resolveAsync(workspace, "${config:editor.fontFamily} ${config:terminal.integrated.fontFamily} ${workspaceFolder} - ${workspaceFolder} ${env:key1} - ${env:key2}"), "foo bar /VSCode/workspaceLocation - /VSCode/workspaceLocation Value for key1 - Value for key2");
    }
  });
  test("mixed types of configuration variables", async () => {
    const configurationService = new TestConfigurationService({
      editor: {
        fontFamily: "foo",
        lineNumbers: 123,
        insertSpaces: false
      },
      terminal: {
        integrated: {
          fontFamily: "bar"
        }
      },
      json: {
        schemas: [
          {
            fileMatch: [
              "/myfile",
              "/myOtherfile"
            ],
            url: "schemaURL"
          }
        ]
      }
    });
    const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), disposables.add(new TestEditorServiceWithActiveEditor()), configurationService, mockCommandService, new TestContextService(), quickInputService, labelService, pathService, extensionService, disposables.add(new TestStorageService()));
    assert.strictEqual(await service.resolveAsync(workspace, "abc ${config:editor.fontFamily} ${config:editor.lineNumbers} ${config:editor.insertSpaces} xyz"), "abc foo 123 false xyz");
  });
  test("uses original variable as fallback", async () => {
    const configurationService = new TestConfigurationService({
      editor: {}
    });
    const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), disposables.add(new TestEditorServiceWithActiveEditor()), configurationService, mockCommandService, new TestContextService(), quickInputService, labelService, pathService, extensionService, disposables.add(new TestStorageService()));
    assert.strictEqual(await service.resolveAsync(workspace, "abc ${unknownVariable} xyz"), "abc ${unknownVariable} xyz");
    assert.strictEqual(await service.resolveAsync(workspace, "abc ${env:unknownVariable} xyz"), "abc  xyz");
  });
  test("configuration variables with invalid accessor", () => {
    const configurationService = new TestConfigurationService({
      editor: {
        fontFamily: "foo"
      }
    });
    const service = new TestConfigurationResolverService(nullContext, Promise.resolve(envVariables), disposables.add(new TestEditorServiceWithActiveEditor()), configurationService, mockCommandService, new TestContextService(), quickInputService, labelService, pathService, extensionService, disposables.add(new TestStorageService()));
    assert.rejects(async () => await service.resolveAsync(workspace, "abc ${env} xyz"));
    assert.rejects(async () => await service.resolveAsync(workspace, "abc ${env:} xyz"));
    assert.rejects(async () => await service.resolveAsync(workspace, "abc ${config} xyz"));
    assert.rejects(async () => await service.resolveAsync(workspace, "abc ${config:} xyz"));
    assert.rejects(async () => await service.resolveAsync(workspace, "abc ${config:editor} xyz"));
    assert.rejects(async () => await service.resolveAsync(workspace, "abc ${config:editor..fontFamily} xyz"));
    assert.rejects(async () => await service.resolveAsync(workspace, "abc ${config:editor.none.none2} xyz"));
  });
  test("a single command variable", () => {
    const configuration = {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "processId": "${command:command1}",
      "port": 5858,
      "sourceMaps": false,
      "outDir": null
    };
    return configurationResolverService.resolveWithInteractionReplace(void 0, configuration).then((result) => {
      assert.deepStrictEqual({ ...result }, {
        "name": "Attach to Process",
        "type": "node",
        "request": "attach",
        "processId": "command1-result",
        "port": 5858,
        "sourceMaps": false,
        "outDir": null
      });
      assert.strictEqual(1, mockCommandService.callCount);
    });
  });
  test("an old style command variable", () => {
    const configuration = {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "processId": "${command:commandVariable1}",
      "port": 5858,
      "sourceMaps": false,
      "outDir": null
    };
    const commandVariables = /* @__PURE__ */ Object.create(null);
    commandVariables["commandVariable1"] = "command1";
    return configurationResolverService.resolveWithInteractionReplace(void 0, configuration, void 0, commandVariables).then((result) => {
      assert.deepStrictEqual({ ...result }, {
        "name": "Attach to Process",
        "type": "node",
        "request": "attach",
        "processId": "command1-result",
        "port": 5858,
        "sourceMaps": false,
        "outDir": null
      });
      assert.strictEqual(1, mockCommandService.callCount);
    });
  });
  test("multiple new and old-style command variables", () => {
    const configuration = {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "processId": "${command:commandVariable1}",
      "pid": "${command:command2}",
      "sourceMaps": false,
      "outDir": "src/${command:command2}",
      "env": {
        "processId": "__${command:command2}__"
      }
    };
    const commandVariables = /* @__PURE__ */ Object.create(null);
    commandVariables["commandVariable1"] = "command1";
    return configurationResolverService.resolveWithInteractionReplace(void 0, configuration, void 0, commandVariables).then((result) => {
      const expected = {
        "name": "Attach to Process",
        "type": "node",
        "request": "attach",
        "processId": "command1-result",
        "pid": "command2-result",
        "sourceMaps": false,
        "outDir": "src/command2-result",
        "env": {
          "processId": "__command2-result__"
        }
      };
      assert.deepStrictEqual(Object.keys(result), Object.keys(expected));
      Object.keys(result).forEach((property) => {
        const expectedProperty = expected[property];
        if (isObject(result[property])) {
          assert.deepStrictEqual({ ...result[property] }, expectedProperty);
        } else {
          assert.deepStrictEqual(result[property], expectedProperty);
        }
      });
      assert.strictEqual(2, mockCommandService.callCount);
    });
  });
  test("a command variable that relies on resolved env vars", () => {
    const configuration = {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "processId": "${command:commandVariable1}",
      "value": "${env:key1}"
    };
    const commandVariables = /* @__PURE__ */ Object.create(null);
    commandVariables["commandVariable1"] = "command1";
    return configurationResolverService.resolveWithInteractionReplace(void 0, configuration, void 0, commandVariables).then((result) => {
      assert.deepStrictEqual({ ...result }, {
        "name": "Attach to Process",
        "type": "node",
        "request": "attach",
        "processId": "Value for key1",
        "value": "Value for key1"
      });
      assert.strictEqual(1, mockCommandService.callCount);
    });
  });
  test("a single prompt input variable", () => {
    const configuration = {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "processId": "${input:input1}",
      "port": 5858,
      "sourceMaps": false,
      "outDir": null
    };
    return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, "tasks").then((result) => {
      assert.deepStrictEqual({ ...result }, {
        "name": "Attach to Process",
        "type": "node",
        "request": "attach",
        "processId": "resolvedEnterinput1",
        "port": 5858,
        "sourceMaps": false,
        "outDir": null
      });
      assert.strictEqual(0, mockCommandService.callCount);
    });
  });
  test("a single pick input variable", () => {
    const configuration = {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "processId": "${input:input2}",
      "port": 5858,
      "sourceMaps": false,
      "outDir": null
    };
    return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, "tasks").then((result) => {
      assert.deepStrictEqual({ ...result }, {
        "name": "Attach to Process",
        "type": "node",
        "request": "attach",
        "processId": "selectedPick",
        "port": 5858,
        "sourceMaps": false,
        "outDir": null
      });
      assert.strictEqual(0, mockCommandService.callCount);
    });
  });
  test("a single command input variable", () => {
    const configuration = {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "processId": "${input:input4}",
      "port": 5858,
      "sourceMaps": false,
      "outDir": null
    };
    return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, "tasks").then((result) => {
      assert.deepStrictEqual({ ...result }, {
        "name": "Attach to Process",
        "type": "node",
        "request": "attach",
        "processId": "arg for command",
        "port": 5858,
        "sourceMaps": false,
        "outDir": null
      });
      assert.strictEqual(1, mockCommandService.callCount);
    });
  });
  test("several input variables and command", () => {
    const configuration = {
      "name": "${input:input3}",
      "type": "${command:command1}",
      "request": "${input:input1}",
      "processId": "${input:input2}",
      "command": "${input:input4}",
      "port": 5858,
      "sourceMaps": false,
      "outDir": null
    };
    return configurationResolverService.resolveWithInteractionReplace(workspace, configuration, "tasks").then((result) => {
      assert.deepStrictEqual({ ...result }, {
        "name": "resolvedEnterinput3",
        "type": "command1-result",
        "request": "resolvedEnterinput1",
        "processId": "selectedPick",
        "command": "arg for command",
        "port": 5858,
        "sourceMaps": false,
        "outDir": null
      });
      assert.strictEqual(2, mockCommandService.callCount);
    });
  });
  test("input variable with undefined workspace folder", () => {
    const configuration = {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "processId": "${input:input1}",
      "port": 5858,
      "sourceMaps": false,
      "outDir": null
    };
    return configurationResolverService.resolveWithInteractionReplace(void 0, configuration, "tasks").then((result) => {
      assert.deepStrictEqual({ ...result }, {
        "name": "Attach to Process",
        "type": "node",
        "request": "attach",
        "processId": "resolvedEnterinput1",
        "port": 5858,
        "sourceMaps": false,
        "outDir": null
      });
      assert.strictEqual(0, mockCommandService.callCount);
    });
  });
  test("contributed variable", () => {
    const buildTask = "npm: compile";
    const variable = "defaultBuildTask";
    const configuration = {
      "name": "${" + variable + "}"
    };
    configurationResolverService.contributeVariable(variable, async () => {
      return buildTask;
    });
    return configurationResolverService.resolveWithInteractionReplace(workspace, configuration).then((result) => {
      assert.deepStrictEqual({ ...result }, {
        "name": `${buildTask}`
      });
    });
  });
  test("resolveWithEnvironment", async () => {
    const env = {
      "VAR_1": "VAL_1",
      "VAR_2": "VAL_2"
    };
    const configuration = "echo ${env:VAR_1}${env:VAR_2}";
    const resolvedResult = await configurationResolverService.resolveWithEnvironment({ ...env }, void 0, configuration);
    assert.deepStrictEqual(resolvedResult, "echo VAL_1VAL_2");
  });
});
class MockCommandService {
  static {
    __name(this, "MockCommandService");
  }
  _serviceBrand;
  callCount = 0;
  onWillExecuteCommand = /* @__PURE__ */ __name(() => Disposable.None, "onWillExecuteCommand");
  onDidExecuteCommand = /* @__PURE__ */ __name(() => Disposable.None, "onDidExecuteCommand");
  executeCommand(commandId, ...args) {
    this.callCount++;
    let result = `${commandId}-result`;
    if (args.length >= 1) {
      if (args[0] && args[0].value) {
        result = args[0].value;
      }
    }
    return Promise.resolve(result);
  }
}
class MockLabelService {
  static {
    __name(this, "MockLabelService");
  }
  _serviceBrand;
  getUriLabel(resource, options) {
    return normalize(resource.fsPath);
  }
  getUriBasenameLabel(resource) {
    throw new Error("Method not implemented.");
  }
  getWorkspaceLabel(workspace, options) {
    throw new Error("Method not implemented.");
  }
  getHostLabel(scheme, authority) {
    throw new Error("Method not implemented.");
  }
  getHostTooltip() {
    throw new Error("Method not implemented.");
  }
  getSeparator(scheme, authority) {
    throw new Error("Method not implemented.");
  }
  registerFormatter(formatter) {
    throw new Error("Method not implemented.");
  }
  registerCachedFormatter(formatter) {
    throw new Error("Method not implemented.");
  }
  onDidChangeFormatters = new Emitter().event;
}
class MockPathService {
  static {
    __name(this, "MockPathService");
  }
  _serviceBrand;
  get path() {
    throw new Error("Property not implemented");
  }
  defaultUriScheme = Schemas.file;
  fileURI(path) {
    throw new Error("Method not implemented.");
  }
  userHome(options) {
    const uri = URI.file("c:\\users\\username");
    return options?.preferLocal ? uri : Promise.resolve(uri);
  }
  hasValidBasename(resource, arg2, name) {
    throw new Error("Method not implemented.");
  }
  resolvedUserHome;
}
class MockInputsConfigurationService extends TestConfigurationService {
  static {
    __name(this, "MockInputsConfigurationService");
  }
  getValue(arg1, arg2) {
    let configuration;
    if (arg1 === "tasks") {
      configuration = {
        inputs: [
          {
            id: "input1",
            type: "promptString",
            description: "Enterinput1",
            default: "default input1"
          },
          {
            id: "input2",
            type: "pickString",
            description: "Enterinput1",
            default: "option2",
            options: ["option1", "option2", "option3"]
          },
          {
            id: "input3",
            type: "promptString",
            description: "Enterinput3",
            default: "default input3",
            password: true
          },
          {
            id: "input4",
            type: "command",
            command: "command1",
            args: {
              value: "arg for command"
            }
          }
        ]
      };
    }
    return configuration;
  }
}
//# sourceMappingURL=configurationResolverService.test.js.map
