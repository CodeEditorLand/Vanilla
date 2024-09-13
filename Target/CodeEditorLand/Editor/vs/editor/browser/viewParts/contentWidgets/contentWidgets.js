var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as dom from "../../../../base/browser/dom.js";
import {
  createFastDomNode
} from "../../../../base/browser/fastDomNode.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { PositionAffinity } from "../../../common/model.js";
import {
  ContentWidgetPositionPreference
} from "../../editorBrowser.js";
import {
  PartFingerprint,
  PartFingerprints,
  ViewPart
} from "../../view/viewPart.js";
class ViewContentWidgets extends ViewPart {
  static {
    __name(this, "ViewContentWidgets");
  }
  _viewDomNode;
  _widgets;
  domNode;
  overflowingContentWidgetsDomNode;
  constructor(context, viewDomNode) {
    super(context);
    this._viewDomNode = viewDomNode;
    this._widgets = {};
    this.domNode = createFastDomNode(document.createElement("div"));
    PartFingerprints.write(this.domNode, PartFingerprint.ContentWidgets);
    this.domNode.setClassName("contentWidgets");
    this.domNode.setPosition("absolute");
    this.domNode.setTop(0);
    this.overflowingContentWidgetsDomNode = createFastDomNode(
      document.createElement("div")
    );
    PartFingerprints.write(
      this.overflowingContentWidgetsDomNode,
      PartFingerprint.OverflowingContentWidgets
    );
    this.overflowingContentWidgetsDomNode.setClassName(
      "overflowingContentWidgets"
    );
  }
  dispose() {
    super.dispose();
    this._widgets = {};
  }
  // --- begin event handlers
  onConfigurationChanged(e) {
    const keys = Object.keys(this._widgets);
    for (const widgetId of keys) {
      this._widgets[widgetId].onConfigurationChanged(e);
    }
    return true;
  }
  onDecorationsChanged(e) {
    return true;
  }
  onFlushed(e) {
    return true;
  }
  onLineMappingChanged(e) {
    this._updateAnchorsViewPositions();
    return true;
  }
  onLinesChanged(e) {
    this._updateAnchorsViewPositions();
    return true;
  }
  onLinesDeleted(e) {
    this._updateAnchorsViewPositions();
    return true;
  }
  onLinesInserted(e) {
    this._updateAnchorsViewPositions();
    return true;
  }
  onScrollChanged(e) {
    return true;
  }
  onZonesChanged(e) {
    return true;
  }
  // ---- end view event handlers
  _updateAnchorsViewPositions() {
    const keys = Object.keys(this._widgets);
    for (const widgetId of keys) {
      this._widgets[widgetId].updateAnchorViewPosition();
    }
  }
  addWidget(_widget) {
    const myWidget = new Widget(this._context, this._viewDomNode, _widget);
    this._widgets[myWidget.id] = myWidget;
    if (myWidget.allowEditorOverflow) {
      this.overflowingContentWidgetsDomNode.appendChild(myWidget.domNode);
    } else {
      this.domNode.appendChild(myWidget.domNode);
    }
    this.setShouldRender();
  }
  setWidgetPosition(widget, primaryAnchor, secondaryAnchor, preference, affinity) {
    const myWidget = this._widgets[widget.getId()];
    myWidget.setPosition(
      primaryAnchor,
      secondaryAnchor,
      preference,
      affinity
    );
    this.setShouldRender();
  }
  removeWidget(widget) {
    const widgetId = widget.getId();
    if (this._widgets.hasOwnProperty(widgetId)) {
      const myWidget = this._widgets[widgetId];
      delete this._widgets[widgetId];
      const domNode = myWidget.domNode.domNode;
      domNode.remove();
      domNode.removeAttribute("monaco-visible-content-widget");
      this.setShouldRender();
    }
  }
  shouldSuppressMouseDownOnWidget(widgetId) {
    if (this._widgets.hasOwnProperty(widgetId)) {
      return this._widgets[widgetId].suppressMouseDown;
    }
    return false;
  }
  onBeforeRender(viewportData) {
    const keys = Object.keys(this._widgets);
    for (const widgetId of keys) {
      this._widgets[widgetId].onBeforeRender(viewportData);
    }
  }
  prepareRender(ctx) {
    const keys = Object.keys(this._widgets);
    for (const widgetId of keys) {
      this._widgets[widgetId].prepareRender(ctx);
    }
  }
  render(ctx) {
    const keys = Object.keys(this._widgets);
    for (const widgetId of keys) {
      this._widgets[widgetId].render(ctx);
    }
  }
}
class Widget {
  static {
    __name(this, "Widget");
  }
  _context;
  _viewDomNode;
  _actual;
  domNode;
  id;
  allowEditorOverflow;
  suppressMouseDown;
  _fixedOverflowWidgets;
  _contentWidth;
  _contentLeft;
  _lineHeight;
  _primaryAnchor = new PositionPair(null, null);
  _secondaryAnchor = new PositionPair(null, null);
  _affinity;
  _preference;
  _cachedDomNodeOffsetWidth;
  _cachedDomNodeOffsetHeight;
  _maxWidth;
  _isVisible;
  _renderData;
  constructor(context, viewDomNode, actual) {
    this._context = context;
    this._viewDomNode = viewDomNode;
    this._actual = actual;
    this.domNode = createFastDomNode(this._actual.getDomNode());
    this.id = this._actual.getId();
    this.allowEditorOverflow = this._actual.allowEditorOverflow || false;
    this.suppressMouseDown = this._actual.suppressMouseDown || false;
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this._fixedOverflowWidgets = options.get(
      EditorOption.fixedOverflowWidgets
    );
    this._contentWidth = layoutInfo.contentWidth;
    this._contentLeft = layoutInfo.contentLeft;
    this._lineHeight = options.get(EditorOption.lineHeight);
    this._affinity = null;
    this._preference = [];
    this._cachedDomNodeOffsetWidth = -1;
    this._cachedDomNodeOffsetHeight = -1;
    this._maxWidth = this._getMaxWidth();
    this._isVisible = false;
    this._renderData = null;
    this.domNode.setPosition(
      this._fixedOverflowWidgets && this.allowEditorOverflow ? "fixed" : "absolute"
    );
    this.domNode.setDisplay("none");
    this.domNode.setVisibility("hidden");
    this.domNode.setAttribute("widgetId", this.id);
    this.domNode.setMaxWidth(this._maxWidth);
  }
  onConfigurationChanged(e) {
    const options = this._context.configuration.options;
    this._lineHeight = options.get(EditorOption.lineHeight);
    if (e.hasChanged(EditorOption.layoutInfo)) {
      const layoutInfo = options.get(EditorOption.layoutInfo);
      this._contentLeft = layoutInfo.contentLeft;
      this._contentWidth = layoutInfo.contentWidth;
      this._maxWidth = this._getMaxWidth();
    }
  }
  updateAnchorViewPosition() {
    this._setPosition(
      this._affinity,
      this._primaryAnchor.modelPosition,
      this._secondaryAnchor.modelPosition
    );
  }
  _setPosition(affinity, primaryAnchor, secondaryAnchor) {
    this._affinity = affinity;
    this._primaryAnchor = getValidPositionPair(
      primaryAnchor,
      this._context.viewModel,
      this._affinity
    );
    this._secondaryAnchor = getValidPositionPair(
      secondaryAnchor,
      this._context.viewModel,
      this._affinity
    );
    function getValidPositionPair(position, viewModel, affinity2) {
      if (!position) {
        return new PositionPair(null, null);
      }
      const validModelPosition = viewModel.model.validatePosition(position);
      if (viewModel.coordinatesConverter.modelPositionIsVisible(
        validModelPosition
      )) {
        const viewPosition = viewModel.coordinatesConverter.convertModelPositionToViewPosition(
          validModelPosition,
          affinity2 ?? void 0
        );
        return new PositionPair(position, viewPosition);
      }
      return new PositionPair(position, null);
    }
    __name(getValidPositionPair, "getValidPositionPair");
  }
  _getMaxWidth() {
    const elDocument = this.domNode.domNode.ownerDocument;
    const elWindow = elDocument.defaultView;
    return this.allowEditorOverflow ? elWindow?.innerWidth || elDocument.documentElement.offsetWidth || elDocument.body.offsetWidth : this._contentWidth;
  }
  setPosition(primaryAnchor, secondaryAnchor, preference, affinity) {
    this._setPosition(affinity, primaryAnchor, secondaryAnchor);
    this._preference = preference;
    if (this._primaryAnchor.viewPosition && this._preference && this._preference.length > 0) {
      this.domNode.setDisplay("block");
    } else {
      this.domNode.setDisplay("none");
    }
    this._cachedDomNodeOffsetWidth = -1;
    this._cachedDomNodeOffsetHeight = -1;
  }
  _layoutBoxInViewport(anchor, width, height, ctx) {
    const aboveLineTop = anchor.top;
    const heightAvailableAboveLine = aboveLineTop;
    const underLineTop = anchor.top + anchor.height;
    const heightAvailableUnderLine = ctx.viewportHeight - underLineTop;
    const aboveTop = aboveLineTop - height;
    const fitsAbove = heightAvailableAboveLine >= height;
    const belowTop = underLineTop;
    const fitsBelow = heightAvailableUnderLine >= height;
    let left = anchor.left;
    if (left + width > ctx.scrollLeft + ctx.viewportWidth) {
      left = ctx.scrollLeft + ctx.viewportWidth - width;
    }
    if (left < ctx.scrollLeft) {
      left = ctx.scrollLeft;
    }
    return { fitsAbove, aboveTop, fitsBelow, belowTop, left };
  }
  _layoutHorizontalSegmentInPage(windowSize, domNodePosition, left, width) {
    const LEFT_PADDING = 15;
    const RIGHT_PADDING = 15;
    const MIN_LIMIT = Math.max(LEFT_PADDING, domNodePosition.left - width);
    const MAX_LIMIT = Math.min(
      domNodePosition.left + domNodePosition.width + width,
      windowSize.width - RIGHT_PADDING
    );
    const elDocument = this._viewDomNode.domNode.ownerDocument;
    const elWindow = elDocument.defaultView;
    let absoluteLeft = domNodePosition.left + left - (elWindow?.scrollX ?? 0);
    if (absoluteLeft + width > MAX_LIMIT) {
      const delta = absoluteLeft - (MAX_LIMIT - width);
      absoluteLeft -= delta;
      left -= delta;
    }
    if (absoluteLeft < MIN_LIMIT) {
      const delta = absoluteLeft - MIN_LIMIT;
      absoluteLeft -= delta;
      left -= delta;
    }
    return [left, absoluteLeft];
  }
  _layoutBoxInPage(anchor, width, height, ctx) {
    const aboveTop = anchor.top - height;
    const belowTop = anchor.top + anchor.height;
    const domNodePosition = dom.getDomNodePagePosition(
      this._viewDomNode.domNode
    );
    const elDocument = this._viewDomNode.domNode.ownerDocument;
    const elWindow = elDocument.defaultView;
    const absoluteAboveTop = domNodePosition.top + aboveTop - (elWindow?.scrollY ?? 0);
    const absoluteBelowTop = domNodePosition.top + belowTop - (elWindow?.scrollY ?? 0);
    const windowSize = dom.getClientArea(elDocument.body);
    const [left, absoluteAboveLeft] = this._layoutHorizontalSegmentInPage(
      windowSize,
      domNodePosition,
      anchor.left - ctx.scrollLeft + this._contentLeft,
      width
    );
    const TOP_PADDING = 22;
    const BOTTOM_PADDING = 22;
    const fitsAbove = absoluteAboveTop >= TOP_PADDING;
    const fitsBelow = absoluteBelowTop + height <= windowSize.height - BOTTOM_PADDING;
    if (this._fixedOverflowWidgets) {
      return {
        fitsAbove,
        aboveTop: Math.max(absoluteAboveTop, TOP_PADDING),
        fitsBelow,
        belowTop: absoluteBelowTop,
        left: absoluteAboveLeft
      };
    }
    return { fitsAbove, aboveTop, fitsBelow, belowTop, left };
  }
  _prepareRenderWidgetAtExactPositionOverflowing(topLeft) {
    return new Coordinate(topLeft.top, topLeft.left + this._contentLeft);
  }
  /**
   * Compute the coordinates above and below the primary and secondary anchors.
   * The content widget *must* touch the primary anchor.
   * The content widget should touch if possible the secondary anchor.
   */
  _getAnchorsCoordinates(ctx) {
    const primary = getCoordinates(
      this._primaryAnchor.viewPosition,
      this._affinity,
      this._lineHeight
    );
    const secondaryViewPosition = this._secondaryAnchor.viewPosition?.lineNumber === this._primaryAnchor.viewPosition?.lineNumber ? this._secondaryAnchor.viewPosition : null;
    const secondary = getCoordinates(
      secondaryViewPosition,
      this._affinity,
      this._lineHeight
    );
    return { primary, secondary };
    function getCoordinates(position, affinity, lineHeight) {
      if (!position) {
        return null;
      }
      const horizontalPosition = ctx.visibleRangeForPosition(position);
      if (!horizontalPosition) {
        return null;
      }
      const left = position.column === 1 && affinity === PositionAffinity.LeftOfInjectedText ? 0 : horizontalPosition.left;
      const top = ctx.getVerticalOffsetForLineNumber(position.lineNumber) - ctx.scrollTop;
      return new AnchorCoordinate(top, left, lineHeight);
    }
    __name(getCoordinates, "getCoordinates");
  }
  _reduceAnchorCoordinates(primary, secondary, width) {
    if (!secondary) {
      return primary;
    }
    const fontInfo = this._context.configuration.options.get(
      EditorOption.fontInfo
    );
    let left = secondary.left;
    if (left < primary.left) {
      left = Math.max(
        left,
        primary.left - width + fontInfo.typicalFullwidthCharacterWidth
      );
    } else {
      left = Math.min(
        left,
        primary.left + width - fontInfo.typicalFullwidthCharacterWidth
      );
    }
    return new AnchorCoordinate(primary.top, left, primary.height);
  }
  _prepareRenderWidget(ctx) {
    if (!this._preference || this._preference.length === 0) {
      return null;
    }
    const { primary, secondary } = this._getAnchorsCoordinates(ctx);
    if (!primary) {
      return {
        kind: "offViewport",
        preserveFocus: this.domNode.domNode.contains(
          this.domNode.domNode.ownerDocument.activeElement
        )
      };
    }
    if (this._cachedDomNodeOffsetWidth === -1 || this._cachedDomNodeOffsetHeight === -1) {
      let preferredDimensions = null;
      if (typeof this._actual.beforeRender === "function") {
        preferredDimensions = safeInvoke(
          this._actual.beforeRender,
          this._actual
        );
      }
      if (preferredDimensions) {
        this._cachedDomNodeOffsetWidth = preferredDimensions.width;
        this._cachedDomNodeOffsetHeight = preferredDimensions.height;
      } else {
        const domNode = this.domNode.domNode;
        const clientRect = domNode.getBoundingClientRect();
        this._cachedDomNodeOffsetWidth = Math.round(clientRect.width);
        this._cachedDomNodeOffsetHeight = Math.round(clientRect.height);
      }
    }
    const anchor = this._reduceAnchorCoordinates(
      primary,
      secondary,
      this._cachedDomNodeOffsetWidth
    );
    let placement;
    if (this.allowEditorOverflow) {
      placement = this._layoutBoxInPage(
        anchor,
        this._cachedDomNodeOffsetWidth,
        this._cachedDomNodeOffsetHeight,
        ctx
      );
    } else {
      placement = this._layoutBoxInViewport(
        anchor,
        this._cachedDomNodeOffsetWidth,
        this._cachedDomNodeOffsetHeight,
        ctx
      );
    }
    for (let pass = 1; pass <= 2; pass++) {
      for (const pref of this._preference) {
        if (pref === ContentWidgetPositionPreference.ABOVE) {
          if (!placement) {
            return null;
          }
          if (pass === 2 || placement.fitsAbove) {
            return {
              kind: "inViewport",
              coordinate: new Coordinate(
                placement.aboveTop,
                placement.left
              ),
              position: ContentWidgetPositionPreference.ABOVE
            };
          }
        } else if (pref === ContentWidgetPositionPreference.BELOW) {
          if (!placement) {
            return null;
          }
          if (pass === 2 || placement.fitsBelow) {
            return {
              kind: "inViewport",
              coordinate: new Coordinate(
                placement.belowTop,
                placement.left
              ),
              position: ContentWidgetPositionPreference.BELOW
            };
          }
        } else if (this.allowEditorOverflow) {
          return {
            kind: "inViewport",
            coordinate: this._prepareRenderWidgetAtExactPositionOverflowing(
              new Coordinate(anchor.top, anchor.left)
            ),
            position: ContentWidgetPositionPreference.EXACT
          };
        } else {
          return {
            kind: "inViewport",
            coordinate: new Coordinate(anchor.top, anchor.left),
            position: ContentWidgetPositionPreference.EXACT
          };
        }
      }
    }
    return null;
  }
  /**
   * On this first pass, we ensure that the content widget (if it is in the viewport) has the max width set correctly.
   */
  onBeforeRender(viewportData) {
    if (!this._primaryAnchor.viewPosition || !this._preference) {
      return;
    }
    if (this._primaryAnchor.viewPosition.lineNumber < viewportData.startLineNumber || this._primaryAnchor.viewPosition.lineNumber > viewportData.endLineNumber) {
      return;
    }
    this.domNode.setMaxWidth(this._maxWidth);
  }
  prepareRender(ctx) {
    this._renderData = this._prepareRenderWidget(ctx);
  }
  render(ctx) {
    if (!this._renderData || this._renderData.kind === "offViewport") {
      if (this._isVisible) {
        this.domNode.removeAttribute("monaco-visible-content-widget");
        this._isVisible = false;
        if (this._renderData?.kind === "offViewport" && this._renderData.preserveFocus) {
          this.domNode.setTop(-1e3);
        } else {
          this.domNode.setVisibility("hidden");
        }
      }
      if (typeof this._actual.afterRender === "function") {
        safeInvoke(this._actual.afterRender, this._actual, null);
      }
      return;
    }
    if (this.allowEditorOverflow) {
      this.domNode.setTop(this._renderData.coordinate.top);
      this.domNode.setLeft(this._renderData.coordinate.left);
    } else {
      this.domNode.setTop(
        this._renderData.coordinate.top + ctx.scrollTop - ctx.bigNumbersDelta
      );
      this.domNode.setLeft(this._renderData.coordinate.left);
    }
    if (!this._isVisible) {
      this.domNode.setVisibility("inherit");
      this.domNode.setAttribute("monaco-visible-content-widget", "true");
      this._isVisible = true;
    }
    if (typeof this._actual.afterRender === "function") {
      safeInvoke(
        this._actual.afterRender,
        this._actual,
        this._renderData.position
      );
    }
  }
}
class PositionPair {
  constructor(modelPosition, viewPosition) {
    this.modelPosition = modelPosition;
    this.viewPosition = viewPosition;
  }
  static {
    __name(this, "PositionPair");
  }
}
class Coordinate {
  constructor(top, left) {
    this.top = top;
    this.left = left;
  }
  static {
    __name(this, "Coordinate");
  }
  _coordinateBrand = void 0;
}
class AnchorCoordinate {
  constructor(top, left, height) {
    this.top = top;
    this.left = left;
    this.height = height;
  }
  static {
    __name(this, "AnchorCoordinate");
  }
  _anchorCoordinateBrand = void 0;
}
function safeInvoke(fn, thisArg, ...args) {
  try {
    return fn.call(thisArg, ...args);
  } catch {
    return null;
  }
}
__name(safeInvoke, "safeInvoke");
export {
  ViewContentWidgets
};
//# sourceMappingURL=contentWidgets.js.map
