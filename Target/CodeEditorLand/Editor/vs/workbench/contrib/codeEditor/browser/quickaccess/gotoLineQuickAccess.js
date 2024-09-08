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
import { KeyCode, KeyMod } from "../../../../../base/common/keyCodes.js";
import { AbstractGotoLineQuickAccessProvider } from "../../../../../editor/contrib/quickAccess/browser/gotoLineQuickAccess.js";
import { localize, localize2 } from "../../../../../nls.js";
import {
  Action2,
  registerAction2
} from "../../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.js";
import { KeybindingWeight } from "../../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  Extensions as QuickaccesExtensions
} from "../../../../../platform/quickinput/common/quickAccess.js";
import {
  IQuickInputService
} from "../../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../../platform/registry/common/platform.js";
import { IEditorGroupsService } from "../../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
let GotoLineQuickAccessProvider = class extends AbstractGotoLineQuickAccessProvider {
  constructor(editorService, editorGroupService, configurationService) {
    super();
    this.editorService = editorService;
    this.editorGroupService = editorGroupService;
    this.configurationService = configurationService;
  }
  onDidActiveTextEditorControlChange = this.editorService.onDidActiveEditorChange;
  get configuration() {
    const editorConfig = this.configurationService.getValue().workbench?.editor;
    return {
      openEditorPinned: !editorConfig?.enablePreviewFromQuickOpen || !editorConfig?.enablePreview
    };
  }
  get activeTextEditorControl() {
    return this.editorService.activeTextEditorControl;
  }
  gotoLocation(context, options) {
    if ((options.keyMods.alt || this.configuration.openEditorPinned && options.keyMods.ctrlCmd || options.forceSideBySide) && this.editorService.activeEditor) {
      context.restoreViewState?.();
      const editorOptions = {
        selection: options.range,
        pinned: options.keyMods.ctrlCmd || this.configuration.openEditorPinned,
        preserveFocus: options.preserveFocus
      };
      this.editorGroupService.sideGroup.openEditor(
        this.editorService.activeEditor,
        editorOptions
      );
    } else {
      super.gotoLocation(context, options);
    }
  }
};
GotoLineQuickAccessProvider = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IEditorGroupsService),
  __decorateParam(2, IConfigurationService)
], GotoLineQuickAccessProvider);
class GotoLineAction extends Action2 {
  static ID = "workbench.action.gotoLine";
  constructor() {
    super({
      id: GotoLineAction.ID,
      title: localize2("gotoLine", "Go to Line/Column..."),
      f1: true,
      keybinding: {
        weight: KeybindingWeight.WorkbenchContrib,
        when: null,
        primary: KeyMod.CtrlCmd | KeyCode.KeyG,
        mac: { primary: KeyMod.WinCtrl | KeyCode.KeyG }
      }
    });
  }
  async run(accessor) {
    accessor.get(IQuickInputService).quickAccess.show(GotoLineQuickAccessProvider.PREFIX);
  }
}
registerAction2(GotoLineAction);
Registry.as(
  QuickaccesExtensions.Quickaccess
).registerQuickAccessProvider({
  ctor: GotoLineQuickAccessProvider,
  prefix: AbstractGotoLineQuickAccessProvider.PREFIX,
  placeholder: localize(
    "gotoLineQuickAccessPlaceholder",
    "Type the line number and optional column to go to (e.g. 42:5 for line 42 and column 5)."
  ),
  helpEntries: [
    {
      description: localize("gotoLineQuickAccess", "Go to Line/Column"),
      commandId: GotoLineAction.ID
    }
  ]
});
export {
  GotoLineQuickAccessProvider
};
