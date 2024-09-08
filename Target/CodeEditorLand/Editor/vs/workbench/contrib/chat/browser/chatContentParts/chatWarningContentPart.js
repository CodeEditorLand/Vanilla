import * as dom from "../../../../../base/browser/dom.js";
import { renderIcon } from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
const $ = dom.$;
class ChatWarningContentPart extends Disposable {
  domNode;
  constructor(kind, content, renderer) {
    super();
    this.domNode = $(".chat-notification-widget");
    let icon;
    let iconClass;
    switch (kind) {
      case "warning":
        icon = Codicon.warning;
        iconClass = ".chat-warning-codicon";
        break;
      case "error":
        icon = Codicon.error;
        iconClass = ".chat-error-codicon";
        break;
      case "info":
        icon = Codicon.info;
        iconClass = ".chat-info-codicon";
        break;
    }
    this.domNode.appendChild($(iconClass, void 0, renderIcon(icon)));
    const markdownContent = renderer.render(content);
    this.domNode.appendChild(markdownContent.element);
  }
  hasSameContent(other) {
    return other.kind === "warning";
  }
}
export {
  ChatWarningContentPart
};
