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
import { Button } from "../../../../base/browser/ui/button/button.js";
import { toAction } from "../../../../base/common/actions.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { toErrorMessage } from "../../../../base/common/errorMessage.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, MutableDisposable, toDisposable } from "../../../../base/common/lifecycle.js";
import "./postEditWidget.css";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "../../../browser/editorBrowser.js";
import { IBulkEditResult, IBulkEditService } from "../../../browser/services/bulkEditService.js";
import { Range } from "../../../common/core/range.js";
import { DocumentDropEdit, DocumentPasteEdit } from "../../../common/languages.js";
import { TrackedRangeStickiness } from "../../../common/model.js";
import { createCombinedWorkspaceEdit } from "./edit.js";
import { localize } from "../../../../nls.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
let PostEditWidget = class extends Disposable {
  constructor(typeId, editor, visibleContext, showCommand, range, edits, onSelectNewEdit, _contextMenuService, contextKeyService, _keybindingService) {
    super();
    this.typeId = typeId;
    this.editor = editor;
    this.showCommand = showCommand;
    this.range = range;
    this.edits = edits;
    this.onSelectNewEdit = onSelectNewEdit;
    this._contextMenuService = _contextMenuService;
    this._keybindingService = _keybindingService;
    this.create();
    this.visibleContext = visibleContext.bindTo(contextKeyService);
    this.visibleContext.set(true);
    this._register(toDisposable(() => this.visibleContext.reset()));
    this.editor.addContentWidget(this);
    this.editor.layoutContentWidget(this);
    this._register(toDisposable(() => this.editor.removeContentWidget(this)));
    this._register(this.editor.onDidChangeCursorPosition((e) => {
      if (!range.containsPosition(e.position)) {
        this.dispose();
      }
    }));
    this._register(Event.runAndSubscribe(_keybindingService.onDidUpdateKeybindings, () => {
      this._updateButtonTitle();
    }));
  }
  static {
    __name(this, "PostEditWidget");
  }
  static baseId = "editor.widget.postEditWidget";
  allowEditorOverflow = true;
  suppressMouseDown = true;
  domNode;
  button;
  visibleContext;
  _updateButtonTitle() {
    const binding = this._keybindingService.lookupKeybinding(this.showCommand.id)?.getLabel();
    this.button.element.title = this.showCommand.label + (binding ? ` (${binding})` : "");
  }
  create() {
    this.domNode = dom.$(".post-edit-widget");
    this.button = this._register(new Button(this.domNode, {
      supportIcons: true
    }));
    this.button.label = "$(insert)";
    this._register(dom.addDisposableListener(this.domNode, dom.EventType.CLICK, () => this.showSelector()));
  }
  getId() {
    return PostEditWidget.baseId + "." + this.typeId;
  }
  getDomNode() {
    return this.domNode;
  }
  getPosition() {
    return {
      position: this.range.getEndPosition(),
      preference: [ContentWidgetPositionPreference.BELOW]
    };
  }
  showSelector() {
    this._contextMenuService.showContextMenu({
      getAnchor: /* @__PURE__ */ __name(() => {
        const pos = dom.getDomNodePagePosition(this.button.element);
        return { x: pos.left + pos.width, y: pos.top + pos.height };
      }, "getAnchor"),
      getActions: /* @__PURE__ */ __name(() => {
        return this.edits.allEdits.map((edit, i) => toAction({
          id: "",
          label: edit.title,
          checked: i === this.edits.activeEditIndex,
          run: /* @__PURE__ */ __name(() => {
            if (i !== this.edits.activeEditIndex) {
              return this.onSelectNewEdit(i);
            }
          }, "run")
        }));
      }, "getActions")
    });
  }
};
PostEditWidget = __decorateClass([
  __decorateParam(7, IContextMenuService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IKeybindingService)
], PostEditWidget);
let PostEditWidgetManager = class extends Disposable {
  constructor(_id, _editor, _visibleContext, _showCommand, _instantiationService, _bulkEditService, _notificationService) {
    super();
    this._id = _id;
    this._editor = _editor;
    this._visibleContext = _visibleContext;
    this._showCommand = _showCommand;
    this._instantiationService = _instantiationService;
    this._bulkEditService = _bulkEditService;
    this._notificationService = _notificationService;
    this._register(Event.any(
      _editor.onDidChangeModel,
      _editor.onDidChangeModelContent
    )(() => this.clear()));
  }
  static {
    __name(this, "PostEditWidgetManager");
  }
  _currentWidget = this._register(new MutableDisposable());
  async applyEditAndShowIfNeeded(ranges, edits, canShowWidget, resolve, token) {
    const model = this._editor.getModel();
    if (!model || !ranges.length) {
      return;
    }
    const edit = edits.allEdits.at(edits.activeEditIndex);
    if (!edit) {
      return;
    }
    const onDidSelectEdit = /* @__PURE__ */ __name(async (newEditIndex) => {
      const model2 = this._editor.getModel();
      if (!model2) {
        return;
      }
      await model2.undo();
      this.applyEditAndShowIfNeeded(ranges, { activeEditIndex: newEditIndex, allEdits: edits.allEdits }, canShowWidget, resolve, token);
    }, "onDidSelectEdit");
    const handleError = /* @__PURE__ */ __name((e, message) => {
      if (isCancellationError(e)) {
        return;
      }
      this._notificationService.error(message);
      if (canShowWidget) {
        this.show(ranges[0], edits, onDidSelectEdit);
      }
    }, "handleError");
    let resolvedEdit;
    try {
      resolvedEdit = await resolve(edit, token);
    } catch (e) {
      return handleError(e, localize("resolveError", "Error resolving edit '{0}':\n{1}", edit.title, toErrorMessage(e)));
    }
    if (token.isCancellationRequested) {
      return;
    }
    const combinedWorkspaceEdit = createCombinedWorkspaceEdit(model.uri, ranges, resolvedEdit);
    const primaryRange = ranges[0];
    const editTrackingDecoration = model.deltaDecorations([], [{
      range: primaryRange,
      options: { description: "paste-line-suffix", stickiness: TrackedRangeStickiness.AlwaysGrowsWhenTypingAtEdges }
    }]);
    this._editor.focus();
    let editResult;
    let editRange;
    try {
      editResult = await this._bulkEditService.apply(combinedWorkspaceEdit, { editor: this._editor, token });
      editRange = model.getDecorationRange(editTrackingDecoration[0]);
    } catch (e) {
      return handleError(e, localize("applyError", "Error applying edit '{0}':\n{1}", edit.title, toErrorMessage(e)));
    } finally {
      model.deltaDecorations(editTrackingDecoration, []);
    }
    if (token.isCancellationRequested) {
      return;
    }
    if (canShowWidget && editResult.isApplied && edits.allEdits.length > 1) {
      this.show(editRange ?? primaryRange, edits, onDidSelectEdit);
    }
  }
  show(range, edits, onDidSelectEdit) {
    this.clear();
    if (this._editor.hasModel()) {
      this._currentWidget.value = this._instantiationService.createInstance(PostEditWidget, this._id, this._editor, this._visibleContext, this._showCommand, range, edits, onDidSelectEdit);
    }
  }
  clear() {
    this._currentWidget.clear();
  }
  tryShowSelector() {
    this._currentWidget.value?.showSelector();
  }
};
PostEditWidgetManager = __decorateClass([
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IBulkEditService),
  __decorateParam(6, INotificationService)
], PostEditWidgetManager);
export {
  PostEditWidgetManager
};
//# sourceMappingURL=postEditWidget.js.map
