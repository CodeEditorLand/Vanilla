import assert from "assert";
import { join, normalize } from "../../../../../base/common/path.js";
import * as platform from "../../../../../base/common/platform.js";
import { URI } from "../../../../../base/common/uri.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { TestTextResourcePropertiesService } from "../../../../../editor/test/common/services/testTextResourcePropertiesService.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import {
  ExtensionIdentifier,
  TargetPlatform
} from "../../../../../platform/extensions/common/extensions.js";
import { Debugger } from "../../common/debugger.js";
import { ExecutableDebugAdapter } from "../../node/debugAdapter.js";
suite("Debug - Debugger", () => {
  let _debugger;
  const extensionFolderPath = "/a/b/c/";
  const debuggerContribution = {
    type: "mock",
    label: "Mock Debug",
    program: "./out/mock/mockDebug.js",
    args: ["arg1", "arg2"],
    configurationAttributes: {
      launch: {
        required: ["program"],
        properties: {
          program: {
            type: "string",
            description: "Workspace relative path to a text file.",
            default: "readme.md"
          }
        }
      }
    },
    variables: null,
    initialConfigurations: [
      {
        name: "Mock-Debug",
        type: "mock",
        request: "launch",
        program: "readme.md"
      }
    ]
  };
  const extensionDescriptor0 = {
    id: "adapter",
    identifier: new ExtensionIdentifier("adapter"),
    name: "myAdapter",
    version: "1.0.0",
    publisher: "vscode",
    extensionLocation: URI.file(extensionFolderPath),
    isBuiltin: false,
    isUserBuiltin: false,
    isUnderDevelopment: false,
    engines: null,
    targetPlatform: TargetPlatform.UNDEFINED,
    contributes: {
      debuggers: [debuggerContribution]
    },
    enabledApiProposals: void 0
  };
  const extensionDescriptor1 = {
    id: "extension1",
    identifier: new ExtensionIdentifier("extension1"),
    name: "extension1",
    version: "1.0.0",
    publisher: "vscode",
    extensionLocation: URI.file("/e1/b/c/"),
    isBuiltin: false,
    isUserBuiltin: false,
    isUnderDevelopment: false,
    engines: null,
    targetPlatform: TargetPlatform.UNDEFINED,
    contributes: {
      debuggers: [
        {
          type: "mock",
          runtime: "runtime",
          runtimeArgs: ["rarg"],
          program: "mockprogram",
          args: ["parg"]
        }
      ]
    },
    enabledApiProposals: void 0
  };
  const extensionDescriptor2 = {
    id: "extension2",
    identifier: new ExtensionIdentifier("extension2"),
    name: "extension2",
    version: "1.0.0",
    publisher: "vscode",
    extensionLocation: URI.file("/e2/b/c/"),
    isBuiltin: false,
    isUserBuiltin: false,
    isUnderDevelopment: false,
    engines: null,
    targetPlatform: TargetPlatform.UNDEFINED,
    contributes: {
      debuggers: [
        {
          type: "mock",
          win: {
            runtime: "winRuntime",
            program: "winProgram"
          },
          linux: {
            runtime: "linuxRuntime",
            program: "linuxProgram"
          },
          osx: {
            runtime: "osxRuntime",
            program: "osxProgram"
          }
        }
      ]
    },
    enabledApiProposals: void 0
  };
  const adapterManager = {
    getDebugAdapterDescriptor(session, config) {
      return Promise.resolve(void 0);
    }
  };
  ensureNoDisposablesAreLeakedInTestSuite();
  const configurationService = new TestConfigurationService();
  const testResourcePropertiesService = new TestTextResourcePropertiesService(
    configurationService
  );
  setup(() => {
    _debugger = new Debugger(
      adapterManager,
      debuggerContribution,
      extensionDescriptor0,
      configurationService,
      testResourcePropertiesService,
      void 0,
      void 0,
      void 0,
      void 0
    );
  });
  teardown(() => {
    _debugger = null;
  });
  test("attributes", () => {
    assert.strictEqual(_debugger.type, debuggerContribution.type);
    assert.strictEqual(_debugger.label, debuggerContribution.label);
    const ae = ExecutableDebugAdapter.platformAdapterExecutable(
      [extensionDescriptor0],
      "mock"
    );
    assert.strictEqual(
      ae.command,
      join(extensionFolderPath, debuggerContribution.program)
    );
    assert.deepStrictEqual(ae.args, debuggerContribution.args);
  });
  test("merge platform specific attributes", function() {
    if (!process.versions.electron) {
      this.skip();
    }
    const ae = ExecutableDebugAdapter.platformAdapterExecutable(
      [extensionDescriptor1, extensionDescriptor2],
      "mock"
    );
    assert.strictEqual(
      ae.command,
      platform.isLinux ? "linuxRuntime" : platform.isMacintosh ? "osxRuntime" : "winRuntime"
    );
    const xprogram = platform.isLinux ? "linuxProgram" : platform.isMacintosh ? "osxProgram" : "winProgram";
    assert.deepStrictEqual(ae.args, [
      "rarg",
      normalize("/e2/b/c/") + xprogram,
      "parg"
    ]);
  });
  test("initial config file content", () => {
    const expected = [
      "{",
      "	// Use IntelliSense to learn about possible attributes.",
      "	// Hover to view descriptions of existing attributes.",
      "	// For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387",
      '	"version": "0.2.0",',
      '	"configurations": [',
      "		{",
      '			"name": "Mock-Debug",',
      '			"type": "mock",',
      '			"request": "launch",',
      '			"program": "readme.md"',
      "		}",
      "	]",
      "}"
    ].join(testResourcePropertiesService.getEOL(URI.file("somefile")));
    return _debugger.getInitialConfigurationContent().then(
      (content) => {
        assert.strictEqual(content, expected);
      },
      (err) => assert.fail(err)
    );
  });
});
