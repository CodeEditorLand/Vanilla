var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import "./iPadShowKeyboard.css";
import * as dom from "../../../../base/browser/dom.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor, IOverlayWidget, IOverlayWidgetPosition, OverlayWidgetPositionPreference } from "../../../browser/editorBrowser.js";
import { EditorContributionInstantiation, registerEditorContribution } from "../../../browser/editorExtensions.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { EditorOption } from "../../../common/config/editorOptions.js";
import { isIOS } from "../../../../base/common/platform.js";
class IPadShowKeyboard extends Disposable {
  static {
    __name(this, "IPadShowKeyboard");
  }
  static ID = "editor.contrib.iPadShowKeyboard";
  editor;
  widget;
  constructor(editor) {
    super();
    this.editor = editor;
    this.widget = null;
    if (isIOS) {
      this._register(editor.onDidChangeConfiguration(() => this.update()));
      this.update();
    }
  }
  update() {
    const shouldHaveWidget = !this.editor.getOption(EditorOption.readOnly);
    if (!this.widget && shouldHaveWidget) {
      this.widget = new ShowKeyboardWidget(this.editor);
    } else if (this.widget && !shouldHaveWidget) {
      this.widget.dispose();
      this.widget = null;
    }
  }
  dispose() {
    super.dispose();
    if (this.widget) {
      this.widget.dispose();
      this.widget = null;
    }
  }
}
class ShowKeyboardWidget extends Disposable {
  static {
    __name(this, "ShowKeyboardWidget");
  }
  static ID = "editor.contrib.ShowKeyboardWidget";
  editor;
  _domNode;
  constructor(editor) {
    super();
    this.editor = editor;
    this._domNode = document.createElement("textarea");
    this._domNode.className = "iPadShowKeyboard";
    this._register(dom.addDisposableListener(this._domNode, "touchstart", (e) => {
      this.editor.focus();
    }));
    this._register(dom.addDisposableListener(this._domNode, "focus", (e) => {
      this.editor.focus();
    }));
    this.editor.addOverlayWidget(this);
  }
  dispose() {
    this.editor.removeOverlayWidget(this);
    super.dispose();
  }
  // ----- IOverlayWidget API
  getId() {
    return ShowKeyboardWidget.ID;
  }
  getDomNode() {
    return this._domNode;
  }
  getPosition() {
    return {
      preference: OverlayWidgetPositionPreference.BOTTOM_RIGHT_CORNER
    };
  }
}
registerEditorContribution(IPadShowKeyboard.ID, IPadShowKeyboard, EditorContributionInstantiation.Eventually);
export {
  IPadShowKeyboard
};
//# sourceMappingURL=iPadShowKeyboard.js.map
