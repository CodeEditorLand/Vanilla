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
import { CountBadge } from "../../../../base/browser/ui/countBadge/countBadge.js";
import { HighlightedLabel, IHighlight } from "../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { IManagedHover } from "../../../../base/browser/ui/hover/hover.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import { CachedListVirtualDelegate } from "../../../../base/browser/ui/list/list.js";
import { IListAccessibilityProvider } from "../../../../base/browser/ui/list/listWidget.js";
import { IAsyncDataSource, ITreeNode, ITreeRenderer } from "../../../../base/browser/ui/tree/tree.js";
import { createMatches, FuzzyScore } from "../../../../base/common/filters.js";
import { Disposable, DisposableStore, IDisposable } from "../../../../base/common/lifecycle.js";
import { basename } from "../../../../base/common/path.js";
import severity from "../../../../base/common/severity.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { defaultCountBadgeStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IDebugConfiguration, IDebugService, IDebugSession, IExpression, IExpressionContainer, INestingReplElement, IReplElement, IReplElementSource, IReplOptions } from "../common/debug.js";
import { Variable } from "../common/debugModel.js";
import { RawObjectReplElement, ReplEvaluationInput, ReplEvaluationResult, ReplGroup, ReplOutputElement, ReplVariableElement } from "../common/replModel.js";
import { AbstractExpressionsRenderer, IExpressionTemplateData, IInputBoxOptions } from "./baseDebugView.js";
import { DebugExpressionRenderer } from "./debugExpressionRenderer.js";
import { debugConsoleEvaluationInput } from "./debugIcons.js";
const $ = dom.$;
class ReplEvaluationInputsRenderer {
  static {
    __name(this, "ReplEvaluationInputsRenderer");
  }
  static ID = "replEvaluationInput";
  get templateId() {
    return ReplEvaluationInputsRenderer.ID;
  }
  renderTemplate(container) {
    dom.append(container, $("span.arrow" + ThemeIcon.asCSSSelector(debugConsoleEvaluationInput)));
    const input = dom.append(container, $(".expression"));
    const label = new HighlightedLabel(input);
    return { label };
  }
  renderElement(element, index, templateData) {
    const evaluation = element.element;
    templateData.label.set(evaluation.value, createMatches(element.filterData));
  }
  disposeTemplate(templateData) {
    templateData.label.dispose();
  }
}
let ReplGroupRenderer = class {
  constructor(expressionRenderer, instaService) {
    this.expressionRenderer = expressionRenderer;
    this.instaService = instaService;
  }
  static {
    __name(this, "ReplGroupRenderer");
  }
  static ID = "replGroup";
  get templateId() {
    return ReplGroupRenderer.ID;
  }
  renderTemplate(container) {
    container.classList.add("group");
    const expression = dom.append(container, $(".output.expression.value-and-source"));
    const label = dom.append(expression, $("span.label"));
    const source = this.instaService.createInstance(SourceWidget, expression);
    return { label, source };
  }
  renderElement(element, _index, templateData) {
    templateData.elementDisposable?.dispose();
    const replGroup = element.element;
    dom.clearNode(templateData.label);
    templateData.elementDisposable = this.expressionRenderer.renderValue(templateData.label, replGroup.name, { wasANSI: true, session: element.element.session });
    templateData.source.setSource(replGroup.sourceData);
  }
  disposeTemplate(templateData) {
    templateData.elementDisposable?.dispose();
    templateData.source.dispose();
  }
};
ReplGroupRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ReplGroupRenderer);
class ReplEvaluationResultsRenderer {
  constructor(expressionRenderer) {
    this.expressionRenderer = expressionRenderer;
  }
  static {
    __name(this, "ReplEvaluationResultsRenderer");
  }
  static ID = "replEvaluationResult";
  get templateId() {
    return ReplEvaluationResultsRenderer.ID;
  }
  renderTemplate(container) {
    const output = dom.append(container, $(".evaluation-result.expression"));
    const value = dom.append(output, $("span.value"));
    return { value, elementStore: new DisposableStore() };
  }
  renderElement(element, index, templateData) {
    templateData.elementStore.clear();
    const expression = element.element;
    templateData.elementStore.add(this.expressionRenderer.renderValue(templateData.value, expression, {
      colorize: true,
      hover: false,
      session: element.element.getSession()
    }));
  }
  disposeTemplate(templateData) {
    templateData.elementStore.dispose();
  }
}
let ReplOutputElementRenderer = class {
  constructor(expressionRenderer, instaService) {
    this.expressionRenderer = expressionRenderer;
    this.instaService = instaService;
  }
  static {
    __name(this, "ReplOutputElementRenderer");
  }
  static ID = "outputReplElement";
  get templateId() {
    return ReplOutputElementRenderer.ID;
  }
  renderTemplate(container) {
    const data = /* @__PURE__ */ Object.create(null);
    container.classList.add("output");
    const expression = dom.append(container, $(".output.expression.value-and-source"));
    data.container = container;
    data.countContainer = dom.append(expression, $(".count-badge-wrapper"));
    data.count = new CountBadge(data.countContainer, {}, defaultCountBadgeStyles);
    data.value = dom.append(expression, $("span.value.label"));
    data.source = this.instaService.createInstance(SourceWidget, expression);
    data.elementDisposable = new DisposableStore();
    return data;
  }
  renderElement({ element }, index, templateData) {
    templateData.elementDisposable.clear();
    this.setElementCount(element, templateData);
    templateData.elementDisposable.add(element.onDidChangeCount(() => this.setElementCount(element, templateData)));
    dom.clearNode(templateData.value);
    templateData.value.className = "value";
    const locationReference = element.expression?.valueLocationReference;
    templateData.elementDisposable.add(this.expressionRenderer.renderValue(templateData.value, element.value, { wasANSI: true, session: element.session, locationReference }));
    templateData.value.classList.add(element.severity === severity.Warning ? "warn" : element.severity === severity.Error ? "error" : element.severity === severity.Ignore ? "ignore" : "info");
    templateData.source.setSource(element.sourceData);
    templateData.getReplElementSource = () => element.sourceData;
  }
  setElementCount(element, templateData) {
    if (element.count >= 2) {
      templateData.count.setCount(element.count);
      templateData.countContainer.hidden = false;
    } else {
      templateData.countContainer.hidden = true;
    }
  }
  disposeTemplate(templateData) {
    templateData.source.dispose();
    templateData.elementDisposable.dispose();
  }
  disposeElement(_element, _index, templateData) {
    templateData.elementDisposable.clear();
  }
};
ReplOutputElementRenderer = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ReplOutputElementRenderer);
let ReplVariablesRenderer = class extends AbstractExpressionsRenderer {
  constructor(expressionRenderer, debugService, contextViewService, hoverService) {
    super(debugService, contextViewService, hoverService);
    this.expressionRenderer = expressionRenderer;
  }
  static {
    __name(this, "ReplVariablesRenderer");
  }
  static ID = "replVariable";
  get templateId() {
    return ReplVariablesRenderer.ID;
  }
  renderElement(node, _index, data) {
    const element = node.element;
    data.elementDisposable.clear();
    super.renderExpressionElement(element instanceof ReplVariableElement ? element.expression : element, node, data);
  }
  renderExpression(expression, data, highlights) {
    const isReplVariable = expression instanceof ReplVariableElement;
    if (isReplVariable || !expression.name) {
      data.label.set("");
      const value = isReplVariable ? expression.expression : expression;
      data.elementDisposable.add(this.expressionRenderer.renderValue(data.value, value, { colorize: true, hover: false, session: expression.getSession() }));
      data.expression.classList.remove("nested-variable");
    } else {
      data.elementDisposable.add(this.expressionRenderer.renderVariable(data, expression, { showChanged: true, highlights }));
      data.expression.classList.toggle("nested-variable", isNestedVariable(expression));
    }
  }
  getInputBoxOptions(expression) {
    return void 0;
  }
};
ReplVariablesRenderer = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IContextViewService),
  __decorateParam(3, IHoverService)
], ReplVariablesRenderer);
class ReplRawObjectsRenderer {
  constructor(expressionRenderer) {
    this.expressionRenderer = expressionRenderer;
  }
  static {
    __name(this, "ReplRawObjectsRenderer");
  }
  static ID = "rawObject";
  get templateId() {
    return ReplRawObjectsRenderer.ID;
  }
  renderTemplate(container) {
    container.classList.add("output");
    const expression = dom.append(container, $(".output.expression"));
    const name = dom.append(expression, $("span.name"));
    const label = new HighlightedLabel(name);
    const value = dom.append(expression, $("span.value"));
    return { container, expression, name, label, value, elementStore: new DisposableStore() };
  }
  renderElement(node, index, templateData) {
    templateData.elementStore.clear();
    const element = node.element;
    templateData.label.set(element.name ? `${element.name}:` : "", createMatches(node.filterData));
    if (element.name) {
      templateData.name.textContent = `${element.name}:`;
    } else {
      templateData.name.textContent = "";
    }
    templateData.elementStore.add(this.expressionRenderer.renderValue(templateData.value, element.value, {
      hover: false,
      session: node.element.getSession()
    }));
  }
  disposeTemplate(templateData) {
    templateData.elementStore.dispose();
    templateData.label.dispose();
  }
}
function isNestedVariable(element) {
  return element instanceof Variable && (element.parent instanceof ReplEvaluationResult || element.parent instanceof Variable);
}
__name(isNestedVariable, "isNestedVariable");
class ReplDelegate extends CachedListVirtualDelegate {
  constructor(configurationService, replOptions) {
    super();
    this.configurationService = configurationService;
    this.replOptions = replOptions;
  }
  static {
    __name(this, "ReplDelegate");
  }
  getHeight(element) {
    const config = this.configurationService.getValue("debug");
    if (!config.console.wordWrap) {
      return this.estimateHeight(element, true);
    }
    return super.getHeight(element);
  }
  /**
   * With wordWrap enabled, this is an estimate. With wordWrap disabled, this is the real height that the list will use.
   */
  estimateHeight(element, ignoreValueLength = false) {
    const lineHeight = this.replOptions.replConfiguration.lineHeight;
    const countNumberOfLines = /* @__PURE__ */ __name((str) => str.match(/\n/g)?.length ?? 0, "countNumberOfLines");
    const hasValue = /* @__PURE__ */ __name((e) => typeof e.value === "string", "hasValue");
    if (hasValue(element) && !isNestedVariable(element)) {
      const value = element.value;
      const valueRows = countNumberOfLines(value) + (ignoreValueLength ? 0 : Math.floor(value.length / 70)) + (element instanceof ReplOutputElement ? 0 : 1);
      return Math.max(valueRows, 1) * lineHeight;
    }
    return lineHeight;
  }
  getTemplateId(element) {
    if (element instanceof Variable || element instanceof ReplVariableElement) {
      return ReplVariablesRenderer.ID;
    }
    if (element instanceof ReplEvaluationResult) {
      return ReplEvaluationResultsRenderer.ID;
    }
    if (element instanceof ReplEvaluationInput) {
      return ReplEvaluationInputsRenderer.ID;
    }
    if (element instanceof ReplOutputElement) {
      return ReplOutputElementRenderer.ID;
    }
    if (element instanceof ReplGroup) {
      return ReplGroupRenderer.ID;
    }
    return ReplRawObjectsRenderer.ID;
  }
  hasDynamicHeight(element) {
    if (isNestedVariable(element)) {
      return false;
    }
    return element.toString().length > 0;
  }
}
function isDebugSession(obj) {
  return typeof obj.getReplElements === "function";
}
__name(isDebugSession, "isDebugSession");
class ReplDataSource {
  static {
    __name(this, "ReplDataSource");
  }
  hasChildren(element) {
    if (isDebugSession(element)) {
      return true;
    }
    return !!element.hasChildren;
  }
  getChildren(element) {
    if (isDebugSession(element)) {
      return Promise.resolve(element.getReplElements());
    }
    return Promise.resolve(element.getChildren());
  }
}
class ReplAccessibilityProvider {
  static {
    __name(this, "ReplAccessibilityProvider");
  }
  getWidgetAriaLabel() {
    return localize("debugConsole", "Debug Console");
  }
  getAriaLabel(element) {
    if (element instanceof Variable) {
      return localize("replVariableAriaLabel", "Variable {0}, value {1}", element.name, element.value);
    }
    if (element instanceof ReplOutputElement || element instanceof ReplEvaluationInput || element instanceof ReplEvaluationResult) {
      return element.value + (element instanceof ReplOutputElement && element.count > 1 ? localize(
        { key: "occurred", comment: ["Front will the value of the debug console element. Placeholder will be replaced by a number which represents occurrance count."] },
        ", occurred {0} times",
        element.count
      ) : "");
    }
    if (element instanceof RawObjectReplElement) {
      return localize("replRawObjectAriaLabel", "Debug console variable {0}, value {1}", element.name, element.value);
    }
    if (element instanceof ReplGroup) {
      return localize("replGroup", "Debug console group {0}", element.name);
    }
    return "";
  }
}
let SourceWidget = class extends Disposable {
  constructor(container, editorService, hoverService, labelService) {
    super();
    this.hoverService = hoverService;
    this.labelService = labelService;
    this.el = dom.append(container, $(".source"));
    this._register(dom.addDisposableListener(this.el, "click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.source) {
        this.source.source.openInEditor(editorService, {
          startLineNumber: this.source.lineNumber,
          startColumn: this.source.column,
          endLineNumber: this.source.lineNumber,
          endColumn: this.source.column
        });
      }
    }));
  }
  static {
    __name(this, "SourceWidget");
  }
  el;
  source;
  hover;
  setSource(source) {
    this.source = source;
    this.el.textContent = source ? `${basename(source.source.name)}:${source.lineNumber}` : "";
    this.hover ??= this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this.el, ""));
    this.hover.update(source ? `${this.labelService.getUriLabel(source.source.uri)}:${source.lineNumber}` : "");
  }
};
SourceWidget = __decorateClass([
  __decorateParam(1, IEditorService),
  __decorateParam(2, IHoverService),
  __decorateParam(3, ILabelService)
], SourceWidget);
export {
  ReplAccessibilityProvider,
  ReplDataSource,
  ReplDelegate,
  ReplEvaluationInputsRenderer,
  ReplEvaluationResultsRenderer,
  ReplGroupRenderer,
  ReplOutputElementRenderer,
  ReplRawObjectsRenderer,
  ReplVariablesRenderer
};
//# sourceMappingURL=replViewer.js.map
