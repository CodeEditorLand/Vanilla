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
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { constObservable } from "../../../../base/common/observable.js";
import * as nls from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  MouseTargetType
} from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import {
  HoverAnchorType,
  HoverForeignElementAnchor,
  RenderedHoverParts
} from "../../hover/browser/hoverTypes.js";
import { InlineEditController } from "./inlineEditController.js";
import { InlineEditHintsContentWidget } from "./inlineEditHintsWidget.js";
class InlineEditHover {
  constructor(owner, range, controller) {
    this.owner = owner;
    this.range = range;
    this.controller = controller;
  }
  static {
    __name(this, "InlineEditHover");
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === HoverAnchorType.Range && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
}
let InlineEditHoverParticipant = class {
  constructor(_editor, _instantiationService, _telemetryService) {
    this._editor = _editor;
    this._instantiationService = _instantiationService;
    this._telemetryService = _telemetryService;
  }
  static {
    __name(this, "InlineEditHoverParticipant");
  }
  hoverOrdinal = 5;
  suggestHoverAnchor(mouseEvent) {
    const controller = InlineEditController.get(this._editor);
    if (!controller) {
      return null;
    }
    const target = mouseEvent.target;
    if (target.type === MouseTargetType.CONTENT_VIEW_ZONE) {
      const viewZoneData = target.detail;
      if (controller.shouldShowHoverAtViewZone(viewZoneData.viewZoneId)) {
        const range = target.range;
        return new HoverForeignElementAnchor(
          1e3,
          this,
          range,
          mouseEvent.event.posx,
          mouseEvent.event.posy,
          false
        );
      }
    }
    if (target.type === MouseTargetType.CONTENT_EMPTY) {
      if (controller.shouldShowHoverAt(target.range)) {
        return new HoverForeignElementAnchor(
          1e3,
          this,
          target.range,
          mouseEvent.event.posx,
          mouseEvent.event.posy,
          false
        );
      }
    }
    if (target.type === MouseTargetType.CONTENT_TEXT) {
      const mightBeForeignElement = target.detail.mightBeForeignElement;
      if (mightBeForeignElement && controller.shouldShowHoverAt(target.range)) {
        return new HoverForeignElementAnchor(
          1e3,
          this,
          target.range,
          mouseEvent.event.posx,
          mouseEvent.event.posy,
          false
        );
      }
    }
    return null;
  }
  computeSync(anchor, lineDecorations) {
    if (this._editor.getOption(EditorOption.inlineEdit).showToolbar !== "onHover") {
      return [];
    }
    const controller = InlineEditController.get(this._editor);
    if (controller && controller.shouldShowHoverAt(anchor.range)) {
      return [new InlineEditHover(this, anchor.range, controller)];
    }
    return [];
  }
  renderHoverParts(context, hoverParts) {
    const disposables = new DisposableStore();
    this._telemetryService.publicLog2("inlineEditHover.shown");
    const w = this._instantiationService.createInstance(
      InlineEditHintsContentWidget,
      this._editor,
      false,
      constObservable(null)
    );
    disposables.add(w);
    const widgetNode = w.getDomNode();
    const renderedHoverPart = {
      hoverPart: hoverParts[0],
      hoverElement: widgetNode,
      dispose: /* @__PURE__ */ __name(() => disposables.dispose(), "dispose")
    };
    return new RenderedHoverParts([renderedHoverPart]);
  }
  getAccessibleContent(hoverPart) {
    return nls.localize(
      "hoverAccessibilityInlineEdits",
      "There are inline edits here."
    );
  }
};
InlineEditHoverParticipant = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ITelemetryService)
], InlineEditHoverParticipant);
export {
  InlineEditHover,
  InlineEditHoverParticipant
};
//# sourceMappingURL=hoverParticipant.js.map
