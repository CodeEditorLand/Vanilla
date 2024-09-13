var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../../../nls.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { ContentHoverController } from "./contentHoverController.js";
import { AccessibleViewType, AccessibleViewProviderId, AccessibleContentProvider, IAccessibleViewContentProvider, IAccessibleViewOptions } from "../../../../platform/accessibility/browser/accessibleView.js";
import { IAccessibleViewImplentation } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { IContextViewService } from "../../../../platform/contextview/browser/contextView.js";
import { IHoverService } from "../../../../platform/hover/browser/hover.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { HoverVerbosityAction } from "../../../common/languages.js";
import { DECREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID, DECREASE_HOVER_VERBOSITY_ACTION_ID, INCREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID, INCREASE_HOVER_VERBOSITY_ACTION_ID } from "./hoverActionIds.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { Action, IAction } from "../../../../base/common/actions.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { labelForHoverVerbosityAction } from "./markdownHoverParticipant.js";
var HoverAccessibilityHelpNLS;
((HoverAccessibilityHelpNLS2) => {
  HoverAccessibilityHelpNLS2.increaseVerbosity = localize("increaseVerbosity", "- The focused hover part verbosity level can be increased with the Increase Hover Verbosity command.", `<keybinding:${INCREASE_HOVER_VERBOSITY_ACTION_ID}>`);
  HoverAccessibilityHelpNLS2.decreaseVerbosity = localize("decreaseVerbosity", "- The focused hover part verbosity level can be decreased with the Decrease Hover Verbosity command.", `<keybinding:${DECREASE_HOVER_VERBOSITY_ACTION_ID}>`);
})(HoverAccessibilityHelpNLS || (HoverAccessibilityHelpNLS = {}));
class HoverAccessibleView {
  static {
    __name(this, "HoverAccessibleView");
  }
  type = AccessibleViewType.View;
  priority = 95;
  name = "hover";
  when = EditorContextKeys.hoverFocused;
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!codeEditor) {
      throw new Error("No active or focused code editor");
    }
    const hoverController = ContentHoverController.get(codeEditor);
    if (!hoverController) {
      return;
    }
    const keybindingService = accessor.get(IKeybindingService);
    return accessor.get(IInstantiationService).createInstance(HoverAccessibleViewProvider, keybindingService, codeEditor, hoverController);
  }
}
class HoverAccessibilityHelp {
  static {
    __name(this, "HoverAccessibilityHelp");
  }
  priority = 100;
  name = "hover";
  type = AccessibleViewType.Help;
  when = EditorContextKeys.hoverVisible;
  getProvider(accessor) {
    const codeEditorService = accessor.get(ICodeEditorService);
    const codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
    if (!codeEditor) {
      throw new Error("No active or focused code editor");
    }
    const hoverController = ContentHoverController.get(codeEditor);
    if (!hoverController) {
      return;
    }
    return accessor.get(IInstantiationService).createInstance(HoverAccessibilityHelpProvider, hoverController);
  }
}
class BaseHoverAccessibleViewProvider extends Disposable {
  constructor(_hoverController) {
    super();
    this._hoverController = _hoverController;
  }
  static {
    __name(this, "BaseHoverAccessibleViewProvider");
  }
  id = AccessibleViewProviderId.Hover;
  verbositySettingKey = "accessibility.verbosity.hover";
  _onDidChangeContent = this._register(new Emitter());
  onDidChangeContent = this._onDidChangeContent.event;
  _focusedHoverPartIndex = -1;
  onOpen() {
    if (!this._hoverController) {
      return;
    }
    this._hoverController.shouldKeepOpenOnEditorMouseMoveOrLeave = true;
    this._focusedHoverPartIndex = this._hoverController.focusedHoverPartIndex();
    this._register(this._hoverController.onHoverContentsChanged(() => {
      this._onDidChangeContent.fire();
    }));
  }
  onClose() {
    if (!this._hoverController) {
      return;
    }
    if (this._focusedHoverPartIndex === -1) {
      this._hoverController.focus();
    } else {
      this._hoverController.focusHoverPartWithIndex(this._focusedHoverPartIndex);
    }
    this._focusedHoverPartIndex = -1;
    this._hoverController.shouldKeepOpenOnEditorMouseMoveOrLeave = false;
  }
  provideContentAtIndex(focusedHoverIndex, includeVerbosityActions) {
    if (focusedHoverIndex !== -1) {
      const accessibleContent = this._hoverController.getAccessibleWidgetContentAtIndex(focusedHoverIndex);
      if (accessibleContent === void 0) {
        return "";
      }
      const contents = [];
      if (includeVerbosityActions) {
        contents.push(...this._descriptionsOfVerbosityActionsForIndex(focusedHoverIndex));
      }
      contents.push(accessibleContent);
      return contents.join("\n");
    } else {
      const accessibleContent = this._hoverController.getAccessibleWidgetContent();
      if (accessibleContent === void 0) {
        return "";
      }
      const contents = [];
      contents.push(accessibleContent);
      return contents.join("\n");
    }
  }
  _descriptionsOfVerbosityActionsForIndex(index) {
    const content = [];
    const descriptionForIncreaseAction = this._descriptionOfVerbosityActionForIndex(HoverVerbosityAction.Increase, index);
    if (descriptionForIncreaseAction !== void 0) {
      content.push(descriptionForIncreaseAction);
    }
    const descriptionForDecreaseAction = this._descriptionOfVerbosityActionForIndex(HoverVerbosityAction.Decrease, index);
    if (descriptionForDecreaseAction !== void 0) {
      content.push(descriptionForDecreaseAction);
    }
    return content;
  }
  _descriptionOfVerbosityActionForIndex(action, index) {
    const isActionSupported = this._hoverController.doesHoverAtIndexSupportVerbosityAction(index, action);
    if (!isActionSupported) {
      return;
    }
    switch (action) {
      case HoverVerbosityAction.Increase:
        return HoverAccessibilityHelpNLS.increaseVerbosity;
      case HoverVerbosityAction.Decrease:
        return HoverAccessibilityHelpNLS.decreaseVerbosity;
    }
  }
}
class HoverAccessibilityHelpProvider extends BaseHoverAccessibleViewProvider {
  static {
    __name(this, "HoverAccessibilityHelpProvider");
  }
  options = { type: AccessibleViewType.Help };
  constructor(hoverController) {
    super(hoverController);
  }
  provideContent() {
    return this.provideContentAtIndex(this._focusedHoverPartIndex, true);
  }
}
class HoverAccessibleViewProvider extends BaseHoverAccessibleViewProvider {
  constructor(_keybindingService, _editor, hoverController) {
    super(hoverController);
    this._keybindingService = _keybindingService;
    this._editor = _editor;
    this._initializeOptions(this._editor, hoverController);
  }
  static {
    __name(this, "HoverAccessibleViewProvider");
  }
  options = { type: AccessibleViewType.View };
  provideContent() {
    return this.provideContentAtIndex(this._focusedHoverPartIndex, false);
  }
  get actions() {
    const actions = [];
    actions.push(this._getActionFor(this._editor, HoverVerbosityAction.Increase));
    actions.push(this._getActionFor(this._editor, HoverVerbosityAction.Decrease));
    return actions;
  }
  _getActionFor(editor, action) {
    let actionId;
    let accessibleActionId;
    let actionCodicon;
    switch (action) {
      case HoverVerbosityAction.Increase:
        actionId = INCREASE_HOVER_VERBOSITY_ACTION_ID;
        accessibleActionId = INCREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID;
        actionCodicon = Codicon.add;
        break;
      case HoverVerbosityAction.Decrease:
        actionId = DECREASE_HOVER_VERBOSITY_ACTION_ID;
        accessibleActionId = DECREASE_HOVER_VERBOSITY_ACCESSIBLE_ACTION_ID;
        actionCodicon = Codicon.remove;
        break;
    }
    const actionLabel = labelForHoverVerbosityAction(this._keybindingService, action);
    const actionEnabled = this._hoverController.doesHoverAtIndexSupportVerbosityAction(this._focusedHoverPartIndex, action);
    return new Action(accessibleActionId, actionLabel, ThemeIcon.asClassName(actionCodicon), actionEnabled, () => {
      editor.getAction(actionId)?.run({ index: this._focusedHoverPartIndex, focus: false });
    });
  }
  _initializeOptions(editor, hoverController) {
    const helpProvider = this._register(new HoverAccessibilityHelpProvider(hoverController));
    this.options.language = editor.getModel()?.getLanguageId();
    this.options.customHelp = () => {
      return helpProvider.provideContentAtIndex(this._focusedHoverPartIndex, true);
    };
  }
}
class ExtHoverAccessibleView {
  static {
    __name(this, "ExtHoverAccessibleView");
  }
  type = AccessibleViewType.View;
  priority = 90;
  name = "extension-hover";
  getProvider(accessor) {
    const contextViewService = accessor.get(IContextViewService);
    const contextViewElement = contextViewService.getContextViewElement();
    const extensionHoverContent = contextViewElement?.textContent ?? void 0;
    const hoverService = accessor.get(IHoverService);
    if (contextViewElement.classList.contains("accessible-view-container") || !extensionHoverContent) {
      return;
    }
    return new AccessibleContentProvider(
      AccessibleViewProviderId.Hover,
      { language: "typescript", type: AccessibleViewType.View },
      () => {
        return extensionHoverContent;
      },
      () => {
        hoverService.showAndFocusLastHover();
      },
      "accessibility.verbosity.hover"
    );
  }
}
export {
  ExtHoverAccessibleView,
  HoverAccessibilityHelp,
  HoverAccessibilityHelpProvider,
  HoverAccessibleView,
  HoverAccessibleViewProvider
};
//# sourceMappingURL=hoverAccessibleViews.js.map
