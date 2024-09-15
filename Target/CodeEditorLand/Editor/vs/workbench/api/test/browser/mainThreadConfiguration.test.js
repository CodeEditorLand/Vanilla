var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import * as sinon from "sinon";
import { URI } from "../../../../base/common/uri.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { Extensions, IConfigurationRegistry, ConfigurationScope } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IWorkspaceContextService, WorkbenchState } from "../../../../platform/workspace/common/workspace.js";
import { TestInstantiationService } from "../../../../platform/instantiation/test/common/instantiationServiceMock.js";
import { MainThreadConfiguration } from "../../browser/mainThreadConfiguration.js";
import { SingleProxyRPCProtocol } from "../common/testRPCProtocol.js";
import { IConfigurationService, ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { WorkspaceService } from "../../../services/configuration/browser/configurationService.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
suite("MainThreadConfiguration", function() {
  const proxy = {
    $initializeConfiguration: /* @__PURE__ */ __name(() => {
    }, "$initializeConfiguration")
  };
  let instantiationService;
  let target;
  suiteSetup(() => {
    Registry.as(Extensions.Configuration).registerConfiguration({
      "id": "extHostConfiguration",
      "title": "a",
      "type": "object",
      "properties": {
        "extHostConfiguration.resource": {
          "description": "extHostConfiguration.resource",
          "type": "boolean",
          "default": true,
          "scope": ConfigurationScope.RESOURCE
        },
        "extHostConfiguration.window": {
          "description": "extHostConfiguration.resource",
          "type": "boolean",
          "default": true,
          "scope": ConfigurationScope.WINDOW
        }
      }
    });
  });
  setup(() => {
    target = sinon.spy();
    instantiationService = new TestInstantiationService();
    instantiationService.stub(IConfigurationService, WorkspaceService);
    instantiationService.stub(IConfigurationService, "onDidUpdateConfiguration", sinon.mock());
    instantiationService.stub(IConfigurationService, "onDidChangeConfiguration", sinon.mock());
    instantiationService.stub(IConfigurationService, "updateValue", target);
    instantiationService.stub(IEnvironmentService, {
      isBuilt: false
    });
  });
  teardown(() => {
    instantiationService.dispose();
  });
  test("update resource configuration without configuration target defaults to workspace in multi root workspace when no resource is provided", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.WORKSPACE, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(null, "extHostConfiguration.resource", "value", void 0, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("update resource configuration without configuration target defaults to workspace in folder workspace when resource is provider", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(null, "extHostConfiguration.resource", "value", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("update resource configuration without configuration target defaults to workspace in folder workspace when no resource is provider", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(null, "extHostConfiguration.resource", "value", void 0, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("update window configuration without configuration target defaults to workspace in multi root workspace when no resource is provided", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.WORKSPACE, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(null, "extHostConfiguration.window", "value", void 0, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("update window configuration without configuration target defaults to workspace in multi root workspace when resource is provided", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.WORKSPACE, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(null, "extHostConfiguration.window", "value", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("update window configuration without configuration target defaults to workspace in folder workspace when resource is provider", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(null, "extHostConfiguration.window", "value", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("update window configuration without configuration target defaults to workspace in folder workspace when no resource is provider", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(null, "extHostConfiguration.window", "value", void 0, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("update resource configuration without configuration target defaults to folder", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.WORKSPACE, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(null, "extHostConfiguration.resource", "value", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE_FOLDER, target.args[0][3]);
  });
  test("update configuration with user configuration target", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(ConfigurationTarget.USER, "extHostConfiguration.window", "value", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.USER, target.args[0][3]);
  });
  test("update configuration with workspace configuration target", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(ConfigurationTarget.WORKSPACE, "extHostConfiguration.window", "value", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("update configuration with folder configuration target", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$updateConfigurationOption(ConfigurationTarget.WORKSPACE_FOLDER, "extHostConfiguration.window", "value", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE_FOLDER, target.args[0][3]);
  });
  test("remove resource configuration without configuration target defaults to workspace in multi root workspace when no resource is provided", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.WORKSPACE, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$removeConfigurationOption(null, "extHostConfiguration.resource", void 0, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("remove resource configuration without configuration target defaults to workspace in folder workspace when resource is provider", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$removeConfigurationOption(null, "extHostConfiguration.resource", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("remove resource configuration without configuration target defaults to workspace in folder workspace when no resource is provider", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$removeConfigurationOption(null, "extHostConfiguration.resource", void 0, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("remove window configuration without configuration target defaults to workspace in multi root workspace when no resource is provided", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.WORKSPACE, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$removeConfigurationOption(null, "extHostConfiguration.window", void 0, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("remove window configuration without configuration target defaults to workspace in multi root workspace when resource is provided", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.WORKSPACE, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$removeConfigurationOption(null, "extHostConfiguration.window", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("remove window configuration without configuration target defaults to workspace in folder workspace when resource is provider", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$removeConfigurationOption(null, "extHostConfiguration.window", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("remove window configuration without configuration target defaults to workspace in folder workspace when no resource is provider", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.FOLDER, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$removeConfigurationOption(null, "extHostConfiguration.window", void 0, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE, target.args[0][3]);
  });
  test("remove configuration without configuration target defaults to folder", function() {
    instantiationService.stub(IWorkspaceContextService, { getWorkbenchState: /* @__PURE__ */ __name(() => WorkbenchState.WORKSPACE, "getWorkbenchState") });
    const testObject = instantiationService.createInstance(MainThreadConfiguration, SingleProxyRPCProtocol(proxy));
    testObject.$removeConfigurationOption(null, "extHostConfiguration.resource", { resource: URI.file("abc") }, void 0);
    assert.strictEqual(ConfigurationTarget.WORKSPACE_FOLDER, target.args[0][3]);
  });
});
//# sourceMappingURL=mainThreadConfiguration.test.js.map
