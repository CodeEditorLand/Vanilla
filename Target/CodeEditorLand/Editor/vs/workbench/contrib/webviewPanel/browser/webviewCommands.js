import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import * as nls from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId
} from "../../../../platform/actions/common/actions.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
  IWebviewService,
  KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED,
  KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED,
  KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE
} from "../../webview/browser/webview.js";
import { WebviewEditor } from "./webviewEditor.js";
import { WebviewInput } from "./webviewEditorInput.js";
const webviewActiveContextKeyExpr = ContextKeyExpr.and(
  ContextKeyExpr.equals("activeEditor", WebviewEditor.ID),
  EditorContextKeys.focus.toNegated()
);
class ShowWebViewEditorFindWidgetAction extends Action2 {
  static ID = "editor.action.webvieweditor.showFind";
  static LABEL = nls.localize(
    "editor.action.webvieweditor.showFind",
    "Show find"
  );
  constructor() {
    super({
      id: ShowWebViewEditorFindWidgetAction.ID,
      title: ShowWebViewEditorFindWidgetAction.LABEL,
      keybinding: {
        when: ContextKeyExpr.and(
          webviewActiveContextKeyExpr,
          KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_ENABLED
        ),
        primary: KeyMod.CtrlCmd | KeyCode.KeyF,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(accessor) {
    getActiveWebviewEditor(accessor)?.showFind();
  }
}
class HideWebViewEditorFindCommand extends Action2 {
  static ID = "editor.action.webvieweditor.hideFind";
  static LABEL = nls.localize(
    "editor.action.webvieweditor.hideFind",
    "Stop find"
  );
  constructor() {
    super({
      id: HideWebViewEditorFindCommand.ID,
      title: HideWebViewEditorFindCommand.LABEL,
      keybinding: {
        when: ContextKeyExpr.and(
          webviewActiveContextKeyExpr,
          KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_VISIBLE
        ),
        primary: KeyCode.Escape,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(accessor) {
    getActiveWebviewEditor(accessor)?.hideFind();
  }
}
class WebViewEditorFindNextCommand extends Action2 {
  static ID = "editor.action.webvieweditor.findNext";
  static LABEL = nls.localize(
    "editor.action.webvieweditor.findNext",
    "Find next"
  );
  constructor() {
    super({
      id: WebViewEditorFindNextCommand.ID,
      title: WebViewEditorFindNextCommand.LABEL,
      keybinding: {
        when: ContextKeyExpr.and(
          webviewActiveContextKeyExpr,
          KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED
        ),
        primary: KeyCode.Enter,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(accessor) {
    getActiveWebviewEditor(accessor)?.runFindAction(false);
  }
}
class WebViewEditorFindPreviousCommand extends Action2 {
  static ID = "editor.action.webvieweditor.findPrevious";
  static LABEL = nls.localize(
    "editor.action.webvieweditor.findPrevious",
    "Find previous"
  );
  constructor() {
    super({
      id: WebViewEditorFindPreviousCommand.ID,
      title: WebViewEditorFindPreviousCommand.LABEL,
      keybinding: {
        when: ContextKeyExpr.and(
          webviewActiveContextKeyExpr,
          KEYBINDING_CONTEXT_WEBVIEW_FIND_WIDGET_FOCUSED
        ),
        primary: KeyMod.Shift | KeyCode.Enter,
        weight: KeybindingWeight.EditorContrib
      }
    });
  }
  run(accessor) {
    getActiveWebviewEditor(accessor)?.runFindAction(true);
  }
}
class ReloadWebviewAction extends Action2 {
  static ID = "workbench.action.webview.reloadWebviewAction";
  static LABEL = nls.localize2(
    "refreshWebviewLabel",
    "Reload Webviews"
  );
  constructor() {
    super({
      id: ReloadWebviewAction.ID,
      title: ReloadWebviewAction.LABEL,
      category: Categories.Developer,
      menu: [
        {
          id: MenuId.CommandPalette
        }
      ]
    });
  }
  async run(accessor) {
    const webviewService = accessor.get(IWebviewService);
    for (const webview of webviewService.webviews) {
      webview.reload();
    }
  }
}
function getActiveWebviewEditor(accessor) {
  const editorService = accessor.get(IEditorService);
  const activeEditor = editorService.activeEditor;
  return activeEditor instanceof WebviewInput ? activeEditor.webview : void 0;
}
export {
  HideWebViewEditorFindCommand,
  ReloadWebviewAction,
  ShowWebViewEditorFindWidgetAction,
  WebViewEditorFindNextCommand,
  WebViewEditorFindPreviousCommand
};
