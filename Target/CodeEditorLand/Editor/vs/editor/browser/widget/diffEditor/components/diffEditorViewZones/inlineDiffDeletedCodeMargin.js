var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { addStandardDisposableListener, getDomNodePagePosition } from "../../../../../../base/browser/dom.js";
import { Action } from "../../../../../../base/common/actions.js";
import { Codicon } from "../../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { isIOS } from "../../../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../../../base/common/themables.js";
import { IEditorMouseEvent, MouseTargetType } from "../../../../editorBrowser.js";
import { CodeEditorWidget } from "../../../codeEditor/codeEditorWidget.js";
import { DiffEditorWidget } from "../../diffEditorWidget.js";
import { EditorOption } from "../../../../../common/config/editorOptions.js";
import { DetailedLineRangeMapping } from "../../../../../common/diff/rangeMapping.js";
import { EndOfLineSequence, ITextModel } from "../../../../../common/model.js";
import { localize } from "../../../../../../nls.js";
import { IClipboardService } from "../../../../../../platform/clipboard/common/clipboardService.js";
import { IContextMenuService } from "../../../../../../platform/contextview/browser/contextView.js";
class InlineDiffDeletedCodeMargin extends Disposable {
  constructor(_getViewZoneId, _marginDomNode, _modifiedEditor, _diff, _editor, _viewLineCounts, _originalTextModel, _contextMenuService, _clipboardService) {
    super();
    this._getViewZoneId = _getViewZoneId;
    this._marginDomNode = _marginDomNode;
    this._modifiedEditor = _modifiedEditor;
    this._diff = _diff;
    this._editor = _editor;
    this._viewLineCounts = _viewLineCounts;
    this._originalTextModel = _originalTextModel;
    this._contextMenuService = _contextMenuService;
    this._clipboardService = _clipboardService;
    this._marginDomNode.style.zIndex = "10";
    this._diffActions = document.createElement("div");
    this._diffActions.className = ThemeIcon.asClassName(Codicon.lightBulb) + " lightbulb-glyph";
    this._diffActions.style.position = "absolute";
    const lineHeight = this._modifiedEditor.getOption(EditorOption.lineHeight);
    this._diffActions.style.right = "0px";
    this._diffActions.style.visibility = "hidden";
    this._diffActions.style.height = `${lineHeight}px`;
    this._diffActions.style.lineHeight = `${lineHeight}px`;
    this._marginDomNode.appendChild(this._diffActions);
    let currentLineNumberOffset = 0;
    const useShadowDOM = _modifiedEditor.getOption(EditorOption.useShadowDOM) && !isIOS;
    const showContextMenu = /* @__PURE__ */ __name((x, y) => {
      this._contextMenuService.showContextMenu({
        domForShadowRoot: useShadowDOM ? _modifiedEditor.getDomNode() ?? void 0 : void 0,
        getAnchor: /* @__PURE__ */ __name(() => ({ x, y }), "getAnchor"),
        getActions: /* @__PURE__ */ __name(() => {
          const actions = [];
          const isDeletion = _diff.modified.isEmpty;
          actions.push(new Action(
            "diff.clipboard.copyDeletedContent",
            isDeletion ? _diff.original.length > 1 ? localize("diff.clipboard.copyDeletedLinesContent.label", "Copy deleted lines") : localize("diff.clipboard.copyDeletedLinesContent.single.label", "Copy deleted line") : _diff.original.length > 1 ? localize("diff.clipboard.copyChangedLinesContent.label", "Copy changed lines") : localize("diff.clipboard.copyChangedLinesContent.single.label", "Copy changed line"),
            void 0,
            true,
            async () => {
              const originalText = this._originalTextModel.getValueInRange(_diff.original.toExclusiveRange());
              await this._clipboardService.writeText(originalText);
            }
          ));
          if (_diff.original.length > 1) {
            actions.push(new Action(
              "diff.clipboard.copyDeletedLineContent",
              isDeletion ? localize(
                "diff.clipboard.copyDeletedLineContent.label",
                "Copy deleted line ({0})",
                _diff.original.startLineNumber + currentLineNumberOffset
              ) : localize(
                "diff.clipboard.copyChangedLineContent.label",
                "Copy changed line ({0})",
                _diff.original.startLineNumber + currentLineNumberOffset
              ),
              void 0,
              true,
              async () => {
                let lineContent = this._originalTextModel.getLineContent(_diff.original.startLineNumber + currentLineNumberOffset);
                if (lineContent === "") {
                  const eof = this._originalTextModel.getEndOfLineSequence();
                  lineContent = eof === EndOfLineSequence.LF ? "\n" : "\r\n";
                }
                await this._clipboardService.writeText(lineContent);
              }
            ));
          }
          const readOnly = _modifiedEditor.getOption(EditorOption.readOnly);
          if (!readOnly) {
            actions.push(
              new Action(
                "diff.inline.revertChange",
                localize("diff.inline.revertChange.label", "Revert this change"),
                void 0,
                true,
                async () => {
                  this._editor.revert(this._diff);
                }
              )
            );
          }
          return actions;
        }, "getActions"),
        autoSelectFirstItem: true
      });
    }, "showContextMenu");
    this._register(addStandardDisposableListener(this._diffActions, "mousedown", (e) => {
      if (!e.leftButton) {
        return;
      }
      const { top, height } = getDomNodePagePosition(this._diffActions);
      const pad = Math.floor(lineHeight / 3);
      e.preventDefault();
      showContextMenu(e.posx, top + height + pad);
    }));
    this._register(_modifiedEditor.onMouseMove((e) => {
      if ((e.target.type === MouseTargetType.CONTENT_VIEW_ZONE || e.target.type === MouseTargetType.GUTTER_VIEW_ZONE) && e.target.detail.viewZoneId === this._getViewZoneId()) {
        currentLineNumberOffset = this._updateLightBulbPosition(this._marginDomNode, e.event.browserEvent.y, lineHeight);
        this.visibility = true;
      } else {
        this.visibility = false;
      }
    }));
    this._register(_modifiedEditor.onMouseDown((e) => {
      if (!e.event.leftButton) {
        return;
      }
      if (e.target.type === MouseTargetType.CONTENT_VIEW_ZONE || e.target.type === MouseTargetType.GUTTER_VIEW_ZONE) {
        const viewZoneId = e.target.detail.viewZoneId;
        if (viewZoneId === this._getViewZoneId()) {
          e.event.preventDefault();
          currentLineNumberOffset = this._updateLightBulbPosition(this._marginDomNode, e.event.browserEvent.y, lineHeight);
          showContextMenu(e.event.posx, e.event.posy + lineHeight);
        }
      }
    }));
  }
  static {
    __name(this, "InlineDiffDeletedCodeMargin");
  }
  _diffActions;
  _visibility = false;
  get visibility() {
    return this._visibility;
  }
  set visibility(_visibility) {
    if (this._visibility !== _visibility) {
      this._visibility = _visibility;
      this._diffActions.style.visibility = _visibility ? "visible" : "hidden";
    }
  }
  _updateLightBulbPosition(marginDomNode, y, lineHeight) {
    const { top } = getDomNodePagePosition(marginDomNode);
    const offset = y - top;
    const lineNumberOffset = Math.floor(offset / lineHeight);
    const newTop = lineNumberOffset * lineHeight;
    this._diffActions.style.top = `${newTop}px`;
    if (this._viewLineCounts) {
      let acc = 0;
      for (let i = 0; i < this._viewLineCounts.length; i++) {
        acc += this._viewLineCounts[i];
        if (lineNumberOffset < acc) {
          return i;
        }
      }
    }
    return lineNumberOffset;
  }
}
export {
  InlineDiffDeletedCodeMargin
};
//# sourceMappingURL=inlineDiffDeletedCodeMargin.js.map
