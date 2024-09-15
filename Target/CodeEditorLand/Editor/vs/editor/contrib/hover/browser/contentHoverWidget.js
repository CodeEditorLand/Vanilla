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
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidgetPosition } from "../../../browser/editorBrowser.js";
import { ConfigurationChangedEvent, EditorOption } from "../../../common/config/editorOptions.js";
import { HoverStartSource } from "./hoverOperation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { ResizableContentWidget } from "./resizableContentWidget.js";
import { IContextKey, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { getHoverAccessibleViewHint, HoverWidget } from "../../../../base/browser/ui/hover/hoverWidget.js";
import { PositionAffinity } from "../../../common/model.js";
import { Emitter } from "../../../../base/common/event.js";
import { RenderedContentHover } from "./contentHoverRendered.js";
const HORIZONTAL_SCROLLING_BY = 30;
const CONTAINER_HEIGHT_PADDING = 6;
let ContentHoverWidget = class extends ResizableContentWidget {
  constructor(editor, contextKeyService, _configurationService, _accessibilityService, _keybindingService) {
    const minimumHeight = editor.getOption(EditorOption.lineHeight) + 8;
    const minimumWidth = 150;
    const minimumSize = new dom.Dimension(minimumWidth, minimumHeight);
    super(editor, minimumSize);
    this._configurationService = _configurationService;
    this._accessibilityService = _accessibilityService;
    this._keybindingService = _keybindingService;
    this._minimumSize = minimumSize;
    this._hoverVisibleKey = EditorContextKeys.hoverVisible.bindTo(contextKeyService);
    this._hoverFocusedKey = EditorContextKeys.hoverFocused.bindTo(contextKeyService);
    dom.append(this._resizableNode.domNode, this._hover.containerDomNode);
    this._resizableNode.domNode.style.zIndex = "50";
    this._register(this._editor.onDidLayoutChange(() => {
      if (this.isVisible) {
        this._updateMaxDimensions();
      }
    }));
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.fontInfo)) {
        this._updateFont();
      }
    }));
    const focusTracker = this._register(dom.trackFocus(this._resizableNode.domNode));
    this._register(focusTracker.onDidFocus(() => {
      this._hoverFocusedKey.set(true);
    }));
    this._register(focusTracker.onDidBlur(() => {
      this._hoverFocusedKey.set(false);
    }));
    this._setRenderedHover(void 0);
    this._editor.addContentWidget(this);
  }
  static {
    __name(this, "ContentHoverWidget");
  }
  static ID = "editor.contrib.resizableContentHoverWidget";
  static _lastDimensions = new dom.Dimension(0, 0);
  _renderedHover;
  _positionPreference;
  _minimumSize;
  _contentWidth;
  _hover = this._register(new HoverWidget());
  _hoverVisibleKey;
  _hoverFocusedKey;
  _onDidResize = this._register(new Emitter());
  onDidResize = this._onDidResize.event;
  get isVisibleFromKeyboard() {
    return this._renderedHover?.source === HoverStartSource.Keyboard;
  }
  get isVisible() {
    return this._hoverVisibleKey.get() ?? false;
  }
  get isFocused() {
    return this._hoverFocusedKey.get() ?? false;
  }
  dispose() {
    super.dispose();
    this._renderedHover?.dispose();
    this._editor.removeContentWidget(this);
  }
  getId() {
    return ContentHoverWidget.ID;
  }
  static _applyDimensions(container, width, height) {
    const transformedWidth = typeof width === "number" ? `${width}px` : width;
    const transformedHeight = typeof height === "number" ? `${height}px` : height;
    container.style.width = transformedWidth;
    container.style.height = transformedHeight;
  }
  _setContentsDomNodeDimensions(width, height) {
    const contentsDomNode = this._hover.contentsDomNode;
    return ContentHoverWidget._applyDimensions(contentsDomNode, width, height);
  }
  _setContainerDomNodeDimensions(width, height) {
    const containerDomNode = this._hover.containerDomNode;
    return ContentHoverWidget._applyDimensions(containerDomNode, width, height);
  }
  _setHoverWidgetDimensions(width, height) {
    this._setContentsDomNodeDimensions(width, height);
    this._setContainerDomNodeDimensions(width, height);
    this._layoutContentWidget();
  }
  static _applyMaxDimensions(container, width, height) {
    const transformedWidth = typeof width === "number" ? `${width}px` : width;
    const transformedHeight = typeof height === "number" ? `${height}px` : height;
    container.style.maxWidth = transformedWidth;
    container.style.maxHeight = transformedHeight;
  }
  _setHoverWidgetMaxDimensions(width, height) {
    ContentHoverWidget._applyMaxDimensions(this._hover.contentsDomNode, width, height);
    ContentHoverWidget._applyMaxDimensions(this._hover.containerDomNode, width, height);
    this._hover.containerDomNode.style.setProperty("--vscode-hover-maxWidth", typeof width === "number" ? `${width}px` : width);
    this._layoutContentWidget();
  }
  _setAdjustedHoverWidgetDimensions(size) {
    this._setHoverWidgetMaxDimensions("none", "none");
    const width = size.width;
    const height = size.height;
    this._setHoverWidgetDimensions(width, height);
  }
  _updateResizableNodeMaxDimensions() {
    const maxRenderingWidth = this._findMaximumRenderingWidth() ?? Infinity;
    const maxRenderingHeight = this._findMaximumRenderingHeight() ?? Infinity;
    this._resizableNode.maxSize = new dom.Dimension(maxRenderingWidth, maxRenderingHeight);
    this._setHoverWidgetMaxDimensions(maxRenderingWidth, maxRenderingHeight);
  }
  _resize(size) {
    ContentHoverWidget._lastDimensions = new dom.Dimension(size.width, size.height);
    this._setAdjustedHoverWidgetDimensions(size);
    this._resizableNode.layout(size.height, size.width);
    this._updateResizableNodeMaxDimensions();
    this._hover.scrollbar.scanDomNode();
    this._editor.layoutContentWidget(this);
    this._onDidResize.fire();
  }
  _findAvailableSpaceVertically() {
    const position = this._renderedHover?.showAtPosition;
    if (!position) {
      return;
    }
    return this._positionPreference === ContentWidgetPositionPreference.ABOVE ? this._availableVerticalSpaceAbove(position) : this._availableVerticalSpaceBelow(position);
  }
  _findMaximumRenderingHeight() {
    const availableSpace = this._findAvailableSpaceVertically();
    if (!availableSpace) {
      return;
    }
    let maximumHeight = CONTAINER_HEIGHT_PADDING;
    Array.from(this._hover.contentsDomNode.children).forEach((hoverPart) => {
      maximumHeight += hoverPart.clientHeight;
    });
    return Math.min(availableSpace, maximumHeight);
  }
  _isHoverTextOverflowing() {
    this._hover.containerDomNode.style.setProperty("--vscode-hover-whiteSpace", "nowrap");
    this._hover.containerDomNode.style.setProperty("--vscode-hover-sourceWhiteSpace", "nowrap");
    const overflowing = Array.from(this._hover.contentsDomNode.children).some((hoverElement) => {
      return hoverElement.scrollWidth > hoverElement.clientWidth;
    });
    this._hover.containerDomNode.style.removeProperty("--vscode-hover-whiteSpace");
    this._hover.containerDomNode.style.removeProperty("--vscode-hover-sourceWhiteSpace");
    return overflowing;
  }
  _findMaximumRenderingWidth() {
    if (!this._editor || !this._editor.hasModel()) {
      return;
    }
    const overflowing = this._isHoverTextOverflowing();
    const initialWidth = typeof this._contentWidth === "undefined" ? 0 : this._contentWidth - 2;
    if (overflowing || this._hover.containerDomNode.clientWidth < initialWidth) {
      const bodyBoxWidth = dom.getClientArea(this._hover.containerDomNode.ownerDocument.body).width;
      const horizontalPadding = 14;
      return bodyBoxWidth - horizontalPadding;
    } else {
      return this._hover.containerDomNode.clientWidth + 2;
    }
  }
  isMouseGettingCloser(posx, posy) {
    if (!this._renderedHover) {
      return false;
    }
    if (this._renderedHover.initialMousePosX === void 0 || this._renderedHover.initialMousePosY === void 0) {
      this._renderedHover.initialMousePosX = posx;
      this._renderedHover.initialMousePosY = posy;
      return false;
    }
    const widgetRect = dom.getDomNodePagePosition(this.getDomNode());
    if (this._renderedHover.closestMouseDistance === void 0) {
      this._renderedHover.closestMouseDistance = computeDistanceFromPointToRectangle(
        this._renderedHover.initialMousePosX,
        this._renderedHover.initialMousePosY,
        widgetRect.left,
        widgetRect.top,
        widgetRect.width,
        widgetRect.height
      );
    }
    const distance = computeDistanceFromPointToRectangle(
      posx,
      posy,
      widgetRect.left,
      widgetRect.top,
      widgetRect.width,
      widgetRect.height
    );
    if (distance > this._renderedHover.closestMouseDistance + 4) {
      return false;
    }
    this._renderedHover.closestMouseDistance = Math.min(this._renderedHover.closestMouseDistance, distance);
    return true;
  }
  _setRenderedHover(renderedHover) {
    this._renderedHover?.dispose();
    this._renderedHover = renderedHover;
    this._hoverVisibleKey.set(!!renderedHover);
    this._hover.containerDomNode.classList.toggle("hidden", !renderedHover);
  }
  _updateFont() {
    const { fontSize, lineHeight } = this._editor.getOption(EditorOption.fontInfo);
    const contentsDomNode = this._hover.contentsDomNode;
    contentsDomNode.style.fontSize = `${fontSize}px`;
    contentsDomNode.style.lineHeight = `${lineHeight / fontSize}`;
    const codeClasses = Array.prototype.slice.call(this._hover.contentsDomNode.getElementsByClassName("code"));
    codeClasses.forEach((node) => this._editor.applyFontInfo(node));
  }
  _updateContent(node) {
    const contentsDomNode = this._hover.contentsDomNode;
    contentsDomNode.style.paddingBottom = "";
    contentsDomNode.textContent = "";
    contentsDomNode.appendChild(node);
  }
  _layoutContentWidget() {
    this._editor.layoutContentWidget(this);
    this._hover.onContentsChanged();
  }
  _updateMaxDimensions() {
    const height = Math.max(this._editor.getLayoutInfo().height / 4, 250, ContentHoverWidget._lastDimensions.height);
    const width = Math.max(this._editor.getLayoutInfo().width * 0.66, 750, ContentHoverWidget._lastDimensions.width);
    this._setHoverWidgetMaxDimensions(width, height);
  }
  _render(renderedHover) {
    this._setRenderedHover(renderedHover);
    this._updateFont();
    this._updateContent(renderedHover.domNode);
    this._updateMaxDimensions();
    this.onContentsChanged();
    this._editor.render();
  }
  getPosition() {
    if (!this._renderedHover) {
      return null;
    }
    return {
      position: this._renderedHover.showAtPosition,
      secondaryPosition: this._renderedHover.showAtSecondaryPosition,
      positionAffinity: this._renderedHover.shouldAppearBeforeContent ? PositionAffinity.LeftOfInjectedText : void 0,
      preference: [this._positionPreference ?? ContentWidgetPositionPreference.ABOVE]
    };
  }
  show(renderedHover) {
    if (!this._editor || !this._editor.hasModel()) {
      return;
    }
    this._render(renderedHover);
    const widgetHeight = dom.getTotalHeight(this._hover.containerDomNode);
    const widgetPosition = renderedHover.showAtPosition;
    this._positionPreference = this._findPositionPreference(widgetHeight, widgetPosition) ?? ContentWidgetPositionPreference.ABOVE;
    this.onContentsChanged();
    if (renderedHover.shouldFocus) {
      this._hover.containerDomNode.focus();
    }
    this._onDidResize.fire();
    const hoverFocused = this._hover.containerDomNode.ownerDocument.activeElement === this._hover.containerDomNode;
    const accessibleViewHint = hoverFocused && getHoverAccessibleViewHint(
      this._configurationService.getValue("accessibility.verbosity.hover") === true && this._accessibilityService.isScreenReaderOptimized(),
      this._keybindingService.lookupKeybinding("editor.action.accessibleView")?.getAriaLabel() ?? ""
    );
    if (accessibleViewHint) {
      this._hover.contentsDomNode.ariaLabel = this._hover.contentsDomNode.textContent + ", " + accessibleViewHint;
    }
  }
  hide() {
    if (!this._renderedHover) {
      return;
    }
    const hoverStoleFocus = this._renderedHover.shouldFocus || this._hoverFocusedKey.get();
    this._setRenderedHover(void 0);
    this._resizableNode.maxSize = new dom.Dimension(Infinity, Infinity);
    this._resizableNode.clearSashHoverState();
    this._hoverFocusedKey.set(false);
    this._editor.layoutContentWidget(this);
    if (hoverStoleFocus) {
      this._editor.focus();
    }
  }
  _removeConstraintsRenderNormally() {
    const layoutInfo = this._editor.getLayoutInfo();
    this._resizableNode.layout(layoutInfo.height, layoutInfo.width);
    this._setHoverWidgetDimensions("auto", "auto");
  }
  setMinimumDimensions(dimensions) {
    this._minimumSize = new dom.Dimension(
      Math.max(this._minimumSize.width, dimensions.width),
      Math.max(this._minimumSize.height, dimensions.height)
    );
    this._updateMinimumWidth();
  }
  _updateMinimumWidth() {
    const width = typeof this._contentWidth === "undefined" ? this._minimumSize.width : Math.min(this._contentWidth, this._minimumSize.width);
    this._resizableNode.minSize = new dom.Dimension(width, this._minimumSize.height);
  }
  onContentsChanged() {
    this._removeConstraintsRenderNormally();
    const containerDomNode = this._hover.containerDomNode;
    let height = dom.getTotalHeight(containerDomNode);
    let width = dom.getTotalWidth(containerDomNode);
    this._resizableNode.layout(height, width);
    this._setHoverWidgetDimensions(width, height);
    height = dom.getTotalHeight(containerDomNode);
    width = dom.getTotalWidth(containerDomNode);
    this._contentWidth = width;
    this._updateMinimumWidth();
    this._resizableNode.layout(height, width);
    if (this._renderedHover?.showAtPosition) {
      const widgetHeight = dom.getTotalHeight(this._hover.containerDomNode);
      this._positionPreference = this._findPositionPreference(widgetHeight, this._renderedHover.showAtPosition);
    }
    this._layoutContentWidget();
  }
  focus() {
    this._hover.containerDomNode.focus();
  }
  scrollUp() {
    const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
    const fontInfo = this._editor.getOption(EditorOption.fontInfo);
    this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop - fontInfo.lineHeight });
  }
  scrollDown() {
    const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
    const fontInfo = this._editor.getOption(EditorOption.fontInfo);
    this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop + fontInfo.lineHeight });
  }
  scrollLeft() {
    const scrollLeft = this._hover.scrollbar.getScrollPosition().scrollLeft;
    this._hover.scrollbar.setScrollPosition({ scrollLeft: scrollLeft - HORIZONTAL_SCROLLING_BY });
  }
  scrollRight() {
    const scrollLeft = this._hover.scrollbar.getScrollPosition().scrollLeft;
    this._hover.scrollbar.setScrollPosition({ scrollLeft: scrollLeft + HORIZONTAL_SCROLLING_BY });
  }
  pageUp() {
    const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
    const scrollHeight = this._hover.scrollbar.getScrollDimensions().height;
    this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop - scrollHeight });
  }
  pageDown() {
    const scrollTop = this._hover.scrollbar.getScrollPosition().scrollTop;
    const scrollHeight = this._hover.scrollbar.getScrollDimensions().height;
    this._hover.scrollbar.setScrollPosition({ scrollTop: scrollTop + scrollHeight });
  }
  goToTop() {
    this._hover.scrollbar.setScrollPosition({ scrollTop: 0 });
  }
  goToBottom() {
    this._hover.scrollbar.setScrollPosition({ scrollTop: this._hover.scrollbar.getScrollDimensions().scrollHeight });
  }
};
ContentHoverWidget = __decorateClass([
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IAccessibilityService),
  __decorateParam(4, IKeybindingService)
], ContentHoverWidget);
function computeDistanceFromPointToRectangle(pointX, pointY, left, top, width, height) {
  const x = left + width / 2;
  const y = top + height / 2;
  const dx = Math.max(Math.abs(pointX - x) - width / 2, 0);
  const dy = Math.max(Math.abs(pointY - y) - height / 2, 0);
  return Math.sqrt(dx * dx + dy * dy);
}
__name(computeDistanceFromPointToRectangle, "computeDistanceFromPointToRectangle");
export {
  ContentHoverWidget
};
//# sourceMappingURL=contentHoverWidget.js.map
