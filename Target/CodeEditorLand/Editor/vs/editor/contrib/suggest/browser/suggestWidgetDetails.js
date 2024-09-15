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
import { DomScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { MarkdownString } from "../../../../base/common/htmlContent.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { MarkdownRenderer } from "../../../browser/widget/markdownRenderer/browser/markdownRenderer.js";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition } from "../../../browser/editorBrowser.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { ResizableHTMLElement } from "../../../../base/browser/ui/resizable/resizable.js";
import * as nls from "../../../../nls.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { CompletionItem } from "./suggest.js";
function canExpandCompletionItem(item) {
  return !!item && Boolean(item.completion.documentation || item.completion.detail && item.completion.detail !== item.completion.label);
}
__name(canExpandCompletionItem, "canExpandCompletionItem");
let SuggestDetailsWidget = class {
  constructor(_editor, instaService) {
    this._editor = _editor;
    this.domNode = dom.$(".suggest-details");
    this.domNode.classList.add("no-docs");
    this._markdownRenderer = instaService.createInstance(MarkdownRenderer, { editor: _editor });
    this._body = dom.$(".body");
    this._scrollbar = new DomScrollableElement(this._body, {
      alwaysConsumeMouseWheel: true
    });
    dom.append(this.domNode, this._scrollbar.getDomNode());
    this._disposables.add(this._scrollbar);
    this._header = dom.append(this._body, dom.$(".header"));
    this._close = dom.append(this._header, dom.$("span" + ThemeIcon.asCSSSelector(Codicon.close)));
    this._close.title = nls.localize("details.close", "Close");
    this._close.role = "button";
    this._close.tabIndex = -1;
    this._type = dom.append(this._header, dom.$("p.type"));
    this._docs = dom.append(this._body, dom.$("p.docs"));
    this._configureFont();
    this._disposables.add(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.fontInfo)) {
        this._configureFont();
      }
    }));
  }
  static {
    __name(this, "SuggestDetailsWidget");
  }
  domNode;
  _onDidClose = new Emitter();
  onDidClose = this._onDidClose.event;
  _onDidChangeContents = new Emitter();
  onDidChangeContents = this._onDidChangeContents.event;
  _close;
  _scrollbar;
  _body;
  _header;
  _type;
  _docs;
  _disposables = new DisposableStore();
  _markdownRenderer;
  _renderDisposeable = new DisposableStore();
  _borderWidth = 1;
  _size = new dom.Dimension(330, 0);
  dispose() {
    this._disposables.dispose();
    this._renderDisposeable.dispose();
  }
  _configureFont() {
    const options = this._editor.getOptions();
    const fontInfo = options.get(EditorOption.fontInfo);
    const fontFamily = fontInfo.getMassagedFontFamily();
    const fontSize = options.get(EditorOption.suggestFontSize) || fontInfo.fontSize;
    const lineHeight = options.get(EditorOption.suggestLineHeight) || fontInfo.lineHeight;
    const fontWeight = fontInfo.fontWeight;
    const fontSizePx = `${fontSize}px`;
    const lineHeightPx = `${lineHeight}px`;
    this.domNode.style.fontSize = fontSizePx;
    this.domNode.style.lineHeight = `${lineHeight / fontSize}`;
    this.domNode.style.fontWeight = fontWeight;
    this.domNode.style.fontFeatureSettings = fontInfo.fontFeatureSettings;
    this._type.style.fontFamily = fontFamily;
    this._close.style.height = lineHeightPx;
    this._close.style.width = lineHeightPx;
  }
  getLayoutInfo() {
    const lineHeight = this._editor.getOption(EditorOption.suggestLineHeight) || this._editor.getOption(EditorOption.fontInfo).lineHeight;
    const borderWidth = this._borderWidth;
    const borderHeight = borderWidth * 2;
    return {
      lineHeight,
      borderWidth,
      borderHeight,
      verticalPadding: 22,
      horizontalPadding: 14
    };
  }
  renderLoading() {
    this._type.textContent = nls.localize("loading", "Loading...");
    this._docs.textContent = "";
    this.domNode.classList.remove("no-docs", "no-type");
    this.layout(this.size.width, this.getLayoutInfo().lineHeight * 2);
    this._onDidChangeContents.fire(this);
  }
  renderItem(item, explainMode) {
    this._renderDisposeable.clear();
    let { detail, documentation } = item.completion;
    if (explainMode) {
      let md = "";
      md += `score: ${item.score[0]}
`;
      md += `prefix: ${item.word ?? "(no prefix)"}
`;
      md += `word: ${item.completion.filterText ? item.completion.filterText + " (filterText)" : item.textLabel}
`;
      md += `distance: ${item.distance} (localityBonus-setting)
`;
      md += `index: ${item.idx}, based on ${item.completion.sortText && `sortText: "${item.completion.sortText}"` || "label"}
`;
      md += `commit_chars: ${item.completion.commitCharacters?.join("")}
`;
      documentation = new MarkdownString().appendCodeblock("empty", md);
      detail = `Provider: ${item.provider._debugDisplayName}`;
    }
    if (!explainMode && !canExpandCompletionItem(item)) {
      this.clearContents();
      return;
    }
    this.domNode.classList.remove("no-docs", "no-type");
    if (detail) {
      const cappedDetail = detail.length > 1e5 ? `${detail.substr(0, 1e5)}\u2026` : detail;
      this._type.textContent = cappedDetail;
      this._type.title = cappedDetail;
      dom.show(this._type);
      this._type.classList.toggle("auto-wrap", !/\r?\n^\s+/gmi.test(cappedDetail));
    } else {
      dom.clearNode(this._type);
      this._type.title = "";
      dom.hide(this._type);
      this.domNode.classList.add("no-type");
    }
    dom.clearNode(this._docs);
    if (typeof documentation === "string") {
      this._docs.classList.remove("markdown-docs");
      this._docs.textContent = documentation;
    } else if (documentation) {
      this._docs.classList.add("markdown-docs");
      dom.clearNode(this._docs);
      const renderedContents = this._markdownRenderer.render(documentation);
      this._docs.appendChild(renderedContents.element);
      this._renderDisposeable.add(renderedContents);
      this._renderDisposeable.add(this._markdownRenderer.onDidRenderAsync(() => {
        this.layout(this._size.width, this._type.clientHeight + this._docs.clientHeight);
        this._onDidChangeContents.fire(this);
      }));
    }
    this.domNode.style.userSelect = "text";
    this.domNode.tabIndex = -1;
    this._close.onmousedown = (e) => {
      e.preventDefault();
      e.stopPropagation();
    };
    this._close.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._onDidClose.fire();
    };
    this._body.scrollTop = 0;
    this.layout(this._size.width, this._type.clientHeight + this._docs.clientHeight);
    this._onDidChangeContents.fire(this);
  }
  clearContents() {
    this.domNode.classList.add("no-docs");
    this._type.textContent = "";
    this._docs.textContent = "";
  }
  get isEmpty() {
    return this.domNode.classList.contains("no-docs");
  }
  get size() {
    return this._size;
  }
  layout(width, height) {
    const newSize = new dom.Dimension(width, height);
    if (!dom.Dimension.equals(newSize, this._size)) {
      this._size = newSize;
      dom.size(this.domNode, width, height);
    }
    this._scrollbar.scanDomNode();
  }
  scrollDown(much = 8) {
    this._body.scrollTop += much;
  }
  scrollUp(much = 8) {
    this._body.scrollTop -= much;
  }
  scrollTop() {
    this._body.scrollTop = 0;
  }
  scrollBottom() {
    this._body.scrollTop = this._body.scrollHeight;
  }
  pageDown() {
    this.scrollDown(80);
  }
  pageUp() {
    this.scrollUp(80);
  }
  set borderWidth(width) {
    this._borderWidth = width;
  }
  get borderWidth() {
    return this._borderWidth;
  }
  focus() {
    this.domNode.focus();
  }
};
SuggestDetailsWidget = __decorateClass([
  __decorateParam(1, IInstantiationService)
], SuggestDetailsWidget);
class SuggestDetailsOverlay {
  constructor(widget, _editor) {
    this.widget = widget;
    this._editor = _editor;
    this._resizable = new ResizableHTMLElement();
    this._resizable.domNode.classList.add("suggest-details-container");
    this._resizable.domNode.appendChild(widget.domNode);
    this._resizable.enableSashes(false, true, true, false);
    let topLeftNow;
    let sizeNow;
    let deltaTop = 0;
    let deltaLeft = 0;
    this._disposables.add(this._resizable.onDidWillResize(() => {
      topLeftNow = this._topLeft;
      sizeNow = this._resizable.size;
    }));
    this._disposables.add(this._resizable.onDidResize((e) => {
      if (topLeftNow && sizeNow) {
        this.widget.layout(e.dimension.width, e.dimension.height);
        let updateTopLeft = false;
        if (e.west) {
          deltaLeft = sizeNow.width - e.dimension.width;
          updateTopLeft = true;
        }
        if (e.north) {
          deltaTop = sizeNow.height - e.dimension.height;
          updateTopLeft = true;
        }
        if (updateTopLeft) {
          this._applyTopLeft({
            top: topLeftNow.top + deltaTop,
            left: topLeftNow.left + deltaLeft
          });
        }
      }
      if (e.done) {
        topLeftNow = void 0;
        sizeNow = void 0;
        deltaTop = 0;
        deltaLeft = 0;
        this._userSize = e.dimension;
      }
    }));
    this._disposables.add(this.widget.onDidChangeContents(() => {
      if (this._anchorBox) {
        this._placeAtAnchor(this._anchorBox, this._userSize ?? this.widget.size, this._preferAlignAtTop);
      }
    }));
  }
  static {
    __name(this, "SuggestDetailsOverlay");
  }
  allowEditorOverflow = true;
  _disposables = new DisposableStore();
  _resizable;
  _added = false;
  _anchorBox;
  _preferAlignAtTop = true;
  _userSize;
  _topLeft;
  dispose() {
    this._resizable.dispose();
    this._disposables.dispose();
    this.hide();
  }
  getId() {
    return "suggest.details";
  }
  getDomNode() {
    return this._resizable.domNode;
  }
  getPosition() {
    return this._topLeft ? { preference: this._topLeft } : null;
  }
  show() {
    if (!this._added) {
      this._editor.addOverlayWidget(this);
      this._added = true;
    }
  }
  hide(sessionEnded = false) {
    this._resizable.clearSashHoverState();
    if (this._added) {
      this._editor.removeOverlayWidget(this);
      this._added = false;
      this._anchorBox = void 0;
      this._topLeft = void 0;
    }
    if (sessionEnded) {
      this._userSize = void 0;
      this.widget.clearContents();
    }
  }
  placeAtAnchor(anchor, preferAlignAtTop) {
    const anchorBox = anchor.getBoundingClientRect();
    this._anchorBox = anchorBox;
    this._preferAlignAtTop = preferAlignAtTop;
    this._placeAtAnchor(this._anchorBox, this._userSize ?? this.widget.size, preferAlignAtTop);
  }
  _placeAtAnchor(anchorBox, size, preferAlignAtTop) {
    const bodyBox = dom.getClientArea(this.getDomNode().ownerDocument.body);
    const info = this.widget.getLayoutInfo();
    const defaultMinSize = new dom.Dimension(220, 2 * info.lineHeight);
    const defaultTop = anchorBox.top;
    const eastPlacement = function() {
      const width = bodyBox.width - (anchorBox.left + anchorBox.width + info.borderWidth + info.horizontalPadding);
      const left2 = -info.borderWidth + anchorBox.left + anchorBox.width;
      const maxSizeTop = new dom.Dimension(width, bodyBox.height - anchorBox.top - info.borderHeight - info.verticalPadding);
      const maxSizeBottom = maxSizeTop.with(void 0, anchorBox.top + anchorBox.height - info.borderHeight - info.verticalPadding);
      return { top: defaultTop, left: left2, fit: width - size.width, maxSizeTop, maxSizeBottom, minSize: defaultMinSize.with(Math.min(width, defaultMinSize.width)) };
    }();
    const westPlacement = function() {
      const width = anchorBox.left - info.borderWidth - info.horizontalPadding;
      const left2 = Math.max(info.horizontalPadding, anchorBox.left - size.width - info.borderWidth);
      const maxSizeTop = new dom.Dimension(width, bodyBox.height - anchorBox.top - info.borderHeight - info.verticalPadding);
      const maxSizeBottom = maxSizeTop.with(void 0, anchorBox.top + anchorBox.height - info.borderHeight - info.verticalPadding);
      return { top: defaultTop, left: left2, fit: width - size.width, maxSizeTop, maxSizeBottom, minSize: defaultMinSize.with(Math.min(width, defaultMinSize.width)) };
    }();
    const southPacement = function() {
      const left2 = anchorBox.left;
      const top2 = -info.borderWidth + anchorBox.top + anchorBox.height;
      const maxSizeBottom = new dom.Dimension(anchorBox.width - info.borderHeight, bodyBox.height - anchorBox.top - anchorBox.height - info.verticalPadding);
      return { top: top2, left: left2, fit: maxSizeBottom.height - size.height, maxSizeBottom, maxSizeTop: maxSizeBottom, minSize: defaultMinSize.with(maxSizeBottom.width) };
    }();
    const placements = [eastPlacement, westPlacement, southPacement];
    const placement = placements.find((p) => p.fit >= 0) ?? placements.sort((a, b) => b.fit - a.fit)[0];
    const bottom = anchorBox.top + anchorBox.height - info.borderHeight;
    let alignAtTop;
    let height = size.height;
    const maxHeight = Math.max(placement.maxSizeTop.height, placement.maxSizeBottom.height);
    if (height > maxHeight) {
      height = maxHeight;
    }
    let maxSize;
    if (preferAlignAtTop) {
      if (height <= placement.maxSizeTop.height) {
        alignAtTop = true;
        maxSize = placement.maxSizeTop;
      } else {
        alignAtTop = false;
        maxSize = placement.maxSizeBottom;
      }
    } else {
      if (height <= placement.maxSizeBottom.height) {
        alignAtTop = false;
        maxSize = placement.maxSizeBottom;
      } else {
        alignAtTop = true;
        maxSize = placement.maxSizeTop;
      }
    }
    let { top, left } = placement;
    if (!alignAtTop && height > anchorBox.height) {
      top = bottom - height;
    }
    const editorDomNode = this._editor.getDomNode();
    if (editorDomNode) {
      const editorBoundingBox = editorDomNode.getBoundingClientRect();
      top -= editorBoundingBox.top;
      left -= editorBoundingBox.left;
    }
    this._applyTopLeft({ left, top });
    this._resizable.enableSashes(!alignAtTop, placement === eastPlacement, alignAtTop, placement !== eastPlacement);
    this._resizable.minSize = placement.minSize;
    this._resizable.maxSize = maxSize;
    this._resizable.layout(height, Math.min(maxSize.width, size.width));
    this.widget.layout(this._resizable.size.width, this._resizable.size.height);
  }
  _applyTopLeft(topLeft) {
    this._topLeft = topLeft;
    this._editor.layoutOverlayWidget(this);
  }
}
export {
  SuggestDetailsOverlay,
  SuggestDetailsWidget,
  canExpandCompletionItem
};
//# sourceMappingURL=suggestWidgetDetails.js.map
