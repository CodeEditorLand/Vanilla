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
import { KeyCode } from "../../../../base/common/keyCodes.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import {
  OperatingSystem as OS,
  isLinux,
  isMacintosh,
  isWindows
} from "../../../../base/common/platform.js";
import { localize, localize2 } from "../../../../nls.js";
import { AccessibleViewRegistry } from "../../../../platform/accessibility/browser/accessibleViewRegistry.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../platform/commands/common/commands.js";
import {
  Extensions as ConfigurationExtensions,
  ConfigurationScope
} from "../../../../platform/configuration/common/configurationRegistry.js";
import {
  ContextKeyExpr,
  IContextKeyService,
  RawContextKey
} from "../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import {
  IQuickInputService
} from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  EditorPaneDescriptor
} from "../../../browser/editor.js";
import { workbenchConfigurationNodeBase } from "../../../common/configuration.js";
import {
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import {
  EditorExtensions
} from "../../../common/editor.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import {
  IEditorService,
  SIDE_GROUP
} from "../../../services/editor/common/editorService.js";
import { IExtensionManagementServerService } from "../../../services/extensionManagement/common/extensionManagement.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IRemoteAgentService } from "../../../services/remote/common/remoteAgentService.js";
import { ExtensionsInput } from "../../extensions/common/extensionsInput.js";
import {
  GettingStartedInputSerializer,
  GettingStartedPage,
  inWelcomeContext
} from "./gettingStarted.js";
import { GettingStartedAccessibleView } from "./gettingStartedAccessibleView.js";
import {
  GettingStartedInput
} from "./gettingStartedInput.js";
import { IWalkthroughsService } from "./gettingStartedService.js";
import {
  StartupPageEditorResolverContribution,
  StartupPageRunnerContribution
} from "./startupPage.js";
import * as icons from "./gettingStartedIcons.js";
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "workbench.action.openWalkthrough",
        title: localize2("miWelcome", "Welcome"),
        category: Categories.Help,
        f1: true,
        menu: {
          id: MenuId.MenubarHelpMenu,
          group: "1_welcome",
          order: 1
        },
        metadata: {
          description: localize2(
            "minWelcomeDescription",
            "Opens a Walkthrough to help you get started in VS Code."
          )
        }
      });
    }
    run(accessor, walkthroughID, toSide) {
      const editorGroupsService = accessor.get(IEditorGroupsService);
      const instantiationService = accessor.get(IInstantiationService);
      const editorService = accessor.get(IEditorService);
      const commandService = accessor.get(ICommandService);
      if (walkthroughID) {
        const selectedCategory = typeof walkthroughID === "string" ? walkthroughID : walkthroughID.category;
        const selectedStep = typeof walkthroughID === "string" ? void 0 : walkthroughID.category + "#" + walkthroughID.step;
        if (!selectedCategory && !selectedStep) {
          editorService.openEditor(
            {
              resource: GettingStartedInput.RESOURCE,
              options: { preserveFocus: toSide ?? false }
            },
            toSide ? SIDE_GROUP : void 0
          );
          return;
        }
        for (const group of editorGroupsService.groups) {
          if (group.activeEditor instanceof GettingStartedInput) {
            group.activeEditorPane.makeCategoryVisibleWhenAvailable(
              selectedCategory,
              selectedStep
            );
            return;
          }
        }
        const result = editorService.findEditors({
          typeId: GettingStartedInput.ID,
          editorId: void 0,
          resource: GettingStartedInput.RESOURCE
        });
        for (const { editor, groupId } of result) {
          if (editor instanceof GettingStartedInput) {
            const group = editorGroupsService.getGroup(groupId);
            if (!editor.selectedCategory && group) {
              editor.selectedCategory = selectedCategory;
              editor.selectedStep = selectedStep;
              group.openEditor(editor, { revealIfOpened: true });
              return;
            }
          }
        }
        const activeEditor = editorService.activeEditor;
        if (selectedStep && activeEditor instanceof GettingStartedInput && activeEditor.selectedCategory === selectedCategory) {
          commandService.executeCommand(
            "walkthroughs.selectStep",
            selectedStep
          );
          return;
        }
        if (activeEditor instanceof ExtensionsInput) {
          const activeGroup = editorGroupsService.activeGroup;
          activeGroup.replaceEditors([
            {
              editor: activeEditor,
              replacement: instantiationService.createInstance(
                GettingStartedInput,
                {
                  selectedCategory,
                  selectedStep
                }
              )
            }
          ]);
        } else {
          const options = {
            selectedCategory,
            selectedStep,
            preserveFocus: toSide ?? false
          };
          editorService.openEditor(
            {
              resource: GettingStartedInput.RESOURCE,
              options
            },
            toSide ? SIDE_GROUP : void 0
          ).then((editor) => {
            editor?.makeCategoryVisibleWhenAvailable(
              selectedCategory,
              selectedStep
            );
          });
        }
      } else {
        editorService.openEditor(
          {
            resource: GettingStartedInput.RESOURCE,
            options: { preserveFocus: toSide ?? false }
          },
          toSide ? SIDE_GROUP : void 0
        );
      }
    }
  }
);
Registry.as(
  EditorExtensions.EditorFactory
).registerEditorSerializer(
  GettingStartedInput.ID,
  GettingStartedInputSerializer
);
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    GettingStartedPage,
    GettingStartedPage.ID,
    localize("welcome", "Welcome")
  ),
  [new SyncDescriptor(GettingStartedInput)]
);
const category = localize2("welcome", "Welcome");
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "welcome.goBack",
        title: localize2("welcome.goBack", "Go Back"),
        category,
        keybinding: {
          weight: KeybindingWeight.EditorContrib,
          primary: KeyCode.Escape,
          when: inWelcomeContext
        },
        precondition: ContextKeyExpr.equals(
          "activeEditor",
          "gettingStartedPage"
        ),
        f1: true
      });
    }
    run(accessor) {
      const editorService = accessor.get(IEditorService);
      const editorPane = editorService.activeEditorPane;
      if (editorPane instanceof GettingStartedPage) {
        editorPane.escape();
      }
    }
  }
);
CommandsRegistry.registerCommand({
  id: "walkthroughs.selectStep",
  handler: /* @__PURE__ */ __name((accessor, stepID) => {
    const editorService = accessor.get(IEditorService);
    const editorPane = editorService.activeEditorPane;
    if (editorPane instanceof GettingStartedPage) {
      editorPane.selectStepLoose(stepID);
    } else {
      console.error(
        "Cannot run walkthroughs.selectStep outside of walkthrough context"
      );
    }
  }, "handler")
});
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "welcome.markStepComplete",
        title: localize(
          "welcome.markStepComplete",
          "Mark Step Complete"
        ),
        category
      });
    }
    run(accessor, arg) {
      if (!arg) {
        return;
      }
      const gettingStartedService = accessor.get(IWalkthroughsService);
      gettingStartedService.progressStep(arg);
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "welcome.markStepIncomplete",
        title: localize(
          "welcome.markStepInomplete",
          "Mark Step Incomplete"
        ),
        category
      });
    }
    run(accessor, arg) {
      if (!arg) {
        return;
      }
      const gettingStartedService = accessor.get(IWalkthroughsService);
      gettingStartedService.deprogressStep(arg);
    }
  }
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "welcome.showAllWalkthroughs",
        title: localize2(
          "welcome.showAllWalkthroughs",
          "Open Walkthrough..."
        ),
        category,
        f1: true
      });
    }
    async getQuickPickItems(contextService, gettingStartedService) {
      const categories = await gettingStartedService.getWalkthroughs();
      return categories.filter((c) => contextService.contextMatchesRules(c.when)).map((x) => ({
        id: x.id,
        label: x.title,
        detail: x.description,
        description: x.source
      }));
    }
    async run(accessor) {
      const commandService = accessor.get(ICommandService);
      const contextService = accessor.get(IContextKeyService);
      const quickInputService = accessor.get(IQuickInputService);
      const gettingStartedService = accessor.get(IWalkthroughsService);
      const extensionService = accessor.get(IExtensionService);
      const disposables = new DisposableStore();
      const quickPick = disposables.add(
        quickInputService.createQuickPick()
      );
      quickPick.canSelectMany = false;
      quickPick.matchOnDescription = true;
      quickPick.matchOnDetail = true;
      quickPick.placeholder = localize(
        "pickWalkthroughs",
        "Select a walkthrough to open"
      );
      quickPick.items = await this.getQuickPickItems(
        contextService,
        gettingStartedService
      );
      quickPick.busy = true;
      disposables.add(
        quickPick.onDidAccept(() => {
          const selection = quickPick.selectedItems[0];
          if (selection) {
            commandService.executeCommand(
              "workbench.action.openWalkthrough",
              selection.id
            );
          }
          quickPick.hide();
        })
      );
      disposables.add(quickPick.onDidHide(() => disposables.dispose()));
      await extensionService.whenInstalledExtensionsRegistered();
      gettingStartedService.onDidAddWalkthrough(async () => {
        quickPick.items = await this.getQuickPickItems(
          contextService,
          gettingStartedService
        );
      });
      quickPick.show();
      quickPick.busy = false;
    }
  }
);
const WorkspacePlatform = new RawContextKey(
  "workspacePlatform",
  void 0,
  localize(
    "workspacePlatform",
    "The platform of the current workspace, which in remote or serverless contexts may be different from the platform of the UI"
  )
);
let WorkspacePlatformContribution = class {
  constructor(extensionManagementServerService, remoteAgentService, contextService) {
    this.extensionManagementServerService = extensionManagementServerService;
    this.remoteAgentService = remoteAgentService;
    this.contextService = contextService;
    this.remoteAgentService.getEnvironment().then((env) => {
      const remoteOS = env?.os;
      const remotePlatform = remoteOS === OS.Macintosh ? "mac" : remoteOS === OS.Windows ? "windows" : remoteOS === OS.Linux ? "linux" : void 0;
      if (remotePlatform) {
        WorkspacePlatform.bindTo(this.contextService).set(remotePlatform);
      } else if (this.extensionManagementServerService.localExtensionManagementServer) {
        if (isMacintosh) {
          WorkspacePlatform.bindTo(this.contextService).set("mac");
        } else if (isLinux) {
          WorkspacePlatform.bindTo(this.contextService).set("linux");
        } else if (isWindows) {
          WorkspacePlatform.bindTo(this.contextService).set("windows");
        }
      } else if (this.extensionManagementServerService.webExtensionManagementServer) {
        WorkspacePlatform.bindTo(this.contextService).set("webworker");
      } else {
        console.error("Error: Unable to detect workspace platform");
      }
    });
  }
  static {
    __name(this, "WorkspacePlatformContribution");
  }
  static ID = "workbench.contrib.workspacePlatform";
};
WorkspacePlatformContribution = __decorateClass([
  __decorateParam(0, IExtensionManagementServerService),
  __decorateParam(1, IRemoteAgentService),
  __decorateParam(2, IContextKeyService)
], WorkspacePlatformContribution);
const configurationRegistry = Registry.as(
  ConfigurationExtensions.Configuration
);
configurationRegistry.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.welcomePage.walkthroughs.openOnInstall": {
      scope: ConfigurationScope.MACHINE,
      type: "boolean",
      default: true,
      description: localize(
        "workbench.welcomePage.walkthroughs.openOnInstall",
        "When enabled, an extension's walkthrough will open upon install of the extension."
      )
    },
    "workbench.startupEditor": {
      scope: ConfigurationScope.RESOURCE,
      type: "string",
      enum: [
        "none",
        "welcomePage",
        "readme",
        "newUntitledFile",
        "welcomePageInEmptyWorkbench",
        "terminal"
      ],
      enumDescriptions: [
        localize(
          {
            comment: [
              "This is the description for a setting. Values surrounded by single quotes are not to be translated."
            ],
            key: "workbench.startupEditor.none"
          },
          "Start without an editor."
        ),
        localize(
          {
            comment: [
              "This is the description for a setting. Values surrounded by single quotes are not to be translated."
            ],
            key: "workbench.startupEditor.welcomePage"
          },
          "Open the Welcome page, with content to aid in getting started with VS Code and extensions."
        ),
        localize(
          {
            comment: [
              "This is the description for a setting. Values surrounded by single quotes are not to be translated."
            ],
            key: "workbench.startupEditor.readme"
          },
          "Open the README when opening a folder that contains one, fallback to 'welcomePage' otherwise. Note: This is only observed as a global configuration, it will be ignored if set in a workspace or folder configuration."
        ),
        localize(
          {
            comment: [
              "This is the description for a setting. Values surrounded by single quotes are not to be translated."
            ],
            key: "workbench.startupEditor.newUntitledFile"
          },
          "Open a new untitled text file (only applies when opening an empty window)."
        ),
        localize(
          {
            comment: [
              "This is the description for a setting. Values surrounded by single quotes are not to be translated."
            ],
            key: "workbench.startupEditor.welcomePageInEmptyWorkbench"
          },
          "Open the Welcome page when opening an empty workbench."
        ),
        localize(
          {
            comment: [
              "This is the description for a setting. Values surrounded by single quotes are not to be translated."
            ],
            key: "workbench.startupEditor.terminal"
          },
          "Open a new terminal in the editor area."
        )
      ],
      default: "welcomePage",
      description: localize(
        "workbench.startupEditor",
        "Controls which editor is shown at startup, if none are restored from the previous session."
      )
    },
    "workbench.welcomePage.preferReducedMotion": {
      scope: ConfigurationScope.APPLICATION,
      type: "boolean",
      default: false,
      deprecationMessage: localize(
        "deprecationMessage",
        "Deprecated, use the global `workbench.reduceMotion`."
      ),
      description: localize(
        "workbench.welcomePage.preferReducedMotion",
        "When enabled, reduce motion in welcome page."
      )
    }
  }
});
registerWorkbenchContribution2(
  WorkspacePlatformContribution.ID,
  WorkspacePlatformContribution,
  WorkbenchPhase.AfterRestored
);
registerWorkbenchContribution2(
  StartupPageEditorResolverContribution.ID,
  StartupPageEditorResolverContribution,
  WorkbenchPhase.BlockRestore
);
registerWorkbenchContribution2(
  StartupPageRunnerContribution.ID,
  StartupPageRunnerContribution,
  WorkbenchPhase.AfterRestored
);
AccessibleViewRegistry.register(new GettingStartedAccessibleView());
export {
  WorkspacePlatform,
  icons
};
//# sourceMappingURL=gettingStarted.contribution.js.map
