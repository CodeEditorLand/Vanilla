var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { $ } from "../../../../../base/browser/dom.js";
import { alert } from "../../../../../base/browser/ui/aria/aria.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import {
  isResponseVM
} from "../../common/chatViewModel.js";
class ChatProgressContentPart extends Disposable {
  static {
    __name(this, "ChatProgressContentPart");
  }
  domNode;
  showSpinner;
  constructor(progress, renderer, context, forceShowSpinner, forceShowMessage) {
    super();
    const followingContent = context.content.slice(context.index + 1);
    this.showSpinner = forceShowSpinner ?? shouldShowSpinner(followingContent, context.element);
    const hideMessage = forceShowMessage !== true && followingContent.some((part) => part.kind !== "progressMessage");
    if (hideMessage) {
      this.domNode = $("");
      return;
    }
    if (this.showSpinner) {
      alert(progress.content.value);
    }
    const codicon = this.showSpinner ? ThemeIcon.modify(Codicon.loading, "spin").id : Codicon.check.id;
    const markdown = new MarkdownString(
      `$(${codicon}) ${progress.content.value}`,
      {
        supportThemeIcons: true
      }
    );
    const result = this._register(renderer.render(markdown));
    result.element.classList.add("progress-step");
    this.domNode = result.element;
  }
  hasSameContent(other, followingContent, element) {
    const showSpinner = shouldShowSpinner(followingContent, element);
    return other.kind === "progressMessage" && this.showSpinner === showSpinner;
  }
}
function shouldShowSpinner(followingContent, element) {
  return isResponseVM(element) && !element.isComplete && followingContent.length === 0;
}
__name(shouldShowSpinner, "shouldShowSpinner");
export {
  ChatProgressContentPart
};
//# sourceMappingURL=chatProgressContentPart.js.map
