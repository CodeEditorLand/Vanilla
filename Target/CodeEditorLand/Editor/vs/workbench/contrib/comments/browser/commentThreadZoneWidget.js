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
import { Color } from "../../../../base/common/color.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { IDisposable, DisposableStore } from "../../../../base/common/lifecycle.js";
import { ICodeEditor, IEditorMouseEvent, MouseTargetType } from "../../../../editor/browser/editorBrowser.js";
import { IPosition } from "../../../../editor/common/core/position.js";
import { IRange, Range } from "../../../../editor/common/core/range.js";
import * as languages from "../../../../editor/common/languages.js";
import { ZoneWidget } from "../../../../editor/contrib/zoneWidget/browser/zoneWidget.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IColorTheme, IThemeService } from "../../../../platform/theme/common/themeService.js";
import { CommentGlyphWidget } from "./commentGlyphWidget.js";
import { ICommentService } from "./commentService.js";
import { ICommentThreadWidget } from "../common/commentThreadWidget.js";
import { EDITOR_FONT_DEFAULTS, EditorOption, IEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { CommentThreadWidget } from "./commentThreadWidget.js";
import { ICellRange } from "../../notebook/common/notebookRange.js";
import { commentThreadStateBackgroundColorVar, commentThreadStateColorVar, getCommentThreadStateBorderColor } from "./commentColors.js";
import { peekViewBorder } from "../../../../editor/contrib/peekView/browser/peekView.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { StableEditorScrollState } from "../../../../editor/browser/stableEditorScroll.js";
function getCommentThreadWidgetStateColor(thread, theme) {
  return getCommentThreadStateBorderColor(thread, theme) ?? theme.getColor(peekViewBorder);
}
__name(getCommentThreadWidgetStateColor, "getCommentThreadWidgetStateColor");
var CommentWidgetFocus = /* @__PURE__ */ ((CommentWidgetFocus2) => {
  CommentWidgetFocus2[CommentWidgetFocus2["None"] = 0] = "None";
  CommentWidgetFocus2[CommentWidgetFocus2["Widget"] = 1] = "Widget";
  CommentWidgetFocus2[CommentWidgetFocus2["Editor"] = 2] = "Editor";
  return CommentWidgetFocus2;
})(CommentWidgetFocus || {});
function parseMouseDownInfoFromEvent(e) {
  const range = e.target.range;
  if (!range) {
    return null;
  }
  if (!e.event.leftButton) {
    return null;
  }
  if (e.target.type !== MouseTargetType.GUTTER_LINE_DECORATIONS) {
    return null;
  }
  const data = e.target.detail;
  const gutterOffsetX = data.offsetX - data.glyphMarginWidth - data.lineNumbersWidth - data.glyphMarginLeft;
  if (gutterOffsetX > 20) {
    return null;
  }
  return { lineNumber: range.startLineNumber };
}
__name(parseMouseDownInfoFromEvent, "parseMouseDownInfoFromEvent");
function isMouseUpEventDragFromMouseDown(mouseDownInfo, e) {
  if (!mouseDownInfo) {
    return null;
  }
  const { lineNumber } = mouseDownInfo;
  const range = e.target.range;
  if (!range) {
    return null;
  }
  return lineNumber;
}
__name(isMouseUpEventDragFromMouseDown, "isMouseUpEventDragFromMouseDown");
function isMouseUpEventMatchMouseDown(mouseDownInfo, e) {
  if (!mouseDownInfo) {
    return null;
  }
  const { lineNumber } = mouseDownInfo;
  const range = e.target.range;
  if (!range || range.startLineNumber !== lineNumber) {
    return null;
  }
  if (e.target.type !== MouseTargetType.GUTTER_LINE_DECORATIONS) {
    return null;
  }
  return lineNumber;
}
__name(isMouseUpEventMatchMouseDown, "isMouseUpEventMatchMouseDown");
let ReviewZoneWidget = class extends ZoneWidget {
  constructor(editor, _uniqueOwner, _commentThread, _pendingComment, _pendingEdits, instantiationService, themeService, commentService, contextKeyService, configurationService) {
    super(editor, { keepEditorSelection: true, isAccessible: true });
    this._uniqueOwner = _uniqueOwner;
    this._commentThread = _commentThread;
    this._pendingComment = _pendingComment;
    this._pendingEdits = _pendingEdits;
    this.themeService = themeService;
    this.commentService = commentService;
    this.configurationService = configurationService;
    this._contextKeyService = contextKeyService.createScoped(this.domNode);
    this._scopedInstantiationService = this._globalToDispose.add(instantiationService.createChild(new ServiceCollection(
      [IContextKeyService, this._contextKeyService]
    )));
    const controller = this.commentService.getCommentController(this._uniqueOwner);
    if (controller) {
      this._commentOptions = controller.options;
    }
    this._initialCollapsibleState = _pendingComment ? languages.CommentThreadCollapsibleState.Expanded : _commentThread.initialCollapsibleState;
    _commentThread.initialCollapsibleState = this._initialCollapsibleState;
    this._commentThreadDisposables = [];
    this.create();
    this._globalToDispose.add(this.themeService.onDidColorThemeChange(this._applyTheme, this));
    this._globalToDispose.add(this.editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.fontInfo)) {
        this._applyTheme(this.themeService.getColorTheme());
      }
    }));
    this._applyTheme(this.themeService.getColorTheme());
  }
  static {
    __name(this, "ReviewZoneWidget");
  }
  _commentThreadWidget;
  _onDidClose = new Emitter();
  _onDidCreateThread = new Emitter();
  _isExpanded;
  _initialCollapsibleState;
  _commentGlyph;
  _globalToDispose = new DisposableStore();
  _commentThreadDisposables = [];
  _contextKeyService;
  _scopedInstantiationService;
  get uniqueOwner() {
    return this._uniqueOwner;
  }
  get commentThread() {
    return this._commentThread;
  }
  get expanded() {
    return this._isExpanded;
  }
  _commentOptions;
  get onDidClose() {
    return this._onDidClose.event;
  }
  get onDidCreateThread() {
    return this._onDidCreateThread.event;
  }
  getPosition() {
    if (this.position) {
      return this.position;
    }
    if (this._commentGlyph) {
      return this._commentGlyph.getPosition().position ?? void 0;
    }
    return void 0;
  }
  revealRange() {
  }
  reveal(commentUniqueId, focus = 0 /* None */) {
    this.makeVisible(commentUniqueId, focus);
    const comment = this._commentThread.comments?.find((comment2) => comment2.uniqueIdInThread === commentUniqueId);
    this.commentService.setActiveCommentAndThread(this.uniqueOwner, { thread: this._commentThread, comment });
  }
  _expandAndShowZoneWidget() {
    if (!this._isExpanded) {
      this.show(this.arrowPosition(this._commentThread.range), 2);
    }
  }
  _setFocus(focus) {
    if (focus === 1 /* Widget */) {
      this._commentThreadWidget.focus();
    } else if (focus === 2 /* Editor */) {
      this._commentThreadWidget.focusCommentEditor();
    }
  }
  _goToComment(commentUniqueId, focus) {
    const height = this.editor.getLayoutInfo().height;
    const coords = this._commentThreadWidget.getCommentCoords(commentUniqueId);
    if (coords) {
      let scrollTop = 1;
      if (this._commentThread.range) {
        const commentThreadCoords = coords.thread;
        const commentCoords = coords.comment;
        scrollTop = this.editor.getTopForLineNumber(this._commentThread.range.startLineNumber) - height / 2 + commentCoords.top - commentThreadCoords.top;
      }
      this.editor.setScrollTop(scrollTop);
      this._setFocus(focus);
    } else {
      this._goToThread(focus);
    }
  }
  _goToThread(focus) {
    const rangeToReveal = this._commentThread.range ? new Range(this._commentThread.range.startLineNumber, this._commentThread.range.startColumn, this._commentThread.range.endLineNumber + 1, 1) : new Range(1, 1, 1, 1);
    this.editor.revealRangeInCenter(rangeToReveal);
    this._setFocus(focus);
  }
  makeVisible(commentUniqueId, focus = 0 /* None */) {
    this._expandAndShowZoneWidget();
    if (commentUniqueId !== void 0) {
      this._goToComment(commentUniqueId, focus);
    } else {
      this._goToThread(focus);
    }
  }
  getPendingComments() {
    return {
      newComment: this._commentThreadWidget.getPendingComment(),
      edits: this._commentThreadWidget.getPendingEdits()
    };
  }
  setPendingComment(comment) {
    this._pendingComment = comment;
    this.expand();
    this._commentThreadWidget.setPendingComment(comment);
  }
  _fillContainer(container) {
    this.setCssClass("review-widget");
    this._commentThreadWidget = this._scopedInstantiationService.createInstance(
      CommentThreadWidget,
      container,
      this.editor,
      this._uniqueOwner,
      this.editor.getModel().uri,
      this._contextKeyService,
      this._scopedInstantiationService,
      this._commentThread,
      this._pendingComment,
      this._pendingEdits,
      { editor: this.editor, codeBlockFontSize: "", codeBlockFontFamily: this.configurationService.getValue("editor").fontFamily || EDITOR_FONT_DEFAULTS.fontFamily },
      this._commentOptions,
      {
        actionRunner: /* @__PURE__ */ __name(async () => {
          if (!this._commentThread.comments || !this._commentThread.comments.length) {
            const newPosition = this.getPosition();
            if (newPosition) {
              const originalRange = this._commentThread.range;
              if (!originalRange) {
                return;
              }
              let range;
              if (newPosition.lineNumber !== originalRange.endLineNumber) {
                const distance = newPosition.lineNumber - originalRange.endLineNumber;
                range = new Range(originalRange.startLineNumber + distance, originalRange.startColumn, originalRange.endLineNumber + distance, originalRange.endColumn);
              } else {
                range = new Range(originalRange.startLineNumber, originalRange.startColumn, originalRange.endLineNumber, originalRange.endColumn);
              }
              await this.commentService.updateCommentThreadTemplate(this.uniqueOwner, this._commentThread.commentThreadHandle, range);
            }
          }
        }, "actionRunner"),
        collapse: /* @__PURE__ */ __name(() => {
          this.collapse();
        }, "collapse")
      }
    );
    this._disposables.add(this._commentThreadWidget);
  }
  arrowPosition(range) {
    if (!range) {
      return void 0;
    }
    return { lineNumber: range.endLineNumber, column: range.endLineNumber === range.startLineNumber ? (range.startColumn + range.endColumn + 1) / 2 : 1 };
  }
  deleteCommentThread() {
    this.dispose();
    this.commentService.disposeCommentThread(this.uniqueOwner, this._commentThread.threadId);
  }
  collapse() {
    this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
  }
  expand(setActive) {
    this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
    if (setActive) {
      this.commentService.setActiveCommentAndThread(this.uniqueOwner, { thread: this._commentThread });
    }
  }
  getGlyphPosition() {
    if (this._commentGlyph) {
      return this._commentGlyph.getPosition().position.lineNumber;
    }
    return 0;
  }
  async update(commentThread) {
    if (this._commentThread !== commentThread) {
      this._commentThreadDisposables.forEach((disposable) => disposable.dispose());
      this._commentThread = commentThread;
      this._commentThreadDisposables = [];
      this.bindCommentThreadListeners();
    }
    await this._commentThreadWidget.updateCommentThread(commentThread);
    const lineNumber = this._commentThread.range?.endLineNumber ?? 1;
    let shouldMoveWidget = false;
    if (this._commentGlyph) {
      this._commentGlyph.setThreadState(commentThread.state);
      if (this._commentGlyph.getPosition().position.lineNumber !== lineNumber) {
        shouldMoveWidget = true;
        this._commentGlyph.setLineNumber(lineNumber);
      }
    }
    if (shouldMoveWidget && this._isExpanded || this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded && !this._isExpanded) {
      this.show(this.arrowPosition(this._commentThread.range), 2);
    } else if (this._commentThread.collapsibleState !== languages.CommentThreadCollapsibleState.Expanded) {
      this.hide();
    }
  }
  _onWidth(widthInPixel) {
    this._commentThreadWidget.layout(widthInPixel);
  }
  _doLayout(heightInPixel, widthInPixel) {
    this._commentThreadWidget.layout(widthInPixel);
  }
  async display(range, shouldReveal) {
    if (range) {
      this._commentGlyph = new CommentGlyphWidget(this.editor, range?.endLineNumber ?? -1);
      this._commentGlyph.setThreadState(this._commentThread.state);
      this._globalToDispose.add(this._commentGlyph.onDidChangeLineNumber(async (e) => {
        if (!this._commentThread.range) {
          return;
        }
        const shift = e - this._commentThread.range.endLineNumber;
        const newRange = new Range(this._commentThread.range.startLineNumber + shift, this._commentThread.range.startColumn, this._commentThread.range.endLineNumber + shift, this._commentThread.range.endColumn);
        this._commentThread.range = newRange;
      }));
    }
    await this._commentThreadWidget.display(this.editor.getOption(EditorOption.lineHeight), shouldReveal);
    this._disposables.add(this._commentThreadWidget.onDidResize((dimension) => {
      this._refresh(dimension);
    }));
    if (this._commentThread.collapsibleState === languages.CommentThreadCollapsibleState.Expanded || range === void 0) {
      this.show(this.arrowPosition(range), 2);
    }
    if (shouldReveal) {
      this.makeVisible();
    }
    this.bindCommentThreadListeners();
  }
  bindCommentThreadListeners() {
    this._commentThreadDisposables.push(this._commentThread.onDidChangeComments(async (_) => {
      await this.update(this._commentThread);
    }));
    this._commentThreadDisposables.push(this._commentThread.onDidChangeCollapsibleState((state) => {
      if (state === languages.CommentThreadCollapsibleState.Expanded && !this._isExpanded) {
        this.show(this.arrowPosition(this._commentThread.range), 2);
        this._commentThreadWidget.ensureFocusIntoNewEditingComment();
        return;
      }
      if (state === languages.CommentThreadCollapsibleState.Collapsed && this._isExpanded) {
        this.hide();
        return;
      }
    }));
    if (this._initialCollapsibleState === void 0) {
      const onDidChangeInitialCollapsibleState = this._commentThread.onDidChangeInitialCollapsibleState((state) => {
        this._initialCollapsibleState = state;
        this._commentThread.collapsibleState = this._initialCollapsibleState;
        onDidChangeInitialCollapsibleState.dispose();
      });
      this._commentThreadDisposables.push(onDidChangeInitialCollapsibleState);
    }
    this._commentThreadDisposables.push(this._commentThread.onDidChangeState(() => {
      const borderColor = getCommentThreadWidgetStateColor(this._commentThread.state, this.themeService.getColorTheme()) || Color.transparent;
      this.style({
        frameColor: borderColor,
        arrowColor: borderColor
      });
      this.container?.style.setProperty(commentThreadStateColorVar, `${borderColor}`);
      this.container?.style.setProperty(commentThreadStateBackgroundColorVar, `${borderColor.transparent(0.1)}`);
    }));
  }
  async submitComment() {
    return this._commentThreadWidget.submitComment();
  }
  _refresh(dimensions) {
    if (this._isExpanded === void 0 && dimensions.height === 0 && dimensions.width === 0) {
      this.commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Collapsed;
      return;
    }
    if (this._isExpanded) {
      this._commentThreadWidget.layout();
      const headHeight = Math.ceil(this.editor.getOption(EditorOption.lineHeight) * 1.2);
      const lineHeight = this.editor.getOption(EditorOption.lineHeight);
      const arrowHeight = Math.round(lineHeight / 3);
      const frameThickness = Math.round(lineHeight / 9) * 2;
      const computedLinesNumber = Math.ceil((headHeight + dimensions.height + arrowHeight + frameThickness + 8) / lineHeight);
      if (this._viewZone?.heightInLines === computedLinesNumber) {
        return;
      }
      const currentPosition = this.getPosition();
      if (this._viewZone && currentPosition && currentPosition.lineNumber !== this._viewZone.afterLineNumber && this._viewZone.afterLineNumber !== 0) {
        this._viewZone.afterLineNumber = currentPosition.lineNumber;
      }
      const capture = StableEditorScrollState.capture(this.editor);
      this._relayout(computedLinesNumber);
      capture.restore(this.editor);
    }
  }
  _applyTheme(theme) {
    const borderColor = getCommentThreadWidgetStateColor(this._commentThread.state, this.themeService.getColorTheme()) || Color.transparent;
    this.style({
      arrowColor: borderColor,
      frameColor: borderColor
    });
    const fontInfo = this.editor.getOption(EditorOption.fontInfo);
    this._commentThreadWidget.applyTheme(theme, fontInfo);
  }
  show(rangeOrPos, heightInLines) {
    const glyphPosition = this._commentGlyph?.getPosition();
    let range = Range.isIRange(rangeOrPos) ? rangeOrPos : rangeOrPos ? Range.fromPositions(rangeOrPos) : void 0;
    if (glyphPosition?.position && range && glyphPosition.position.lineNumber !== range.endLineNumber) {
      const distance = glyphPosition.position.lineNumber - range.endLineNumber;
      range = new Range(range.startLineNumber + distance, range.startColumn, range.endLineNumber + distance, range.endColumn);
    }
    this._isExpanded = true;
    super.show(range ?? new Range(0, 0, 0, 0), heightInLines);
    this._commentThread.collapsibleState = languages.CommentThreadCollapsibleState.Expanded;
    this._refresh(this._commentThreadWidget.getDimensions());
  }
  hide() {
    if (this._isExpanded) {
      this._isExpanded = false;
      if (this.editor.hasWidgetFocus()) {
        this.editor.focus();
      }
      if (!this._commentThread.comments || !this._commentThread.comments.length) {
        this.deleteCommentThread();
      }
    }
    super.hide();
  }
  dispose() {
    super.dispose();
    if (this._commentGlyph) {
      this._commentGlyph.dispose();
      this._commentGlyph = void 0;
    }
    this._globalToDispose.dispose();
    this._commentThreadDisposables.forEach((global) => global.dispose());
    this._onDidClose.fire(void 0);
  }
};
ReviewZoneWidget = __decorateClass([
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, ICommentService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IConfigurationService)
], ReviewZoneWidget);
export {
  CommentWidgetFocus,
  ReviewZoneWidget,
  isMouseUpEventDragFromMouseDown,
  isMouseUpEventMatchMouseDown,
  parseMouseDownInfoFromEvent
};
//# sourceMappingURL=commentThreadZoneWidget.js.map
