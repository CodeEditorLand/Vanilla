import { Codicon } from "../../../base/common/codicons.js";
import { KeyCode, KeyMod } from "../../../base/common/keyCodes.js";
import { localize, localize2 } from "../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../platform/commands/common/commands.js";
import { IKeybindingService } from "../../../platform/keybinding/common/keybinding.js";
import {
  KeybindingWeight,
  KeybindingsRegistry
} from "../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  IQuickInputService,
  ItemActivation
} from "../../../platform/quickinput/common/quickInput.js";
import {
  defaultQuickAccessContext,
  getQuickNavigateHandler,
  inQuickPickContext
} from "../quickaccess.js";
const globalQuickAccessKeybinding = {
  primary: KeyMod.CtrlCmd | KeyCode.KeyP,
  secondary: [KeyMod.CtrlCmd | KeyCode.KeyE],
  mac: { primary: KeyMod.CtrlCmd | KeyCode.KeyP, secondary: void 0 }
};
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.closeQuickOpen",
  weight: KeybindingWeight.WorkbenchContrib,
  when: inQuickPickContext,
  primary: KeyCode.Escape,
  secondary: [KeyMod.Shift | KeyCode.Escape],
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    return quickInputService.cancel();
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.acceptSelectedQuickOpenItem",
  weight: KeybindingWeight.WorkbenchContrib,
  when: inQuickPickContext,
  primary: 0,
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    return quickInputService.accept();
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.alternativeAcceptSelectedQuickOpenItem",
  weight: KeybindingWeight.WorkbenchContrib,
  when: inQuickPickContext,
  primary: 0,
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    return quickInputService.accept({ ctrlCmd: true, alt: false });
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.focusQuickOpen",
  weight: KeybindingWeight.WorkbenchContrib,
  when: inQuickPickContext,
  primary: 0,
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.focus();
  }
});
const quickAccessNavigateNextInFilePickerId = "workbench.action.quickOpenNavigateNextInFilePicker";
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickAccessNavigateNextInFilePickerId,
  weight: KeybindingWeight.WorkbenchContrib + 50,
  handler: getQuickNavigateHandler(
    quickAccessNavigateNextInFilePickerId,
    true
  ),
  when: defaultQuickAccessContext,
  primary: globalQuickAccessKeybinding.primary,
  secondary: globalQuickAccessKeybinding.secondary,
  mac: globalQuickAccessKeybinding.mac
});
const quickAccessNavigatePreviousInFilePickerId = "workbench.action.quickOpenNavigatePreviousInFilePicker";
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: quickAccessNavigatePreviousInFilePickerId,
  weight: KeybindingWeight.WorkbenchContrib + 50,
  handler: getQuickNavigateHandler(
    quickAccessNavigatePreviousInFilePickerId,
    false
  ),
  when: defaultQuickAccessContext,
  primary: globalQuickAccessKeybinding.primary | KeyMod.Shift,
  secondary: [globalQuickAccessKeybinding.secondary[0] | KeyMod.Shift],
  mac: {
    primary: globalQuickAccessKeybinding.mac.primary | KeyMod.Shift,
    secondary: void 0
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.quickPickManyToggle",
  weight: KeybindingWeight.WorkbenchContrib,
  when: inQuickPickContext,
  primary: 0,
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.toggle();
  }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "workbench.action.quickInputBack",
  weight: KeybindingWeight.WorkbenchContrib + 50,
  when: inQuickPickContext,
  primary: 0,
  win: { primary: KeyMod.Alt | KeyCode.LeftArrow },
  mac: { primary: KeyMod.WinCtrl | KeyCode.Minus },
  linux: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.Minus },
  handler: (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.back();
  }
});
registerAction2(
  class QuickAccessAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.quickOpen",
        title: localize2("quickOpen", "Go to File..."),
        metadata: {
          description: `Quick access`,
          args: [
            {
              name: "prefix",
              schema: {
                type: "string"
              }
            }
          ]
        },
        keybinding: {
          weight: KeybindingWeight.WorkbenchContrib,
          primary: globalQuickAccessKeybinding.primary,
          secondary: globalQuickAccessKeybinding.secondary,
          mac: globalQuickAccessKeybinding.mac
        },
        f1: true
      });
    }
    run(accessor, prefix) {
      const quickInputService = accessor.get(IQuickInputService);
      quickInputService.quickAccess.show(
        typeof prefix === "string" ? prefix : void 0,
        {
          preserveValue: typeof prefix === "string"
        }
      );
    }
  }
);
registerAction2(
  class QuickAccessAction2 extends Action2 {
    constructor() {
      super({
        id: "workbench.action.quickOpenWithModes",
        title: localize("quickOpenWithModes", "Quick Open"),
        icon: Codicon.search,
        menu: {
          id: MenuId.CommandCenterCenter,
          order: 100
        }
      });
    }
    run(accessor) {
      const quickInputService = accessor.get(IQuickInputService);
      const providerOptions = {
        includeHelp: true,
        from: "commandCenter"
      };
      quickInputService.quickAccess.show(void 0, {
        preserveValue: true,
        providerOptions
      });
    }
  }
);
CommandsRegistry.registerCommand(
  "workbench.action.quickOpenPreviousEditor",
  async (accessor) => {
    const quickInputService = accessor.get(IQuickInputService);
    quickInputService.quickAccess.show("", {
      itemActivation: ItemActivation.SECOND
    });
  }
);
class BaseQuickAccessNavigateAction extends Action2 {
  constructor(id, title, next, quickNavigate, keybinding) {
    super({ id, title, f1: true, keybinding });
    this.id = id;
    this.next = next;
    this.quickNavigate = quickNavigate;
  }
  async run(accessor) {
    const keybindingService = accessor.get(IKeybindingService);
    const quickInputService = accessor.get(IQuickInputService);
    const keys = keybindingService.lookupKeybindings(this.id);
    const quickNavigate = this.quickNavigate ? { keybindings: keys } : void 0;
    quickInputService.navigate(this.next, quickNavigate);
  }
}
class QuickAccessNavigateNextAction extends BaseQuickAccessNavigateAction {
  constructor() {
    super(
      "workbench.action.quickOpenNavigateNext",
      localize2("quickNavigateNext", "Navigate Next in Quick Open"),
      true,
      true
    );
  }
}
class QuickAccessNavigatePreviousAction extends BaseQuickAccessNavigateAction {
  constructor() {
    super(
      "workbench.action.quickOpenNavigatePrevious",
      localize2(
        "quickNavigatePrevious",
        "Navigate Previous in Quick Open"
      ),
      false,
      true
    );
  }
}
class QuickAccessSelectNextAction extends BaseQuickAccessNavigateAction {
  constructor() {
    super(
      "workbench.action.quickOpenSelectNext",
      localize2("quickSelectNext", "Select Next in Quick Open"),
      true,
      false,
      {
        weight: KeybindingWeight.WorkbenchContrib + 50,
        when: inQuickPickContext,
        primary: 0,
        mac: { primary: KeyMod.WinCtrl | KeyCode.KeyN }
      }
    );
  }
}
class QuickAccessSelectPreviousAction extends BaseQuickAccessNavigateAction {
  constructor() {
    super(
      "workbench.action.quickOpenSelectPrevious",
      localize2("quickSelectPrevious", "Select Previous in Quick Open"),
      false,
      false,
      {
        weight: KeybindingWeight.WorkbenchContrib + 50,
        when: inQuickPickContext,
        primary: 0,
        mac: { primary: KeyMod.WinCtrl | KeyCode.KeyP }
      }
    );
  }
}
registerAction2(QuickAccessSelectNextAction);
registerAction2(QuickAccessSelectPreviousAction);
registerAction2(QuickAccessNavigateNextAction);
registerAction2(QuickAccessNavigatePreviousAction);
