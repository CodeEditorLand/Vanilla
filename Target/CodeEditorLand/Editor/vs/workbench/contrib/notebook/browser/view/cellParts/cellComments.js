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
import { DisposableStore, MutableDisposable } from "../../../../../../base/common/lifecycle.js";
import { EDITOR_FONT_DEFAULTS, IEditorOptions } from "../../../../../../editor/common/config/editorOptions.js";
import * as languages from "../../../../../../editor/common/languages.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IThemeService } from "../../../../../../platform/theme/common/themeService.js";
import { ICommentService } from "../../../../comments/browser/commentService.js";
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
    this._register(this._commentThreadWidget = new MutableDisposable());
    this._register(this.themeService.onDidColorThemeChange(this._applyTheme, this));
    this._applyTheme();
  }
  static {
    __name(this, "CellComments");
  }
  _commentThreadWidget;
  currentElement;
  _commentThreadDisposables = this._register(new DisposableStore());
  async initialize(element) {
    if (this.currentElement === element) {
      return;
    }
    this.currentElement = element;
    await this._updateThread();
  }
  async _createCommentTheadWidget(owner, commentThread) {
    this._commentThreadDisposables.clear();
    this._commentThreadWidget.value = this.instantiationService.createInstance(
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
    const layoutInfo = this.notebookEditor.getLayoutInfo();
    await this._commentThreadWidget.value.display(layoutInfo.fontInfo.lineHeight, true);
    this._applyTheme();
    this._commentThreadDisposables.add(this._commentThreadWidget.value.onDidResize(() => {
      if (this.currentElement && this._commentThreadWidget.value) {
        this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.value.getDimensions().height);
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
    const info = await this._getCommentThreadForCell(this.currentElement);
    if (!this._commentThreadWidget.value && info) {
      await this._createCommentTheadWidget(info.owner, info.thread);
      this.container.style.top = `${this.currentElement.layoutInfo.commentOffset}px`;
      this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.value.getDimensions().height);
      return;
    }
    if (this._commentThreadWidget.value) {
      if (!info) {
        this._commentThreadDisposables.clear();
        this._commentThreadWidget.value = void 0;
        this.currentElement.commentHeight = 0;
        return;
      }
      await this._commentThreadWidget.value.updateCommentThread(info.thread);
      this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.value.getDimensions().height);
    }
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
  async _getCommentThreadForCell(element) {
    if (this.notebookEditor.hasModel()) {
      const commentInfos = coalesce(await this.commentService.getNotebookComments(element.uri));
      for (const commentInfo of commentInfos) {
        for (const thread of commentInfo.threads) {
          return { owner: commentInfo.uniqueOwner, thread };
        }
      }
    }
    return null;
  }
  _applyTheme() {
    const theme = this.themeService.getColorTheme();
    const fontInfo = this.notebookEditor.getLayoutInfo().fontInfo;
    this._commentThreadWidget.value?.applyTheme(theme, fontInfo);
  }
  didRenderCell(element) {
    this.initialize(element);
    this._bindListeners();
  }
  prepareLayout() {
    if (this.currentElement && this._commentThreadWidget.value) {
      this.currentElement.commentHeight = this._calculateCommentThreadHeight(this._commentThreadWidget.value.getDimensions().height);
    }
  }
  updateInternalLayoutNow(element) {
    if (this.currentElement && this._commentThreadWidget.value) {
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
