var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../../../../../base/browser/dom.js";
import { DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { localize } from "../../../../../../nls.js";
import { IHoverService } from "../../../../../../platform/hover/browser/hover.js";
import { WorkbenchObjectTree } from "../../../../../../platform/list/browser/listService.js";
import { renderExpressionValue } from "../../../../debug/browser/baseDebugView.js";
const $ = dom.$;
const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
class NotebookVariablesTree extends WorkbenchObjectTree {
}
class NotebookVariablesDelegate {
  getHeight(element) {
    return 22;
  }
  getTemplateId(element) {
    return NotebookVariableRenderer.ID;
  }
}
let NotebookVariableRenderer = class {
  constructor(_hoverService) {
    this._hoverService = _hoverService;
  }
  static ID = "variableElement";
  get templateId() {
    return NotebookVariableRenderer.ID;
  }
  renderTemplate(container) {
    const expression = dom.append(container, $(".expression"));
    const name = dom.append(expression, $("span.name"));
    const value = dom.append(expression, $("span.value"));
    const template = {
      expression,
      name,
      value,
      elementDisposables: new DisposableStore()
    };
    return template;
  }
  renderElement(element, _index, data) {
    const text = element.element.value.trim() !== "" ? `${element.element.name}:` : element.element.name;
    data.name.textContent = text;
    data.name.title = element.element.type ?? "";
    renderExpressionValue(
      data.elementDisposables,
      element.element,
      data.value,
      {
        colorize: true,
        maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET
      },
      this._hoverService
    );
  }
  disposeElement(element, index, templateData, height) {
    templateData.elementDisposables.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposables.dispose();
  }
};
NotebookVariableRenderer = __decorateClass([
  __decorateParam(0, IHoverService)
], NotebookVariableRenderer);
class NotebookVariableAccessibilityProvider {
  getWidgetAriaLabel() {
    return localize("debugConsole", "Notebook Variables");
  }
  getAriaLabel(element) {
    return localize(
      "notebookVariableAriaLabel",
      "Variable {0}, value {1}",
      element.name,
      element.value
    );
  }
}
export {
  NotebookVariableAccessibilityProvider,
  NotebookVariableRenderer,
  NotebookVariablesDelegate,
  NotebookVariablesTree
};
