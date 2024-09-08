import { Action } from "../../../common/actions.js";
import { distinct, equals, range } from "../../../common/arrays.js";
import { Delayer, disposableTimeout, timeout } from "../../../common/async.js";
import { Codicon } from "../../../common/codicons.js";
import { Emitter, Event, EventBufferer, Relay } from "../../../common/event.js";
import { FuzzyScore, fuzzyScore } from "../../../common/filters.js";
import { KeyCode } from "../../../common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  dispose,
  toDisposable
} from "../../../common/lifecycle.js";
import { SetMap } from "../../../common/map.js";
import { clamp } from "../../../common/numbers.js";
import { ThemeIcon } from "../../../common/themables.js";
import { isNumber } from "../../../common/types.js";
import {
  $,
  addDisposableListener,
  append,
  asCssValueWithDefault,
  clearNode,
  createStyleSheet,
  getWindow,
  h,
  hasParentWithClass,
  isActiveElement,
  isEditableElement,
  isKeyboardEvent
} from "../../dom.js";
import { DomEmitter } from "../../event.js";
import { StandardKeyboardEvent } from "../../keyboardEvent.js";
import { ActionBar } from "../actionbar/actionbar.js";
import { FindInput } from "../findinput/findInput.js";
import {
  MessageType,
  unthemedInboxStyles
} from "../inputbox/inputBox.js";
import {
  ElementsDragAndDropData
} from "../list/listView.js";
import {
  List,
  MouseController,
  isActionItem,
  isButton,
  isMonacoCustomToggle,
  isMonacoEditor,
  isStickyScrollContainer,
  isStickyScrollElement
} from "../list/listWidget.js";
import {
  Toggle,
  unthemedToggleStyles
} from "../toggle/toggle.js";
import { getVisibleState, isFilterResult } from "./indexTreeModel.js";
import {
  TreeDragOverBubble,
  TreeError,
  TreeMouseEventTarget,
  TreeVisibility
} from "./tree.js";
import "./media/tree.css";
import { localize } from "../../../../nls.js";
import { autorun, constObservable } from "../../../common/observable.js";
import { alert } from "../aria/aria.js";
import {
  createInstantHoverDelegate,
  getDefaultHoverDelegate
} from "../hover/hoverDelegateFactory.js";
class TreeElementsDragAndDropData extends ElementsDragAndDropData {
  constructor(data) {
    super(data.elements.map((node) => node.element));
    this.data = data;
  }
  set context(context) {
    this.data.context = context;
  }
  get context() {
    return this.data.context;
  }
}
function asTreeDragAndDropData(data) {
  if (data instanceof ElementsDragAndDropData) {
    return new TreeElementsDragAndDropData(data);
  }
  return data;
}
class TreeNodeListDragAndDrop {
  constructor(modelProvider, dnd) {
    this.modelProvider = modelProvider;
    this.dnd = dnd;
  }
  autoExpandNode;
  autoExpandDisposable = Disposable.None;
  disposables = new DisposableStore();
  getDragURI(node) {
    return this.dnd.getDragURI(node.element);
  }
  getDragLabel(nodes, originalEvent) {
    if (this.dnd.getDragLabel) {
      return this.dnd.getDragLabel(
        nodes.map((node) => node.element),
        originalEvent
      );
    }
    return void 0;
  }
  onDragStart(data, originalEvent) {
    this.dnd.onDragStart?.(asTreeDragAndDropData(data), originalEvent);
  }
  onDragOver(data, targetNode, targetIndex, targetSector, originalEvent, raw = true) {
    const result = this.dnd.onDragOver(
      asTreeDragAndDropData(data),
      targetNode && targetNode.element,
      targetIndex,
      targetSector,
      originalEvent
    );
    const didChangeAutoExpandNode = this.autoExpandNode !== targetNode;
    if (didChangeAutoExpandNode) {
      this.autoExpandDisposable.dispose();
      this.autoExpandNode = targetNode;
    }
    if (typeof targetNode === "undefined") {
      return result;
    }
    if (didChangeAutoExpandNode && typeof result !== "boolean" && result.autoExpand) {
      this.autoExpandDisposable = disposableTimeout(
        () => {
          const model2 = this.modelProvider();
          const ref2 = model2.getNodeLocation(targetNode);
          if (model2.isCollapsed(ref2)) {
            model2.setCollapsed(ref2, false);
          }
          this.autoExpandNode = void 0;
        },
        500,
        this.disposables
      );
    }
    if (typeof result === "boolean" || !result.accept || typeof result.bubble === "undefined" || result.feedback) {
      if (!raw) {
        const accept = typeof result === "boolean" ? result : result.accept;
        const effect = typeof result === "boolean" ? void 0 : result.effect;
        return { accept, effect, feedback: [targetIndex] };
      }
      return result;
    }
    if (result.bubble === TreeDragOverBubble.Up) {
      const model2 = this.modelProvider();
      const ref2 = model2.getNodeLocation(targetNode);
      const parentRef = model2.getParentNodeLocation(ref2);
      const parentNode = model2.getNode(parentRef);
      const parentIndex = parentRef && model2.getListIndex(parentRef);
      return this.onDragOver(
        data,
        parentNode,
        parentIndex,
        targetSector,
        originalEvent,
        false
      );
    }
    const model = this.modelProvider();
    const ref = model.getNodeLocation(targetNode);
    const start = model.getListIndex(ref);
    const length = model.getListRenderCount(ref);
    return { ...result, feedback: range(start, start + length) };
  }
  drop(data, targetNode, targetIndex, targetSector, originalEvent) {
    this.autoExpandDisposable.dispose();
    this.autoExpandNode = void 0;
    this.dnd.drop(
      asTreeDragAndDropData(data),
      targetNode && targetNode.element,
      targetIndex,
      targetSector,
      originalEvent
    );
  }
  onDragEnd(originalEvent) {
    this.dnd.onDragEnd?.(originalEvent);
  }
  dispose() {
    this.disposables.dispose();
    this.dnd.dispose();
  }
}
function asListOptions(modelProvider, options) {
  return options && {
    ...options,
    identityProvider: options.identityProvider && {
      getId(el) {
        return options.identityProvider.getId(el.element);
      }
    },
    dnd: options.dnd && new TreeNodeListDragAndDrop(modelProvider, options.dnd),
    multipleSelectionController: options.multipleSelectionController && {
      isSelectionSingleChangeEvent(e) {
        return options.multipleSelectionController.isSelectionSingleChangeEvent(
          { ...e, element: e.element }
        );
      },
      isSelectionRangeChangeEvent(e) {
        return options.multipleSelectionController.isSelectionRangeChangeEvent(
          { ...e, element: e.element }
        );
      }
    },
    accessibilityProvider: options.accessibilityProvider && {
      ...options.accessibilityProvider,
      getSetSize(node) {
        const model = modelProvider();
        const ref = model.getNodeLocation(node);
        const parentRef = model.getParentNodeLocation(ref);
        const parentNode = model.getNode(parentRef);
        return parentNode.visibleChildrenCount;
      },
      getPosInSet(node) {
        return node.visibleChildIndex + 1;
      },
      isChecked: options.accessibilityProvider && options.accessibilityProvider.isChecked ? (node) => {
        return options.accessibilityProvider.isChecked(node.element);
      } : void 0,
      getRole: options.accessibilityProvider && options.accessibilityProvider.getRole ? (node) => {
        return options.accessibilityProvider.getRole(
          node.element
        );
      } : () => "treeitem",
      getAriaLabel(e) {
        return options.accessibilityProvider.getAriaLabel(
          e.element
        );
      },
      getWidgetAriaLabel() {
        return options.accessibilityProvider.getWidgetAriaLabel();
      },
      getWidgetRole: options.accessibilityProvider && options.accessibilityProvider.getWidgetRole ? () => options.accessibilityProvider.getWidgetRole() : () => "tree",
      getAriaLevel: options.accessibilityProvider && options.accessibilityProvider.getAriaLevel ? (node) => options.accessibilityProvider.getAriaLevel(
        node.element
      ) : (node) => {
        return node.depth;
      },
      getActiveDescendantId: options.accessibilityProvider.getActiveDescendantId && ((node) => {
        return options.accessibilityProvider.getActiveDescendantId(node.element);
      })
    },
    keyboardNavigationLabelProvider: options.keyboardNavigationLabelProvider && {
      ...options.keyboardNavigationLabelProvider,
      getKeyboardNavigationLabel(node) {
        return options.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(
          node.element
        );
      }
    }
  };
}
class ComposedTreeDelegate {
  constructor(delegate) {
    this.delegate = delegate;
  }
  getHeight(element) {
    return this.delegate.getHeight(element.element);
  }
  getTemplateId(element) {
    return this.delegate.getTemplateId(element.element);
  }
  hasDynamicHeight(element) {
    return !!this.delegate.hasDynamicHeight && this.delegate.hasDynamicHeight(element.element);
  }
  setDynamicHeight(element, height) {
    this.delegate.setDynamicHeight?.(element.element, height);
  }
}
class AbstractTreeViewState {
  focus;
  selection;
  expanded;
  scrollTop;
  static lift(state) {
    return state instanceof AbstractTreeViewState ? state : new AbstractTreeViewState(state);
  }
  static empty(scrollTop = 0) {
    return new AbstractTreeViewState({
      focus: [],
      selection: [],
      expanded: /* @__PURE__ */ Object.create(null),
      scrollTop
    });
  }
  constructor(state) {
    this.focus = new Set(state.focus);
    this.selection = new Set(state.selection);
    if (state.expanded instanceof Array) {
      this.expanded = /* @__PURE__ */ Object.create(null);
      for (const id of state.expanded) {
        this.expanded[id] = 1;
      }
    } else {
      this.expanded = state.expanded;
    }
    this.expanded = state.expanded;
    this.scrollTop = state.scrollTop;
  }
  toJSON() {
    return {
      focus: Array.from(this.focus),
      selection: Array.from(this.selection),
      expanded: this.expanded,
      scrollTop: this.scrollTop
    };
  }
}
var RenderIndentGuides = /* @__PURE__ */ ((RenderIndentGuides2) => {
  RenderIndentGuides2["None"] = "none";
  RenderIndentGuides2["OnHover"] = "onHover";
  RenderIndentGuides2["Always"] = "always";
  return RenderIndentGuides2;
})(RenderIndentGuides || {});
class EventCollection {
  constructor(onDidChange, _elements = []) {
    this._elements = _elements;
    this.onDidChange = Event.forEach(
      onDidChange,
      (elements) => this._elements = elements,
      this.disposables
    );
  }
  disposables = new DisposableStore();
  onDidChange;
  get elements() {
    return this._elements;
  }
  dispose() {
    this.disposables.dispose();
  }
}
class TreeRenderer {
  constructor(renderer, model, onDidChangeCollapseState, activeNodes, renderedIndentGuides, options = {}) {
    this.renderer = renderer;
    this.model = model;
    this.activeNodes = activeNodes;
    this.renderedIndentGuides = renderedIndentGuides;
    this.templateId = renderer.templateId;
    this.updateOptions(options);
    Event.map(onDidChangeCollapseState, (e) => e.node)(
      this.onDidChangeNodeTwistieState,
      this,
      this.disposables
    );
    renderer.onDidChangeTwistieState?.(
      this.onDidChangeTwistieState,
      this,
      this.disposables
    );
  }
  static DefaultIndent = 8;
  templateId;
  renderedElements = /* @__PURE__ */ new Map();
  renderedNodes = /* @__PURE__ */ new Map();
  indent = TreeRenderer.DefaultIndent;
  hideTwistiesOfChildlessElements = false;
  shouldRenderIndentGuides = false;
  activeIndentNodes = /* @__PURE__ */ new Set();
  indentGuidesDisposable = Disposable.None;
  disposables = new DisposableStore();
  updateOptions(options = {}) {
    if (typeof options.indent !== "undefined") {
      const indent = clamp(options.indent, 0, 40);
      if (indent !== this.indent) {
        this.indent = indent;
        for (const [node, templateData] of this.renderedNodes) {
          this.renderTreeElement(node, templateData);
        }
      }
    }
    if (typeof options.renderIndentGuides !== "undefined") {
      const shouldRenderIndentGuides = options.renderIndentGuides !== "none" /* None */;
      if (shouldRenderIndentGuides !== this.shouldRenderIndentGuides) {
        this.shouldRenderIndentGuides = shouldRenderIndentGuides;
        for (const [node, templateData] of this.renderedNodes) {
          this._renderIndentGuides(node, templateData);
        }
        this.indentGuidesDisposable.dispose();
        if (shouldRenderIndentGuides) {
          const disposables = new DisposableStore();
          this.activeNodes.onDidChange(
            this._onDidChangeActiveNodes,
            this,
            disposables
          );
          this.indentGuidesDisposable = disposables;
          this._onDidChangeActiveNodes(this.activeNodes.elements);
        }
      }
    }
    if (typeof options.hideTwistiesOfChildlessElements !== "undefined") {
      this.hideTwistiesOfChildlessElements = options.hideTwistiesOfChildlessElements;
    }
  }
  renderTemplate(container) {
    const el = append(container, $(".monaco-tl-row"));
    const indent = append(el, $(".monaco-tl-indent"));
    const twistie = append(el, $(".monaco-tl-twistie"));
    const contents = append(el, $(".monaco-tl-contents"));
    const templateData = this.renderer.renderTemplate(contents);
    return {
      container,
      indent,
      twistie,
      indentGuidesDisposable: Disposable.None,
      templateData
    };
  }
  renderElement(node, index, templateData, height) {
    this.renderedNodes.set(node, templateData);
    this.renderedElements.set(node.element, node);
    this.renderTreeElement(node, templateData);
    this.renderer.renderElement(
      node,
      index,
      templateData.templateData,
      height
    );
  }
  disposeElement(node, index, templateData, height) {
    templateData.indentGuidesDisposable.dispose();
    this.renderer.disposeElement?.(
      node,
      index,
      templateData.templateData,
      height
    );
    if (typeof height === "number") {
      this.renderedNodes.delete(node);
      this.renderedElements.delete(node.element);
    }
  }
  disposeTemplate(templateData) {
    this.renderer.disposeTemplate(templateData.templateData);
  }
  onDidChangeTwistieState(element) {
    const node = this.renderedElements.get(element);
    if (!node) {
      return;
    }
    this.onDidChangeNodeTwistieState(node);
  }
  onDidChangeNodeTwistieState(node) {
    const templateData = this.renderedNodes.get(node);
    if (!templateData) {
      return;
    }
    this._onDidChangeActiveNodes(this.activeNodes.elements);
    this.renderTreeElement(node, templateData);
  }
  renderTreeElement(node, templateData) {
    const indent = TreeRenderer.DefaultIndent + (node.depth - 1) * this.indent;
    templateData.twistie.style.paddingLeft = `${indent}px`;
    templateData.indent.style.width = `${indent + this.indent - 16}px`;
    if (node.collapsible) {
      templateData.container.setAttribute(
        "aria-expanded",
        String(!node.collapsed)
      );
    } else {
      templateData.container.removeAttribute("aria-expanded");
    }
    templateData.twistie.classList.remove(
      ...ThemeIcon.asClassNameArray(Codicon.treeItemExpanded)
    );
    let twistieRendered = false;
    if (this.renderer.renderTwistie) {
      twistieRendered = this.renderer.renderTwistie(
        node.element,
        templateData.twistie
      );
    }
    if (node.collapsible && (!this.hideTwistiesOfChildlessElements || node.visibleChildrenCount > 0)) {
      if (!twistieRendered) {
        templateData.twistie.classList.add(
          ...ThemeIcon.asClassNameArray(Codicon.treeItemExpanded)
        );
      }
      templateData.twistie.classList.add("collapsible");
      templateData.twistie.classList.toggle("collapsed", node.collapsed);
    } else {
      templateData.twistie.classList.remove("collapsible", "collapsed");
    }
    this._renderIndentGuides(node, templateData);
  }
  _renderIndentGuides(node, templateData) {
    clearNode(templateData.indent);
    templateData.indentGuidesDisposable.dispose();
    if (!this.shouldRenderIndentGuides) {
      return;
    }
    const disposableStore = new DisposableStore();
    while (true) {
      const ref = this.model.getNodeLocation(node);
      const parentRef = this.model.getParentNodeLocation(ref);
      if (!parentRef) {
        break;
      }
      const parent = this.model.getNode(parentRef);
      const guide = $(".indent-guide", {
        style: `width: ${this.indent}px`
      });
      if (this.activeIndentNodes.has(parent)) {
        guide.classList.add("active");
      }
      if (templateData.indent.childElementCount === 0) {
        templateData.indent.appendChild(guide);
      } else {
        templateData.indent.insertBefore(
          guide,
          templateData.indent.firstElementChild
        );
      }
      this.renderedIndentGuides.add(parent, guide);
      disposableStore.add(
        toDisposable(
          () => this.renderedIndentGuides.delete(parent, guide)
        )
      );
      node = parent;
    }
    templateData.indentGuidesDisposable = disposableStore;
  }
  _onDidChangeActiveNodes(nodes) {
    if (!this.shouldRenderIndentGuides) {
      return;
    }
    const set = /* @__PURE__ */ new Set();
    nodes.forEach((node) => {
      const ref = this.model.getNodeLocation(node);
      try {
        const parentRef = this.model.getParentNodeLocation(ref);
        if (node.collapsible && node.children.length > 0 && !node.collapsed) {
          set.add(node);
        } else if (parentRef) {
          set.add(this.model.getNode(parentRef));
        }
      } catch {
      }
    });
    this.activeIndentNodes.forEach((node) => {
      if (!set.has(node)) {
        this.renderedIndentGuides.forEach(
          node,
          (line) => line.classList.remove("active")
        );
      }
    });
    set.forEach((node) => {
      if (!this.activeIndentNodes.has(node)) {
        this.renderedIndentGuides.forEach(
          node,
          (line) => line.classList.add("active")
        );
      }
    });
    this.activeIndentNodes = set;
  }
  setModel(model) {
    this.model = model;
  }
  dispose() {
    this.renderedNodes.clear();
    this.renderedElements.clear();
    this.indentGuidesDisposable.dispose();
    dispose(this.disposables);
  }
}
class FindFilter {
  constructor(tree, keyboardNavigationLabelProvider, _filter) {
    this.tree = tree;
    this.keyboardNavigationLabelProvider = keyboardNavigationLabelProvider;
    this._filter = _filter;
    tree.onWillRefilter(this.reset, this, this.disposables);
  }
  _totalCount = 0;
  get totalCount() {
    return this._totalCount;
  }
  _matchCount = 0;
  get matchCount() {
    return this._matchCount;
  }
  _pattern = "";
  _lowercasePattern = "";
  disposables = new DisposableStore();
  set pattern(pattern) {
    this._pattern = pattern;
    this._lowercasePattern = pattern.toLowerCase();
  }
  filter(element, parentVisibility) {
    let visibility = TreeVisibility.Visible;
    if (this._filter) {
      const result = this._filter.filter(element, parentVisibility);
      if (typeof result === "boolean") {
        visibility = result ? TreeVisibility.Visible : TreeVisibility.Hidden;
      } else if (isFilterResult(result)) {
        visibility = getVisibleState(result.visibility);
      } else {
        visibility = result;
      }
      if (visibility === TreeVisibility.Hidden) {
        return false;
      }
    }
    this._totalCount++;
    if (!this._pattern) {
      this._matchCount++;
      return { data: FuzzyScore.Default, visibility };
    }
    const label = this.keyboardNavigationLabelProvider.getKeyboardNavigationLabel(
      element
    );
    const labels = Array.isArray(label) ? label : [label];
    for (const l of labels) {
      const labelStr = l && l.toString();
      if (typeof labelStr === "undefined") {
        return { data: FuzzyScore.Default, visibility };
      }
      let score;
      if (this.tree.findMatchType === 1 /* Contiguous */) {
        const index = labelStr.toLowerCase().indexOf(this._lowercasePattern);
        if (index > -1) {
          score = [Number.MAX_SAFE_INTEGER, 0];
          for (let i = this._lowercasePattern.length; i > 0; i--) {
            score.push(index + i - 1);
          }
        }
      } else {
        score = fuzzyScore(
          this._pattern,
          this._lowercasePattern,
          0,
          labelStr,
          labelStr.toLowerCase(),
          0,
          { firstMatchCanBeWeak: true, boostFullMatch: true }
        );
      }
      if (score) {
        this._matchCount++;
        return labels.length === 1 ? { data: score, visibility } : { data: { label: labelStr, score }, visibility };
      }
    }
    if (this.tree.findMode === 1 /* Filter */) {
      if (typeof this.tree.options.defaultFindVisibility === "number") {
        return this.tree.options.defaultFindVisibility;
      } else if (this.tree.options.defaultFindVisibility) {
        return this.tree.options.defaultFindVisibility(element);
      } else {
        return TreeVisibility.Recurse;
      }
    } else {
      return { data: FuzzyScore.Default, visibility };
    }
  }
  reset() {
    this._totalCount = 0;
    this._matchCount = 0;
  }
  dispose() {
    dispose(this.disposables);
  }
}
class ModeToggle extends Toggle {
  constructor(opts) {
    super({
      icon: Codicon.listFilter,
      title: localize("filter", "Filter"),
      isChecked: opts.isChecked ?? false,
      hoverDelegate: opts.hoverDelegate ?? getDefaultHoverDelegate("element"),
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
}
class FuzzyToggle extends Toggle {
  constructor(opts) {
    super({
      icon: Codicon.searchFuzzy,
      title: localize("fuzzySearch", "Fuzzy Match"),
      isChecked: opts.isChecked ?? false,
      hoverDelegate: opts.hoverDelegate ?? getDefaultHoverDelegate("element"),
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
}
const unthemedFindWidgetStyles = {
  inputBoxStyles: unthemedInboxStyles,
  toggleStyles: unthemedToggleStyles,
  listFilterWidgetBackground: void 0,
  listFilterWidgetNoMatchesOutline: void 0,
  listFilterWidgetOutline: void 0,
  listFilterWidgetShadow: void 0
};
var TreeFindMode = /* @__PURE__ */ ((TreeFindMode2) => {
  TreeFindMode2[TreeFindMode2["Highlight"] = 0] = "Highlight";
  TreeFindMode2[TreeFindMode2["Filter"] = 1] = "Filter";
  return TreeFindMode2;
})(TreeFindMode || {});
var TreeFindMatchType = /* @__PURE__ */ ((TreeFindMatchType2) => {
  TreeFindMatchType2[TreeFindMatchType2["Fuzzy"] = 0] = "Fuzzy";
  TreeFindMatchType2[TreeFindMatchType2["Contiguous"] = 1] = "Contiguous";
  return TreeFindMatchType2;
})(TreeFindMatchType || {});
class FindWidget extends Disposable {
  constructor(container, tree, contextViewProvider, mode, matchType, options) {
    super();
    this.tree = tree;
    container.appendChild(this.elements.root);
    this._register(toDisposable(() => this.elements.root.remove()));
    const styles = options?.styles ?? unthemedFindWidgetStyles;
    if (styles.listFilterWidgetBackground) {
      this.elements.root.style.backgroundColor = styles.listFilterWidgetBackground;
    }
    if (styles.listFilterWidgetShadow) {
      this.elements.root.style.boxShadow = `0 0 8px 2px ${styles.listFilterWidgetShadow}`;
    }
    const toggleHoverDelegate = this._register(
      createInstantHoverDelegate()
    );
    this.modeToggle = this._register(
      new ModeToggle({
        ...styles.toggleStyles,
        isChecked: mode === 1 /* Filter */,
        hoverDelegate: toggleHoverDelegate
      })
    );
    this.matchTypeToggle = this._register(
      new FuzzyToggle({
        ...styles.toggleStyles,
        isChecked: matchType === 0 /* Fuzzy */,
        hoverDelegate: toggleHoverDelegate
      })
    );
    this.onDidChangeMode = Event.map(
      this.modeToggle.onChange,
      () => this.modeToggle.checked ? 1 /* Filter */ : 0 /* Highlight */,
      this._store
    );
    this.onDidChangeMatchType = Event.map(
      this.matchTypeToggle.onChange,
      () => this.matchTypeToggle.checked ? 0 /* Fuzzy */ : 1 /* Contiguous */,
      this._store
    );
    this.findInput = this._register(
      new FindInput(this.elements.findInput, contextViewProvider, {
        label: localize("type to search", "Type to search"),
        additionalToggles: [this.modeToggle, this.matchTypeToggle],
        showCommonFindToggles: false,
        inputBoxStyles: styles.inputBoxStyles,
        toggleStyles: styles.toggleStyles,
        history: options?.history
      })
    );
    this.actionbar = this._register(new ActionBar(this.elements.actionbar));
    this.mode = mode;
    const emitter = this._register(
      new DomEmitter(this.findInput.inputBox.inputElement, "keydown")
    );
    const onKeyDown = Event.chain(
      emitter.event,
      ($2) => $2.map((e) => new StandardKeyboardEvent(e))
    );
    this._register(
      onKeyDown((e) => {
        if (e.equals(KeyCode.Enter)) {
          e.preventDefault();
          e.stopPropagation();
          this.findInput.inputBox.addToHistory();
          this.tree.domFocus();
          return;
        }
        if (e.equals(KeyCode.DownArrow)) {
          e.preventDefault();
          e.stopPropagation();
          if (this.findInput.inputBox.isAtLastInHistory() || this.findInput.inputBox.isNowhereInHistory()) {
            this.findInput.inputBox.addToHistory();
            this.tree.domFocus();
          } else {
            this.findInput.inputBox.showNextValue();
          }
          return;
        }
        if (e.equals(KeyCode.UpArrow)) {
          e.preventDefault();
          e.stopPropagation();
          this.findInput.inputBox.showPreviousValue();
          return;
        }
      })
    );
    const closeAction = this._register(
      new Action(
        "close",
        localize("close", "Close"),
        "codicon codicon-close",
        true,
        () => this.dispose()
      )
    );
    this.actionbar.push(closeAction, { icon: true, label: false });
    const onGrabMouseDown = this._register(
      new DomEmitter(this.elements.grab, "mousedown")
    );
    this._register(
      onGrabMouseDown.event((e) => {
        const disposables = new DisposableStore();
        const onWindowMouseMove = disposables.add(
          new DomEmitter(getWindow(e), "mousemove")
        );
        const onWindowMouseUp = disposables.add(
          new DomEmitter(getWindow(e), "mouseup")
        );
        const startRight = this.right;
        const startX = e.pageX;
        const startTop = this.top;
        const startY = e.pageY;
        this.elements.grab.classList.add("grabbing");
        const transition = this.elements.root.style.transition;
        this.elements.root.style.transition = "unset";
        const update = (e2) => {
          const deltaX = e2.pageX - startX;
          this.right = startRight - deltaX;
          const deltaY = e2.pageY - startY;
          this.top = startTop + deltaY;
          this.layout();
        };
        disposables.add(onWindowMouseMove.event(update));
        disposables.add(
          onWindowMouseUp.event((e2) => {
            update(e2);
            this.elements.grab.classList.remove("grabbing");
            this.elements.root.style.transition = transition;
            disposables.dispose();
          })
        );
      })
    );
    const onGrabKeyDown = Event.chain(
      this._register(new DomEmitter(this.elements.grab, "keydown")).event,
      ($2) => $2.map((e) => new StandardKeyboardEvent(e))
    );
    this._register(
      onGrabKeyDown((e) => {
        let right;
        let top;
        if (e.keyCode === KeyCode.LeftArrow) {
          right = Number.POSITIVE_INFINITY;
        } else if (e.keyCode === KeyCode.RightArrow) {
          right = 0;
        } else if (e.keyCode === KeyCode.Space) {
          right = this.right === 0 ? Number.POSITIVE_INFINITY : 0;
        }
        if (e.keyCode === KeyCode.UpArrow) {
          top = 0;
        } else if (e.keyCode === KeyCode.DownArrow) {
          top = Number.POSITIVE_INFINITY;
        }
        if (right !== void 0) {
          e.preventDefault();
          e.stopPropagation();
          this.right = right;
          this.layout();
        }
        if (top !== void 0) {
          e.preventDefault();
          e.stopPropagation();
          this.top = top;
          const transition = this.elements.root.style.transition;
          this.elements.root.style.transition = "unset";
          this.layout();
          setTimeout(() => {
            this.elements.root.style.transition = transition;
          }, 0);
        }
      })
    );
    this.onDidChangeValue = this.findInput.onDidChange;
  }
  elements = h(".monaco-tree-type-filter", [
    h(".monaco-tree-type-filter-grab.codicon.codicon-debug-gripper@grab", {
      tabIndex: 0
    }),
    h(".monaco-tree-type-filter-input@findInput"),
    h(".monaco-tree-type-filter-actionbar@actionbar")
  ]);
  set mode(mode) {
    this.modeToggle.checked = mode === 1 /* Filter */;
    this.findInput.inputBox.setPlaceHolder(
      mode === 1 /* Filter */ ? localize("type to filter", "Type to filter") : localize("type to search", "Type to search")
    );
  }
  set matchType(matchType) {
    this.matchTypeToggle.checked = matchType === 0 /* Fuzzy */;
  }
  get value() {
    return this.findInput.inputBox.value;
  }
  set value(value) {
    this.findInput.inputBox.value = value;
  }
  modeToggle;
  matchTypeToggle;
  findInput;
  actionbar;
  width = 0;
  right = 0;
  top = 0;
  _onDidDisable = new Emitter();
  onDidDisable = this._onDidDisable.event;
  onDidChangeValue;
  onDidChangeMode;
  onDidChangeMatchType;
  getHistory() {
    return this.findInput.inputBox.getHistory();
  }
  focus() {
    this.findInput.focus();
  }
  select() {
    this.findInput.select();
    this.findInput.inputBox.addToHistory(true);
  }
  layout(width = this.width) {
    this.width = width;
    this.right = clamp(this.right, 0, Math.max(0, width - 212));
    this.elements.root.style.right = `${this.right}px`;
    this.top = clamp(this.top, 0, 24);
    this.elements.root.style.top = `${this.top}px`;
  }
  showMessage(message) {
    this.findInput.showMessage(message);
  }
  clearMessage() {
    this.findInput.clearMessage();
  }
  async dispose() {
    this._onDidDisable.fire();
    this.elements.root.classList.add("disabled");
    await timeout(300);
    super.dispose();
  }
}
class FindController {
  constructor(tree, view, filter, contextViewProvider, options = {}) {
    this.tree = tree;
    this.view = view;
    this.filter = filter;
    this.contextViewProvider = contextViewProvider;
    this.options = options;
    this._mode = tree.options.defaultFindMode ?? 0 /* Highlight */;
    this._matchType = tree.options.defaultFindMatchType ?? 0 /* Fuzzy */;
  }
  _history;
  _pattern = "";
  get pattern() {
    return this._pattern;
  }
  previousPattern = "";
  _mode;
  get mode() {
    return this._mode;
  }
  set mode(mode) {
    if (mode === this._mode) {
      return;
    }
    this._mode = mode;
    if (this.widget) {
      this.widget.mode = this._mode;
    }
    this.tree.refilter();
    this.render();
    this._onDidChangeMode.fire(mode);
  }
  _matchType;
  get matchType() {
    return this._matchType;
  }
  set matchType(matchType) {
    if (matchType === this._matchType) {
      return;
    }
    this._matchType = matchType;
    if (this.widget) {
      this.widget.matchType = this._matchType;
    }
    this.tree.refilter();
    this.render();
    this._onDidChangeMatchType.fire(matchType);
  }
  widget;
  width = 0;
  _onDidChangeMode = new Emitter();
  onDidChangeMode = this._onDidChangeMode.event;
  _onDidChangeMatchType = new Emitter();
  onDidChangeMatchType = this._onDidChangeMatchType.event;
  _onDidChangePattern = new Emitter();
  onDidChangePattern = this._onDidChangePattern.event;
  _onDidChangeOpenState = new Emitter();
  onDidChangeOpenState = this._onDidChangeOpenState.event;
  enabledDisposables = new DisposableStore();
  disposables = new DisposableStore();
  updateOptions(optionsUpdate = {}) {
    if (optionsUpdate.defaultFindMode !== void 0) {
      this.mode = optionsUpdate.defaultFindMode;
    }
    if (optionsUpdate.defaultFindMatchType !== void 0) {
      this.matchType = optionsUpdate.defaultFindMatchType;
    }
  }
  isOpened() {
    return !!this.widget;
  }
  open() {
    if (this.widget) {
      this.widget.focus();
      this.widget.select();
      return;
    }
    this.widget = new FindWidget(
      this.view.getHTMLElement(),
      this.tree,
      this.contextViewProvider,
      this.mode,
      this.matchType,
      { ...this.options, history: this._history }
    );
    this.enabledDisposables.add(this.widget);
    this.widget.onDidChangeValue(
      this.onDidChangeValue,
      this,
      this.enabledDisposables
    );
    this.widget.onDidChangeMode(
      (mode) => this.mode = mode,
      void 0,
      this.enabledDisposables
    );
    this.widget.onDidChangeMatchType(
      (matchType) => this.matchType = matchType,
      void 0,
      this.enabledDisposables
    );
    this.widget.onDidDisable(this.close, this, this.enabledDisposables);
    this.widget.layout(this.width);
    this.widget.focus();
    this.widget.value = this.previousPattern;
    this.widget.select();
    this._onDidChangeOpenState.fire(true);
  }
  close() {
    if (!this.widget) {
      return;
    }
    this._history = this.widget.getHistory();
    this.widget = void 0;
    this.enabledDisposables.clear();
    this.previousPattern = this.pattern;
    this.onDidChangeValue("");
    this.tree.domFocus();
    this._onDidChangeOpenState.fire(false);
  }
  onDidChangeValue(pattern) {
    this._pattern = pattern;
    this._onDidChangePattern.fire(pattern);
    this.filter.pattern = pattern;
    this.tree.refilter();
    if (pattern) {
      this.tree.focusNext(
        0,
        true,
        void 0,
        (node) => !FuzzyScore.isDefault(node.filterData)
      );
    }
    const focus = this.tree.getFocus();
    if (focus.length > 0) {
      const element = focus[0];
      if (this.tree.getRelativeTop(element) === null) {
        this.tree.reveal(element, 0.5);
      }
    }
    this.render();
  }
  render() {
    const noMatches = this.filter.totalCount > 0 && this.filter.matchCount === 0;
    if (this.pattern && noMatches) {
      alert(localize("replFindNoResults", "No results"));
      if (this.tree.options.showNotFoundMessage ?? true) {
        this.widget?.showMessage({
          type: MessageType.WARNING,
          content: localize("not found", "No elements found.")
        });
      } else {
        this.widget?.showMessage({ type: MessageType.WARNING });
      }
    } else {
      this.widget?.clearMessage();
      if (this.pattern) {
        alert(
          localize(
            "replFindResults",
            "{0} results",
            this.filter.matchCount
          )
        );
      }
    }
  }
  shouldAllowFocus(node) {
    if (!this.widget || !this.pattern) {
      return true;
    }
    if (this.filter.totalCount > 0 && this.filter.matchCount <= 1) {
      return true;
    }
    return !FuzzyScore.isDefault(node.filterData);
  }
  layout(width) {
    this.width = width;
    this.widget?.layout(width);
  }
  dispose() {
    this._history = void 0;
    this._onDidChangePattern.dispose();
    this.enabledDisposables.dispose();
    this.disposables.dispose();
  }
}
function stickyScrollNodeStateEquals(node1, node2) {
  return node1.position === node2.position && stickyScrollNodeEquals(node1, node2);
}
function stickyScrollNodeEquals(node1, node2) {
  return node1.node.element === node2.node.element && node1.startIndex === node2.startIndex && node1.height === node2.height && node1.endIndex === node2.endIndex;
}
class StickyScrollState {
  constructor(stickyNodes = []) {
    this.stickyNodes = stickyNodes;
  }
  get count() {
    return this.stickyNodes.length;
  }
  equal(state) {
    return equals(
      this.stickyNodes,
      state.stickyNodes,
      stickyScrollNodeStateEquals
    );
  }
  lastNodePartiallyVisible() {
    if (this.count === 0) {
      return false;
    }
    const lastStickyNode = this.stickyNodes[this.count - 1];
    if (this.count === 1) {
      return lastStickyNode.position !== 0;
    }
    const secondLastStickyNode = this.stickyNodes[this.count - 2];
    return secondLastStickyNode.position + secondLastStickyNode.height !== lastStickyNode.position;
  }
  animationStateChanged(previousState) {
    if (!equals(
      this.stickyNodes,
      previousState.stickyNodes,
      stickyScrollNodeEquals
    )) {
      return false;
    }
    if (this.count === 0) {
      return false;
    }
    const lastStickyNode = this.stickyNodes[this.count - 1];
    const previousLastStickyNode = previousState.stickyNodes[previousState.count - 1];
    return lastStickyNode.position !== previousLastStickyNode.position;
  }
}
class DefaultStickyScrollDelegate {
  constrainStickyScrollNodes(stickyNodes, stickyScrollMaxItemCount, maxWidgetHeight) {
    for (let i = 0; i < stickyNodes.length; i++) {
      const stickyNode = stickyNodes[i];
      const stickyNodeBottom = stickyNode.position + stickyNode.height;
      if (stickyNodeBottom > maxWidgetHeight || i >= stickyScrollMaxItemCount) {
        return stickyNodes.slice(0, i);
      }
    }
    return stickyNodes;
  }
}
class StickyScrollController extends Disposable {
  constructor(tree, model, view, renderers, treeDelegate, options = {}) {
    super();
    this.tree = tree;
    this.model = model;
    this.view = view;
    this.treeDelegate = treeDelegate;
    const stickyScrollOptions = this.validateStickySettings(options);
    this.stickyScrollMaxItemCount = stickyScrollOptions.stickyScrollMaxItemCount;
    this.stickyScrollDelegate = options.stickyScrollDelegate ?? new DefaultStickyScrollDelegate();
    this._widget = this._register(
      new StickyScrollWidget(
        view.getScrollableElement(),
        view,
        tree,
        renderers,
        treeDelegate,
        options.accessibilityProvider
      )
    );
    this.onDidChangeHasFocus = this._widget.onDidChangeHasFocus;
    this.onContextMenu = this._widget.onContextMenu;
    this._register(view.onDidScroll(() => this.update()));
    this._register(view.onDidChangeContentHeight(() => this.update()));
    this._register(tree.onDidChangeCollapseState(() => this.update()));
    this.update();
  }
  onDidChangeHasFocus;
  onContextMenu;
  stickyScrollDelegate;
  stickyScrollMaxItemCount;
  maxWidgetViewRatio = 0.4;
  _widget;
  get height() {
    return this._widget.height;
  }
  get count() {
    return this._widget.count;
  }
  getNode(node) {
    return this._widget.getNode(node);
  }
  getNodeAtHeight(height) {
    let index;
    if (height === 0) {
      index = this.view.firstVisibleIndex;
    } else {
      index = this.view.indexAt(height + this.view.scrollTop);
    }
    if (index < 0 || index >= this.view.length) {
      return void 0;
    }
    return this.view.element(index);
  }
  update() {
    const firstVisibleNode = this.getNodeAtHeight(0);
    if (!firstVisibleNode || this.tree.scrollTop === 0) {
      this._widget.setState(void 0);
      return;
    }
    const stickyState = this.findStickyState(firstVisibleNode);
    this._widget.setState(stickyState);
  }
  findStickyState(firstVisibleNode) {
    const stickyNodes = [];
    let firstVisibleNodeUnderWidget = firstVisibleNode;
    let stickyNodesHeight = 0;
    let nextStickyNode = this.getNextStickyNode(
      firstVisibleNodeUnderWidget,
      void 0,
      stickyNodesHeight
    );
    while (nextStickyNode) {
      stickyNodes.push(nextStickyNode);
      stickyNodesHeight += nextStickyNode.height;
      if (stickyNodes.length <= this.stickyScrollMaxItemCount) {
        firstVisibleNodeUnderWidget = this.getNextVisibleNode(nextStickyNode);
        if (!firstVisibleNodeUnderWidget) {
          break;
        }
      }
      nextStickyNode = this.getNextStickyNode(
        firstVisibleNodeUnderWidget,
        nextStickyNode.node,
        stickyNodesHeight
      );
    }
    const contrainedStickyNodes = this.constrainStickyNodes(stickyNodes);
    return contrainedStickyNodes.length ? new StickyScrollState(contrainedStickyNodes) : void 0;
  }
  getNextVisibleNode(previousStickyNode) {
    return this.getNodeAtHeight(
      previousStickyNode.position + previousStickyNode.height
    );
  }
  getNextStickyNode(firstVisibleNodeUnderWidget, previousStickyNode, stickyNodesHeight) {
    const nextStickyNode = this.getAncestorUnderPrevious(
      firstVisibleNodeUnderWidget,
      previousStickyNode
    );
    if (!nextStickyNode) {
      return void 0;
    }
    if (nextStickyNode === firstVisibleNodeUnderWidget) {
      if (!this.nodeIsUncollapsedParent(firstVisibleNodeUnderWidget)) {
        return void 0;
      }
      if (this.nodeTopAlignsWithStickyNodesBottom(
        firstVisibleNodeUnderWidget,
        stickyNodesHeight
      )) {
        return void 0;
      }
    }
    return this.createStickyScrollNode(nextStickyNode, stickyNodesHeight);
  }
  nodeTopAlignsWithStickyNodesBottom(node, stickyNodesHeight) {
    const nodeIndex = this.getNodeIndex(node);
    const elementTop = this.view.getElementTop(nodeIndex);
    const stickyPosition = stickyNodesHeight;
    return this.view.scrollTop === elementTop - stickyPosition;
  }
  createStickyScrollNode(node, currentStickyNodesHeight) {
    const height = this.treeDelegate.getHeight(node);
    const { startIndex, endIndex } = this.getNodeRange(node);
    const position = this.calculateStickyNodePosition(
      endIndex,
      currentStickyNodesHeight,
      height
    );
    return { node, position, height, startIndex, endIndex };
  }
  getAncestorUnderPrevious(node, previousAncestor = void 0) {
    let currentAncestor = node;
    let parentOfcurrentAncestor = this.getParentNode(currentAncestor);
    while (parentOfcurrentAncestor) {
      if (parentOfcurrentAncestor === previousAncestor) {
        return currentAncestor;
      }
      currentAncestor = parentOfcurrentAncestor;
      parentOfcurrentAncestor = this.getParentNode(currentAncestor);
    }
    if (previousAncestor === void 0) {
      return currentAncestor;
    }
    return void 0;
  }
  calculateStickyNodePosition(lastDescendantIndex, stickyRowPositionTop, stickyNodeHeight) {
    let lastChildRelativeTop = this.view.getRelativeTop(lastDescendantIndex);
    if (lastChildRelativeTop === null && this.view.firstVisibleIndex === lastDescendantIndex && lastDescendantIndex + 1 < this.view.length) {
      const nodeHeight = this.treeDelegate.getHeight(
        this.view.element(lastDescendantIndex)
      );
      const nextNodeRelativeTop = this.view.getRelativeTop(
        lastDescendantIndex + 1
      );
      lastChildRelativeTop = nextNodeRelativeTop ? nextNodeRelativeTop - nodeHeight / this.view.renderHeight : null;
    }
    if (lastChildRelativeTop === null) {
      return stickyRowPositionTop;
    }
    const lastChildNode = this.view.element(lastDescendantIndex);
    const lastChildHeight = this.treeDelegate.getHeight(lastChildNode);
    const topOfLastChild = lastChildRelativeTop * this.view.renderHeight;
    const bottomOfLastChild = topOfLastChild + lastChildHeight;
    if (stickyRowPositionTop + stickyNodeHeight > bottomOfLastChild && stickyRowPositionTop <= bottomOfLastChild) {
      return bottomOfLastChild - stickyNodeHeight;
    }
    return stickyRowPositionTop;
  }
  constrainStickyNodes(stickyNodes) {
    if (stickyNodes.length === 0) {
      return [];
    }
    const maximumStickyWidgetHeight = this.view.renderHeight * this.maxWidgetViewRatio;
    const lastStickyNode = stickyNodes[stickyNodes.length - 1];
    if (stickyNodes.length <= this.stickyScrollMaxItemCount && lastStickyNode.position + lastStickyNode.height <= maximumStickyWidgetHeight) {
      return stickyNodes;
    }
    const constrainedStickyNodes = this.stickyScrollDelegate.constrainStickyScrollNodes(
      stickyNodes,
      this.stickyScrollMaxItemCount,
      maximumStickyWidgetHeight
    );
    if (!constrainedStickyNodes.length) {
      return [];
    }
    const lastConstrainedStickyNode = constrainedStickyNodes[constrainedStickyNodes.length - 1];
    if (constrainedStickyNodes.length > this.stickyScrollMaxItemCount || lastConstrainedStickyNode.position + lastConstrainedStickyNode.height > maximumStickyWidgetHeight) {
      throw new Error("stickyScrollDelegate violates constraints");
    }
    return constrainedStickyNodes;
  }
  getParentNode(node) {
    const nodeLocation = this.model.getNodeLocation(node);
    const parentLocation = this.model.getParentNodeLocation(nodeLocation);
    return parentLocation ? this.model.getNode(parentLocation) : void 0;
  }
  nodeIsUncollapsedParent(node) {
    const nodeLocation = this.model.getNodeLocation(node);
    return this.model.getListRenderCount(nodeLocation) > 1;
  }
  getNodeIndex(node) {
    const nodeLocation = this.model.getNodeLocation(node);
    const nodeIndex = this.model.getListIndex(nodeLocation);
    return nodeIndex;
  }
  getNodeRange(node) {
    const nodeLocation = this.model.getNodeLocation(node);
    const startIndex = this.model.getListIndex(nodeLocation);
    if (startIndex < 0) {
      throw new Error("Node not found in tree");
    }
    const renderCount = this.model.getListRenderCount(nodeLocation);
    const endIndex = startIndex + renderCount - 1;
    return { startIndex, endIndex };
  }
  nodePositionTopBelowWidget(node) {
    const ancestors = [];
    let currentAncestor = this.getParentNode(node);
    while (currentAncestor) {
      ancestors.push(currentAncestor);
      currentAncestor = this.getParentNode(currentAncestor);
    }
    let widgetHeight = 0;
    for (let i = 0; i < ancestors.length && i < this.stickyScrollMaxItemCount; i++) {
      widgetHeight += this.treeDelegate.getHeight(ancestors[i]);
    }
    return widgetHeight;
  }
  getFocus() {
    return this._widget.getFocus();
  }
  domFocus() {
    this._widget.domFocus();
  }
  // Whether sticky scroll was the last focused part in the tree or not
  focusedLast() {
    return this._widget.focusedLast();
  }
  updateOptions(optionsUpdate = {}) {
    if (!optionsUpdate.stickyScrollMaxItemCount) {
      return;
    }
    const validatedOptions = this.validateStickySettings(optionsUpdate);
    if (this.stickyScrollMaxItemCount !== validatedOptions.stickyScrollMaxItemCount) {
      this.stickyScrollMaxItemCount = validatedOptions.stickyScrollMaxItemCount;
      this.update();
    }
  }
  validateStickySettings(options) {
    let stickyScrollMaxItemCount = 7;
    if (typeof options.stickyScrollMaxItemCount === "number") {
      stickyScrollMaxItemCount = Math.max(
        options.stickyScrollMaxItemCount,
        1
      );
    }
    return { stickyScrollMaxItemCount };
  }
  setModel(model) {
    this.model = model;
  }
}
class StickyScrollWidget {
  constructor(container, view, tree, treeRenderers, treeDelegate, accessibilityProvider) {
    this.view = view;
    this.tree = tree;
    this.treeRenderers = treeRenderers;
    this.treeDelegate = treeDelegate;
    this.accessibilityProvider = accessibilityProvider;
    this._rootDomNode = $(".monaco-tree-sticky-container.empty");
    container.appendChild(this._rootDomNode);
    const shadow = $(".monaco-tree-sticky-container-shadow");
    this._rootDomNode.appendChild(shadow);
    this.stickyScrollFocus = new StickyScrollFocus(this._rootDomNode, view);
    this.onDidChangeHasFocus = this.stickyScrollFocus.onDidChangeHasFocus;
    this.onContextMenu = this.stickyScrollFocus.onContextMenu;
  }
  _rootDomNode;
  _previousState;
  _previousElements = [];
  _previousStateDisposables = new DisposableStore();
  stickyScrollFocus;
  onDidChangeHasFocus;
  onContextMenu;
  get height() {
    if (!this._previousState) {
      return 0;
    }
    const lastElement = this._previousState.stickyNodes[this._previousState.count - 1];
    return lastElement.position + lastElement.height;
  }
  get count() {
    return this._previousState?.count ?? 0;
  }
  getNode(node) {
    return this._previousState?.stickyNodes.find(
      (stickyNode) => stickyNode.node === node
    );
  }
  setState(state) {
    const wasVisible = !!this._previousState && this._previousState.count > 0;
    const isVisible = !!state && state.count > 0;
    if (!wasVisible && !isVisible || wasVisible && isVisible && this._previousState.equal(state)) {
      return;
    }
    if (wasVisible !== isVisible) {
      this.setVisible(isVisible);
    }
    if (!isVisible) {
      this._previousState = void 0;
      this._previousElements = [];
      this._previousStateDisposables.clear();
      return;
    }
    const lastStickyNode = state.stickyNodes[state.count - 1];
    if (this._previousState && state.animationStateChanged(this._previousState)) {
      this._previousElements[this._previousState.count - 1].style.top = `${lastStickyNode.position}px`;
    } else {
      this._previousStateDisposables.clear();
      const elements = Array(state.count);
      for (let stickyIndex = state.count - 1; stickyIndex >= 0; stickyIndex--) {
        const stickyNode = state.stickyNodes[stickyIndex];
        const { element, disposable } = this.createElement(
          stickyNode,
          stickyIndex,
          state.count
        );
        elements[stickyIndex] = element;
        this._rootDomNode.appendChild(element);
        this._previousStateDisposables.add(disposable);
      }
      this.stickyScrollFocus.updateElements(elements, state);
      this._previousElements = elements;
    }
    this._previousState = state;
    this._rootDomNode.style.height = `${lastStickyNode.position + lastStickyNode.height}px`;
  }
  createElement(stickyNode, stickyIndex, stickyNodesTotal) {
    const nodeIndex = stickyNode.startIndex;
    const stickyElement = document.createElement("div");
    stickyElement.style.top = `${stickyNode.position}px`;
    if (this.tree.options.setRowHeight !== false) {
      stickyElement.style.height = `${stickyNode.height}px`;
    }
    if (this.tree.options.setRowLineHeight !== false) {
      stickyElement.style.lineHeight = `${stickyNode.height}px`;
    }
    stickyElement.classList.add("monaco-tree-sticky-row");
    stickyElement.classList.add("monaco-list-row");
    stickyElement.setAttribute("data-index", `${nodeIndex}`);
    stickyElement.setAttribute(
      "data-parity",
      nodeIndex % 2 === 0 ? "even" : "odd"
    );
    stickyElement.setAttribute("id", this.view.getElementID(nodeIndex));
    const accessibilityDisposable = this.setAccessibilityAttributes(
      stickyElement,
      stickyNode.node.element,
      stickyIndex,
      stickyNodesTotal
    );
    const nodeTemplateId = this.treeDelegate.getTemplateId(stickyNode.node);
    const renderer = this.treeRenderers.find(
      (renderer2) => renderer2.templateId === nodeTemplateId
    );
    if (!renderer) {
      throw new Error(
        `No renderer found for template id ${nodeTemplateId}`
      );
    }
    let nodeCopy = stickyNode.node;
    if (nodeCopy === this.tree.getNode(this.tree.getNodeLocation(stickyNode.node))) {
      nodeCopy = new Proxy(stickyNode.node, {});
    }
    const templateData = renderer.renderTemplate(stickyElement);
    renderer.renderElement(
      nodeCopy,
      stickyNode.startIndex,
      templateData,
      stickyNode.height
    );
    const disposable = toDisposable(() => {
      accessibilityDisposable.dispose();
      renderer.disposeElement(
        nodeCopy,
        stickyNode.startIndex,
        templateData,
        stickyNode.height
      );
      renderer.disposeTemplate(templateData);
      stickyElement.remove();
    });
    return { element: stickyElement, disposable };
  }
  setAccessibilityAttributes(container, element, stickyIndex, stickyNodesTotal) {
    if (!this.accessibilityProvider) {
      return Disposable.None;
    }
    if (this.accessibilityProvider.getSetSize) {
      container.setAttribute(
        "aria-setsize",
        String(
          this.accessibilityProvider.getSetSize(
            element,
            stickyIndex,
            stickyNodesTotal
          )
        )
      );
    }
    if (this.accessibilityProvider.getPosInSet) {
      container.setAttribute(
        "aria-posinset",
        String(
          this.accessibilityProvider.getPosInSet(
            element,
            stickyIndex
          )
        )
      );
    }
    if (this.accessibilityProvider.getRole) {
      container.setAttribute(
        "role",
        this.accessibilityProvider.getRole(element) ?? "treeitem"
      );
    }
    const ariaLabel = this.accessibilityProvider.getAriaLabel(element);
    const observable = ariaLabel && typeof ariaLabel !== "string" ? ariaLabel : constObservable(ariaLabel);
    const result = autorun((reader) => {
      const value = reader.readObservable(observable);
      if (value) {
        container.setAttribute("aria-label", value);
      } else {
        container.removeAttribute("aria-label");
      }
    });
    if (typeof ariaLabel === "string") {
    } else if (ariaLabel) {
      container.setAttribute("aria-label", ariaLabel.get());
    }
    const ariaLevel = this.accessibilityProvider.getAriaLevel && this.accessibilityProvider.getAriaLevel(element);
    if (typeof ariaLevel === "number") {
      container.setAttribute("aria-level", `${ariaLevel}`);
    }
    container.setAttribute("aria-selected", String(false));
    return result;
  }
  setVisible(visible) {
    this._rootDomNode.classList.toggle("empty", !visible);
    if (!visible) {
      this.stickyScrollFocus.updateElements([], void 0);
    }
  }
  getFocus() {
    return this.stickyScrollFocus.getFocus();
  }
  domFocus() {
    this.stickyScrollFocus.domFocus();
  }
  focusedLast() {
    return this.stickyScrollFocus.focusedLast();
  }
  dispose() {
    this.stickyScrollFocus.dispose();
    this._previousStateDisposables.dispose();
    this._rootDomNode.remove();
  }
}
class StickyScrollFocus extends Disposable {
  constructor(container, view) {
    super();
    this.container = container;
    this.view = view;
    this._register(
      addDisposableListener(
        this.container,
        "focus",
        () => this.onFocus()
      )
    );
    this._register(
      addDisposableListener(this.container, "blur", () => this.onBlur())
    );
    this._register(
      this.view.onDidFocus(() => this.toggleStickyScrollFocused(false))
    );
    this._register(this.view.onKeyDown((e) => this.onKeyDown(e)));
    this._register(this.view.onMouseDown((e) => this.onMouseDown(e)));
    this._register(
      this.view.onContextMenu((e) => this.handleContextMenu(e))
    );
  }
  focusedIndex = -1;
  elements = [];
  state;
  _onDidChangeHasFocus = new Emitter();
  onDidChangeHasFocus = this._onDidChangeHasFocus.event;
  _onContextMenu = new Emitter();
  onContextMenu = this._onContextMenu.event;
  _domHasFocus = false;
  get domHasFocus() {
    return this._domHasFocus;
  }
  set domHasFocus(hasFocus) {
    if (hasFocus !== this._domHasFocus) {
      this._onDidChangeHasFocus.fire(hasFocus);
      this._domHasFocus = hasFocus;
    }
  }
  handleContextMenu(e) {
    const target = e.browserEvent.target;
    if (!isStickyScrollContainer(target) && !isStickyScrollElement(target)) {
      if (this.focusedLast()) {
        this.view.domFocus();
      }
      return;
    }
    if (!isKeyboardEvent(e.browserEvent)) {
      if (!this.state) {
        throw new Error(
          "Context menu should not be triggered when state is undefined"
        );
      }
      const stickyIndex = this.state.stickyNodes.findIndex(
        (stickyNode2) => stickyNode2.node.element === e.element?.element
      );
      if (stickyIndex === -1) {
        throw new Error(
          "Context menu should not be triggered when element is not in sticky scroll widget"
        );
      }
      this.container.focus();
      this.setFocus(stickyIndex);
      return;
    }
    if (!this.state || this.focusedIndex < 0) {
      throw new Error(
        "Context menu key should not be triggered when focus is not in sticky scroll widget"
      );
    }
    const stickyNode = this.state.stickyNodes[this.focusedIndex];
    const element = stickyNode.node.element;
    const anchor = this.elements[this.focusedIndex];
    this._onContextMenu.fire({
      element,
      anchor,
      browserEvent: e.browserEvent,
      isStickyScroll: true
    });
  }
  onKeyDown(e) {
    if (this.domHasFocus && this.state) {
      if (e.key === "ArrowUp") {
        this.setFocusedElement(Math.max(0, this.focusedIndex - 1));
        e.preventDefault();
        e.stopPropagation();
      } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        if (this.focusedIndex >= this.state.count - 1) {
          const nodeIndexToFocus = this.state.stickyNodes[this.state.count - 1].startIndex + 1;
          this.view.domFocus();
          this.view.setFocus([nodeIndexToFocus]);
          this.scrollNodeUnderWidget(nodeIndexToFocus, this.state);
        } else {
          this.setFocusedElement(this.focusedIndex + 1);
        }
        e.preventDefault();
        e.stopPropagation();
      }
    }
  }
  onMouseDown(e) {
    const target = e.browserEvent.target;
    if (!isStickyScrollContainer(target) && !isStickyScrollElement(target)) {
      return;
    }
    e.browserEvent.preventDefault();
    e.browserEvent.stopPropagation();
  }
  updateElements(elements, state) {
    if (state && state.count === 0) {
      throw new Error(
        "Sticky scroll state must be undefined when there are no sticky nodes"
      );
    }
    if (state && state.count !== elements.length) {
      throw new Error("Sticky scroll focus received illigel state");
    }
    const previousIndex = this.focusedIndex;
    this.removeFocus();
    this.elements = elements;
    this.state = state;
    if (state) {
      const newFocusedIndex = clamp(previousIndex, 0, state.count - 1);
      this.setFocus(newFocusedIndex);
    } else if (this.domHasFocus) {
      this.view.domFocus();
    }
    this.container.tabIndex = state ? 0 : -1;
  }
  setFocusedElement(stickyIndex) {
    const state = this.state;
    if (!state) {
      throw new Error("Cannot set focus when state is undefined");
    }
    this.setFocus(stickyIndex);
    if (stickyIndex < state.count - 1) {
      return;
    }
    if (state.lastNodePartiallyVisible()) {
      const lastStickyNode = state.stickyNodes[stickyIndex];
      this.scrollNodeUnderWidget(lastStickyNode.endIndex + 1, state);
    }
  }
  scrollNodeUnderWidget(nodeIndex, state) {
    const lastStickyNode = state.stickyNodes[state.count - 1];
    const secondLastStickyNode = state.count > 1 ? state.stickyNodes[state.count - 2] : void 0;
    const elementScrollTop = this.view.getElementTop(nodeIndex);
    const elementTargetViewTop = secondLastStickyNode ? secondLastStickyNode.position + secondLastStickyNode.height + lastStickyNode.height : lastStickyNode.height;
    this.view.scrollTop = elementScrollTop - elementTargetViewTop;
  }
  getFocus() {
    if (!this.state || this.focusedIndex === -1) {
      return void 0;
    }
    return this.state.stickyNodes[this.focusedIndex].node.element;
  }
  domFocus() {
    if (!this.state) {
      throw new Error("Cannot focus when state is undefined");
    }
    this.container.focus();
  }
  focusedLast() {
    if (!this.state) {
      return false;
    }
    return this.view.getHTMLElement().classList.contains("sticky-scroll-focused");
  }
  removeFocus() {
    if (this.focusedIndex === -1) {
      return;
    }
    this.toggleElementFocus(this.elements[this.focusedIndex], false);
    this.focusedIndex = -1;
  }
  setFocus(newFocusIndex) {
    if (newFocusIndex < 0) {
      throw new Error("addFocus() can not remove focus");
    }
    if (!this.state && newFocusIndex >= 0) {
      throw new Error("Cannot set focus index when state is undefined");
    }
    if (this.state && newFocusIndex >= this.state.count) {
      throw new Error(
        "Cannot set focus index to an index that does not exist"
      );
    }
    const oldIndex = this.focusedIndex;
    if (oldIndex >= 0) {
      this.toggleElementFocus(this.elements[oldIndex], false);
    }
    if (newFocusIndex >= 0) {
      this.toggleElementFocus(this.elements[newFocusIndex], true);
    }
    this.focusedIndex = newFocusIndex;
  }
  toggleElementFocus(element, focused) {
    this.toggleElementActiveFocus(element, focused && this.domHasFocus);
    this.toggleElementPassiveFocus(element, focused);
  }
  toggleCurrentElementActiveFocus(focused) {
    if (this.focusedIndex === -1) {
      return;
    }
    this.toggleElementActiveFocus(
      this.elements[this.focusedIndex],
      focused
    );
  }
  toggleElementActiveFocus(element, focused) {
    element.classList.toggle("focused", focused);
  }
  toggleElementPassiveFocus(element, focused) {
    element.classList.toggle("passive-focused", focused);
  }
  toggleStickyScrollFocused(focused) {
    this.view.getHTMLElement().classList.toggle("sticky-scroll-focused", focused);
  }
  onFocus() {
    if (!this.state || this.elements.length === 0) {
      throw new Error(
        "Cannot focus when state is undefined or elements are empty"
      );
    }
    this.domHasFocus = true;
    this.toggleStickyScrollFocused(true);
    this.toggleCurrentElementActiveFocus(true);
    if (this.focusedIndex === -1) {
      this.setFocus(0);
    }
  }
  onBlur() {
    this.domHasFocus = false;
    this.toggleCurrentElementActiveFocus(false);
  }
  dispose() {
    this.toggleStickyScrollFocused(false);
    this._onDidChangeHasFocus.fire(false);
    super.dispose();
  }
}
function asTreeMouseEvent(event) {
  let target = TreeMouseEventTarget.Unknown;
  if (hasParentWithClass(
    event.browserEvent.target,
    "monaco-tl-twistie",
    "monaco-tl-row"
  )) {
    target = TreeMouseEventTarget.Twistie;
  } else if (hasParentWithClass(
    event.browserEvent.target,
    "monaco-tl-contents",
    "monaco-tl-row"
  )) {
    target = TreeMouseEventTarget.Element;
  } else if (hasParentWithClass(
    event.browserEvent.target,
    "monaco-tree-type-filter",
    "monaco-list"
  )) {
    target = TreeMouseEventTarget.Filter;
  }
  return {
    browserEvent: event.browserEvent,
    element: event.element ? event.element.element : null,
    target
  };
}
function asTreeContextMenuEvent(event) {
  const isStickyScroll = isStickyScrollContainer(
    event.browserEvent.target
  );
  return {
    element: event.element ? event.element.element : null,
    browserEvent: event.browserEvent,
    anchor: event.anchor,
    isStickyScroll
  };
}
function dfs(node, fn) {
  fn(node);
  node.children.forEach((child) => dfs(child, fn));
}
class Trait {
  constructor(getFirstViewElementWithTrait, identityProvider) {
    this.getFirstViewElementWithTrait = getFirstViewElementWithTrait;
    this.identityProvider = identityProvider;
  }
  nodes = [];
  elements;
  _onDidChange = new Emitter();
  onDidChange = this._onDidChange.event;
  _nodeSet;
  get nodeSet() {
    if (!this._nodeSet) {
      this._nodeSet = this.createNodeSet();
    }
    return this._nodeSet;
  }
  set(nodes, browserEvent) {
    if (!browserEvent?.__forceEvent && equals(this.nodes, nodes)) {
      return;
    }
    this._set(nodes, false, browserEvent);
  }
  _set(nodes, silent, browserEvent) {
    this.nodes = [...nodes];
    this.elements = void 0;
    this._nodeSet = void 0;
    if (!silent) {
      const that = this;
      this._onDidChange.fire({
        get elements() {
          return that.get();
        },
        browserEvent
      });
    }
  }
  get() {
    if (!this.elements) {
      this.elements = this.nodes.map((node) => node.element);
    }
    return [...this.elements];
  }
  getNodes() {
    return this.nodes;
  }
  has(node) {
    return this.nodeSet.has(node);
  }
  onDidModelSplice({
    insertedNodes,
    deletedNodes
  }) {
    if (!this.identityProvider) {
      const set = this.createNodeSet();
      const visit = (node) => set.delete(node);
      deletedNodes.forEach((node) => dfs(node, visit));
      this.set([...set.values()]);
      return;
    }
    const deletedNodesIdSet = /* @__PURE__ */ new Set();
    const deletedNodesVisitor = (node) => deletedNodesIdSet.add(
      this.identityProvider.getId(node.element).toString()
    );
    deletedNodes.forEach((node) => dfs(node, deletedNodesVisitor));
    const insertedNodesMap = /* @__PURE__ */ new Map();
    const insertedNodesVisitor = (node) => insertedNodesMap.set(
      this.identityProvider.getId(node.element).toString(),
      node
    );
    insertedNodes.forEach((node) => dfs(node, insertedNodesVisitor));
    const nodes = [];
    for (const node of this.nodes) {
      const id = this.identityProvider.getId(node.element).toString();
      const wasDeleted = deletedNodesIdSet.has(id);
      if (wasDeleted) {
        const insertedNode = insertedNodesMap.get(id);
        if (insertedNode && insertedNode.visible) {
          nodes.push(insertedNode);
        }
      } else {
        nodes.push(node);
      }
    }
    if (this.nodes.length > 0 && nodes.length === 0) {
      const node = this.getFirstViewElementWithTrait();
      if (node) {
        nodes.push(node);
      }
    }
    this._set(nodes, true);
  }
  createNodeSet() {
    const set = /* @__PURE__ */ new Set();
    for (const node of this.nodes) {
      set.add(node);
    }
    return set;
  }
}
class TreeNodeListMouseController extends MouseController {
  constructor(list, tree, stickyScrollProvider) {
    super(list);
    this.tree = tree;
    this.stickyScrollProvider = stickyScrollProvider;
  }
  onViewPointer(e) {
    if (isButton(e.browserEvent.target) || isEditableElement(e.browserEvent.target) || isMonacoEditor(e.browserEvent.target)) {
      return;
    }
    if (e.browserEvent.isHandledByList) {
      return;
    }
    const node = e.element;
    if (!node) {
      return super.onViewPointer(e);
    }
    if (this.isSelectionRangeChangeEvent(e) || this.isSelectionSingleChangeEvent(e)) {
      return super.onViewPointer(e);
    }
    const target = e.browserEvent.target;
    const onTwistie = target.classList.contains("monaco-tl-twistie") || target.classList.contains("monaco-icon-label") && target.classList.contains("folder-icon") && e.browserEvent.offsetX < 16;
    const isStickyElement = isStickyScrollElement(
      e.browserEvent.target
    );
    let expandOnlyOnTwistieClick = false;
    if (isStickyElement) {
      expandOnlyOnTwistieClick = true;
    } else if (typeof this.tree.expandOnlyOnTwistieClick === "function") {
      expandOnlyOnTwistieClick = this.tree.expandOnlyOnTwistieClick(
        node.element
      );
    } else {
      expandOnlyOnTwistieClick = !!this.tree.expandOnlyOnTwistieClick;
    }
    if (isStickyElement) {
      this.handleStickyScrollMouseEvent(e, node);
    } else {
      if (expandOnlyOnTwistieClick && !onTwistie && e.browserEvent.detail !== 2) {
        return super.onViewPointer(e);
      }
      if (!this.tree.expandOnDoubleClick && e.browserEvent.detail === 2) {
        return super.onViewPointer(e);
      }
    }
    if (node.collapsible && (!isStickyElement || onTwistie)) {
      const location = this.tree.getNodeLocation(node);
      const recursive = e.browserEvent.altKey;
      this.tree.setFocus([location]);
      this.tree.toggleCollapsed(location, recursive);
      if (onTwistie) {
        e.browserEvent.isHandledByList = true;
        return;
      }
    }
    if (!isStickyElement) {
      super.onViewPointer(e);
    }
  }
  handleStickyScrollMouseEvent(e, node) {
    if (isMonacoCustomToggle(e.browserEvent.target) || isActionItem(e.browserEvent.target)) {
      return;
    }
    const stickyScrollController = this.stickyScrollProvider();
    if (!stickyScrollController) {
      throw new Error("Sticky scroll controller not found");
    }
    const nodeIndex = this.list.indexOf(node);
    const elementScrollTop = this.list.getElementTop(nodeIndex);
    const elementTargetViewTop = stickyScrollController.nodePositionTopBelowWidget(node);
    this.tree.scrollTop = elementScrollTop - elementTargetViewTop;
    this.list.domFocus();
    this.list.setFocus([nodeIndex]);
    this.list.setSelection([nodeIndex]);
  }
  onDoubleClick(e) {
    const onTwistie = e.browserEvent.target.classList.contains("monaco-tl-twistie");
    if (onTwistie || !this.tree.expandOnDoubleClick) {
      return;
    }
    if (e.browserEvent.isHandledByList) {
      return;
    }
    super.onDoubleClick(e);
  }
  // to make sure dom focus is not stolen (for example with context menu)
  onMouseDown(e) {
    const target = e.browserEvent.target;
    if (!isStickyScrollContainer(target) && !isStickyScrollElement(target)) {
      super.onMouseDown(e);
      return;
    }
  }
  onContextMenu(e) {
    const target = e.browserEvent.target;
    if (!isStickyScrollContainer(target) && !isStickyScrollElement(target)) {
      super.onContextMenu(e);
      return;
    }
  }
}
class TreeNodeList extends List {
  constructor(user, container, virtualDelegate, renderers, focusTrait, selectionTrait, anchorTrait, options) {
    super(user, container, virtualDelegate, renderers, options);
    this.focusTrait = focusTrait;
    this.selectionTrait = selectionTrait;
    this.anchorTrait = anchorTrait;
  }
  createMouseController(options) {
    return new TreeNodeListMouseController(
      this,
      options.tree,
      options.stickyScrollProvider
    );
  }
  splice(start, deleteCount, elements = []) {
    super.splice(start, deleteCount, elements);
    if (elements.length === 0) {
      return;
    }
    const additionalFocus = [];
    const additionalSelection = [];
    let anchor;
    elements.forEach((node, index) => {
      if (this.focusTrait.has(node)) {
        additionalFocus.push(start + index);
      }
      if (this.selectionTrait.has(node)) {
        additionalSelection.push(start + index);
      }
      if (this.anchorTrait.has(node)) {
        anchor = start + index;
      }
    });
    if (additionalFocus.length > 0) {
      super.setFocus(distinct([...super.getFocus(), ...additionalFocus]));
    }
    if (additionalSelection.length > 0) {
      super.setSelection(
        distinct([...super.getSelection(), ...additionalSelection])
      );
    }
    if (typeof anchor === "number") {
      super.setAnchor(anchor);
    }
  }
  setFocus(indexes, browserEvent, fromAPI = false) {
    super.setFocus(indexes, browserEvent);
    if (!fromAPI) {
      this.focusTrait.set(
        indexes.map((i) => this.element(i)),
        browserEvent
      );
    }
  }
  setSelection(indexes, browserEvent, fromAPI = false) {
    super.setSelection(indexes, browserEvent);
    if (!fromAPI) {
      this.selectionTrait.set(
        indexes.map((i) => this.element(i)),
        browserEvent
      );
    }
  }
  setAnchor(index, fromAPI = false) {
    super.setAnchor(index);
    if (!fromAPI) {
      if (typeof index === "undefined") {
        this.anchorTrait.set([]);
      } else {
        this.anchorTrait.set([this.element(index)]);
      }
    }
  }
}
var AbstractTreePart = /* @__PURE__ */ ((AbstractTreePart2) => {
  AbstractTreePart2[AbstractTreePart2["Tree"] = 0] = "Tree";
  AbstractTreePart2[AbstractTreePart2["StickyScroll"] = 1] = "StickyScroll";
  return AbstractTreePart2;
})(AbstractTreePart || {});
class AbstractTree {
  constructor(_user, container, delegate, renderers, _options = {}) {
    this._user = _user;
    this._options = _options;
    let filter;
    if (_options.keyboardNavigationLabelProvider) {
      filter = new FindFilter(
        this,
        _options.keyboardNavigationLabelProvider,
        _options.filter
      );
      _options = {
        ..._options,
        filter
      };
      this.disposables.add(filter);
    }
    this.model = this.createModel(_user, _options);
    this.treeDelegate = new ComposedTreeDelegate(delegate);
    const activeNodes = this.disposables.add(
      new EventCollection(this.onDidChangeActiveNodesRelay.event)
    );
    const renderedIndentGuides = new SetMap();
    this.renderers = renderers.map(
      (r) => new TreeRenderer(
        r,
        this.model,
        this.onDidChangeCollapseStateRelay.event,
        activeNodes,
        renderedIndentGuides,
        _options
      )
    );
    for (const r of this.renderers) {
      this.disposables.add(r);
    }
    this.focus = new Trait(
      () => this.view.getFocusedElements()[0],
      _options.identityProvider
    );
    this.selection = new Trait(
      () => this.view.getSelectedElements()[0],
      _options.identityProvider
    );
    this.anchor = new Trait(
      () => this.view.getAnchorElement(),
      _options.identityProvider
    );
    this.view = new TreeNodeList(
      _user,
      container,
      this.treeDelegate,
      this.renderers,
      this.focus,
      this.selection,
      this.anchor,
      {
        ...asListOptions(() => this.model, _options),
        tree: this,
        stickyScrollProvider: () => this.stickyScrollController
      }
    );
    this.setupModel(this.model);
    if (_options.keyboardSupport !== false) {
      const onKeyDown = Event.chain(
        this.view.onKeyDown,
        ($2) => $2.filter(
          (e) => !isEditableElement(e.target)
        ).map((e) => new StandardKeyboardEvent(e))
      );
      Event.chain(
        onKeyDown,
        ($2) => $2.filter((e) => e.keyCode === KeyCode.LeftArrow)
      )(this.onLeftArrow, this, this.disposables);
      Event.chain(
        onKeyDown,
        ($2) => $2.filter((e) => e.keyCode === KeyCode.RightArrow)
      )(this.onRightArrow, this, this.disposables);
      Event.chain(
        onKeyDown,
        ($2) => $2.filter((e) => e.keyCode === KeyCode.Space)
      )(this.onSpace, this, this.disposables);
    }
    if ((_options.findWidgetEnabled ?? true) && _options.keyboardNavigationLabelProvider && _options.contextViewProvider) {
      const opts = this.options.findWidgetStyles ? { styles: this.options.findWidgetStyles } : void 0;
      this.findController = new FindController(
        this,
        this.view,
        filter,
        _options.contextViewProvider,
        opts
      );
      this.focusNavigationFilter = (node) => this.findController.shouldAllowFocus(node);
      this.onDidChangeFindOpenState = this.findController.onDidChangeOpenState;
      this.disposables.add(this.findController);
      this.onDidChangeFindMode = this.findController.onDidChangeMode;
      this.onDidChangeFindMatchType = this.findController.onDidChangeMatchType;
      this.disposables.add(
        this.onDidSpliceModelRelay.event(() => {
          if (!this.findController.isOpened() || this.findController.pattern.length === 0) {
            return;
          }
          this.refilter();
          this.findController.render();
        })
      );
    } else {
      this.onDidChangeFindMode = Event.None;
      this.onDidChangeFindMatchType = Event.None;
    }
    if (_options.enableStickyScroll) {
      this.stickyScrollController = new StickyScrollController(
        this,
        this.model,
        this.view,
        this.renderers,
        this.treeDelegate,
        _options
      );
      this.onDidChangeStickyScrollFocused = this.stickyScrollController.onDidChangeHasFocus;
    }
    this.styleElement = createStyleSheet(this.view.getHTMLElement());
    this.getHTMLElement().classList.toggle(
      "always",
      this._options.renderIndentGuides === "always" /* Always */
    );
  }
  view;
  renderers;
  model;
  treeDelegate;
  focus;
  selection;
  anchor;
  eventBufferer = new EventBufferer();
  findController;
  onDidChangeFindOpenState = Event.None;
  onDidChangeStickyScrollFocused = Event.None;
  focusNavigationFilter;
  stickyScrollController;
  styleElement;
  disposables = new DisposableStore();
  get onDidScroll() {
    return this.view.onDidScroll;
  }
  get onDidChangeFocus() {
    return this.eventBufferer.wrapEvent(this.focus.onDidChange);
  }
  get onDidChangeSelection() {
    return this.eventBufferer.wrapEvent(this.selection.onDidChange);
  }
  get onMouseClick() {
    return Event.map(this.view.onMouseClick, asTreeMouseEvent);
  }
  get onMouseDblClick() {
    return Event.filter(
      Event.map(this.view.onMouseDblClick, asTreeMouseEvent),
      (e) => e.target !== TreeMouseEventTarget.Filter
    );
  }
  get onMouseOver() {
    return Event.map(this.view.onMouseOver, asTreeMouseEvent);
  }
  get onMouseOut() {
    return Event.map(this.view.onMouseOut, asTreeMouseEvent);
  }
  get onContextMenu() {
    return Event.any(
      Event.filter(
        Event.map(this.view.onContextMenu, asTreeContextMenuEvent),
        (e) => !e.isStickyScroll
      ),
      this.stickyScrollController?.onContextMenu ?? Event.None
    );
  }
  get onTap() {
    return Event.map(this.view.onTap, asTreeMouseEvent);
  }
  get onPointer() {
    return Event.map(this.view.onPointer, asTreeMouseEvent);
  }
  get onKeyDown() {
    return this.view.onKeyDown;
  }
  get onKeyUp() {
    return this.view.onKeyUp;
  }
  get onKeyPress() {
    return this.view.onKeyPress;
  }
  get onDidFocus() {
    return this.view.onDidFocus;
  }
  get onDidBlur() {
    return this.view.onDidBlur;
  }
  onDidSwapModel = this.disposables.add(new Emitter());
  onDidChangeModelRelay = this.disposables.add(
    new Relay()
  );
  onDidSpliceModelRelay = this.disposables.add(
    new Relay()
  );
  onDidChangeCollapseStateRelay = this.disposables.add(
    new Relay()
  );
  onDidChangeRenderNodeCountRelay = this.disposables.add(
    new Relay()
  );
  onDidChangeActiveNodesRelay = this.disposables.add(
    new Relay()
  );
  get onDidChangeModel() {
    return Event.any(
      this.onDidChangeModelRelay.event,
      this.onDidSwapModel.event
    );
  }
  get onDidChangeCollapseState() {
    return this.model.onDidChangeCollapseState;
  }
  get onDidChangeRenderNodeCount() {
    return this.model.onDidChangeRenderNodeCount;
  }
  _onWillRefilter = new Emitter();
  onWillRefilter = this._onWillRefilter.event;
  get findMode() {
    return this.findController?.mode ?? 0 /* Highlight */;
  }
  set findMode(findMode) {
    if (this.findController) {
      this.findController.mode = findMode;
    }
  }
  onDidChangeFindMode;
  get findMatchType() {
    return this.findController?.matchType ?? 0 /* Fuzzy */;
  }
  set findMatchType(findFuzzy) {
    if (this.findController) {
      this.findController.matchType = findFuzzy;
    }
  }
  onDidChangeFindMatchType;
  get onDidChangeFindPattern() {
    return this.findController ? this.findController.onDidChangePattern : Event.None;
  }
  get expandOnDoubleClick() {
    return typeof this._options.expandOnDoubleClick === "undefined" ? true : this._options.expandOnDoubleClick;
  }
  get expandOnlyOnTwistieClick() {
    return typeof this._options.expandOnlyOnTwistieClick === "undefined" ? true : this._options.expandOnlyOnTwistieClick;
  }
  _onDidUpdateOptions = new Emitter();
  onDidUpdateOptions = this._onDidUpdateOptions.event;
  get onDidDispose() {
    return this.view.onDidDispose;
  }
  updateOptions(optionsUpdate = {}) {
    this._options = { ...this._options, ...optionsUpdate };
    for (const renderer of this.renderers) {
      renderer.updateOptions(optionsUpdate);
    }
    this.view.updateOptions(this._options);
    this.findController?.updateOptions(optionsUpdate);
    this.updateStickyScroll(optionsUpdate);
    this._onDidUpdateOptions.fire(this._options);
    this.getHTMLElement().classList.toggle(
      "always",
      this._options.renderIndentGuides === "always" /* Always */
    );
  }
  get options() {
    return this._options;
  }
  updateStickyScroll(optionsUpdate) {
    if (!this.stickyScrollController && this._options.enableStickyScroll) {
      this.stickyScrollController = new StickyScrollController(
        this,
        this.model,
        this.view,
        this.renderers,
        this.treeDelegate,
        this._options
      );
      this.onDidChangeStickyScrollFocused = this.stickyScrollController.onDidChangeHasFocus;
    } else if (this.stickyScrollController && !this._options.enableStickyScroll) {
      this.onDidChangeStickyScrollFocused = Event.None;
      this.stickyScrollController.dispose();
      this.stickyScrollController = void 0;
    }
    this.stickyScrollController?.updateOptions(optionsUpdate);
  }
  updateWidth(element) {
    const index = this.model.getListIndex(element);
    if (index === -1) {
      return;
    }
    this.view.updateWidth(index);
  }
  // Widget
  getHTMLElement() {
    return this.view.getHTMLElement();
  }
  get contentHeight() {
    return this.view.contentHeight;
  }
  get contentWidth() {
    return this.view.contentWidth;
  }
  get onDidChangeContentHeight() {
    return this.view.onDidChangeContentHeight;
  }
  get onDidChangeContentWidth() {
    return this.view.onDidChangeContentWidth;
  }
  get scrollTop() {
    return this.view.scrollTop;
  }
  set scrollTop(scrollTop) {
    this.view.scrollTop = scrollTop;
  }
  get scrollLeft() {
    return this.view.scrollLeft;
  }
  set scrollLeft(scrollLeft) {
    this.view.scrollLeft = scrollLeft;
  }
  get scrollHeight() {
    return this.view.scrollHeight;
  }
  get renderHeight() {
    return this.view.renderHeight;
  }
  get firstVisibleElement() {
    let index = this.view.firstVisibleIndex;
    if (this.stickyScrollController) {
      index += this.stickyScrollController.count;
    }
    if (index < 0 || index >= this.view.length) {
      return void 0;
    }
    const node = this.view.element(index);
    return node.element;
  }
  get lastVisibleElement() {
    const index = this.view.lastVisibleIndex;
    const node = this.view.element(index);
    return node.element;
  }
  get ariaLabel() {
    return this.view.ariaLabel;
  }
  set ariaLabel(value) {
    this.view.ariaLabel = value;
  }
  get selectionSize() {
    return this.selection.getNodes().length;
  }
  domFocus() {
    if (this.stickyScrollController?.focusedLast()) {
      this.stickyScrollController.domFocus();
    } else {
      this.view.domFocus();
    }
  }
  isDOMFocused() {
    return isActiveElement(this.getHTMLElement());
  }
  layout(height, width) {
    this.view.layout(height, width);
    if (isNumber(width)) {
      this.findController?.layout(width);
    }
  }
  style(styles) {
    const suffix = `.${this.view.domId}`;
    const content = [];
    if (styles.treeIndentGuidesStroke) {
      content.push(
        `.monaco-list${suffix}:hover .monaco-tl-indent > .indent-guide, .monaco-list${suffix}.always .monaco-tl-indent > .indent-guide  { border-color: ${styles.treeInactiveIndentGuidesStroke}; }`
      );
      content.push(
        `.monaco-list${suffix} .monaco-tl-indent > .indent-guide.active { border-color: ${styles.treeIndentGuidesStroke}; }`
      );
    }
    const stickyScrollBackground = styles.treeStickyScrollBackground ?? styles.listBackground;
    if (stickyScrollBackground) {
      content.push(
        `.monaco-list${suffix} .monaco-scrollable-element .monaco-tree-sticky-container { background-color: ${stickyScrollBackground}; }`
      );
      content.push(
        `.monaco-list${suffix} .monaco-scrollable-element .monaco-tree-sticky-container .monaco-tree-sticky-row { background-color: ${stickyScrollBackground}; }`
      );
    }
    if (styles.treeStickyScrollBorder) {
      content.push(
        `.monaco-list${suffix} .monaco-scrollable-element .monaco-tree-sticky-container { border-bottom: 1px solid ${styles.treeStickyScrollBorder}; }`
      );
    }
    if (styles.treeStickyScrollShadow) {
      content.push(
        `.monaco-list${suffix} .monaco-scrollable-element .monaco-tree-sticky-container .monaco-tree-sticky-container-shadow { box-shadow: ${styles.treeStickyScrollShadow} 0 6px 6px -6px inset; height: 3px; }`
      );
    }
    if (styles.listFocusForeground) {
      content.push(
        `.monaco-list${suffix}.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container:focus .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`
      );
      content.push(
        `.monaco-list${suffix}:not(.sticky-scroll-focused) .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.focused { color: inherit; }`
      );
    }
    const focusAndSelectionOutline = asCssValueWithDefault(
      styles.listFocusAndSelectionOutline,
      asCssValueWithDefault(
        styles.listSelectionOutline,
        styles.listFocusOutline ?? ""
      )
    );
    if (focusAndSelectionOutline) {
      content.push(
        `.monaco-list${suffix}.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container:focus .monaco-list-row.focused.selected { outline: 1px solid ${focusAndSelectionOutline}; outline-offset: -1px;}`
      );
      content.push(
        `.monaco-list${suffix}:not(.sticky-scroll-focused) .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.focused.selected { outline: inherit;}`
      );
    }
    if (styles.listFocusOutline) {
      content.push(
        `.monaco-list${suffix}.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container:focus .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }`
      );
      content.push(
        `.monaco-list${suffix}:not(.sticky-scroll-focused) .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.focused { outline: inherit; }`
      );
      content.push(
        `.monaco-workbench.context-menu-visible .monaco-list${suffix}.last-focused.sticky-scroll-focused .monaco-scrollable-element .monaco-tree-sticky-container .monaco-list-row.passive-focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }`
      );
      content.push(
        `.monaco-workbench.context-menu-visible .monaco-list${suffix}.last-focused.sticky-scroll-focused .monaco-list-rows .monaco-list-row.focused { outline: inherit; }`
      );
      content.push(
        `.monaco-workbench.context-menu-visible .monaco-list${suffix}.last-focused:not(.sticky-scroll-focused) .monaco-tree-sticky-container .monaco-list-rows .monaco-list-row.focused { outline: inherit; }`
      );
    }
    this.styleElement.textContent = content.join("\n");
    this.view.style(styles);
  }
  // Tree navigation
  getParentElement(location) {
    const parentRef = this.model.getParentNodeLocation(location);
    const parentNode = this.model.getNode(parentRef);
    return parentNode.element;
  }
  getFirstElementChild(location) {
    return this.model.getFirstElementChild(location);
  }
  // Tree
  getNode(location) {
    return this.model.getNode(location);
  }
  getNodeLocation(node) {
    return this.model.getNodeLocation(node);
  }
  collapse(location, recursive = false) {
    return this.model.setCollapsed(location, true, recursive);
  }
  expand(location, recursive = false) {
    return this.model.setCollapsed(location, false, recursive);
  }
  toggleCollapsed(location, recursive = false) {
    return this.model.setCollapsed(location, void 0, recursive);
  }
  expandAll() {
    this.model.setCollapsed(this.model.rootRef, false, true);
  }
  collapseAll() {
    this.model.setCollapsed(this.model.rootRef, true, true);
  }
  isCollapsible(location) {
    return this.model.isCollapsible(location);
  }
  setCollapsible(location, collapsible) {
    return this.model.setCollapsible(location, collapsible);
  }
  isCollapsed(location) {
    return this.model.isCollapsed(location);
  }
  expandTo(location) {
    this.model.expandTo(location);
  }
  triggerTypeNavigation() {
    this.view.triggerTypeNavigation();
  }
  openFind() {
    this.findController?.open();
  }
  closeFind() {
    this.findController?.close();
  }
  refilter() {
    this._onWillRefilter.fire(void 0);
    this.model.refilter();
  }
  setAnchor(element) {
    if (typeof element === "undefined") {
      return this.view.setAnchor(void 0);
    }
    this.eventBufferer.bufferEvents(() => {
      const node = this.model.getNode(element);
      this.anchor.set([node]);
      const index = this.model.getListIndex(element);
      if (index > -1) {
        this.view.setAnchor(index, true);
      }
    });
  }
  getAnchor() {
    return this.anchor.get().at(0);
  }
  setSelection(elements, browserEvent) {
    this.eventBufferer.bufferEvents(() => {
      const nodes = elements.map((e) => this.model.getNode(e));
      this.selection.set(nodes, browserEvent);
      const indexes = elements.map((e) => this.model.getListIndex(e)).filter((i) => i > -1);
      this.view.setSelection(indexes, browserEvent, true);
    });
  }
  getSelection() {
    return this.selection.get();
  }
  setFocus(elements, browserEvent) {
    this.eventBufferer.bufferEvents(() => {
      const nodes = elements.map((e) => this.model.getNode(e));
      this.focus.set(nodes, browserEvent);
      const indexes = elements.map((e) => this.model.getListIndex(e)).filter((i) => i > -1);
      this.view.setFocus(indexes, browserEvent, true);
    });
  }
  focusNext(n = 1, loop = false, browserEvent, filter = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    this.view.focusNext(n, loop, browserEvent, filter);
  }
  focusPrevious(n = 1, loop = false, browserEvent, filter = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    this.view.focusPrevious(n, loop, browserEvent, filter);
  }
  focusNextPage(browserEvent, filter = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    return this.view.focusNextPage(browserEvent, filter);
  }
  focusPreviousPage(browserEvent, filter = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    return this.view.focusPreviousPage(
      browserEvent,
      filter,
      () => this.stickyScrollController?.height ?? 0
    );
  }
  focusLast(browserEvent, filter = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    this.view.focusLast(browserEvent, filter);
  }
  focusFirst(browserEvent, filter = isKeyboardEvent(browserEvent) && browserEvent.altKey ? void 0 : this.focusNavigationFilter) {
    this.view.focusFirst(browserEvent, filter);
  }
  getFocus() {
    return this.focus.get();
  }
  getStickyScrollFocus() {
    const focus = this.stickyScrollController?.getFocus();
    return focus !== void 0 ? [focus] : [];
  }
  getFocusedPart() {
    return this.stickyScrollController?.focusedLast() ? 1 /* StickyScroll */ : 0 /* Tree */;
  }
  reveal(location, relativeTop) {
    this.model.expandTo(location);
    const index = this.model.getListIndex(location);
    if (index === -1) {
      return;
    }
    if (this.stickyScrollController) {
      const paddingTop = this.stickyScrollController.nodePositionTopBelowWidget(
        this.getNode(location)
      );
      this.view.reveal(index, relativeTop, paddingTop);
    } else {
      this.view.reveal(index, relativeTop);
    }
  }
  /**
   * Returns the relative position of an element rendered in the list.
   * Returns `null` if the element isn't *entirely* in the visible viewport.
   */
  getRelativeTop(location) {
    const index = this.model.getListIndex(location);
    if (index === -1) {
      return null;
    }
    const stickyScrollNode = this.stickyScrollController?.getNode(
      this.getNode(location)
    );
    return this.view.getRelativeTop(
      index,
      stickyScrollNode?.position ?? this.stickyScrollController?.height
    );
  }
  getViewState(identityProvider = this.options.identityProvider) {
    if (!identityProvider) {
      throw new TreeError(
        this._user,
        "Can't get tree view state without an identity provider"
      );
    }
    const getId = (element) => identityProvider.getId(element).toString();
    const state = AbstractTreeViewState.empty(this.scrollTop);
    for (const focus of this.getFocus()) {
      state.focus.add(getId(focus));
    }
    for (const selection of this.getSelection()) {
      state.selection.add(getId(selection));
    }
    const root = this.model.getNode();
    const queue = [root];
    while (queue.length > 0) {
      const node = queue.shift();
      if (node !== root && node.collapsible) {
        state.expanded[getId(node.element)] = node.collapsed ? 0 : 1;
      }
      queue.push(...node.children);
    }
    return state;
  }
  // List
  onLeftArrow(e) {
    e.preventDefault();
    e.stopPropagation();
    const nodes = this.view.getFocusedElements();
    if (nodes.length === 0) {
      return;
    }
    const node = nodes[0];
    const location = this.model.getNodeLocation(node);
    const didChange = this.model.setCollapsed(location, true);
    if (!didChange) {
      const parentLocation = this.model.getParentNodeLocation(location);
      if (!parentLocation) {
        return;
      }
      const parentListIndex = this.model.getListIndex(parentLocation);
      this.view.reveal(parentListIndex);
      this.view.setFocus([parentListIndex]);
    }
  }
  onRightArrow(e) {
    e.preventDefault();
    e.stopPropagation();
    const nodes = this.view.getFocusedElements();
    if (nodes.length === 0) {
      return;
    }
    const node = nodes[0];
    const location = this.model.getNodeLocation(node);
    const didChange = this.model.setCollapsed(location, false);
    if (!didChange) {
      if (!node.children.some((child) => child.visible)) {
        return;
      }
      const [focusedIndex] = this.view.getFocus();
      const firstChildIndex = focusedIndex + 1;
      this.view.reveal(firstChildIndex);
      this.view.setFocus([firstChildIndex]);
    }
  }
  onSpace(e) {
    e.preventDefault();
    e.stopPropagation();
    const nodes = this.view.getFocusedElements();
    if (nodes.length === 0) {
      return;
    }
    const node = nodes[0];
    const location = this.model.getNodeLocation(node);
    const recursive = e.browserEvent.altKey;
    this.model.setCollapsed(location, void 0, recursive);
  }
  modelDisposables = new DisposableStore();
  setupModel(model) {
    this.modelDisposables.clear();
    this.modelDisposables.add(
      model.onDidSpliceRenderedNodes(
        ({ start, deleteCount, elements }) => this.view.splice(start, deleteCount, elements)
      )
    );
    const onDidModelSplice = Event.forEach(
      model.onDidSpliceModel,
      (e) => {
        this.eventBufferer.bufferEvents(() => {
          this.focus.onDidModelSplice(e);
          this.selection.onDidModelSplice(e);
        });
      },
      this.modelDisposables
    );
    onDidModelSplice(() => null, null, this.modelDisposables);
    const activeNodesEmitter = this.modelDisposables.add(
      new Emitter()
    );
    const activeNodesDebounce = this.modelDisposables.add(new Delayer(0));
    this.modelDisposables.add(
      Event.any(
        onDidModelSplice,
        this.focus.onDidChange,
        this.selection.onDidChange
      )(() => {
        activeNodesDebounce.trigger(() => {
          const set = /* @__PURE__ */ new Set();
          for (const node of this.focus.getNodes()) {
            set.add(node);
          }
          for (const node of this.selection.getNodes()) {
            set.add(node);
          }
          activeNodesEmitter.fire([...set.values()]);
        });
      })
    );
    this.onDidChangeActiveNodesRelay.input = activeNodesEmitter.event;
    this.onDidChangeModelRelay.input = Event.signal(model.onDidSpliceModel);
    this.onDidChangeCollapseStateRelay.input = model.onDidChangeCollapseState;
    this.onDidChangeRenderNodeCountRelay.input = model.onDidChangeRenderNodeCount;
  }
  setModel(newModel) {
    const oldModel = this.model;
    this.model = newModel;
    this.setupModel(newModel);
    this.renderers.forEach((r) => r.setModel(newModel));
    this.stickyScrollController?.setModel(newModel);
    this.view.splice(0, oldModel.getListRenderCount(oldModel.rootRef));
    this.model.refilter();
    this.onDidSwapModel.fire();
  }
  getModel() {
    return this.model;
  }
  navigate(start) {
    return new TreeNavigator(this.view, this.model, start);
  }
  dispose() {
    dispose(this.disposables);
    this.stickyScrollController?.dispose();
    this.view.dispose();
    this.modelDisposables.dispose();
  }
}
class TreeNavigator {
  constructor(view, model, start) {
    this.view = view;
    this.model = model;
    if (start) {
      this.index = this.model.getListIndex(start);
    } else {
      this.index = -1;
    }
  }
  index;
  current() {
    if (this.index < 0 || this.index >= this.view.length) {
      return null;
    }
    return this.view.element(this.index).element;
  }
  previous() {
    this.index--;
    return this.current();
  }
  next() {
    this.index++;
    return this.current();
  }
  first() {
    this.index = 0;
    return this.current();
  }
  last() {
    this.index = this.view.length - 1;
    return this.current();
  }
}
export {
  AbstractTree,
  AbstractTreePart,
  AbstractTreeViewState,
  ComposedTreeDelegate,
  FuzzyToggle,
  ModeToggle,
  RenderIndentGuides,
  TreeFindMatchType,
  TreeFindMode,
  TreeRenderer
};
