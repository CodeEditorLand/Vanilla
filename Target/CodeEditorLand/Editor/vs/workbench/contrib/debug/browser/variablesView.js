var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import { HighlightedLabel, IHighlight } from "../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { IListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { AsyncDataTree, IAsyncDataTreeViewState } from "../../../../base/browser/ui/tree/asyncDataTree.js";
import { ITreeContextMenuEvent, ITreeMouseEvent, ITreeNode, ITreeRenderer } from "../../../../base/browser/ui/tree/tree.js";
import { Action, IAction } from "../../../../base/common/actions.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { FuzzyScore, createMatches } from "../../../../base/common/filters.js";
import { IDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { createAndFillInContextMenuActions } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { IMenuService, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService, IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { WorkbenchAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { ProgressLocation } from "../../../../platform/progress/common/progress.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ViewAction, ViewPane } from "../../../browser/parts/views/viewPane.js";
import { IViewletViewOptions } from "../../../browser/parts/views/viewsViewlet.js";
import { IViewDescriptorService } from "../../../common/views.js";
import { IEditorService, SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IExtensionsWorkbenchService } from "../../extensions/common/extensions.js";
import { CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED, CONTEXT_VARIABLES_FOCUSED, DataBreakpointSetType, DebugVisualizationType, IDataBreakpointInfoResponse, IDebugService, IExpression, IScope, IStackFrame, IViewModel, VARIABLES_VIEW_ID } from "../common/debug.js";
import { getContextForVariable } from "../common/debugContext.js";
import { ErrorScope, Expression, Scope, StackFrame, Variable, VisualizedExpression, getUriForDebugMemory } from "../common/debugModel.js";
import { DebugVisualizer, IDebugVisualizerService } from "../common/debugVisualizers.js";
import { AbstractExpressionDataSource, AbstractExpressionsRenderer, IExpressionTemplateData, IInputBoxOptions, renderViewTree } from "./baseDebugView.js";
import { ADD_TO_WATCH_ID, ADD_TO_WATCH_LABEL, COPY_EVALUATE_PATH_ID, COPY_EVALUATE_PATH_LABEL, COPY_VALUE_ID, COPY_VALUE_LABEL } from "./debugCommands.js";
import { DebugExpressionRenderer } from "./debugExpressionRenderer.js";
const $ = dom.$;
let forgetScopes = true;
let variableInternalContext;
let dataBreakpointInfoResponse;
let VariablesView = class extends ViewPane {
  constructor(options, contextMenuService, debugService, keybindingService, configurationService, instantiationService, viewDescriptorService, contextKeyService, openerService, themeService, telemetryService, hoverService, menuService) {
    super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
    this.debugService = debugService;
    this.menuService = menuService;
    this.updateTreeScheduler = new RunOnceScheduler(async () => {
      const stackFrame = this.debugService.getViewModel().focusedStackFrame;
      this.needsRefresh = false;
      const input = this.tree.getInput();
      if (input) {
        this.savedViewState.set(input.getId(), this.tree.getViewState());
      }
      if (!stackFrame) {
        await this.tree.setInput(null);
        return;
      }
      const viewState = this.savedViewState.get(stackFrame.getId());
      await this.tree.setInput(stackFrame, viewState);
      const scopes = await stackFrame.getScopes();
      const toExpand = scopes.find((s) => !s.expensive);
      if (toExpand && this.tree.hasNode(toExpand)) {
        this.autoExpandedScopes.add(toExpand.getId());
        await this.tree.expand(toExpand);
      }
    }, 400);
  }
  static {
    __name(this, "VariablesView");
  }
  updateTreeScheduler;
  needsRefresh = false;
  tree;
  savedViewState = /* @__PURE__ */ new Map();
  autoExpandedScopes = /* @__PURE__ */ new Set();
  renderBody(container) {
    super.renderBody(container);
    this.element.classList.add("debug-pane");
    container.classList.add("debug-variables");
    const treeContainer = renderViewTree(container);
    const expressionRenderer = this.instantiationService.createInstance(DebugExpressionRenderer);
    this.tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "VariablesView",
      treeContainer,
      new VariablesDelegate(),
      [
        this.instantiationService.createInstance(VariablesRenderer, expressionRenderer),
        this.instantiationService.createInstance(VisualizedVariableRenderer, expressionRenderer),
        new ScopesRenderer(),
        new ScopeErrorRenderer()
      ],
      this.instantiationService.createInstance(VariablesDataSource),
      {
        accessibilityProvider: new VariablesAccessibilityProvider(),
        identityProvider: { getId: /* @__PURE__ */ __name((element) => element.getId(), "getId") },
        keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: /* @__PURE__ */ __name((e) => e.name, "getKeyboardNavigationLabel") },
        overrideStyles: this.getLocationBasedColors().listOverrideStyles
      }
    );
    this._register(VisualizedVariableRenderer.rendererOnVisualizationRange(this.debugService.getViewModel(), this.tree));
    this.tree.setInput(this.debugService.getViewModel().focusedStackFrame ?? null);
    CONTEXT_VARIABLES_FOCUSED.bindTo(this.tree.contextKeyService);
    this._register(this.debugService.getViewModel().onDidFocusStackFrame((sf) => {
      if (!this.isBodyVisible()) {
        this.needsRefresh = true;
        return;
      }
      const timeout = sf.explicit ? 0 : void 0;
      this.updateTreeScheduler.schedule(timeout);
    }));
    this._register(this.debugService.getViewModel().onWillUpdateViews(() => {
      const stackFrame = this.debugService.getViewModel().focusedStackFrame;
      if (stackFrame && forgetScopes) {
        stackFrame.forgetScopes();
      }
      forgetScopes = true;
      this.tree.updateChildren();
    }));
    this._register(this.tree);
    this._register(this.tree.onMouseDblClick((e) => this.onMouseDblClick(e)));
    this._register(this.tree.onContextMenu(async (e) => await this.onContextMenu(e)));
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible && this.needsRefresh) {
        this.updateTreeScheduler.schedule();
      }
    }));
    let horizontalScrolling;
    this._register(this.debugService.getViewModel().onDidSelectExpression((e) => {
      const variable = e?.expression;
      if (variable && this.tree.hasNode(variable)) {
        horizontalScrolling = this.tree.options.horizontalScrolling;
        if (horizontalScrolling) {
          this.tree.updateOptions({ horizontalScrolling: false });
        }
        this.tree.rerender(variable);
      } else if (!e && horizontalScrolling !== void 0) {
        this.tree.updateOptions({ horizontalScrolling });
        horizontalScrolling = void 0;
      }
    }));
    this._register(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
      if (e instanceof Variable && this.tree.hasNode(e)) {
        await this.tree.updateChildren(e, false, true);
        await this.tree.expand(e);
      }
    }));
    this._register(this.debugService.onDidEndSession(() => {
      this.savedViewState.clear();
      this.autoExpandedScopes.clear();
    }));
  }
  layoutBody(width, height) {
    super.layoutBody(height, width);
    this.tree.layout(width, height);
  }
  focus() {
    super.focus();
    this.tree.domFocus();
  }
  collapseAll() {
    this.tree.collapseAll();
  }
  onMouseDblClick(e) {
    if (this.canSetExpressionValue(e.element)) {
      this.debugService.getViewModel().setSelectedExpression(e.element, false);
    }
  }
  canSetExpressionValue(e) {
    const session = this.debugService.getViewModel().focusedSession;
    if (!session) {
      return false;
    }
    if (e instanceof VisualizedExpression) {
      return !!e.treeItem.canEdit;
    }
    return e instanceof Variable && !e.presentationHint?.attributes?.includes("readOnly") && !e.presentationHint?.lazy;
  }
  async onContextMenu(e) {
    const variable = e.element;
    if (!(variable instanceof Variable) || !variable.value) {
      return;
    }
    return openContextMenuForVariableTreeElement(this.contextKeyService, this.menuService, this.contextMenuService, MenuId.DebugVariablesContext, e);
  }
};
VariablesView = __decorateClass([
  __decorateParam(1, IContextMenuService),
  __decorateParam(2, IDebugService),
  __decorateParam(3, IKeybindingService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IViewDescriptorService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IThemeService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IHoverService),
  __decorateParam(12, IMenuService)
], VariablesView);
async function openContextMenuForVariableTreeElement(parentContextKeyService, menuService, contextMenuService, menuId, e) {
  const variable = e.element;
  if (!(variable instanceof Variable) || !variable.value) {
    return;
  }
  const contextKeyService = await getContextForVariableMenuWithDataAccess(parentContextKeyService, variable);
  const context = getVariablesContext(variable);
  const menu = menuService.getMenuActions(menuId, contextKeyService, { arg: context, shouldForwardArgs: false });
  const secondary = [];
  createAndFillInContextMenuActions(menu, { primary: [], secondary }, "inline");
  contextMenuService.showContextMenu({
    getAnchor: /* @__PURE__ */ __name(() => e.anchor, "getAnchor"),
    getActions: /* @__PURE__ */ __name(() => secondary, "getActions")
  });
}
__name(openContextMenuForVariableTreeElement, "openContextMenuForVariableTreeElement");
const getVariablesContext = /* @__PURE__ */ __name((variable) => ({
  sessionId: variable.getSession()?.getId(),
  container: variable.parent instanceof Expression ? { expression: variable.parent.name } : variable.parent.toDebugProtocolObject(),
  variable: variable.toDebugProtocolObject()
}), "getVariablesContext");
async function getContextForVariableMenuWithDataAccess(parentContext, variable) {
  const session = variable.getSession();
  if (!session || !session.capabilities.supportsDataBreakpoints) {
    return getContextForVariableMenuBase(parentContext, variable);
  }
  const contextKeys = [];
  dataBreakpointInfoResponse = await session.dataBreakpointInfo(variable.name, variable.parent.reference);
  const dataBreakpointId = dataBreakpointInfoResponse?.dataId;
  const dataBreakpointAccessTypes = dataBreakpointInfoResponse?.accessTypes;
  if (!dataBreakpointAccessTypes) {
    contextKeys.push([CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED.key, !!dataBreakpointId]);
  } else {
    for (const accessType of dataBreakpointAccessTypes) {
      switch (accessType) {
        case "read":
          contextKeys.push([CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED.key, !!dataBreakpointId]);
          break;
        case "write":
          contextKeys.push([CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED.key, !!dataBreakpointId]);
          break;
        case "readWrite":
          contextKeys.push([CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED.key, !!dataBreakpointId]);
          break;
      }
    }
  }
  return getContextForVariableMenuBase(parentContext, variable, contextKeys);
}
__name(getContextForVariableMenuWithDataAccess, "getContextForVariableMenuWithDataAccess");
function getContextForVariableMenuBase(parentContext, variable, additionalContext = []) {
  variableInternalContext = variable;
  return getContextForVariable(parentContext, variable, additionalContext);
}
__name(getContextForVariableMenuBase, "getContextForVariableMenuBase");
function isStackFrame(obj) {
  return obj instanceof StackFrame;
}
__name(isStackFrame, "isStackFrame");
class VariablesDataSource extends AbstractExpressionDataSource {
  static {
    __name(this, "VariablesDataSource");
  }
  hasChildren(element) {
    if (!element) {
      return false;
    }
    if (isStackFrame(element)) {
      return true;
    }
    return element.hasChildren;
  }
  doGetChildren(element) {
    if (isStackFrame(element)) {
      return element.getScopes();
    }
    return element.getChildren();
  }
}
class VariablesDelegate {
  static {
    __name(this, "VariablesDelegate");
  }
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    if (element instanceof ErrorScope) {
      return ScopeErrorRenderer.ID;
    }
    if (element instanceof Scope) {
      return ScopesRenderer.ID;
    }
    if (element instanceof VisualizedExpression) {
      return VisualizedVariableRenderer.ID;
    }
    return VariablesRenderer.ID;
  }
}
class ScopesRenderer {
  static {
    __name(this, "ScopesRenderer");
  }
  static ID = "scope";
  get templateId() {
    return ScopesRenderer.ID;
  }
  renderTemplate(container) {
    const name = dom.append(container, $(".scope"));
    const label = new HighlightedLabel(name);
    return { name, label };
  }
  renderElement(element, index, templateData) {
    templateData.label.set(element.element.name, createMatches(element.filterData));
  }
  disposeTemplate(templateData) {
    templateData.label.dispose();
  }
}
class ScopeErrorRenderer {
  static {
    __name(this, "ScopeErrorRenderer");
  }
  static ID = "scopeError";
  get templateId() {
    return ScopeErrorRenderer.ID;
  }
  renderTemplate(container) {
    const wrapper = dom.append(container, $(".scope"));
    const error = dom.append(wrapper, $(".error"));
    return { error };
  }
  renderElement(element, index, templateData) {
    templateData.error.innerText = element.element.name;
  }
  disposeTemplate() {
  }
}
let VisualizedVariableRenderer = class extends AbstractExpressionsRenderer {
  constructor(expressionRenderer, debugService, contextViewService, hoverService, menuService, contextKeyService) {
    super(debugService, contextViewService, hoverService);
    this.expressionRenderer = expressionRenderer;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
  }
  static {
    __name(this, "VisualizedVariableRenderer");
  }
  static ID = "viz";
  /**
   * Registers a helper that rerenders the tree when visualization is requested
   * or cancelled./
   */
  static rendererOnVisualizationRange(model, tree) {
    return model.onDidChangeVisualization(({ original }) => {
      if (!tree.hasNode(original)) {
        return;
      }
      const parent = tree.getParentElement(original);
      tree.updateChildren(parent, false, false);
    });
  }
  get templateId() {
    return VisualizedVariableRenderer.ID;
  }
  renderElement(node, index, data) {
    data.elementDisposable.clear();
    super.renderExpressionElement(node.element, node, data);
  }
  renderExpression(expression, data, highlights) {
    const viz = expression;
    let text = viz.name;
    if (viz.value && typeof viz.name === "string") {
      text += ":";
    }
    data.label.set(text, highlights, viz.name);
    data.elementDisposable.add(this.expressionRenderer.renderValue(data.value, viz, {
      showChanged: false,
      maxValueLength: 1024,
      colorize: true,
      session: expression.getSession()
    }));
  }
  getInputBoxOptions(expression) {
    const viz = expression;
    return {
      initialValue: expression.value,
      ariaLabel: localize("variableValueAriaLabel", "Type new variable value"),
      validationOptions: {
        validation: /* @__PURE__ */ __name(() => viz.errorMessage ? { content: viz.errorMessage } : null, "validation")
      },
      onFinish: /* @__PURE__ */ __name((value, success) => {
        viz.errorMessage = void 0;
        if (success) {
          viz.edit(value).then(() => {
            forgetScopes = false;
            this.debugService.getViewModel().updateViews();
          });
        }
      }, "onFinish")
    };
  }
  renderActionBar(actionBar, expression, _data) {
    const viz = expression;
    const contextKeyService = viz.original ? getContextForVariableMenuBase(this.contextKeyService, viz.original) : this.contextKeyService;
    const context = viz.original ? getVariablesContext(viz.original) : void 0;
    const menu = this.menuService.getMenuActions(MenuId.DebugVariablesContext, contextKeyService, { arg: context, shouldForwardArgs: false });
    const primary = [];
    createAndFillInContextMenuActions(menu, { primary, secondary: [] }, "inline");
    if (viz.original) {
      const action = new Action("debugViz", localize("removeVisualizer", "Remove Visualizer"), ThemeIcon.asClassName(Codicon.eye), true, () => this.debugService.getViewModel().setVisualizedExpression(viz.original, void 0));
      action.checked = true;
      primary.push(action);
      actionBar.domNode.style.display = "initial";
    }
    actionBar.clear();
    actionBar.context = context;
    actionBar.push(primary, { icon: true, label: false });
  }
};
VisualizedVariableRenderer = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IHoverService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IContextKeyService)
], VisualizedVariableRenderer);
let VariablesRenderer = class extends AbstractExpressionsRenderer {
  constructor(expressionRenderer, menuService, contextKeyService, visualization, contextMenuService, debugService, contextViewService, hoverService) {
    super(debugService, contextViewService, hoverService);
    this.expressionRenderer = expressionRenderer;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.visualization = visualization;
    this.contextMenuService = contextMenuService;
  }
  static {
    __name(this, "VariablesRenderer");
  }
  static ID = "variable";
  get templateId() {
    return VariablesRenderer.ID;
  }
  renderExpression(expression, data, highlights) {
    data.elementDisposable.add(this.expressionRenderer.renderVariable(data, expression, {
      highlights,
      showChanged: true
    }));
  }
  renderElement(node, index, data) {
    data.elementDisposable.clear();
    super.renderExpressionElement(node.element, node, data);
  }
  getInputBoxOptions(expression) {
    const variable = expression;
    return {
      initialValue: expression.value,
      ariaLabel: localize("variableValueAriaLabel", "Type new variable value"),
      validationOptions: {
        validation: /* @__PURE__ */ __name(() => variable.errorMessage ? { content: variable.errorMessage } : null, "validation")
      },
      onFinish: /* @__PURE__ */ __name((value, success) => {
        variable.errorMessage = void 0;
        const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
        if (success && variable.value !== value && focusedStackFrame) {
          variable.setVariable(value, focusedStackFrame).then(() => {
            forgetScopes = false;
            this.debugService.getViewModel().updateViews();
          });
        }
      }, "onFinish")
    };
  }
  renderActionBar(actionBar, expression, data) {
    const variable = expression;
    const contextKeyService = getContextForVariableMenuBase(this.contextKeyService, variable);
    const primary = [];
    const context = getVariablesContext(variable);
    const menu = this.menuService.getMenuActions(MenuId.DebugVariablesContext, contextKeyService, { arg: context, shouldForwardArgs: false });
    createAndFillInContextMenuActions(menu, { primary, secondary: [] }, "inline");
    actionBar.clear();
    actionBar.context = context;
    actionBar.push(primary, { icon: true, label: false });
    const cts = new CancellationTokenSource();
    data.elementDisposable.add(toDisposable(() => cts.dispose(true)));
    this.visualization.getApplicableFor(expression, cts.token).then((result) => {
      data.elementDisposable.add(result);
      const originalExpression = expression instanceof VisualizedExpression && expression.original || expression;
      const actions = result.object.map((v) => new Action("debugViz", v.name, v.iconClass || "debug-viz-icon", void 0, this.useVisualizer(v, originalExpression, cts.token)));
      if (actions.length === 0) {
      } else if (actions.length === 1) {
        actionBar.push(actions[0], { icon: true, label: false });
      } else {
        actionBar.push(new Action("debugViz", localize("useVisualizer", "Visualize Variable..."), ThemeIcon.asClassName(Codicon.eye), void 0, () => this.pickVisualizer(actions, originalExpression, data)), { icon: true, label: false });
      }
    });
  }
  pickVisualizer(actions, expression, data) {
    this.contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => data.actionBar.getContainer(), "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => actions, "getActions")
    });
  }
  useVisualizer(viz, expression, token) {
    return async () => {
      const resolved = await viz.resolve(token);
      if (token.isCancellationRequested) {
        return;
      }
      if (resolved.type === DebugVisualizationType.Command) {
        viz.execute();
      } else {
        const replacement = await this.visualization.getVisualizedNodeFor(resolved.id, expression);
        if (replacement) {
          this.debugService.getViewModel().setVisualizedExpression(expression, replacement);
        }
      }
    };
  }
};
VariablesRenderer = __decorateClass([
  __decorateParam(1, IMenuService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IDebugVisualizerService),
  __decorateParam(4, IContextMenuService),
  __decorateParam(5, IDebugService),
  __decorateParam(6, IContextViewService),
  __decorateParam(7, IHoverService)
], VariablesRenderer);
class VariablesAccessibilityProvider {
  static {
    __name(this, "VariablesAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("variablesAriaTreeLabel", "Debug Variables");
  }
  getAriaLabel(element) {
    if (element instanceof Scope) {
      return localize("variableScopeAriaLabel", "Scope {0}", element.name);
    }
    if (element instanceof Variable) {
      return localize({ key: "variableAriaLabel", comment: ["Placeholders are variable name and variable value respectivly. They should not be translated."] }, "{0}, value {1}", element.name, element.value);
    }
    return null;
  }
}
const SET_VARIABLE_ID = "debug.setVariable";
CommandsRegistry.registerCommand({
  id: SET_VARIABLE_ID,
  handler: /* @__PURE__ */ __name((accessor) => {
    const debugService = accessor.get(IDebugService);
    debugService.getViewModel().setSelectedExpression(variableInternalContext, false);
  }, "handler")
});
CommandsRegistry.registerCommand({
  metadata: {
    description: COPY_VALUE_LABEL
  },
  id: COPY_VALUE_ID,
  handler: /* @__PURE__ */ __name(async (accessor, arg, ctx) => {
    const debugService = accessor.get(IDebugService);
    const clipboardService = accessor.get(IClipboardService);
    let elementContext = "";
    let elements;
    if (arg instanceof Variable || arg instanceof Expression) {
      elementContext = "watch";
      elements = ctx ? ctx : [];
    } else {
      elementContext = "variables";
      elements = variableInternalContext ? [variableInternalContext] : [];
    }
    const stackFrame = debugService.getViewModel().focusedStackFrame;
    const session = debugService.getViewModel().focusedSession;
    if (!stackFrame || !session || elements.length === 0) {
      return;
    }
    const evalContext = session.capabilities.supportsClipboardContext ? "clipboard" : elementContext;
    const toEvaluate = elements.map((element) => element instanceof Variable ? element.evaluateName || element.value : element.name);
    try {
      const evaluations = await Promise.all(toEvaluate.map((expr) => session.evaluate(expr, stackFrame.frameId, evalContext)));
      const result = coalesce(evaluations).map((evaluation) => evaluation.body.result);
      if (result.length) {
        clipboardService.writeText(result.join("\n"));
      }
    } catch (e) {
      const result = elements.map((element) => element.value);
      clipboardService.writeText(result.join("\n"));
    }
  }, "handler")
});
const VIEW_MEMORY_ID = "workbench.debug.viewlet.action.viewMemory";
const HEX_EDITOR_EXTENSION_ID = "ms-vscode.hexeditor";
const HEX_EDITOR_EDITOR_ID = "hexEditor.hexedit";
CommandsRegistry.registerCommand({
  id: VIEW_MEMORY_ID,
  handler: /* @__PURE__ */ __name(async (accessor, arg, ctx) => {
    const debugService = accessor.get(IDebugService);
    let sessionId;
    let memoryReference;
    if ("sessionId" in arg) {
      if (!arg.sessionId || !arg.variable.memoryReference) {
        return;
      }
      sessionId = arg.sessionId;
      memoryReference = arg.variable.memoryReference;
    } else {
      if (!arg.memoryReference) {
        return;
      }
      const focused = debugService.getViewModel().focusedSession;
      if (!focused) {
        return;
      }
      sessionId = focused.getId();
      memoryReference = arg.memoryReference;
    }
    const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
    const editorService = accessor.get(IEditorService);
    const notificationService = accessor.get(INotificationService);
    const extensionService = accessor.get(IExtensionService);
    const telemetryService = accessor.get(ITelemetryService);
    const ext = await extensionService.getExtension(HEX_EDITOR_EXTENSION_ID);
    if (ext || await tryInstallHexEditor(extensionsWorkbenchService, notificationService)) {
      telemetryService.publicLog("debug/didViewMemory", {
        debugType: debugService.getModel().getSession(sessionId)?.configuration.type
      });
      await editorService.openEditor({
        resource: getUriForDebugMemory(sessionId, memoryReference),
        options: {
          revealIfOpened: true,
          override: HEX_EDITOR_EDITOR_ID
        }
      }, SIDE_GROUP);
    }
  }, "handler")
});
async function tryInstallHexEditor(extensionsWorkbenchService, notificationService) {
  try {
    await extensionsWorkbenchService.install(HEX_EDITOR_EXTENSION_ID, {
      justification: localize("viewMemory.prompt", "Inspecting binary data requires this extension."),
      enable: true
    }, ProgressLocation.Notification);
    return true;
  } catch (error) {
    notificationService.error(error);
    return false;
  }
}
__name(tryInstallHexEditor, "tryInstallHexEditor");
const BREAK_WHEN_VALUE_CHANGES_ID = "debug.breakWhenValueChanges";
CommandsRegistry.registerCommand({
  id: BREAK_WHEN_VALUE_CHANGES_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const debugService = accessor.get(IDebugService);
    if (dataBreakpointInfoResponse) {
      await debugService.addDataBreakpoint({ description: dataBreakpointInfoResponse.description, src: { type: DataBreakpointSetType.Variable, dataId: dataBreakpointInfoResponse.dataId }, canPersist: !!dataBreakpointInfoResponse.canPersist, accessTypes: dataBreakpointInfoResponse.accessTypes, accessType: "write" });
    }
  }, "handler")
});
const BREAK_WHEN_VALUE_IS_ACCESSED_ID = "debug.breakWhenValueIsAccessed";
CommandsRegistry.registerCommand({
  id: BREAK_WHEN_VALUE_IS_ACCESSED_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const debugService = accessor.get(IDebugService);
    if (dataBreakpointInfoResponse) {
      await debugService.addDataBreakpoint({ description: dataBreakpointInfoResponse.description, src: { type: DataBreakpointSetType.Variable, dataId: dataBreakpointInfoResponse.dataId }, canPersist: !!dataBreakpointInfoResponse.canPersist, accessTypes: dataBreakpointInfoResponse.accessTypes, accessType: "readWrite" });
    }
  }, "handler")
});
const BREAK_WHEN_VALUE_IS_READ_ID = "debug.breakWhenValueIsRead";
CommandsRegistry.registerCommand({
  id: BREAK_WHEN_VALUE_IS_READ_ID,
  handler: /* @__PURE__ */ __name(async (accessor) => {
    const debugService = accessor.get(IDebugService);
    if (dataBreakpointInfoResponse) {
      await debugService.addDataBreakpoint({ description: dataBreakpointInfoResponse.description, src: { type: DataBreakpointSetType.Variable, dataId: dataBreakpointInfoResponse.dataId }, canPersist: !!dataBreakpointInfoResponse.canPersist, accessTypes: dataBreakpointInfoResponse.accessTypes, accessType: "read" });
    }
  }, "handler")
});
CommandsRegistry.registerCommand({
  metadata: {
    description: COPY_EVALUATE_PATH_LABEL
  },
  id: COPY_EVALUATE_PATH_ID,
  handler: /* @__PURE__ */ __name(async (accessor, context) => {
    const clipboardService = accessor.get(IClipboardService);
    await clipboardService.writeText(context.variable.evaluateName);
  }, "handler")
});
CommandsRegistry.registerCommand({
  metadata: {
    description: ADD_TO_WATCH_LABEL
  },
  id: ADD_TO_WATCH_ID,
  handler: /* @__PURE__ */ __name(async (accessor, context) => {
    const debugService = accessor.get(IDebugService);
    debugService.addWatchExpression(context.variable.evaluateName);
  }, "handler")
});
registerAction2(class extends ViewAction {
  constructor() {
    super({
      id: "variables.collapse",
      viewId: VARIABLES_VIEW_ID,
      title: localize("collapse", "Collapse All"),
      f1: false,
      icon: Codicon.collapseAll,
      menu: {
        id: MenuId.ViewTitle,
        group: "navigation",
        when: ContextKeyExpr.equals("view", VARIABLES_VIEW_ID)
      }
    });
  }
  runInView(_accessor, view) {
    view.collapseAll();
  }
});
export {
  BREAK_WHEN_VALUE_CHANGES_ID,
  BREAK_WHEN_VALUE_IS_ACCESSED_ID,
  BREAK_WHEN_VALUE_IS_READ_ID,
  SET_VARIABLE_ID,
  VIEW_MEMORY_ID,
  VariablesRenderer,
  VariablesView,
  VisualizedVariableRenderer,
  openContextMenuForVariableTreeElement
};
//# sourceMappingURL=variablesView.js.map
