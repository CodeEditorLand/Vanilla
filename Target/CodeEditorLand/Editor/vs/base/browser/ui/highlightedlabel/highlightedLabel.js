import { Disposable } from "../../../common/lifecycle.js";
import * as objects from "../../../common/objects.js";
import * as dom from "../../dom.js";
import { getBaseLayerHoverDelegate } from "../hover/hoverDelegate2.js";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import { renderLabelWithIcons } from "../iconLabel/iconLabels.js";
class HighlightedLabel extends Disposable {
  /**
   * Create a new {@link HighlightedLabel}.
   *
   * @param container The parent container to append to.
   */
  constructor(container, options) {
    super();
    this.options = options;
    this.supportIcons = options?.supportIcons ?? false;
    this.domNode = dom.append(
      container,
      dom.$("span.monaco-highlighted-label")
    );
  }
  domNode;
  text = "";
  title = "";
  highlights = [];
  supportIcons;
  didEverRender = false;
  customHover;
  /**
   * The label's DOM node.
   */
  get element() {
    return this.domNode;
  }
  /**
   * Set the label and highlights.
   *
   * @param text The label to display.
   * @param highlights The ranges to highlight.
   * @param title An optional title for the hover tooltip.
   * @param escapeNewLines Whether to escape new lines.
   * @returns
   */
  set(text, highlights = [], title = "", escapeNewLines) {
    if (!text) {
      text = "";
    }
    if (escapeNewLines) {
      text = HighlightedLabel.escapeNewLines(text, highlights);
    }
    if (this.didEverRender && this.text === text && this.title === title && objects.equals(this.highlights, highlights)) {
      return;
    }
    this.text = text;
    this.title = title;
    this.highlights = highlights;
    this.render();
  }
  render() {
    const children = [];
    let pos = 0;
    for (const highlight of this.highlights) {
      if (highlight.end === highlight.start) {
        continue;
      }
      if (pos < highlight.start) {
        const substring2 = this.text.substring(pos, highlight.start);
        if (this.supportIcons) {
          children.push(...renderLabelWithIcons(substring2));
        } else {
          children.push(substring2);
        }
        pos = highlight.start;
      }
      const substring = this.text.substring(pos, highlight.end);
      const element = dom.$(
        "span.highlight",
        void 0,
        ...this.supportIcons ? renderLabelWithIcons(substring) : [substring]
      );
      if (highlight.extraClasses) {
        element.classList.add(...highlight.extraClasses);
      }
      children.push(element);
      pos = highlight.end;
    }
    if (pos < this.text.length) {
      const substring = this.text.substring(pos);
      if (this.supportIcons) {
        children.push(...renderLabelWithIcons(substring));
      } else {
        children.push(substring);
      }
    }
    dom.reset(this.domNode, ...children);
    if (this.options?.hoverDelegate?.showNativeHover) {
      this.domNode.title = this.title;
    } else if (!this.customHover && this.title !== "") {
      const hoverDelegate = this.options?.hoverDelegate ?? getDefaultHoverDelegate("mouse");
      this.customHover = this._register(
        getBaseLayerHoverDelegate().setupManagedHover(
          hoverDelegate,
          this.domNode,
          this.title
        )
      );
    } else if (this.customHover) {
      this.customHover.update(this.title);
    }
    this.didEverRender = true;
  }
  static escapeNewLines(text, highlights) {
    let total = 0;
    let extra = 0;
    return text.replace(/\r\n|\r|\n/g, (match, offset) => {
      extra = match === "\r\n" ? -1 : 0;
      offset += total;
      for (const highlight of highlights) {
        if (highlight.end <= offset) {
          continue;
        }
        if (highlight.start >= offset) {
          highlight.start += extra;
        }
        if (highlight.end >= offset) {
          highlight.end += extra;
        }
      }
      total += extra;
      return "\u23CE";
    });
  }
}
export {
  HighlightedLabel
};
