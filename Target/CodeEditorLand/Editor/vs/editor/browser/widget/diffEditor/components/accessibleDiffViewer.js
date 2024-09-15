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
import {
  addDisposableListener,
  addStandardDisposableListener,
  reset
} from "../../../../../base/browser/dom.js";
import { createTrustedTypesPolicy } from "../../../../../base/browser/trustedTypes.js";
import { ActionBar } from "../../../../../base/browser/ui/actionbar/actionbar.js";
import { DomScrollableElement } from "../../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { Action } from "../../../../../base/common/actions.js";
import {
  forEachAdjacent,
  groupAdjacentBy
} from "../../../../../base/common/arrays.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import {
  Disposable,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunWithStore,
  derived,
  derivedWithStore,
  observableValue,
  subtransaction,
  transaction
} from "../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { localize } from "../../../../../nls.js";
import {
  AccessibilitySignal,
  IAccessibilitySignalService
} from "../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { registerIcon } from "../../../../../platform/theme/common/iconRegistry.js";
import {
  EditorFontLigatures,
  EditorOption
} from "../../../../common/config/editorOptions.js";
import { LineRange } from "../../../../common/core/lineRange.js";
import { OffsetRange } from "../../../../common/core/offsetRange.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import {
  LineRangeMapping
} from "../../../../common/diff/rangeMapping.js";
import { ILanguageService } from "../../../../common/languages/language.js";
import { LineTokens } from "../../../../common/tokens/lineTokens.js";
import {
  RenderLineInput,
  renderViewLine2
} from "../../../../common/viewLayout/viewLineRenderer.js";
import { ViewLineRenderingData } from "../../../../common/viewModel.js";
import { applyFontInfo } from "../../../config/domFontInfo.js";
import { applyStyle } from "../utils.js";
import "./accessibleDiffViewer.css";
const accessibleDiffViewerInsertIcon = registerIcon(
  "diff-review-insert",
  Codicon.add,
  localize(
    "accessibleDiffViewerInsertIcon",
    "Icon for 'Insert' in accessible diff viewer."
  )
);
const accessibleDiffViewerRemoveIcon = registerIcon(
  "diff-review-remove",
  Codicon.remove,
  localize(
    "accessibleDiffViewerRemoveIcon",
    "Icon for 'Remove' in accessible diff viewer."
  )
);
const accessibleDiffViewerCloseIcon = registerIcon(
  "diff-review-close",
  Codicon.close,
  localize(
    "accessibleDiffViewerCloseIcon",
    "Icon for 'Close' in accessible diff viewer."
  )
);
let AccessibleDiffViewer = class extends Disposable {
  constructor(_parentNode, _visible, _setVisible, _canClose, _width, _height, _diffs, _models, _instantiationService) {
    super();
    this._parentNode = _parentNode;
    this._visible = _visible;
    this._setVisible = _setVisible;
    this._canClose = _canClose;
    this._width = _width;
    this._height = _height;
    this._diffs = _diffs;
    this._models = _models;
    this._instantiationService = _instantiationService;
  }
  static {
    __name(this, "AccessibleDiffViewer");
  }
  static _ttPolicy = createTrustedTypesPolicy("diffReview", {
    createHTML: /* @__PURE__ */ __name((value) => value, "createHTML")
  });
  _state = derivedWithStore(this, (reader, store) => {
    const visible = this._visible.read(reader);
    this._parentNode.style.visibility = visible ? "visible" : "hidden";
    if (!visible) {
      return null;
    }
    const model = store.add(
      this._instantiationService.createInstance(
        ViewModel,
        this._diffs,
        this._models,
        this._setVisible,
        this._canClose
      )
    );
    const view = store.add(
      this._instantiationService.createInstance(
        View,
        this._parentNode,
        model,
        this._width,
        this._height,
        this._models
      )
    );
    return { model, view };
  }).recomputeInitiallyAndOnChange(this._store);
  next() {
    transaction((tx) => {
      const isVisible = this._visible.get();
      this._setVisible(true, tx);
      if (isVisible) {
        this._state.get().model.nextGroup(tx);
      }
    });
  }
  prev() {
    transaction((tx) => {
      this._setVisible(true, tx);
      this._state.get().model.previousGroup(tx);
    });
  }
  close() {
    transaction((tx) => {
      this._setVisible(false, tx);
    });
  }
};
AccessibleDiffViewer = __decorateClass([
  __decorateParam(8, IInstantiationService)
], AccessibleDiffViewer);
let ViewModel = class extends Disposable {
  constructor(_diffs, _models, _setVisible, canClose, _accessibilitySignalService) {
    super();
    this._diffs = _diffs;
    this._models = _models;
    this._setVisible = _setVisible;
    this.canClose = canClose;
    this._accessibilitySignalService = _accessibilitySignalService;
    this._register(
      autorun((reader) => {
        const diffs = this._diffs.read(reader);
        if (!diffs) {
          this._groups.set([], void 0);
          return;
        }
        const groups = computeViewElementGroups(
          diffs,
          this._models.getOriginalModel().getLineCount(),
          this._models.getModifiedModel().getLineCount()
        );
        transaction((tx) => {
          const p = this._models.getModifiedPosition();
          if (p) {
            const nextGroup = groups.findIndex(
              (g) => p?.lineNumber < g.range.modified.endLineNumberExclusive
            );
            if (nextGroup !== -1) {
              this._currentGroupIdx.set(nextGroup, tx);
            }
          }
          this._groups.set(groups, tx);
        });
      })
    );
    this._register(
      autorun((reader) => {
        const currentViewItem = this.currentElement.read(reader);
        if (currentViewItem?.type === 2 /* Deleted */) {
          this._accessibilitySignalService.playSignal(
            AccessibilitySignal.diffLineDeleted,
            {
              source: "accessibleDiffViewer.currentElementChanged"
            }
          );
        } else if (currentViewItem?.type === 3 /* Added */) {
          this._accessibilitySignalService.playSignal(
            AccessibilitySignal.diffLineInserted,
            {
              source: "accessibleDiffViewer.currentElementChanged"
            }
          );
        }
      })
    );
    this._register(
      autorun((reader) => {
        const currentViewItem = this.currentElement.read(reader);
        if (currentViewItem && currentViewItem.type !== 0 /* Header */) {
          const lineNumber = currentViewItem.modifiedLineNumber ?? currentViewItem.diff.modified.startLineNumber;
          this._models.modifiedSetSelection(
            Range.fromPositions(new Position(lineNumber, 1))
          );
        }
      })
    );
  }
  static {
    __name(this, "ViewModel");
  }
  _groups = observableValue(this, []);
  _currentGroupIdx = observableValue(this, 0);
  _currentElementIdx = observableValue(this, 0);
  groups = this._groups;
  currentGroup = this._currentGroupIdx.map((idx, r) => this._groups.read(r)[idx]);
  currentGroupIndex = this._currentGroupIdx;
  currentElement = this._currentElementIdx.map(
    (idx, r) => this.currentGroup.read(r)?.lines[idx]
  );
  _goToGroupDelta(delta, tx) {
    const groups = this.groups.get();
    if (!groups || groups.length <= 1) {
      return;
    }
    subtransaction(tx, (tx2) => {
      this._currentGroupIdx.set(
        OffsetRange.ofLength(groups.length).clipCyclic(
          this._currentGroupIdx.get() + delta
        ),
        tx2
      );
      this._currentElementIdx.set(0, tx2);
    });
  }
  nextGroup(tx) {
    this._goToGroupDelta(1, tx);
  }
  previousGroup(tx) {
    this._goToGroupDelta(-1, tx);
  }
  _goToLineDelta(delta) {
    const group = this.currentGroup.get();
    if (!group || group.lines.length <= 1) {
      return;
    }
    transaction((tx) => {
      this._currentElementIdx.set(
        OffsetRange.ofLength(group.lines.length).clip(
          this._currentElementIdx.get() + delta
        ),
        tx
      );
    });
  }
  goToNextLine() {
    this._goToLineDelta(1);
  }
  goToPreviousLine() {
    this._goToLineDelta(-1);
  }
  goToLine(line) {
    const group = this.currentGroup.get();
    if (!group) {
      return;
    }
    const idx = group.lines.indexOf(line);
    if (idx === -1) {
      return;
    }
    transaction((tx) => {
      this._currentElementIdx.set(idx, tx);
    });
  }
  revealCurrentElementInEditor() {
    if (!this.canClose.get()) {
      return;
    }
    this._setVisible(false, void 0);
    const curElem = this.currentElement.get();
    if (curElem) {
      if (curElem.type === 2 /* Deleted */) {
        this._models.originalReveal(
          Range.fromPositions(
            new Position(curElem.originalLineNumber, 1)
          )
        );
      } else {
        this._models.modifiedReveal(
          curElem.type !== 0 /* Header */ ? Range.fromPositions(
            new Position(curElem.modifiedLineNumber, 1)
          ) : void 0
        );
      }
    }
  }
  close() {
    if (!this.canClose.get()) {
      return;
    }
    this._setVisible(false, void 0);
    this._models.modifiedFocus();
  }
};
ViewModel = __decorateClass([
  __decorateParam(4, IAccessibilitySignalService)
], ViewModel);
const viewElementGroupLineMargin = 3;
function computeViewElementGroups(diffs, originalLineCount, modifiedLineCount) {
  const result = [];
  for (const g of groupAdjacentBy(
    diffs,
    (a, b) => b.modified.startLineNumber - a.modified.endLineNumberExclusive < 2 * viewElementGroupLineMargin
  )) {
    const viewElements = [];
    viewElements.push(new HeaderViewElement());
    const origFullRange = new LineRange(
      Math.max(
        1,
        g[0].original.startLineNumber - viewElementGroupLineMargin
      ),
      Math.min(
        g[g.length - 1].original.endLineNumberExclusive + viewElementGroupLineMargin,
        originalLineCount + 1
      )
    );
    const modifiedFullRange = new LineRange(
      Math.max(
        1,
        g[0].modified.startLineNumber - viewElementGroupLineMargin
      ),
      Math.min(
        g[g.length - 1].modified.endLineNumberExclusive + viewElementGroupLineMargin,
        modifiedLineCount + 1
      )
    );
    forEachAdjacent(g, (a, b) => {
      const origRange = new LineRange(
        a ? a.original.endLineNumberExclusive : origFullRange.startLineNumber,
        b ? b.original.startLineNumber : origFullRange.endLineNumberExclusive
      );
      const modifiedRange2 = new LineRange(
        a ? a.modified.endLineNumberExclusive : modifiedFullRange.startLineNumber,
        b ? b.modified.startLineNumber : modifiedFullRange.endLineNumberExclusive
      );
      origRange.forEach((origLineNumber) => {
        viewElements.push(
          new UnchangedLineViewElement(
            origLineNumber,
            modifiedRange2.startLineNumber + (origLineNumber - origRange.startLineNumber)
          )
        );
      });
      if (b) {
        b.original.forEach((origLineNumber) => {
          viewElements.push(
            new DeletedLineViewElement(b, origLineNumber)
          );
        });
        b.modified.forEach((modifiedLineNumber) => {
          viewElements.push(
            new AddedLineViewElement(b, modifiedLineNumber)
          );
        });
      }
    });
    const modifiedRange = g[0].modified.join(g[g.length - 1].modified);
    const originalRange = g[0].original.join(g[g.length - 1].original);
    result.push(
      new ViewElementGroup(
        new LineRangeMapping(modifiedRange, originalRange),
        viewElements
      )
    );
  }
  return result;
}
__name(computeViewElementGroups, "computeViewElementGroups");
var LineType = /* @__PURE__ */ ((LineType2) => {
  LineType2[LineType2["Header"] = 0] = "Header";
  LineType2[LineType2["Unchanged"] = 1] = "Unchanged";
  LineType2[LineType2["Deleted"] = 2] = "Deleted";
  LineType2[LineType2["Added"] = 3] = "Added";
  return LineType2;
})(LineType || {});
class ViewElementGroup {
  constructor(range, lines) {
    this.range = range;
    this.lines = lines;
  }
  static {
    __name(this, "ViewElementGroup");
  }
}
class HeaderViewElement {
  static {
    __name(this, "HeaderViewElement");
  }
  type = 0 /* Header */;
}
class DeletedLineViewElement {
  constructor(diff, originalLineNumber) {
    this.diff = diff;
    this.originalLineNumber = originalLineNumber;
  }
  static {
    __name(this, "DeletedLineViewElement");
  }
  type = 2 /* Deleted */;
  modifiedLineNumber = void 0;
}
class AddedLineViewElement {
  constructor(diff, modifiedLineNumber) {
    this.diff = diff;
    this.modifiedLineNumber = modifiedLineNumber;
  }
  static {
    __name(this, "AddedLineViewElement");
  }
  type = 3 /* Added */;
  originalLineNumber = void 0;
}
class UnchangedLineViewElement {
  constructor(originalLineNumber, modifiedLineNumber) {
    this.originalLineNumber = originalLineNumber;
    this.modifiedLineNumber = modifiedLineNumber;
  }
  static {
    __name(this, "UnchangedLineViewElement");
  }
  type = 1 /* Unchanged */;
}
let View = class extends Disposable {
  constructor(_element, _model, _width, _height, _models, _languageService) {
    super();
    this._element = _element;
    this._model = _model;
    this._width = _width;
    this._height = _height;
    this._models = _models;
    this._languageService = _languageService;
    this.domNode = this._element;
    this.domNode.className = "monaco-component diff-review monaco-editor-background";
    const actionBarContainer = document.createElement("div");
    actionBarContainer.className = "diff-review-actions";
    this._actionBar = this._register(new ActionBar(actionBarContainer));
    this._register(
      autorun((reader) => {
        this._actionBar.clear();
        if (this._model.canClose.read(reader)) {
          this._actionBar.push(
            new Action(
              "diffreview.close",
              localize("label.close", "Close"),
              "close-diff-review " + ThemeIcon.asClassName(
                accessibleDiffViewerCloseIcon
              ),
              true,
              async () => _model.close()
            ),
            { label: false, icon: true }
          );
        }
      })
    );
    this._content = document.createElement("div");
    this._content.className = "diff-review-content";
    this._content.setAttribute("role", "code");
    this._scrollbar = this._register(
      new DomScrollableElement(this._content, {})
    );
    reset(this.domNode, this._scrollbar.getDomNode(), actionBarContainer);
    this._register(
      autorun((r) => {
        this._height.read(r);
        this._width.read(r);
        this._scrollbar.scanDomNode();
      })
    );
    this._register(
      toDisposable(() => {
        reset(this.domNode);
      })
    );
    this._register(
      applyStyle(this.domNode, {
        width: this._width,
        height: this._height
      })
    );
    this._register(
      applyStyle(this._content, {
        width: this._width,
        height: this._height
      })
    );
    this._register(
      autorunWithStore((reader, store) => {
        this._model.currentGroup.read(reader);
        this._render(store);
      })
    );
    this._register(
      addStandardDisposableListener(this.domNode, "keydown", (e) => {
        if (e.equals(KeyCode.DownArrow) || e.equals(KeyMod.CtrlCmd | KeyCode.DownArrow) || e.equals(KeyMod.Alt | KeyCode.DownArrow)) {
          e.preventDefault();
          this._model.goToNextLine();
        }
        if (e.equals(KeyCode.UpArrow) || e.equals(KeyMod.CtrlCmd | KeyCode.UpArrow) || e.equals(KeyMod.Alt | KeyCode.UpArrow)) {
          e.preventDefault();
          this._model.goToPreviousLine();
        }
        if (e.equals(KeyCode.Escape) || e.equals(KeyMod.CtrlCmd | KeyCode.Escape) || e.equals(KeyMod.Alt | KeyCode.Escape) || e.equals(KeyMod.Shift | KeyCode.Escape)) {
          e.preventDefault();
          this._model.close();
        }
        if (e.equals(KeyCode.Space) || e.equals(KeyCode.Enter)) {
          e.preventDefault();
          this._model.revealCurrentElementInEditor();
        }
      })
    );
  }
  static {
    __name(this, "View");
  }
  domNode;
  _content;
  _scrollbar;
  _actionBar;
  _render(store) {
    const originalOptions = this._models.getOriginalOptions();
    const modifiedOptions = this._models.getModifiedOptions();
    const container = document.createElement("div");
    container.className = "diff-review-table";
    container.setAttribute("role", "list");
    container.setAttribute(
      "aria-label",
      localize(
        "ariaLabel",
        "Accessible Diff Viewer. Use arrow up and down to navigate."
      )
    );
    applyFontInfo(container, modifiedOptions.get(EditorOption.fontInfo));
    reset(this._content, container);
    const originalModel = this._models.getOriginalModel();
    const modifiedModel = this._models.getModifiedModel();
    if (!originalModel || !modifiedModel) {
      return;
    }
    const originalModelOpts = originalModel.getOptions();
    const modifiedModelOpts = modifiedModel.getOptions();
    const lineHeight = modifiedOptions.get(EditorOption.lineHeight);
    const group = this._model.currentGroup.get();
    for (const viewItem of group?.lines || []) {
      if (!group) {
        break;
      }
      let row;
      if (viewItem.type === 0 /* Header */) {
        const header = document.createElement("div");
        header.className = "diff-review-row";
        header.setAttribute("role", "listitem");
        const r = group.range;
        const diffIndex = this._model.currentGroupIndex.get();
        const diffsLength = this._model.groups.get().length;
        const getAriaLines = /* @__PURE__ */ __name((lines) => lines === 0 ? localize("no_lines_changed", "no lines changed") : lines === 1 ? localize("one_line_changed", "1 line changed") : localize(
          "more_lines_changed",
          "{0} lines changed",
          lines
        ), "getAriaLines");
        const originalChangedLinesCntAria = getAriaLines(
          r.original.length
        );
        const modifiedChangedLinesCntAria = getAriaLines(
          r.modified.length
        );
        header.setAttribute(
          "aria-label",
          localize(
            {
              key: "header",
              comment: [
                "This is the ARIA label for a git diff header.",
                "A git diff header looks like this: @@ -154,12 +159,39 @@.",
                "That encodes that at original line 154 (which is now line 159), 12 lines were removed/changed with 39 lines.",
                "Variables 0 and 1 refer to the diff index out of total number of diffs.",
                "Variables 2 and 4 will be numbers (a line number).",
                'Variables 3 and 5 will be "no lines changed", "1 line changed" or "X lines changed", localized separately.'
              ]
            },
            "Difference {0} of {1}: original line {2}, {3}, modified line {4}, {5}",
            diffIndex + 1,
            diffsLength,
            r.original.startLineNumber,
            originalChangedLinesCntAria,
            r.modified.startLineNumber,
            modifiedChangedLinesCntAria
          )
        );
        const cell = document.createElement("div");
        cell.className = "diff-review-cell diff-review-summary";
        cell.appendChild(
          document.createTextNode(
            `${diffIndex + 1}/${diffsLength}: @@ -${r.original.startLineNumber},${r.original.length} +${r.modified.startLineNumber},${r.modified.length} @@`
          )
        );
        header.appendChild(cell);
        row = header;
      } else {
        row = this._createRow(
          viewItem,
          lineHeight,
          this._width.get(),
          originalOptions,
          originalModel,
          originalModelOpts,
          modifiedOptions,
          modifiedModel,
          modifiedModelOpts
        );
      }
      container.appendChild(row);
      const isSelectedObs = derived(
        (reader) => (
          /** @description isSelected */
          this._model.currentElement.read(
            reader
          ) === viewItem
        )
      );
      store.add(
        autorun((reader) => {
          const isSelected = isSelectedObs.read(reader);
          row.tabIndex = isSelected ? 0 : -1;
          if (isSelected) {
            row.focus();
          }
        })
      );
      store.add(
        addDisposableListener(row, "focus", () => {
          this._model.goToLine(viewItem);
        })
      );
    }
    this._scrollbar.scanDomNode();
  }
  _createRow(item, lineHeight, width, originalOptions, originalModel, originalModelOpts, modifiedOptions, modifiedModel, modifiedModelOpts) {
    const originalLayoutInfo = originalOptions.get(EditorOption.layoutInfo);
    const originalLineNumbersWidth = originalLayoutInfo.glyphMarginWidth + originalLayoutInfo.lineNumbersWidth;
    const modifiedLayoutInfo = modifiedOptions.get(EditorOption.layoutInfo);
    const modifiedLineNumbersWidth = 10 + modifiedLayoutInfo.glyphMarginWidth + modifiedLayoutInfo.lineNumbersWidth;
    let rowClassName = "diff-review-row";
    let lineNumbersExtraClassName = "";
    const spacerClassName = "diff-review-spacer";
    let spacerIcon = null;
    switch (item.type) {
      case 3 /* Added */:
        rowClassName = "diff-review-row line-insert";
        lineNumbersExtraClassName = " char-insert";
        spacerIcon = accessibleDiffViewerInsertIcon;
        break;
      case 2 /* Deleted */:
        rowClassName = "diff-review-row line-delete";
        lineNumbersExtraClassName = " char-delete";
        spacerIcon = accessibleDiffViewerRemoveIcon;
        break;
    }
    const row = document.createElement("div");
    row.style.minWidth = width + "px";
    row.className = rowClassName;
    row.setAttribute("role", "listitem");
    row.ariaLevel = "";
    const cell = document.createElement("div");
    cell.className = "diff-review-cell";
    cell.style.height = `${lineHeight}px`;
    row.appendChild(cell);
    const originalLineNumber = document.createElement("span");
    originalLineNumber.style.width = originalLineNumbersWidth + "px";
    originalLineNumber.style.minWidth = originalLineNumbersWidth + "px";
    originalLineNumber.className = "diff-review-line-number" + lineNumbersExtraClassName;
    if (item.originalLineNumber !== void 0) {
      originalLineNumber.appendChild(
        document.createTextNode(String(item.originalLineNumber))
      );
    } else {
      originalLineNumber.innerText = "\xA0";
    }
    cell.appendChild(originalLineNumber);
    const modifiedLineNumber = document.createElement("span");
    modifiedLineNumber.style.width = modifiedLineNumbersWidth + "px";
    modifiedLineNumber.style.minWidth = modifiedLineNumbersWidth + "px";
    modifiedLineNumber.style.paddingRight = "10px";
    modifiedLineNumber.className = "diff-review-line-number" + lineNumbersExtraClassName;
    if (item.modifiedLineNumber !== void 0) {
      modifiedLineNumber.appendChild(
        document.createTextNode(String(item.modifiedLineNumber))
      );
    } else {
      modifiedLineNumber.innerText = "\xA0";
    }
    cell.appendChild(modifiedLineNumber);
    const spacer = document.createElement("span");
    spacer.className = spacerClassName;
    if (spacerIcon) {
      const spacerCodicon = document.createElement("span");
      spacerCodicon.className = ThemeIcon.asClassName(spacerIcon);
      spacerCodicon.innerText = "\xA0\xA0";
      spacer.appendChild(spacerCodicon);
    } else {
      spacer.innerText = "\xA0\xA0";
    }
    cell.appendChild(spacer);
    let lineContent;
    if (item.modifiedLineNumber !== void 0) {
      let html = this._getLineHtml(
        modifiedModel,
        modifiedOptions,
        modifiedModelOpts.tabSize,
        item.modifiedLineNumber,
        this._languageService.languageIdCodec
      );
      if (AccessibleDiffViewer._ttPolicy) {
        html = AccessibleDiffViewer._ttPolicy.createHTML(
          html
        );
      }
      cell.insertAdjacentHTML("beforeend", html);
      lineContent = modifiedModel.getLineContent(item.modifiedLineNumber);
    } else {
      let html = this._getLineHtml(
        originalModel,
        originalOptions,
        originalModelOpts.tabSize,
        item.originalLineNumber,
        this._languageService.languageIdCodec
      );
      if (AccessibleDiffViewer._ttPolicy) {
        html = AccessibleDiffViewer._ttPolicy.createHTML(
          html
        );
      }
      cell.insertAdjacentHTML("beforeend", html);
      lineContent = originalModel.getLineContent(item.originalLineNumber);
    }
    if (lineContent.length === 0) {
      lineContent = localize("blankLine", "blank");
    }
    let ariaLabel = "";
    switch (item.type) {
      case 1 /* Unchanged */:
        if (item.originalLineNumber === item.modifiedLineNumber) {
          ariaLabel = localize(
            {
              key: "unchangedLine",
              comment: [
                "The placeholders are contents of the line and should not be translated."
              ]
            },
            "{0} unchanged line {1}",
            lineContent,
            item.originalLineNumber
          );
        } else {
          ariaLabel = localize(
            "equalLine",
            "{0} original line {1} modified line {2}",
            lineContent,
            item.originalLineNumber,
            item.modifiedLineNumber
          );
        }
        break;
      case 3 /* Added */:
        ariaLabel = localize(
          "insertLine",
          "+ {0} modified line {1}",
          lineContent,
          item.modifiedLineNumber
        );
        break;
      case 2 /* Deleted */:
        ariaLabel = localize(
          "deleteLine",
          "- {0} original line {1}",
          lineContent,
          item.originalLineNumber
        );
        break;
    }
    row.setAttribute("aria-label", ariaLabel);
    return row;
  }
  _getLineHtml(model, options, tabSize, lineNumber, languageIdCodec) {
    const lineContent = model.getLineContent(lineNumber);
    const fontInfo = options.get(EditorOption.fontInfo);
    const lineTokens = LineTokens.createEmpty(lineContent, languageIdCodec);
    const isBasicASCII = ViewLineRenderingData.isBasicASCII(
      lineContent,
      model.mightContainNonBasicASCII()
    );
    const containsRTL = ViewLineRenderingData.containsRTL(
      lineContent,
      isBasicASCII,
      model.mightContainRTL()
    );
    const r = renderViewLine2(
      new RenderLineInput(
        fontInfo.isMonospace && !options.get(EditorOption.disableMonospaceOptimizations),
        fontInfo.canUseHalfwidthRightwardsArrow,
        lineContent,
        false,
        isBasicASCII,
        containsRTL,
        0,
        lineTokens,
        [],
        tabSize,
        0,
        fontInfo.spaceWidth,
        fontInfo.middotWidth,
        fontInfo.wsmiddotWidth,
        options.get(EditorOption.stopRenderingLineAfter),
        options.get(EditorOption.renderWhitespace),
        options.get(EditorOption.renderControlCharacters),
        options.get(EditorOption.fontLigatures) !== EditorFontLigatures.OFF,
        null
      )
    );
    return r.html;
  }
};
View = __decorateClass([
  __decorateParam(5, ILanguageService)
], View);
class AccessibleDiffViewerModelFromEditors {
  constructor(editors) {
    this.editors = editors;
  }
  static {
    __name(this, "AccessibleDiffViewerModelFromEditors");
  }
  getOriginalModel() {
    return this.editors.original.getModel();
  }
  getOriginalOptions() {
    return this.editors.original.getOptions();
  }
  originalReveal(range) {
    this.editors.original.revealRange(range);
    this.editors.original.setSelection(range);
    this.editors.original.focus();
  }
  getModifiedModel() {
    return this.editors.modified.getModel();
  }
  getModifiedOptions() {
    return this.editors.modified.getOptions();
  }
  modifiedReveal(range) {
    if (range) {
      this.editors.modified.revealRange(range);
      this.editors.modified.setSelection(range);
    }
    this.editors.modified.focus();
  }
  modifiedSetSelection(range) {
    this.editors.modified.setSelection(range);
  }
  modifiedFocus() {
    this.editors.modified.focus();
  }
  getModifiedPosition() {
    return this.editors.modified.getPosition() ?? void 0;
  }
}
export {
  AccessibleDiffViewer,
  AccessibleDiffViewerModelFromEditors
};
//# sourceMappingURL=accessibleDiffViewer.js.map
