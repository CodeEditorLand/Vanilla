import * as assert from "assert";
import * as dom from "../../../../../base/browser/dom.js";
import { HighlightedLabel } from "../../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { DisposableStore } from "../../../../../base/common/lifecycle.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../../../base/test/common/utils.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { TestConfigurationService } from "../../../../../platform/configuration/test/common/testConfigurationService.js";
import { IHoverService } from "../../../../../platform/hover/browser/hover.js";
import { NullHoverService } from "../../../../../platform/hover/test/browser/nullHoverService.js";
import { workbenchInstantiationService } from "../../../../test/browser/workbenchTestServices.js";
import { LinkDetector } from "../../browser/linkDetector.js";
import { VariablesRenderer } from "../../browser/variablesView.js";
import { IDebugService } from "../../common/debug.js";
import {
  Scope,
  StackFrame,
  Thread,
  Variable
} from "../../common/debugModel.js";
import { MockDebugService, MockSession } from "../common/mockDebug.js";
const $ = dom.$;
function assertVariable(disposables, variablesRenderer, displayType) {
  const session = new MockSession();
  const thread = new Thread(session, "mockthread", 1);
  const range = {
    startLineNumber: 1,
    startColumn: 1,
    endLineNumber: void 0,
    endColumn: void 0
  };
  const stackFrame = new StackFrame(
    thread,
    1,
    null,
    "app.js",
    "normal",
    range,
    0,
    true
  );
  const scope = new Scope(stackFrame, 1, "local", 1, false, 10, 10);
  const node = {
    element: new Variable(
      session,
      1,
      scope,
      2,
      "foo",
      "bar.foo",
      void 0,
      0,
      0,
      void 0,
      {},
      "string"
    ),
    depth: 0,
    visibleChildrenCount: 1,
    visibleChildIndex: -1,
    collapsible: false,
    collapsed: false,
    visible: true,
    filterData: void 0,
    children: []
  };
  const expression = $(".");
  const name = $(".");
  const type = $(".");
  const value = $(".");
  const label = disposables.add(new HighlightedLabel(name));
  const lazyButton = $(".");
  const inputBoxContainer = $(".");
  const elementDisposable = disposables.add(new DisposableStore());
  const templateDisposable = disposables.add(new DisposableStore());
  const currentElement = void 0;
  const data = {
    expression,
    name,
    type,
    value,
    label,
    lazyButton,
    inputBoxContainer,
    elementDisposable,
    templateDisposable,
    currentElement
  };
  variablesRenderer.renderElement(node, 0, data);
  assert.strictEqual(value.textContent, "");
  assert.strictEqual(label.element.textContent, "foo");
  node.element.value = "xpto";
  variablesRenderer.renderElement(node, 0, data);
  assert.strictEqual(value.textContent, "xpto");
  assert.strictEqual(type.textContent, displayType ? "string =" : "");
  assert.strictEqual(
    label.element.textContent,
    displayType ? "foo: " : "foo ="
  );
}
suite("Debug - Variable Debug View", () => {
  const disposables = ensureNoDisposablesAreLeakedInTestSuite();
  let variablesRenderer;
  let instantiationService;
  let linkDetector;
  let configurationService;
  setup(() => {
    instantiationService = workbenchInstantiationService(
      void 0,
      disposables
    );
    linkDetector = instantiationService.createInstance(LinkDetector);
    const debugService = new MockDebugService();
    instantiationService.stub(IHoverService, NullHoverService);
    debugService.getViewModel = () => ({
      focusedStackFrame: void 0,
      getSelectedExpression: () => void 0
    });
    debugService.getViewModel().getSelectedExpression = () => void 0;
    instantiationService.stub(IDebugService, debugService);
  });
  test("variable expressions with display type", () => {
    configurationService = new TestConfigurationService({
      debug: {
        showVariableTypes: true
      }
    });
    instantiationService.stub(IConfigurationService, configurationService);
    variablesRenderer = instantiationService.createInstance(
      VariablesRenderer,
      linkDetector
    );
    assertVariable(disposables, variablesRenderer, true);
  });
  test("variable expressions", () => {
    configurationService = new TestConfigurationService({
      debug: {
        showVariableTypes: false
      }
    });
    instantiationService.stub(IConfigurationService, configurationService);
    variablesRenderer = instantiationService.createInstance(
      VariablesRenderer,
      linkDetector
    );
    assertVariable(disposables, variablesRenderer, false);
  });
});
