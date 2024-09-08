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
import { AsyncIterableObject } from "../../../../../base/common/async.js";
import * as nls from "../../../../../nls.js";
import { IThemeService } from "../../../../../platform/theme/common/themeService.js";
import {
  HoverAnchorType,
  RenderedHoverParts
} from "../../../hover/browser/hoverTypes.js";
import { ColorDetector } from "../colorDetector.js";
import {
  createColorHover,
  renderHoverParts
} from "../colorPickerParticipantUtils.js";
class ColorHover {
  constructor(owner, range, model, provider) {
    this.owner = owner;
    this.range = range;
    this.model = model;
    this.provider = provider;
  }
  /**
   * Force the hover to always be rendered at this specific range,
   * even in the case of multiple hover parts.
   */
  forceShowAtRange = true;
  isValidForHoverAnchor(anchor) {
    return anchor.type === HoverAnchorType.Range && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
}
let HoverColorPickerParticipant = class {
  constructor(_editor, _themeService) {
    this._editor = _editor;
    this._themeService = _themeService;
  }
  hoverOrdinal = 2;
  _colorPicker;
  computeSync(_anchor, _lineDecorations) {
    return [];
  }
  computeAsync(anchor, lineDecorations, token) {
    return AsyncIterableObject.fromPromise(
      this._computeAsync(anchor, lineDecorations, token)
    );
  }
  async _computeAsync(_anchor, lineDecorations, _token) {
    if (!this._editor.hasModel()) {
      return [];
    }
    const colorDetector = ColorDetector.get(this._editor);
    if (!colorDetector) {
      return [];
    }
    for (const d of lineDecorations) {
      if (!colorDetector.isColorDecoration(d)) {
        continue;
      }
      const colorData = colorDetector.getColorData(
        d.range.getStartPosition()
      );
      if (colorData) {
        const colorHover = await createColorHover(
          this,
          this._editor.getModel(),
          colorData.colorInfo,
          colorData.provider
        );
        return [colorHover];
      }
    }
    return [];
  }
  renderHoverParts(context, hoverParts) {
    const renderedPart = renderHoverParts(
      this,
      this._editor,
      this._themeService,
      hoverParts,
      context
    );
    if (!renderedPart) {
      return new RenderedHoverParts([]);
    }
    this._colorPicker = renderedPart.colorPicker;
    const renderedHoverPart = {
      hoverPart: renderedPart.hoverPart,
      hoverElement: this._colorPicker.domNode,
      dispose() {
        renderedPart.disposables.dispose();
      }
    };
    return new RenderedHoverParts([renderedHoverPart]);
  }
  getAccessibleContent(hoverPart) {
    return nls.localize(
      "hoverAccessibilityColorParticipant",
      "There is a color picker here."
    );
  }
  handleResize() {
    this._colorPicker?.layout();
  }
  isColorPickerVisible() {
    return !!this._colorPicker;
  }
};
HoverColorPickerParticipant = __decorateClass([
  __decorateParam(1, IThemeService)
], HoverColorPickerParticipant);
export {
  ColorHover,
  HoverColorPickerParticipant
};
