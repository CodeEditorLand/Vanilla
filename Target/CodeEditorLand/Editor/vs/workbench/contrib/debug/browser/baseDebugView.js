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
import * as dom from "../../../../base/browser/dom.js";
import { ActionBar } from "../../../../base/browser/ui/actionbar/actionbar.js";
import {
  HighlightedLabel
} from "../../../../base/browser/ui/highlightedlabel/highlightedLabel.js";
import { getDefaultHoverDelegate } from "../../../../base/browser/ui/hover/hoverDelegateFactory.js";
import {
  InputBox
} from "../../../../base/browser/ui/inputbox/inputBox.js";
import { Codicon } from "../../../../base/common/codicons.js";
import {
  createMatches
} from "../../../../base/common/filters.js";
import { createSingleCallFunction } from "../../../../base/common/functional.js";
import { KeyCode } from "../../../../base/common/keyCodes.js";
import {
  DisposableStore,
  dispose,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { localize } from "../../../../nls.js";
import {
  CommandsRegistry
} from "../../../../platform/commands/common/commands.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { defaultInputBoxStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import {
  IDebugService
} from "../common/debug.js";
import {
  Expression,
  ExpressionContainer,
  Variable
} from "../common/debugModel.js";
import { IDebugVisualizerService } from "../common/debugVisualizers.js";
import { ReplEvaluationResult } from "../common/replModel.js";
import { COPY_EVALUATE_PATH_ID, COPY_VALUE_ID } from "./debugCommands.js";
import {
  DebugLinkHoverBehavior
} from "./linkDetector.js";
const MAX_VALUE_RENDER_LENGTH_IN_VIEWLET = 1024;
const booleanRegex = /^(true|false)$/i;
const stringRegex = /^(['"]).*\1$/;
const $ = dom.$;
function renderViewTree(container) {
  const treeContainer = $(".");
  treeContainer.classList.add("debug-view-content");
  container.appendChild(treeContainer);
  return treeContainer;
}
function renderExpressionValue(store, expressionOrValue, container, options, hoverService) {
  let value = typeof expressionOrValue === "string" ? expressionOrValue : expressionOrValue.value;
  container.className = "value";
  if (value === null || (expressionOrValue instanceof Expression || expressionOrValue instanceof Variable || expressionOrValue instanceof ReplEvaluationResult) && !expressionOrValue.available) {
    container.classList.add("unavailable");
    if (value !== Expression.DEFAULT_VALUE) {
      container.classList.add("error");
    }
  } else {
    if (typeof expressionOrValue !== "string" && options.showChanged && expressionOrValue.valueChanged && value !== Expression.DEFAULT_VALUE) {
      container.className = "value changed";
      expressionOrValue.valueChanged = false;
    }
    if (options.colorize && typeof expressionOrValue !== "string") {
      if (expressionOrValue.type === "number" || expressionOrValue.type === "boolean" || expressionOrValue.type === "string") {
        container.classList.add(expressionOrValue.type);
      } else if (!isNaN(+value)) {
        container.classList.add("number");
      } else if (booleanRegex.test(value)) {
        container.classList.add("boolean");
      } else if (stringRegex.test(value)) {
        container.classList.add("string");
      }
    }
  }
  if (options.maxValueLength && value && value.length > options.maxValueLength) {
    value = value.substring(0, options.maxValueLength) + "...";
  }
  if (!value) {
    value = "";
  }
  const session = expressionOrValue instanceof ExpressionContainer ? expressionOrValue.getSession() : void 0;
  const hoverBehavior = options.hover === false ? { type: DebugLinkHoverBehavior.Rich, store } : { type: DebugLinkHoverBehavior.None };
  if (expressionOrValue instanceof ExpressionContainer && expressionOrValue.valueLocationReference !== void 0 && session && options.linkDetector) {
    container.textContent = "";
    container.appendChild(
      options.linkDetector.linkifyLocation(
        value,
        expressionOrValue.valueLocationReference,
        session,
        hoverBehavior
      )
    );
  } else if (options.linkDetector) {
    container.textContent = "";
    container.appendChild(
      options.linkDetector.linkify(
        value,
        false,
        session ? session.root : void 0,
        true,
        hoverBehavior
      )
    );
  } else {
    container.textContent = value;
  }
  if (options.hover !== false) {
    const { commands = [], commandService } = options.hover || {};
    store.add(
      hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        container,
        () => {
          const container2 = dom.$("div");
          const markdownHoverElement = dom.$("div.hover-row");
          const hoverContentsElement = dom.append(
            markdownHoverElement,
            dom.$("div.hover-contents")
          );
          const hoverContentsPre = dom.append(
            hoverContentsElement,
            dom.$("pre.debug-var-hover-pre")
          );
          hoverContentsPre.textContent = value;
          container2.appendChild(markdownHoverElement);
          return container2;
        },
        {
          actions: commands.map(({ id, args }) => {
            const description = CommandsRegistry.getCommand(id)?.metadata?.description;
            return {
              label: typeof description === "string" ? description : description ? description.value : id,
              commandId: id,
              run: () => commandService.executeCommand(id, ...args)
            };
          })
        }
      )
    );
  }
}
function renderVariable(store, commandService, hoverService, variable, data, showChanged, highlights, linkDetector, displayType) {
  if (variable.available) {
    data.type.textContent = "";
    let text = variable.name;
    if (variable.value && typeof variable.name === "string") {
      if (variable.type && displayType) {
        text += ": ";
        data.type.textContent = variable.type + " =";
      } else {
        text += " =";
      }
    }
    data.label.set(
      text,
      highlights,
      variable.type && !displayType ? variable.type : variable.name
    );
    data.name.classList.toggle(
      "virtual",
      variable.presentationHint?.kind === "virtual"
    );
    data.name.classList.toggle(
      "internal",
      variable.presentationHint?.visibility === "internal"
    );
  } else if (variable.value && typeof variable.name === "string" && variable.name) {
    data.label.set(":");
  }
  data.expression.classList.toggle("lazy", !!variable.presentationHint?.lazy);
  const commands = [
    { id: COPY_VALUE_ID, args: [variable, [variable]] }
  ];
  if (variable.evaluateName) {
    commands.push({ id: COPY_EVALUATE_PATH_ID, args: [{ variable }] });
  }
  renderExpressionValue(
    store,
    variable,
    data.value,
    {
      showChanged,
      maxValueLength: MAX_VALUE_RENDER_LENGTH_IN_VIEWLET,
      hover: { commands, commandService },
      colorize: true,
      linkDetector
    },
    hoverService
  );
}
let AbstractExpressionDataSource = class {
  constructor(debugService, debugVisualizer) {
    this.debugService = debugService;
    this.debugVisualizer = debugVisualizer;
  }
  async getChildren(element) {
    const vm = this.debugService.getViewModel();
    const children = await this.doGetChildren(element);
    return Promise.all(
      children.map(async (r) => {
        const vizOrTree = vm.getVisualizedExpression(r);
        if (typeof vizOrTree === "string") {
          const viz = await this.debugVisualizer.getVisualizedNodeFor(
            vizOrTree,
            r
          );
          if (viz) {
            vm.setVisualizedExpression(r, viz);
            return viz;
          }
        } else if (vizOrTree) {
          return vizOrTree;
        }
        return r;
      })
    );
  }
};
AbstractExpressionDataSource = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IDebugVisualizerService)
], AbstractExpressionDataSource);
let AbstractExpressionsRenderer = class {
  constructor(debugService, contextViewService, hoverService) {
    this.debugService = debugService;
    this.contextViewService = contextViewService;
    this.hoverService = hoverService;
  }
  renderTemplate(container) {
    const templateDisposable = new DisposableStore();
    const expression = dom.append(container, $(".expression"));
    const name = dom.append(expression, $("span.name"));
    const lazyButton = dom.append(expression, $("span.lazy-button"));
    lazyButton.classList.add(...ThemeIcon.asClassNameArray(Codicon.eye));
    templateDisposable.add(
      this.hoverService.setupManagedHover(
        getDefaultHoverDelegate("mouse"),
        lazyButton,
        localize("debug.lazyButton.tooltip", "Click to expand")
      )
    );
    const type = dom.append(expression, $("span.type"));
    const value = dom.append(expression, $("span.value"));
    const label = templateDisposable.add(new HighlightedLabel(name));
    const inputBoxContainer = dom.append(
      expression,
      $(".inputBoxContainer")
    );
    let actionBar;
    if (this.renderActionBar) {
      dom.append(expression, $(".span.actionbar-spacer"));
      actionBar = templateDisposable.add(new ActionBar(expression));
    }
    const template = {
      expression,
      name,
      type,
      value,
      label,
      inputBoxContainer,
      actionBar,
      elementDisposable: new DisposableStore(),
      templateDisposable,
      lazyButton,
      currentElement: void 0
    };
    templateDisposable.add(
      dom.addDisposableListener(lazyButton, dom.EventType.CLICK, () => {
        if (template.currentElement) {
          this.debugService.getViewModel().evaluateLazyExpression(template.currentElement);
        }
      })
    );
    return template;
  }
  renderExpressionElement(element, node, data) {
    data.currentElement = element;
    this.renderExpression(
      node.element,
      data,
      createMatches(node.filterData)
    );
    if (data.actionBar) {
      this.renderActionBar(data.actionBar, element, data);
    }
    const selectedExpression = this.debugService.getViewModel().getSelectedExpression();
    if (element === selectedExpression?.expression || element instanceof Variable && element.errorMessage) {
      const options = this.getInputBoxOptions(
        element,
        !!selectedExpression?.settingWatch
      );
      if (options) {
        data.elementDisposable.add(
          this.renderInputBox(
            data.name,
            data.value,
            data.inputBoxContainer,
            options
          )
        );
      }
    }
  }
  renderInputBox(nameElement, valueElement, inputBoxContainer, options) {
    nameElement.style.display = "none";
    valueElement.style.display = "none";
    inputBoxContainer.style.display = "initial";
    dom.clearNode(inputBoxContainer);
    const inputBox = new InputBox(
      inputBoxContainer,
      this.contextViewService,
      { ...options, inputBoxStyles: defaultInputBoxStyles }
    );
    inputBox.value = options.initialValue;
    inputBox.focus();
    inputBox.select();
    const done = createSingleCallFunction(
      (success, finishEditing) => {
        nameElement.style.display = "";
        valueElement.style.display = "";
        inputBoxContainer.style.display = "none";
        const value = inputBox.value;
        dispose(toDispose);
        if (finishEditing) {
          this.debugService.getViewModel().setSelectedExpression(void 0, false);
          options.onFinish(value, success);
        }
      }
    );
    const toDispose = [
      inputBox,
      dom.addStandardDisposableListener(
        inputBox.inputElement,
        dom.EventType.KEY_DOWN,
        (e) => {
          const isEscape = e.equals(KeyCode.Escape);
          const isEnter = e.equals(KeyCode.Enter);
          if (isEscape || isEnter) {
            e.preventDefault();
            e.stopPropagation();
            done(isEnter, true);
          }
        }
      ),
      dom.addDisposableListener(
        inputBox.inputElement,
        dom.EventType.BLUR,
        () => {
          done(true, true);
        }
      ),
      dom.addDisposableListener(
        inputBox.inputElement,
        dom.EventType.CLICK,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        }
      )
    ];
    return toDisposable(() => {
      done(false, false);
    });
  }
  disposeElement(node, index, templateData) {
    templateData.elementDisposable.clear();
  }
  disposeTemplate(templateData) {
    templateData.elementDisposable.dispose();
    templateData.templateDisposable.dispose();
  }
};
AbstractExpressionsRenderer = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IContextViewService),
  __decorateParam(2, IHoverService)
], AbstractExpressionsRenderer);
export {
  AbstractExpressionDataSource,
  AbstractExpressionsRenderer,
  renderExpressionValue,
  renderVariable,
  renderViewTree
};
