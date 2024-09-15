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
import { coalesce } from "../../../../../../base/common/arrays.js";
import { DisposableMap, DisposableStore } from "../../../../../../base/common/lifecycle.js";
import { EDITOR_FONT_DEFAULTS, IEditorOptions } from "../../../../../../editor/common/config/editorOptions.js";
import * as languages from "../../../../../../editor/common/languages.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { ICommentService, INotebookCommentInfo } from "../../../../comments/browser/commentService.js";
import { CommentThreadWidget } from "../../../../comments/browser/commentThreadWidget.js";
import { ICellViewModel, INotebookEditorDelegate } from "../../notebookBrowser.js";
import { CellContentPart } from "../cellPart.js";
import { ICellRange } from "../../../common/notebookRange.js";
let CellComments = class extends CellContentPart {
  constructor(notebookEditor, container, contextKeyService, themeService, commentService, configurationService, instantiationService) {
    super();
    this.notebookEditor = notebookEditor;
    this.container = container;
    this.contextKeyService = contextKeyService;
    this.themeService = themeService;
    this.commentService = commentService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.container.classList.add("review-widget");
    this._register(this._commentThreadWidgets = new DisposableMap());
    this._register(this.themeService.onDidColorThemeChange(this._applyTheme, this));
    this._applyTheme();
  }
  static {
    __name(this, "CellComments");
  }
  // keyed by threadId
  _commentThreadWidgets;
  currentElement;
  async initialize(element) {
    if (this.currentElement === element) {
      return;
    }
    this.currentElement = element;
    await this._updateThread();
  }
  async _createCommentTheadWidget(owner, commentThread) {
    const widgetDisposables = new DisposableStore();
    const widget = this.instantiationService.createInstance(
      CommentThreadWidget,
      this.container,
      this.notebookEditor,
      owner,
      this.notebookEditor.textModel.uri,
      this.contextKeyService,
      this.instantiationService,
      commentThread,
      void 0,
      void 0,
      {
        codeBlockFontFamily: this.configurationService.getValue("editor").fontFamily || EDITOR_FONT_DEFAULTS.fontFamily
      },
      void 0,
      {
        actionRunner: /* @__PURE__ */ __name(() => {
        }, "actionRunner"),
        collapse: /* @__PURE__ */ __name(() => {
        }, "collapse")
      }
    );
    widgetDisposables.add(widget);
    this._commentThreadWidgets.set(commentThread.threadId, { widget, dispose: /* @__PURE__ */ __name(() => widgetDisposables.dispose(), "dispose") });
    const layoutInfo = this.notebookEditor.getLayoutInfo();
    await widget.display(layoutInfo.fontInfo.lineHeight, true);
    this._applyTheme();
    widgetDisposables.add(widget.onDidResize(() => {
      if (this.currentElement) {
        this.currentElement.commentHeight = this._calculateCommentThreadHeight(widget.getDimensions().height);
      }
    }));
  }
  _bindListeners() {
    this.cellDisposables.add(this.commentService.onDidUpdateCommentThreads(async () => this._updateThread()));
  }
  async _updateThread() {
    if (!this.currentElement) {
      return;
    }
    const infos = await this._getCommentThreadsForCell(this.currentElement);
    const widgetsToDelete = new Set(this._commentThreadWidgets.keys());
    const layoutInfo = this.currentElement.layoutInfo;
    this.container.style.top = `${layoutInfo.commentOffset}px`;
    for (const info of infos) {
      if (!info) {
        continue;
      }
      for (const thread of info.threads) {
        widgetsToDelete.delete(thread.threadId);
        const widget = this._commentThreadWidgets.get(thread.threadId)?.widget;
        if (widget) {
          await widget.updateCommentThread(thread);
        } else {
          await this._createCommentTheadWidget(info.uniqueOwner, thread);
        }
      }
    }
    for (const threadId of widgetsToDelete) {
      this._commentThreadWidgets.deleteAndDispose(threadId);
    }
    this._updateHeight();
  }
  _calculateCommentThreadHeight(bodyHeight) {
    const layoutInfo = this.notebookEditor.getLayoutInfo();
    const headHeight = Math.ceil(layoutInfo.fontInfo.lineHeight * 1.2);
    const lineHeight = layoutInfo.fontInfo.lineHeight;
    const arrowHeight = Math.round(lineHeight / 3);
    const frameThickness = Math.round(lineHeight / 9) * 2;
    const computedHeight = headHeight + bodyHeight + arrowHeight + frameThickness + 8;
    return computedHeight;
  }
  _updateHeight() {
    if (!this.currentElement) {
      return;
    }
    let height = 0;
    for (const { widget } of this._commentThreadWidgets.values()) {
      height += this._calculateCommentThreadHeight(widget.getDimensions().height);
    }
    this.currentElement.commentHeight = height;
  }
  async _getCommentThreadsForCell(element) {
    if (this.notebookEditor.hasModel()) {
      return coalesce(await this.commentService.getNotebookComments(element.uri));
    }
    return [];
  }
  _applyTheme() {
    const theme = this.themeService.getColorTheme();
    const fontInfo = this.notebookEditor.getLayoutInfo().fontInfo;
    for (const { widget } of this._commentThreadWidgets.values()) {
      widget.applyTheme(theme, fontInfo);
    }
  }
  didRenderCell(element) {
    this.initialize(element);
    this._bindListeners();
  }
  prepareLayout() {
    this._updateHeight();
  }
  updateInternalLayoutNow(element) {
    if (this.currentElement) {
      this.container.style.top = `${element.layoutInfo.commentOffset}px`;
    }
  }
};
CellComments = __decorateClass([
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IThemeService),
  __decorateParam(4, ICommentService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IInstantiationService)
], CellComments);
export {
  CellComments
};
//# sourceMappingURL=cellComments.js.map
