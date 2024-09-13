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
import { IKeyboardEvent } from "../../../../base/browser/keyboardEvent.js";
import { IMouseEvent } from "../../../../base/browser/mouseEvent.js";
import { IListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { AsyncDataTree } from "../../../../base/browser/ui/tree/asyncDataTree.js";
import { ITreeContextMenuEvent } from "../../../../base/browser/ui/tree/tree.js";
import { coalesce } from "../../../../base/common/arrays.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import * as lifecycle from "../../../../base/common/lifecycle.js";
import { clamp } from "../../../../base/common/numbers.js";
import { isMacintosh } from "../../../../base/common/platform.js";
import { ScrollbarVisibility } from "../../../../base/common/scrollable.js";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "../../../../editor/browser/editorBrowser.js";
import { ConfigurationChangedEvent, EditorOption } from "../../../../editor/common/config/editorOptions.js";
import { IDimension } from "../../../../editor/common/core/dimension.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ModelDecorationOptions } from "../../../../editor/common/model/textModel.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import * as nls from "../../../../nls.js";
import { IMenuService, MenuId } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { WorkbenchAsyncDataTree } from "../../../../platform/list/browser/listService.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { asCssVariable, editorHoverBackground, editorHoverBorder, editorHoverForeground } from "../../../../platform/theme/common/colorRegistry.js";
import { IDebugService, IDebugSession, IExpression, IExpressionContainer, IStackFrame } from "../common/debug.js";
import { Expression, Variable, VisualizedExpression } from "../common/debugModel.js";
import { getEvaluatableExpressionAtPosition } from "../common/debugUtils.js";
import { AbstractExpressionDataSource } from "./baseDebugView.js";
import { DebugExpressionRenderer } from "./debugExpressionRenderer.js";
import { VariablesRenderer, VisualizedVariableRenderer, openContextMenuForVariableTreeElement } from "./variablesView.js";
const $ = dom.$;
var ShowDebugHoverResult = /* @__PURE__ */ ((ShowDebugHoverResult2) => {
  ShowDebugHoverResult2[ShowDebugHoverResult2["NOT_CHANGED"] = 0] = "NOT_CHANGED";
  ShowDebugHoverResult2[ShowDebugHoverResult2["NOT_AVAILABLE"] = 1] = "NOT_AVAILABLE";
  ShowDebugHoverResult2[ShowDebugHoverResult2["CANCELLED"] = 2] = "CANCELLED";
  return ShowDebugHoverResult2;
})(ShowDebugHoverResult || {});
async function doFindExpression(container, namesToFind) {
  if (!container) {
    return null;
  }
  const children = await container.getChildren();
  const filtered = children.filter((v) => namesToFind[0] === v.name);
  if (filtered.length !== 1) {
    return null;
  }
  if (namesToFind.length === 1) {
    return filtered[0];
  } else {
    return doFindExpression(filtered[0], namesToFind.slice(1));
  }
}
__name(doFindExpression, "doFindExpression");
async function findExpressionInStackFrame(stackFrame, namesToFind) {
  const scopes = await stackFrame.getScopes();
  const nonExpensive = scopes.filter((s) => !s.expensive);
  const expressions = coalesce(await Promise.all(nonExpensive.map((scope) => doFindExpression(scope, namesToFind))));
  return expressions.length > 0 && expressions.every((e) => e.value === expressions[0].value) ? expressions[0] : void 0;
}
__name(findExpressionInStackFrame, "findExpressionInStackFrame");
let DebugHoverWidget = class {
  constructor(editor, debugService, instantiationService, menuService, contextKeyService, contextMenuService) {
    this.editor = editor;
    this.debugService = debugService;
    this.instantiationService = instantiationService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.toDispose = [];
    this.showAtPosition = null;
    this.positionPreference = [ContentWidgetPositionPreference.ABOVE, ContentWidgetPositionPreference.BELOW];
    this.debugHoverComputer = this.instantiationService.createInstance(DebugHoverComputer, this.editor);
    this.expressionRenderer = this.instantiationService.createInstance(DebugExpressionRenderer);
  }
  static {
    __name(this, "DebugHoverWidget");
  }
  static ID = "debug.hoverWidget";
  // editor.IContentWidget.allowEditorOverflow
  allowEditorOverflow = true;
  // todo@connor4312: move more properties that are only valid while a hover
  // is happening into `_isVisible`
  _isVisible;
  safeTriangle;
  showCancellationSource;
  domNode;
  tree;
  showAtPosition;
  positionPreference;
  highlightDecorations = this.editor.createDecorationsCollection();
  complexValueContainer;
  complexValueTitle;
  valueContainer;
  treeContainer;
  toDispose;
  scrollbar;
  debugHoverComputer;
  expressionRenderer;
  expressionToRender;
  isUpdatingTree = false;
  get isShowingComplexValue() {
    return this.complexValueContainer?.hidden === false;
  }
  create() {
    this.domNode = $(".debug-hover-widget");
    this.complexValueContainer = dom.append(this.domNode, $(".complex-value"));
    this.complexValueTitle = dom.append(this.complexValueContainer, $(".title"));
    this.treeContainer = dom.append(this.complexValueContainer, $(".debug-hover-tree"));
    this.treeContainer.setAttribute("role", "tree");
    const tip = dom.append(this.complexValueContainer, $(".tip"));
    tip.textContent = nls.localize({ key: "quickTip", comment: ['"switch to editor language hover" means to show the programming language hover widget instead of the debug hover'] }, "Hold {0} key to switch to editor language hover", isMacintosh ? "Option" : "Alt");
    const dataSource = this.instantiationService.createInstance(DebugHoverDataSource);
    this.tree = this.instantiationService.createInstance(
      WorkbenchAsyncDataTree,
      "DebugHover",
      this.treeContainer,
      new DebugHoverDelegate(),
      [
        this.instantiationService.createInstance(VariablesRenderer, this.expressionRenderer),
        this.instantiationService.createInstance(VisualizedVariableRenderer, this.expressionRenderer)
      ],
      dataSource,
      {
        accessibilityProvider: new DebugHoverAccessibilityProvider(),
        mouseSupport: false,
        horizontalScrolling: true,
        useShadows: false,
        keyboardNavigationLabelProvider: { getKeyboardNavigationLabel: /* @__PURE__ */ __name((e) => e.name, "getKeyboardNavigationLabel") },
        overrideStyles: {
          listBackground: editorHoverBackground
        }
      }
    );
    this.toDispose.push(VisualizedVariableRenderer.rendererOnVisualizationRange(this.debugService.getViewModel(), this.tree));
    this.valueContainer = $(".value");
    this.valueContainer.tabIndex = 0;
    this.valueContainer.setAttribute("role", "tooltip");
    this.scrollbar = new DomScrollableElement(this.valueContainer, { horizontal: ScrollbarVisibility.Hidden });
    this.domNode.appendChild(this.scrollbar.getDomNode());
    this.toDispose.push(this.scrollbar);
    this.editor.applyFontInfo(this.domNode);
    this.domNode.style.backgroundColor = asCssVariable(editorHoverBackground);
    this.domNode.style.border = `1px solid ${asCssVariable(editorHoverBorder)}`;
    this.domNode.style.color = asCssVariable(editorHoverForeground);
    this.toDispose.push(this.tree.onContextMenu(async (e) => await this.onContextMenu(e)));
    this.toDispose.push(this.tree.onDidChangeContentHeight(() => {
      if (!this.isUpdatingTree) {
        this.layoutTreeAndContainer();
      }
    }));
    this.toDispose.push(this.tree.onDidChangeContentWidth(() => {
      if (!this.isUpdatingTree) {
        this.layoutTreeAndContainer();
      }
    }));
    this.registerListeners();
    this.editor.addContentWidget(this);
  }
  async onContextMenu(e) {
    const variable = e.element;
    if (!(variable instanceof Variable) || !variable.value) {
      return;
    }
    return openContextMenuForVariableTreeElement(this.contextKeyService, this.menuService, this.contextMenuService, MenuId.DebugHoverContext, e);
  }
  registerListeners() {
    this.toDispose.push(dom.addStandardDisposableListener(this.domNode, "keydown", (e) => {
      if (e.equals(KeyCode.Escape)) {
        this.hide();
      }
    }));
    this.toDispose.push(this.editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.fontInfo)) {
        this.editor.applyFontInfo(this.domNode);
      }
    }));
    this.toDispose.push(this.debugService.getViewModel().onDidEvaluateLazyExpression(async (e) => {
      if (e instanceof Variable && this.tree.hasNode(e)) {
        await this.tree.updateChildren(e, false, true);
        await this.tree.expand(e);
      }
    }));
  }
  isHovered() {
    return !!this.domNode?.matches(":hover");
  }
  isVisible() {
    return !!this._isVisible;
  }
  willBeVisible() {
    return !!this.showCancellationSource;
  }
  getId() {
    return DebugHoverWidget.ID;
  }
  getDomNode() {
    return this.domNode;
  }
  /**
   * Gets whether the given coordinates are in the safe triangle formed from
   * the position at which the hover was initiated.
   */
  isInSafeTriangle(x, y) {
    return this._isVisible && !!this.safeTriangle?.contains(x, y);
  }
  async showAt(position, focus, mouseEvent) {
    this.showCancellationSource?.dispose(true);
    const cancellationSource = this.showCancellationSource = new CancellationTokenSource();
    const session = this.debugService.getViewModel().focusedSession;
    if (!session || !this.editor.hasModel()) {
      this.hide();
      return 1 /* NOT_AVAILABLE */;
    }
    const result = await this.debugHoverComputer.compute(position, cancellationSource.token);
    if (cancellationSource.token.isCancellationRequested) {
      this.hide();
      return 2 /* CANCELLED */;
    }
    if (!result.range) {
      this.hide();
      return 1 /* NOT_AVAILABLE */;
    }
    if (this.isVisible() && !result.rangeChanged) {
      return 0 /* NOT_CHANGED */;
    }
    const expression = await this.debugHoverComputer.evaluate(session);
    if (cancellationSource.token.isCancellationRequested) {
      this.hide();
      return 2 /* CANCELLED */;
    }
    if (!expression || expression instanceof Expression && !expression.available) {
      this.hide();
      return 1 /* NOT_AVAILABLE */;
    }
    this.highlightDecorations.set([{
      range: result.range,
      options: DebugHoverWidget._HOVER_HIGHLIGHT_DECORATION_OPTIONS
    }]);
    return this.doShow(session, result.range.getStartPosition(), expression, focus, mouseEvent);
  }
  static _HOVER_HIGHLIGHT_DECORATION_OPTIONS = ModelDecorationOptions.register({
    description: "bdebug-hover-highlight",
    className: "hoverHighlight"
  });
  async doShow(session, position, expression, focus, mouseEvent) {
    if (!this.domNode) {
      this.create();
    }
    this.showAtPosition = position;
    const store = new lifecycle.DisposableStore();
    this._isVisible = { store };
    if (!expression.hasChildren) {
      this.complexValueContainer.hidden = true;
      this.valueContainer.hidden = false;
      store.add(this.expressionRenderer.renderValue(this.valueContainer, expression, {
        showChanged: false,
        colorize: true,
        hover: false,
        session
      }));
      this.valueContainer.title = "";
      this.editor.layoutContentWidget(this);
      this.scrollbar.scanDomNode();
      if (focus) {
        this.editor.render();
        this.valueContainer.focus();
      }
      return void 0;
    }
    this.valueContainer.hidden = true;
    this.expressionToRender = expression;
    this.complexValueTitle.textContent = expression.value;
    this.complexValueTitle.title = expression.value;
    this.editor.layoutContentWidget(this);
    this.tree.scrollTop = 0;
    this.tree.scrollLeft = 0;
    this.complexValueContainer.hidden = false;
    this.safeTriangle = mouseEvent && new dom.SafeTriangle(mouseEvent.posx, mouseEvent.posy, this.domNode);
    if (focus) {
      this.editor.render();
      this.tree.domFocus();
    }
  }
  layoutTreeAndContainer() {
    this.layoutTree();
    this.editor.layoutContentWidget(this);
  }
  layoutTree() {
    const scrollBarHeight = 10;
    let maxHeightToAvoidCursorOverlay = Infinity;
    if (this.showAtPosition) {
      const editorTop = this.editor.getDomNode()?.offsetTop || 0;
      const containerTop = this.treeContainer.offsetTop + editorTop;
      const hoveredCharTop = this.editor.getTopForLineNumber(this.showAtPosition.lineNumber, true) - this.editor.getScrollTop();
      if (containerTop < hoveredCharTop) {
        maxHeightToAvoidCursorOverlay = hoveredCharTop + editorTop - 22;
      }
    }
    const treeHeight = Math.min(Math.max(266, this.editor.getLayoutInfo().height * 0.55), this.tree.contentHeight + scrollBarHeight, maxHeightToAvoidCursorOverlay);
    const realTreeWidth = this.tree.contentWidth;
    const treeWidth = clamp(realTreeWidth, 400, 550);
    this.tree.layout(treeHeight, treeWidth);
    this.treeContainer.style.height = `${treeHeight}px`;
    this.scrollbar.scanDomNode();
  }
  beforeRender() {
    if (this.expressionToRender) {
      const expression = this.expressionToRender;
      this.expressionToRender = void 0;
      this.isUpdatingTree = true;
      this.tree.setInput(expression).finally(() => {
        this.isUpdatingTree = false;
      });
    }
    return null;
  }
  afterRender(positionPreference) {
    if (positionPreference) {
      this.positionPreference = [positionPreference];
    }
  }
  hide() {
    if (this.showCancellationSource) {
      this.showCancellationSource.dispose(true);
      this.showCancellationSource = void 0;
    }
    if (!this._isVisible) {
      return;
    }
    if (dom.isAncestorOfActiveElement(this.domNode)) {
      this.editor.focus();
    }
    this._isVisible.store.dispose();
    this._isVisible = void 0;
    this.highlightDecorations.clear();
    this.editor.layoutContentWidget(this);
    this.positionPreference = [ContentWidgetPositionPreference.ABOVE, ContentWidgetPositionPreference.BELOW];
  }
  getPosition() {
    return this._isVisible ? {
      position: this.showAtPosition,
      preference: this.positionPreference
    } : null;
  }
  dispose() {
    this.toDispose = lifecycle.dispose(this.toDispose);
  }
};
DebugHoverWidget = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IMenuService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IContextMenuService)
], DebugHoverWidget);
class DebugHoverAccessibilityProvider {
  static {
    __name(this, "DebugHoverAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return nls.localize("treeAriaLabel", "Debug Hover");
  }
  getAriaLabel(element) {
    return nls.localize({ key: "variableAriaLabel", comment: ["Do not translate placeholders. Placeholders are name and value of a variable."] }, "{0}, value {1}, variables, debug", element.name, element.value);
  }
}
class DebugHoverDataSource extends AbstractExpressionDataSource {
  static {
    __name(this, "DebugHoverDataSource");
  }
  hasChildren(element) {
    return element.hasChildren;
  }
  doGetChildren(element) {
    return element.getChildren();
  }
}
class DebugHoverDelegate {
  static {
    __name(this, "DebugHoverDelegate");
  }
  getHeight(element) {
    return 18;
  }
  getTemplateId(element) {
    if (element instanceof VisualizedExpression) {
      return VisualizedVariableRenderer.ID;
    }
    return VariablesRenderer.ID;
  }
}
let DebugHoverComputer = class {
  constructor(editor, debugService, languageFeaturesService, logService) {
    this.editor = editor;
    this.debugService = debugService;
    this.languageFeaturesService = languageFeaturesService;
    this.logService = logService;
  }
  static {
    __name(this, "DebugHoverComputer");
  }
  _current;
  async compute(position, token) {
    const session = this.debugService.getViewModel().focusedSession;
    if (!session || !this.editor.hasModel()) {
      return { rangeChanged: false };
    }
    const model = this.editor.getModel();
    const result = await getEvaluatableExpressionAtPosition(this.languageFeaturesService, model, position, token);
    if (!result) {
      return { rangeChanged: false };
    }
    const { range, matchingExpression } = result;
    const rangeChanged = !this._current?.range.equalsRange(range);
    this._current = { expression: matchingExpression, range: Range.lift(range) };
    return { rangeChanged, range: this._current.range };
  }
  async evaluate(session) {
    if (!this._current) {
      this.logService.error("No expression to evaluate");
      return;
    }
    const textModel = this.editor.getModel();
    const debugSource = textModel && session.getSourceForUri(textModel?.uri);
    if (session.capabilities.supportsEvaluateForHovers) {
      const expression = new Expression(this._current.expression);
      await expression.evaluate(session, this.debugService.getViewModel().focusedStackFrame, "hover", void 0, debugSource ? {
        line: this._current.range.startLineNumber,
        column: this._current.range.startColumn,
        source: debugSource.raw
      } : void 0);
      return expression;
    } else {
      const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
      if (focusedStackFrame) {
        return await findExpressionInStackFrame(
          focusedStackFrame,
          coalesce(this._current.expression.split(".").map((word) => word.trim()))
        );
      }
    }
    return void 0;
  }
};
DebugHoverComputer = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, ILogService)
], DebugHoverComputer);
export {
  DebugHoverWidget,
  ShowDebugHoverResult,
  findExpressionInStackFrame
};
//# sourceMappingURL=debugHover.js.map
