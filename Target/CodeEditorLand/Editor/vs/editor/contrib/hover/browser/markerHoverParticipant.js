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
import { isNonEmptyArray } from "../../../../base/common/arrays.js";
import { CancelablePromise, createCancelablePromise, disposableTimeout } from "../../../../base/common/async.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Disposable, DisposableStore, toDisposable } from "../../../../base/common/lifecycle.js";
import { basename } from "../../../../base/common/resources.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { Range } from "../../../common/core/range.js";
import { CodeActionTriggerType } from "../../../common/languages.js";
import { IModelDecoration } from "../../../common/model.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { IMarkerDecorationsService } from "../../../common/services/markerDecorations.js";
import { getCodeActions, quickFixCommandId } from "../../codeAction/browser/codeAction.js";
import { CodeActionController } from "../../codeAction/browser/codeActionController.js";
import { CodeActionKind, CodeActionSet, CodeActionTrigger, CodeActionTriggerSource } from "../../codeAction/common/types.js";
import { MarkerController, NextMarkerAction } from "../../gotoError/browser/gotoError.js";
import { HoverAnchor, HoverAnchorType, IEditorHoverParticipant, IEditorHoverRenderContext, IHoverPart, IRenderedHoverPart, IRenderedHoverParts, RenderedHoverParts } from "./hoverTypes.js";
import * as nls from "../../../../nls.js";
import { ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import { IMarker, IMarkerData, MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { Progress } from "../../../../platform/progress/common/progress.js";
const $ = dom.$;
class MarkerHover {
  constructor(owner, range, marker) {
    this.owner = owner;
    this.range = range;
    this.marker = marker;
  }
  static {
    __name(this, "MarkerHover");
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === HoverAnchorType.Range && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
}
const markerCodeActionTrigger = {
  type: CodeActionTriggerType.Invoke,
  filter: { include: CodeActionKind.QuickFix },
  triggerAction: CodeActionTriggerSource.QuickFixHover
};
let MarkerHoverParticipant = class {
  constructor(_editor, _markerDecorationsService, _openerService, _languageFeaturesService) {
    this._editor = _editor;
    this._markerDecorationsService = _markerDecorationsService;
    this._openerService = _openerService;
    this._languageFeaturesService = _languageFeaturesService;
  }
  static {
    __name(this, "MarkerHoverParticipant");
  }
  hoverOrdinal = 1;
  recentMarkerCodeActionsInfo = void 0;
  computeSync(anchor, lineDecorations) {
    if (!this._editor.hasModel() || anchor.type !== HoverAnchorType.Range && !anchor.supportsMarkerHover) {
      return [];
    }
    const model = this._editor.getModel();
    const lineNumber = anchor.range.startLineNumber;
    const maxColumn = model.getLineMaxColumn(lineNumber);
    const result = [];
    for (const d of lineDecorations) {
      const startColumn = d.range.startLineNumber === lineNumber ? d.range.startColumn : 1;
      const endColumn = d.range.endLineNumber === lineNumber ? d.range.endColumn : maxColumn;
      const marker = this._markerDecorationsService.getMarker(model.uri, d);
      if (!marker) {
        continue;
      }
      const range = new Range(anchor.range.startLineNumber, startColumn, anchor.range.startLineNumber, endColumn);
      result.push(new MarkerHover(this, range, marker));
    }
    return result;
  }
  renderHoverParts(context, hoverParts) {
    if (!hoverParts.length) {
      return new RenderedHoverParts([]);
    }
    const disposables = new DisposableStore();
    const renderedHoverParts = [];
    hoverParts.forEach((hoverPart) => {
      const renderedMarkerHover = this._renderMarkerHover(hoverPart);
      context.fragment.appendChild(renderedMarkerHover.hoverElement);
      renderedHoverParts.push(renderedMarkerHover);
    });
    const markerHoverForStatusbar = hoverParts.length === 1 ? hoverParts[0] : hoverParts.sort((a, b) => MarkerSeverity.compare(a.marker.severity, b.marker.severity))[0];
    this.renderMarkerStatusbar(context, markerHoverForStatusbar, disposables);
    return new RenderedHoverParts(renderedHoverParts);
  }
  getAccessibleContent(hoverPart) {
    return hoverPart.marker.message;
  }
  _renderMarkerHover(markerHover) {
    const disposables = new DisposableStore();
    const hoverElement = $("div.hover-row");
    const markerElement = dom.append(hoverElement, $("div.marker.hover-contents"));
    const { source, message, code, relatedInformation } = markerHover.marker;
    this._editor.applyFontInfo(markerElement);
    const messageElement = dom.append(markerElement, $("span"));
    messageElement.style.whiteSpace = "pre-wrap";
    messageElement.innerText = message;
    if (source || code) {
      if (code && typeof code !== "string") {
        const sourceAndCodeElement = $("span");
        if (source) {
          const sourceElement = dom.append(sourceAndCodeElement, $("span"));
          sourceElement.innerText = source;
        }
        const codeLink = dom.append(sourceAndCodeElement, $("a.code-link"));
        codeLink.setAttribute("href", code.target.toString(true));
        disposables.add(dom.addDisposableListener(codeLink, "click", (e) => {
          this._openerService.open(code.target, { allowCommands: true });
          e.preventDefault();
          e.stopPropagation();
        }));
        const codeElement = dom.append(codeLink, $("span"));
        codeElement.innerText = code.value;
        const detailsElement = dom.append(markerElement, sourceAndCodeElement);
        detailsElement.style.opacity = "0.6";
        detailsElement.style.paddingLeft = "6px";
      } else {
        const detailsElement = dom.append(markerElement, $("span"));
        detailsElement.style.opacity = "0.6";
        detailsElement.style.paddingLeft = "6px";
        detailsElement.innerText = source && code ? `${source}(${code})` : source ? source : `(${code})`;
      }
    }
    if (isNonEmptyArray(relatedInformation)) {
      for (const { message: message2, resource, startLineNumber, startColumn } of relatedInformation) {
        const relatedInfoContainer = dom.append(markerElement, $("div"));
        relatedInfoContainer.style.marginTop = "8px";
        const a = dom.append(relatedInfoContainer, $("a"));
        a.innerText = `${basename(resource)}(${startLineNumber}, ${startColumn}): `;
        a.style.cursor = "pointer";
        disposables.add(dom.addDisposableListener(a, "click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          if (this._openerService) {
            const editorOptions = { selection: { startLineNumber, startColumn } };
            this._openerService.open(resource, {
              fromUserGesture: true,
              editorOptions
            }).catch(onUnexpectedError);
          }
        }));
        const messageElement2 = dom.append(relatedInfoContainer, $("span"));
        messageElement2.innerText = message2;
        this._editor.applyFontInfo(messageElement2);
      }
    }
    const renderedHoverPart = {
      hoverPart: markerHover,
      hoverElement,
      dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose")
    };
    return renderedHoverPart;
  }
  renderMarkerStatusbar(context, markerHover, disposables) {
    if (markerHover.marker.severity === MarkerSeverity.Error || markerHover.marker.severity === MarkerSeverity.Warning || markerHover.marker.severity === MarkerSeverity.Info) {
      const markerController = MarkerController.get(this._editor);
      if (markerController) {
        context.statusBar.addAction({
          label: nls.localize("view problem", "View Problem"),
          commandId: NextMarkerAction.ID,
          run: /* @__PURE__ */ __name(() => {
            context.hide();
            markerController.showAtMarker(markerHover.marker);
            this._editor.focus();
          }, "run")
        });
      }
    }
    if (!this._editor.getOption(EditorOption.readOnly)) {
      const quickfixPlaceholderElement = context.statusBar.append($("div"));
      if (this.recentMarkerCodeActionsInfo) {
        if (IMarkerData.makeKey(this.recentMarkerCodeActionsInfo.marker) === IMarkerData.makeKey(markerHover.marker)) {
          if (!this.recentMarkerCodeActionsInfo.hasCodeActions) {
            quickfixPlaceholderElement.textContent = nls.localize("noQuickFixes", "No quick fixes available");
          }
        } else {
          this.recentMarkerCodeActionsInfo = void 0;
        }
      }
      const updatePlaceholderDisposable = this.recentMarkerCodeActionsInfo && !this.recentMarkerCodeActionsInfo.hasCodeActions ? Disposable.None : disposableTimeout(() => quickfixPlaceholderElement.textContent = nls.localize("checkingForQuickFixes", "Checking for quick fixes..."), 200, disposables);
      if (!quickfixPlaceholderElement.textContent) {
        quickfixPlaceholderElement.textContent = String.fromCharCode(160);
      }
      const codeActionsPromise = this.getCodeActions(markerHover.marker);
      disposables.add(toDisposable(() => codeActionsPromise.cancel()));
      codeActionsPromise.then((actions) => {
        updatePlaceholderDisposable.dispose();
        this.recentMarkerCodeActionsInfo = { marker: markerHover.marker, hasCodeActions: actions.validActions.length > 0 };
        if (!this.recentMarkerCodeActionsInfo.hasCodeActions) {
          actions.dispose();
          quickfixPlaceholderElement.textContent = nls.localize("noQuickFixes", "No quick fixes available");
          return;
        }
        quickfixPlaceholderElement.style.display = "none";
        let showing = false;
        disposables.add(toDisposable(() => {
          if (!showing) {
            actions.dispose();
          }
        }));
        context.statusBar.addAction({
          label: nls.localize("quick fixes", "Quick Fix..."),
          commandId: quickFixCommandId,
          run: /* @__PURE__ */ __name((target) => {
            showing = true;
            const controller = CodeActionController.get(this._editor);
            const elementPosition = dom.getDomNodePagePosition(target);
            context.hide();
            controller?.showCodeActions(markerCodeActionTrigger, actions, {
              x: elementPosition.left,
              y: elementPosition.top,
              width: elementPosition.width,
              height: elementPosition.height
            });
          }, "run")
        });
      }, onUnexpectedError);
    }
  }
  getCodeActions(marker) {
    return createCancelablePromise((cancellationToken) => {
      return getCodeActions(
        this._languageFeaturesService.codeActionProvider,
        this._editor.getModel(),
        new Range(marker.startLineNumber, marker.startColumn, marker.endLineNumber, marker.endColumn),
        markerCodeActionTrigger,
        Progress.None,
        cancellationToken
      );
    });
  }
};
MarkerHoverParticipant = __decorateClass([
  __decorateParam(1, IMarkerDecorationsService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, ILanguageFeaturesService)
], MarkerHoverParticipant);
export {
  MarkerHover,
  MarkerHoverParticipant
};
//# sourceMappingURL=markerHoverParticipant.js.map
