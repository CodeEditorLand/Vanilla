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
import { KeyChord, KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import {
  Disposable,
  DisposableStore,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import {
  isBoolean,
  isObject,
  isString
} from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import "./media/preferences.css";
import { isCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import {
  EditorContributionInstantiation,
  registerEditorContribution
} from "../../../../editor/browser/editorExtensions.js";
import { Context as SuggestContext } from "../../../../editor/contrib/suggest/browser/suggest.js";
import * as nls from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import {
  CommandsRegistry,
  ICommandService
} from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import {
  InputFocusedContext,
  IsMacNativeContext
} from "../../../../platform/contextkey/common/contextkeys.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import {
  KeybindingWeight,
  KeybindingsRegistry
} from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IUserDataProfilesService } from "../../../../platform/userDataProfile/common/userDataProfile.js";
import {
  IWorkspaceContextService,
  WorkbenchState
} from "../../../../platform/workspace/common/workspace.js";
import { PICK_WORKSPACE_FOLDER_COMMAND_ID } from "../../../browser/actions/workspaceCommands.js";
import {
  EditorPaneDescriptor
} from "../../../browser/editor.js";
import {
  RemoteNameContext,
  ResourceContextKey,
  WorkbenchStateContext
} from "../../../common/contextkeys.js";
import {
  Extensions as WorkbenchExtensions,
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import {
  EditorExtensions
} from "../../../common/editor.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { KeybindingsEditorInput } from "../../../services/preferences/browser/keybindingsEditorInput.js";
import {
  DEFINE_KEYBINDING_EDITOR_CONTRIB_ID,
  IPreferencesService
} from "../../../services/preferences/common/preferences.js";
import { SettingsEditor2Input } from "../../../services/preferences/common/preferencesEditorInput.js";
import {
  CURRENT_PROFILE_CONTEXT,
  IUserDataProfileService
} from "../../../services/userDataProfile/common/userDataProfile.js";
import {
  ExplorerFolderContext,
  ExplorerRootContext
} from "../../files/common/files.js";
import {
  CONTEXT_KEYBINDINGS_EDITOR,
  CONTEXT_KEYBINDINGS_SEARCH_FOCUS,
  CONTEXT_KEYBINDING_FOCUS,
  CONTEXT_SETTINGS_EDITOR,
  CONTEXT_SETTINGS_JSON_EDITOR,
  CONTEXT_SETTINGS_ROW_FOCUS,
  CONTEXT_SETTINGS_SEARCH_FOCUS,
  CONTEXT_TOC_ROW_FOCUS,
  CONTEXT_WHEN_FOCUS,
  KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN,
  KEYBINDINGS_EDITOR_COMMAND_ADD,
  KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY,
  KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
  KEYBINDINGS_EDITOR_COMMAND_COPY,
  KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
  KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
  KEYBINDINGS_EDITOR_COMMAND_DEFINE,
  KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
  KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
  KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
  KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN,
  KEYBINDINGS_EDITOR_COMMAND_REMOVE,
  KEYBINDINGS_EDITOR_COMMAND_RESET,
  KEYBINDINGS_EDITOR_COMMAND_SEARCH,
  KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
  KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
  KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS,
  KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS,
  KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS,
  REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG,
  SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
  SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU
} from "../common/preferences.js";
import { PreferencesContribution } from "../common/preferencesContribution.js";
import { KeybindingsEditor } from "./keybindingsEditor.js";
import { ConfigureLanguageBasedSettingsAction } from "./preferencesActions.js";
import { SettingsEditorContribution } from "./preferencesEditor.js";
import { preferencesOpenSettingsIcon } from "./preferencesIcons.js";
import { SettingsEditor2, SettingsFocusContext } from "./settingsEditor2.js";
const SETTINGS_EDITOR_COMMAND_SEARCH = "settings.action.search";
const SETTINGS_EDITOR_COMMAND_FOCUS_FILE = "settings.action.focusSettingsFile";
const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH = "settings.action.focusSettingsFromSearch";
const SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST = "settings.action.focusSettingsList";
const SETTINGS_EDITOR_COMMAND_FOCUS_TOC = "settings.action.focusTOC";
const SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL = "settings.action.focusSettingControl";
const SETTINGS_EDITOR_COMMAND_FOCUS_UP = "settings.action.focusLevelUp";
const SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON = "settings.switchToJSON";
const SETTINGS_EDITOR_COMMAND_FILTER_ONLINE = "settings.filterByOnline";
const SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED = "settings.filterUntrusted";
const SETTINGS_COMMAND_OPEN_SETTINGS = "workbench.action.openSettings";
const SETTINGS_COMMAND_FILTER_TELEMETRY = "settings.filterByTelemetry";
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    SettingsEditor2,
    SettingsEditor2.ID,
    nls.localize("settingsEditor2", "Settings Editor 2")
  ),
  [new SyncDescriptor(SettingsEditor2Input)]
);
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    KeybindingsEditor,
    KeybindingsEditor.ID,
    nls.localize("keybindingsEditor", "Keybindings Editor")
  ),
  [new SyncDescriptor(KeybindingsEditorInput)]
);
class KeybindingsEditorInputSerializer {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(KeybindingsEditorInput);
  }
}
class SettingsEditor2InputSerializer {
  canSerialize(editorInput) {
    return true;
  }
  serialize(input) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(SettingsEditor2Input);
  }
}
Registry.as(
  EditorExtensions.EditorFactory
).registerEditorSerializer(
  KeybindingsEditorInput.ID,
  KeybindingsEditorInputSerializer
);
Registry.as(
  EditorExtensions.EditorFactory
).registerEditorSerializer(
  SettingsEditor2Input.ID,
  SettingsEditor2InputSerializer
);
const OPEN_USER_SETTINGS_UI_TITLE = nls.localize2(
  "openSettings2",
  "Open Settings (UI)"
);
const OPEN_USER_SETTINGS_JSON_TITLE = nls.localize2(
  "openUserSettingsJson",
  "Open User Settings (JSON)"
);
const OPEN_APPLICATION_SETTINGS_JSON_TITLE = nls.localize2(
  "openApplicationSettingsJson",
  "Open Application Settings (JSON)"
);
const category = Categories.Preferences;
function sanitizeBoolean(arg) {
  return isBoolean(arg) ? arg : void 0;
}
function sanitizeString(arg) {
  return isString(arg) ? arg : void 0;
}
function sanitizeOpenSettingsArgs(args) {
  if (!isObject(args)) {
    args = {};
  }
  let sanitizedObject = {
    focusSearch: sanitizeBoolean(args?.focusSearch),
    openToSide: sanitizeBoolean(args?.openToSide),
    query: sanitizeString(args?.query)
  };
  if (isString(args?.revealSetting?.key)) {
    sanitizedObject = {
      ...sanitizedObject,
      revealSetting: {
        key: args.revealSetting.key,
        edit: sanitizeBoolean(args.revealSetting?.edit)
      }
    };
  }
  return sanitizedObject;
}
let PreferencesActionsContribution = class extends Disposable {
  constructor(environmentService, userDataProfileService, preferencesService, workspaceContextService, labelService, extensionService, userDataProfilesService) {
    super();
    this.environmentService = environmentService;
    this.userDataProfileService = userDataProfileService;
    this.preferencesService = preferencesService;
    this.workspaceContextService = workspaceContextService;
    this.labelService = labelService;
    this.extensionService = extensionService;
    this.userDataProfilesService = userDataProfilesService;
    this.registerSettingsActions();
    this.registerKeybindingsActions();
    this.updatePreferencesEditorMenuItem();
    this._register(workspaceContextService.onDidChangeWorkbenchState(() => this.updatePreferencesEditorMenuItem()));
    this._register(workspaceContextService.onDidChangeWorkspaceFolders(() => this.updatePreferencesEditorMenuItemForWorkspaceFolders()));
  }
  static ID = "workbench.contrib.preferencesActions";
  registerSettingsActions() {
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_COMMAND_OPEN_SETTINGS,
              title: {
                ...nls.localize2("settings", "Settings"),
                mnemonicTitle: nls.localize(
                  {
                    key: "miOpenSettings",
                    comment: ["&& denotes a mnemonic"]
                  },
                  "&&Settings"
                )
              },
              keybinding: {
                weight: KeybindingWeight.WorkbenchContrib,
                when: null,
                primary: KeyMod.CtrlCmd | KeyCode.Comma
              },
              menu: [
                {
                  id: MenuId.GlobalActivity,
                  group: "2_configuration",
                  order: 2
                },
                {
                  id: MenuId.MenubarPreferencesMenu,
                  group: "2_configuration",
                  order: 2
                }
              ]
            });
          }
          run(accessor, args) {
            const opts = typeof args === "string" ? { query: args } : sanitizeOpenSettingsArgs(args);
            return accessor.get(IPreferencesService).openSettings(opts);
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openSettings2",
              title: nls.localize2(
                "openSettings2",
                "Open Settings (UI)"
              ),
              category,
              f1: true
            });
          }
          run(accessor, args) {
            args = sanitizeOpenSettingsArgs(args);
            return accessor.get(IPreferencesService).openSettings({ jsonEditor: false, ...args });
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openSettingsJson",
              title: OPEN_USER_SETTINGS_JSON_TITLE,
              metadata: {
                description: nls.localize2(
                  "workbench.action.openSettingsJson.description",
                  "Opens the JSON file containing the current user profile settings"
                )
              },
              category,
              f1: true
            });
          }
          run(accessor, args) {
            args = sanitizeOpenSettingsArgs(args);
            return accessor.get(IPreferencesService).openSettings({ jsonEditor: true, ...args });
          }
        }
      )
    );
    const that = this;
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openApplicationSettingsJson",
              title: OPEN_APPLICATION_SETTINGS_JSON_TITLE,
              category,
              menu: {
                id: MenuId.CommandPalette,
                when: ContextKeyExpr.notEquals(
                  CURRENT_PROFILE_CONTEXT.key,
                  that.userDataProfilesService.defaultProfile.id
                )
              }
            });
          }
          run(accessor, args) {
            args = sanitizeOpenSettingsArgs(args);
            return accessor.get(IPreferencesService).openApplicationSettings({
              jsonEditor: true,
              ...args
            });
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openGlobalSettings",
              title: nls.localize2(
                "openGlobalSettings",
                "Open User Settings"
              ),
              category,
              f1: true
            });
          }
          run(accessor, args) {
            args = sanitizeOpenSettingsArgs(args);
            return accessor.get(IPreferencesService).openUserSettings(args);
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openRawDefaultSettings",
              title: nls.localize2(
                "openRawDefaultSettings",
                "Open Default Settings (JSON)"
              ),
              category,
              f1: true
            });
          }
          run(accessor) {
            return accessor.get(IPreferencesService).openRawDefaultSettings();
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: ConfigureLanguageBasedSettingsAction.ID,
              title: ConfigureLanguageBasedSettingsAction.LABEL,
              category,
              f1: true
            });
          }
          run(accessor) {
            return accessor.get(IInstantiationService).createInstance(
              ConfigureLanguageBasedSettingsAction,
              ConfigureLanguageBasedSettingsAction.ID,
              ConfigureLanguageBasedSettingsAction.LABEL.value
            ).run();
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openWorkspaceSettings",
              title: nls.localize2(
                "openWorkspaceSettings",
                "Open Workspace Settings"
              ),
              category,
              menu: {
                id: MenuId.CommandPalette,
                when: WorkbenchStateContext.notEqualsTo(
                  "empty"
                )
              }
            });
          }
          run(accessor, args) {
            args = typeof args === "string" ? { query: args } : sanitizeOpenSettingsArgs(args);
            return accessor.get(IPreferencesService).openWorkspaceSettings(args);
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openAccessibilitySettings",
              title: nls.localize2(
                "openAccessibilitySettings",
                "Open Accessibility Settings"
              ),
              category,
              menu: {
                id: MenuId.CommandPalette,
                when: WorkbenchStateContext.notEqualsTo(
                  "empty"
                )
              }
            });
          }
          async run(accessor) {
            await accessor.get(IPreferencesService).openSettings({
              jsonEditor: false,
              query: "@tag:accessibility"
            });
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openWorkspaceSettingsFile",
              title: nls.localize2(
                "openWorkspaceSettingsFile",
                "Open Workspace Settings (JSON)"
              ),
              category,
              menu: {
                id: MenuId.CommandPalette,
                when: WorkbenchStateContext.notEqualsTo(
                  "empty"
                )
              }
            });
          }
          run(accessor, args) {
            args = sanitizeOpenSettingsArgs(args);
            return accessor.get(IPreferencesService).openWorkspaceSettings({
              jsonEditor: true,
              ...args
            });
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openFolderSettings",
              title: nls.localize2(
                "openFolderSettings",
                "Open Folder Settings"
              ),
              category,
              menu: {
                id: MenuId.CommandPalette,
                when: WorkbenchStateContext.isEqualTo(
                  "workspace"
                )
              }
            });
          }
          async run(accessor, args) {
            const commandService = accessor.get(ICommandService);
            const preferencesService = accessor.get(IPreferencesService);
            const workspaceFolder = await commandService.executeCommand(
              PICK_WORKSPACE_FOLDER_COMMAND_ID
            );
            if (workspaceFolder) {
              args = sanitizeOpenSettingsArgs(args);
              await preferencesService.openFolderSettings({
                folderUri: workspaceFolder.uri,
                ...args
              });
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openFolderSettingsFile",
              title: nls.localize2(
                "openFolderSettingsFile",
                "Open Folder Settings (JSON)"
              ),
              category,
              menu: {
                id: MenuId.CommandPalette,
                when: WorkbenchStateContext.isEqualTo(
                  "workspace"
                )
              }
            });
          }
          async run(accessor, args) {
            const commandService = accessor.get(ICommandService);
            const preferencesService = accessor.get(IPreferencesService);
            const workspaceFolder = await commandService.executeCommand(
              PICK_WORKSPACE_FOLDER_COMMAND_ID
            );
            if (workspaceFolder) {
              args = sanitizeOpenSettingsArgs(args);
              await preferencesService.openFolderSettings({
                folderUri: workspaceFolder.uri,
                jsonEditor: true,
                ...args
              });
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "_workbench.action.openFolderSettings",
              title: nls.localize(
                "openFolderSettings",
                "Open Folder Settings"
              ),
              category,
              menu: {
                id: MenuId.ExplorerContext,
                group: "2_workspace",
                order: 20,
                when: ContextKeyExpr.and(
                  ExplorerRootContext,
                  ExplorerFolderContext
                )
              }
            });
          }
          async run(accessor, resource) {
            if (URI.isUri(resource)) {
              await accessor.get(IPreferencesService).openFolderSettings({ folderUri: resource });
            } else {
              const commandService = accessor.get(ICommandService);
              const preferencesService = accessor.get(IPreferencesService);
              const workspaceFolder = await commandService.executeCommand(
                PICK_WORKSPACE_FOLDER_COMMAND_ID
              );
              if (workspaceFolder) {
                await preferencesService.openFolderSettings({
                  folderUri: workspaceFolder.uri
                });
              }
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_FILTER_ONLINE,
              title: nls.localize(
                {
                  key: "miOpenOnlineSettings",
                  comment: ["&& denotes a mnemonic"]
                },
                "&&Online Services Settings"
              ),
              menu: {
                id: MenuId.MenubarPreferencesMenu,
                group: "3_settings",
                order: 1
              }
            });
          }
          run(accessor) {
            const editorPane = accessor.get(IEditorService).activeEditorPane;
            if (editorPane instanceof SettingsEditor2) {
              editorPane.focusSearch(`@tag:usesOnlineServices`);
            } else {
              accessor.get(IPreferencesService).openSettings({
                jsonEditor: false,
                query: "@tag:usesOnlineServices"
              });
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_FILTER_UNTRUSTED,
              title: nls.localize2(
                "filterUntrusted",
                "Show untrusted workspace settings"
              )
            });
          }
          run(accessor) {
            accessor.get(IPreferencesService).openWorkspaceSettings({
              jsonEditor: false,
              query: `@tag:${REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG}`
            });
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_COMMAND_FILTER_TELEMETRY,
              title: nls.localize(
                {
                  key: "miOpenTelemetrySettings",
                  comment: ["&& denotes a mnemonic"]
                },
                "&&Telemetry Settings"
              )
            });
          }
          run(accessor) {
            const editorPane = accessor.get(IEditorService).activeEditorPane;
            if (editorPane instanceof SettingsEditor2) {
              editorPane.focusSearch(`@tag:telemetry`);
            } else {
              accessor.get(IPreferencesService).openSettings({
                jsonEditor: false,
                query: "@tag:telemetry"
              });
            }
          }
        }
      )
    );
    this.registerSettingsEditorActions();
    this.extensionService.whenInstalledExtensionsRegistered().then(() => {
      const remoteAuthority = this.environmentService.remoteAuthority;
      const hostLabel = this.labelService.getHostLabel(
        Schemas.vscodeRemote,
        remoteAuthority
      ) || remoteAuthority;
      this._register(
        registerAction2(
          class extends Action2 {
            constructor() {
              super({
                id: "workbench.action.openRemoteSettings",
                title: nls.localize2(
                  "openRemoteSettings",
                  "Open Remote Settings ({0})",
                  hostLabel
                ),
                category,
                menu: {
                  id: MenuId.CommandPalette,
                  when: RemoteNameContext.notEqualsTo("")
                }
              });
            }
            run(accessor, args) {
              args = sanitizeOpenSettingsArgs(args);
              return accessor.get(IPreferencesService).openRemoteSettings(args);
            }
          }
        )
      );
      this._register(
        registerAction2(
          class extends Action2 {
            constructor() {
              super({
                id: "workbench.action.openRemoteSettingsFile",
                title: nls.localize2(
                  "openRemoteSettingsJSON",
                  "Open Remote Settings (JSON) ({0})",
                  hostLabel
                ),
                category,
                menu: {
                  id: MenuId.CommandPalette,
                  when: RemoteNameContext.notEqualsTo("")
                }
              });
            }
            run(accessor, args) {
              args = sanitizeOpenSettingsArgs(args);
              return accessor.get(IPreferencesService).openRemoteSettings({
                jsonEditor: true,
                ...args
              });
            }
          }
        )
      );
    });
  }
  registerSettingsEditorActions() {
    function getPreferencesEditor(accessor) {
      const activeEditorPane = accessor.get(IEditorService).activeEditorPane;
      if (activeEditorPane instanceof SettingsEditor2) {
        return activeEditorPane;
      }
      return null;
    }
    function settingsEditorFocusSearch(accessor) {
      const preferencesEditor = getPreferencesEditor(accessor);
      preferencesEditor?.focusSearch();
    }
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_SEARCH,
              precondition: CONTEXT_SETTINGS_EDITOR,
              keybinding: {
                primary: KeyMod.CtrlCmd | KeyCode.KeyF,
                weight: KeybindingWeight.EditorContrib,
                when: null
              },
              category,
              f1: true,
              title: nls.localize2(
                "settings.focusSearch",
                "Focus Settings Search"
              )
            });
          }
          run(accessor) {
            settingsEditorFocusSearch(accessor);
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
              precondition: CONTEXT_SETTINGS_EDITOR,
              keybinding: {
                primary: KeyCode.Escape,
                weight: KeybindingWeight.EditorContrib,
                when: CONTEXT_SETTINGS_SEARCH_FOCUS
              },
              category,
              f1: true,
              title: nls.localize2(
                "settings.clearResults",
                "Clear Settings Search Results"
              )
            });
          }
          run(accessor) {
            const preferencesEditor = getPreferencesEditor(accessor);
            preferencesEditor?.clearSearchResults();
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_FOCUS_FILE,
              precondition: ContextKeyExpr.and(
                CONTEXT_SETTINGS_SEARCH_FOCUS,
                SuggestContext.Visible.toNegated()
              ),
              keybinding: {
                primary: KeyCode.DownArrow,
                weight: KeybindingWeight.EditorContrib,
                when: null
              },
              title: nls.localize(
                "settings.focusFile",
                "Focus settings file"
              )
            });
          }
          run(accessor, args) {
            const preferencesEditor = getPreferencesEditor(accessor);
            preferencesEditor?.focusSettings();
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_FROM_SEARCH,
              precondition: ContextKeyExpr.and(
                CONTEXT_SETTINGS_SEARCH_FOCUS,
                SuggestContext.Visible.toNegated()
              ),
              keybinding: {
                primary: KeyCode.DownArrow,
                weight: KeybindingWeight.WorkbenchContrib,
                when: null
              },
              title: nls.localize(
                "settings.focusFile",
                "Focus settings file"
              )
            });
          }
          run(accessor, args) {
            const preferencesEditor = getPreferencesEditor(accessor);
            preferencesEditor?.focusSettings();
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_FOCUS_SETTINGS_LIST,
              precondition: ContextKeyExpr.and(
                CONTEXT_SETTINGS_EDITOR,
                CONTEXT_TOC_ROW_FOCUS
              ),
              keybinding: {
                primary: KeyCode.Enter,
                weight: KeybindingWeight.WorkbenchContrib,
                when: null
              },
              title: nls.localize(
                "settings.focusSettingsList",
                "Focus settings list"
              )
            });
          }
          run(accessor) {
            const preferencesEditor = getPreferencesEditor(accessor);
            if (preferencesEditor instanceof SettingsEditor2) {
              preferencesEditor.focusSettings();
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_FOCUS_TOC,
              precondition: CONTEXT_SETTINGS_EDITOR,
              f1: true,
              keybinding: [
                {
                  primary: KeyCode.LeftArrow,
                  weight: KeybindingWeight.WorkbenchContrib,
                  when: CONTEXT_SETTINGS_ROW_FOCUS
                }
              ],
              category,
              title: nls.localize2(
                "settings.focusSettingsTOC",
                "Focus Settings Table of Contents"
              )
            });
          }
          run(accessor) {
            const preferencesEditor = getPreferencesEditor(accessor);
            if (!(preferencesEditor instanceof SettingsEditor2)) {
              return;
            }
            preferencesEditor.focusTOC();
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_FOCUS_CONTROL,
              precondition: ContextKeyExpr.and(
                CONTEXT_SETTINGS_EDITOR,
                CONTEXT_SETTINGS_ROW_FOCUS
              ),
              keybinding: {
                primary: KeyCode.Enter,
                weight: KeybindingWeight.WorkbenchContrib
              },
              title: nls.localize(
                "settings.focusSettingControl",
                "Focus Setting Control"
              )
            });
          }
          run(accessor) {
            const preferencesEditor = getPreferencesEditor(accessor);
            if (!(preferencesEditor instanceof SettingsEditor2)) {
              return;
            }
            const activeElement = preferencesEditor.getContainer()?.ownerDocument.activeElement;
            if (activeElement?.classList.contains("monaco-list")) {
              preferencesEditor.focusSettings(true);
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU,
              precondition: CONTEXT_SETTINGS_EDITOR,
              keybinding: {
                primary: KeyMod.Shift | KeyCode.F9,
                weight: KeybindingWeight.WorkbenchContrib,
                when: null
              },
              f1: true,
              category,
              title: nls.localize2(
                "settings.showContextMenu",
                "Show Setting Context Menu"
              )
            });
          }
          run(accessor) {
            const preferencesEditor = getPreferencesEditor(accessor);
            if (preferencesEditor instanceof SettingsEditor2) {
              preferencesEditor.showContextMenu();
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_FOCUS_UP,
              precondition: ContextKeyExpr.and(
                CONTEXT_SETTINGS_EDITOR,
                CONTEXT_SETTINGS_SEARCH_FOCUS.toNegated(),
                CONTEXT_SETTINGS_JSON_EDITOR.toNegated()
              ),
              keybinding: {
                primary: KeyCode.Escape,
                weight: KeybindingWeight.WorkbenchContrib,
                when: null
              },
              f1: true,
              category,
              title: nls.localize2(
                "settings.focusLevelUp",
                "Move Focus Up One Level"
              )
            });
          }
          run(accessor) {
            const preferencesEditor = getPreferencesEditor(accessor);
            if (!(preferencesEditor instanceof SettingsEditor2)) {
              return;
            }
            if (preferencesEditor.currentFocusContext === SettingsFocusContext.SettingControl) {
              preferencesEditor.focusSettings();
            } else if (preferencesEditor.currentFocusContext === SettingsFocusContext.SettingTree) {
              preferencesEditor.focusTOC();
            } else if (preferencesEditor.currentFocusContext === SettingsFocusContext.TableOfContents) {
              preferencesEditor.focusSearch();
            }
          }
        }
      )
    );
  }
  registerKeybindingsActions() {
    const that = this;
    const category2 = nls.localize2("preferences", "Preferences");
    const id = "workbench.action.openGlobalKeybindings";
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id,
              title: nls.localize2(
                "openGlobalKeybindings",
                "Open Keyboard Shortcuts"
              ),
              shortTitle: nls.localize(
                "keyboardShortcuts",
                "Keyboard Shortcuts"
              ),
              category: category2,
              icon: preferencesOpenSettingsIcon,
              keybinding: {
                when: null,
                weight: KeybindingWeight.WorkbenchContrib,
                primary: KeyChord(
                  KeyMod.CtrlCmd | KeyCode.KeyK,
                  KeyMod.CtrlCmd | KeyCode.KeyS
                )
              },
              menu: [
                { id: MenuId.CommandPalette },
                {
                  id: MenuId.EditorTitle,
                  when: ResourceContextKey.Resource.isEqualTo(
                    that.userDataProfileService.currentProfile.keybindingsResource.toString()
                  ),
                  group: "navigation",
                  order: 1
                },
                {
                  id: MenuId.GlobalActivity,
                  group: "2_configuration",
                  order: 4
                }
              ]
            });
          }
          run(accessor, args) {
            const query = typeof args === "string" ? args : void 0;
            return accessor.get(IPreferencesService).openGlobalKeybindingSettings(false, { query });
          }
        }
      )
    );
    this._register(
      MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
        command: {
          id,
          title: nls.localize(
            "keyboardShortcuts",
            "Keyboard Shortcuts"
          )
        },
        group: "2_configuration",
        order: 4
      })
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openDefaultKeybindingsFile",
              title: nls.localize2(
                "openDefaultKeybindingsFile",
                "Open Default Keyboard Shortcuts (JSON)"
              ),
              category: category2,
              menu: { id: MenuId.CommandPalette }
            });
          }
          run(accessor) {
            return accessor.get(IPreferencesService).openDefaultKeybindingsFile();
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "workbench.action.openGlobalKeybindingsFile",
              title: nls.localize2(
                "openGlobalKeybindingsFile",
                "Open Keyboard Shortcuts (JSON)"
              ),
              category: category2,
              icon: preferencesOpenSettingsIcon,
              menu: [
                { id: MenuId.CommandPalette },
                {
                  id: MenuId.EditorTitle,
                  when: ContextKeyExpr.and(
                    CONTEXT_KEYBINDINGS_EDITOR
                  ),
                  group: "navigation"
                }
              ]
            });
          }
          run(accessor) {
            return accessor.get(IPreferencesService).openGlobalKeybindingSettings(true);
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS,
              title: nls.localize2(
                "showDefaultKeybindings",
                "Show System Keybindings"
              ),
              menu: [
                {
                  id: MenuId.EditorTitle,
                  when: ContextKeyExpr.and(
                    CONTEXT_KEYBINDINGS_EDITOR
                  ),
                  group: "1_keyboard_preferences_actions"
                }
              ]
            });
          }
          run(accessor) {
            const editorPane = accessor.get(IEditorService).activeEditorPane;
            if (editorPane instanceof KeybindingsEditor) {
              editorPane.search("@source:system");
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS,
              title: nls.localize2(
                "showExtensionKeybindings",
                "Show Extension Keybindings"
              ),
              menu: [
                {
                  id: MenuId.EditorTitle,
                  when: ContextKeyExpr.and(
                    CONTEXT_KEYBINDINGS_EDITOR
                  ),
                  group: "1_keyboard_preferences_actions"
                }
              ]
            });
          }
          run(accessor) {
            const editorPane = accessor.get(IEditorService).activeEditorPane;
            if (editorPane instanceof KeybindingsEditor) {
              editorPane.search("@source:extension");
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS,
              title: nls.localize2(
                "showUserKeybindings",
                "Show User Keybindings"
              ),
              menu: [
                {
                  id: MenuId.EditorTitle,
                  when: ContextKeyExpr.and(
                    CONTEXT_KEYBINDINGS_EDITOR
                  ),
                  group: "1_keyboard_preferences_actions"
                }
              ]
            });
          }
          run(accessor) {
            const editorPane = accessor.get(IEditorService).activeEditorPane;
            if (editorPane instanceof KeybindingsEditor) {
              editorPane.search("@source:user");
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS,
              title: nls.localize(
                "clear",
                "Clear Search Results"
              ),
              keybinding: {
                weight: KeybindingWeight.WorkbenchContrib,
                when: ContextKeyExpr.and(
                  CONTEXT_KEYBINDINGS_EDITOR,
                  CONTEXT_KEYBINDINGS_SEARCH_FOCUS
                ),
                primary: KeyCode.Escape
              }
            });
          }
          run(accessor) {
            const editorPane = accessor.get(IEditorService).activeEditorPane;
            if (editorPane instanceof KeybindingsEditor) {
              editorPane.clearSearchResults();
            }
          }
        }
      )
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY,
              title: nls.localize(
                "clearHistory",
                "Clear Keyboard Shortcuts Search History"
              ),
              category: category2,
              menu: [
                {
                  id: MenuId.CommandPalette,
                  when: ContextKeyExpr.and(
                    CONTEXT_KEYBINDINGS_EDITOR
                  )
                }
              ]
            });
          }
          run(accessor) {
            const editorPane = accessor.get(IEditorService).activeEditorPane;
            if (editorPane instanceof KeybindingsEditor) {
              editorPane.clearKeyboardShortcutSearchHistory();
            }
          }
        }
      )
    );
    this.registerKeybindingEditorActions();
  }
  registerKeybindingEditorActions() {
    const that = this;
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_DEFINE,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDING_FOCUS,
        CONTEXT_WHEN_FOCUS.toNegated()
      ),
      primary: KeyCode.Enter,
      handler: (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.defineKeybinding(
            editorPane.activeKeybindingEntry,
            false
          );
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_ADD,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDING_FOCUS
      ),
      primary: KeyChord(
        KeyMod.CtrlCmd | KeyCode.KeyK,
        KeyMod.CtrlCmd | KeyCode.KeyA
      ),
      handler: (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.defineKeybinding(
            editorPane.activeKeybindingEntry,
            true
          );
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDING_FOCUS
      ),
      primary: KeyChord(
        KeyMod.CtrlCmd | KeyCode.KeyK,
        KeyMod.CtrlCmd | KeyCode.KeyE
      ),
      handler: (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor && editorPane.activeKeybindingEntry.keybindingItem.keybinding) {
          editorPane.defineWhenExpression(
            editorPane.activeKeybindingEntry
          );
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_REMOVE,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDING_FOCUS,
        InputFocusedContext.toNegated()
      ),
      primary: KeyCode.Delete,
      mac: {
        primary: KeyMod.CtrlCmd | KeyCode.Backspace
      },
      handler: (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.removeKeybinding(
            editorPane.activeKeybindingEntry
          );
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_RESET,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDING_FOCUS
      ),
      primary: 0,
      handler: (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.resetKeybinding(
            editorPane.activeKeybindingEntry
          );
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_SEARCH,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
      primary: KeyMod.CtrlCmd | KeyCode.KeyF,
      handler: (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.focusSearch();
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDINGS_SEARCH_FOCUS
      ),
      primary: KeyMod.Alt | KeyCode.KeyK,
      mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyK },
      handler: (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.recordSearchKeys();
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(CONTEXT_KEYBINDINGS_EDITOR),
      primary: KeyMod.Alt | KeyCode.KeyP,
      mac: { primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyP },
      handler: (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.toggleSortByPrecedence();
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDING_FOCUS
      ),
      primary: 0,
      handler: (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.showSimilarKeybindings(
            editorPane.activeKeybindingEntry
          );
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_COPY,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDING_FOCUS,
        CONTEXT_WHEN_FOCUS.negate()
      ),
      primary: KeyMod.CtrlCmd | KeyCode.KeyC,
      handler: async (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          await editorPane.copyKeybinding(
            editorPane.activeKeybindingEntry
          );
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDING_FOCUS
      ),
      primary: 0,
      handler: async (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          await editorPane.copyKeybindingCommand(
            editorPane.activeKeybindingEntry
          );
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDING_FOCUS
      ),
      primary: 0,
      handler: async (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          await editorPane.copyKeybindingCommandTitle(
            editorPane.activeKeybindingEntry
          );
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_KEYBINDINGS_SEARCH_FOCUS
      ),
      primary: KeyMod.CtrlCmd | KeyCode.DownArrow,
      handler: (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.focusKeybindings();
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_WHEN_FOCUS,
        SuggestContext.Visible.toNegated()
      ),
      primary: KeyCode.Escape,
      handler: async (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.rejectWhenExpression(
            editorPane.activeKeybindingEntry
          );
        }
      }
    });
    KeybindingsRegistry.registerCommandAndKeybindingRule({
      id: KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN,
      weight: KeybindingWeight.WorkbenchContrib,
      when: ContextKeyExpr.and(
        CONTEXT_KEYBINDINGS_EDITOR,
        CONTEXT_WHEN_FOCUS,
        SuggestContext.Visible.toNegated()
      ),
      primary: KeyCode.Enter,
      handler: async (accessor, args) => {
        const editorPane = accessor.get(IEditorService).activeEditorPane;
        if (editorPane instanceof KeybindingsEditor) {
          editorPane.acceptWhenExpression(
            editorPane.activeKeybindingEntry
          );
        }
      }
    });
    const profileScopedActionDisposables = this._register(
      new DisposableStore()
    );
    const registerProfileScopedActions = () => {
      profileScopedActionDisposables.clear();
      profileScopedActionDisposables.add(
        registerAction2(
          class DefineKeybindingAction extends Action2 {
            constructor() {
              const when = ResourceContextKey.Resource.isEqualTo(
                that.userDataProfileService.currentProfile.keybindingsResource.toString()
              );
              super({
                id: "editor.action.defineKeybinding",
                title: nls.localize2(
                  "defineKeybinding.start",
                  "Define Keybinding"
                ),
                f1: true,
                precondition: when,
                keybinding: {
                  weight: KeybindingWeight.WorkbenchContrib,
                  when,
                  primary: KeyChord(
                    KeyMod.CtrlCmd | KeyCode.KeyK,
                    KeyMod.CtrlCmd | KeyCode.KeyK
                  )
                },
                menu: {
                  id: MenuId.EditorContent,
                  when
                }
              });
            }
            async run(accessor) {
              const codeEditor = accessor.get(
                IEditorService
              ).activeTextEditorControl;
              if (isCodeEditor(codeEditor)) {
                codeEditor.getContribution(
                  DEFINE_KEYBINDING_EDITOR_CONTRIB_ID
                )?.showDefineKeybindingWidget();
              }
            }
          }
        )
      );
    };
    registerProfileScopedActions();
    this._register(
      this.userDataProfileService.onDidChangeCurrentProfile(
        () => registerProfileScopedActions()
      )
    );
  }
  updatePreferencesEditorMenuItem() {
    const commandId = "_workbench.openWorkspaceSettingsEditor";
    if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.WORKSPACE && !CommandsRegistry.getCommand(commandId)) {
      CommandsRegistry.registerCommand(
        commandId,
        () => this.preferencesService.openWorkspaceSettings({
          jsonEditor: false
        })
      );
      MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
        command: {
          id: commandId,
          title: OPEN_USER_SETTINGS_UI_TITLE,
          icon: preferencesOpenSettingsIcon
        },
        when: ContextKeyExpr.and(
          ResourceContextKey.Resource.isEqualTo(
            this.preferencesService.workspaceSettingsResource.toString()
          ),
          WorkbenchStateContext.isEqualTo("workspace"),
          ContextKeyExpr.not("isInDiffEditor")
        ),
        group: "navigation",
        order: 1
      });
    }
    this.updatePreferencesEditorMenuItemForWorkspaceFolders();
  }
  updatePreferencesEditorMenuItemForWorkspaceFolders() {
    for (const folder of this.workspaceContextService.getWorkspace().folders) {
      const commandId = `_workbench.openFolderSettings.${folder.uri.toString()}`;
      if (!CommandsRegistry.getCommand(commandId)) {
        CommandsRegistry.registerCommand(commandId, () => {
          if (this.workspaceContextService.getWorkbenchState() === WorkbenchState.FOLDER) {
            return this.preferencesService.openWorkspaceSettings({
              jsonEditor: false
            });
          } else {
            return this.preferencesService.openFolderSettings({
              folderUri: folder.uri,
              jsonEditor: false
            });
          }
        });
        MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
          command: {
            id: commandId,
            title: OPEN_USER_SETTINGS_UI_TITLE,
            icon: preferencesOpenSettingsIcon
          },
          when: ContextKeyExpr.and(
            ResourceContextKey.Resource.isEqualTo(
              this.preferencesService.getFolderSettingsResource(folder.uri).toString()
            ),
            ContextKeyExpr.not("isInDiffEditor")
          ),
          group: "navigation",
          order: 1
        });
      }
    }
  }
};
PreferencesActionsContribution = __decorateClass([
  __decorateParam(0, IWorkbenchEnvironmentService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IPreferencesService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, ILabelService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IUserDataProfilesService)
], PreferencesActionsContribution);
let SettingsEditorTitleContribution = class extends Disposable {
  constructor(userDataProfileService, userDataProfilesService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.registerSettingsEditorTitleActions();
  }
  registerSettingsEditorTitleActions() {
    const registerOpenUserSettingsEditorFromJsonActionDisposables = this._register(new MutableDisposable());
    const openUserSettingsEditorWhen = ContextKeyExpr.and(
      ContextKeyExpr.or(
        ResourceContextKey.Resource.isEqualTo(
          this.userDataProfileService.currentProfile.settingsResource.toString()
        ),
        ResourceContextKey.Resource.isEqualTo(
          this.userDataProfilesService.defaultProfile.settingsResource.toString()
        )
      ),
      ContextKeyExpr.not("isInDiffEditor")
    );
    const registerOpenUserSettingsEditorFromJsonAction = () => {
      registerOpenUserSettingsEditorFromJsonActionDisposables.value = void 0;
      registerOpenUserSettingsEditorFromJsonActionDisposables.value = registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: "_workbench.openUserSettingsEditor",
              title: OPEN_USER_SETTINGS_UI_TITLE,
              icon: preferencesOpenSettingsIcon,
              menu: [
                {
                  id: MenuId.EditorTitle,
                  when: openUserSettingsEditorWhen,
                  group: "navigation",
                  order: 1
                }
              ]
            });
          }
          run(accessor, args) {
            args = sanitizeOpenSettingsArgs(args);
            return accessor.get(IPreferencesService).openUserSettings({
              jsonEditor: false,
              ...args
            });
          }
        }
      );
    };
    registerOpenUserSettingsEditorFromJsonAction();
    this._register(
      this.userDataProfileService.onDidChangeCurrentProfile(() => {
        registerOpenUserSettingsEditorFromJsonAction();
      })
    );
    const openSettingsJsonWhen = ContextKeyExpr.and(
      CONTEXT_SETTINGS_EDITOR,
      CONTEXT_SETTINGS_JSON_EDITOR.toNegated()
    );
    this._register(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              id: SETTINGS_EDITOR_COMMAND_SWITCH_TO_JSON,
              title: nls.localize2(
                "openSettingsJson",
                "Open Settings (JSON)"
              ),
              icon: preferencesOpenSettingsIcon,
              menu: [
                {
                  id: MenuId.EditorTitle,
                  when: openSettingsJsonWhen,
                  group: "navigation",
                  order: 1
                }
              ]
            });
          }
          run(accessor) {
            const editorPane = accessor.get(IEditorService).activeEditorPane;
            if (editorPane instanceof SettingsEditor2) {
              return editorPane.switchToSettingsFile();
            }
            return null;
          }
        }
      )
    );
  }
};
SettingsEditorTitleContribution = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IUserDataProfilesService)
], SettingsEditorTitleContribution);
const workbenchContributionsRegistry = Registry.as(WorkbenchExtensions.Workbench);
registerWorkbenchContribution2(
  PreferencesActionsContribution.ID,
  PreferencesActionsContribution,
  WorkbenchPhase.BlockStartup
);
registerWorkbenchContribution2(
  PreferencesContribution.ID,
  PreferencesContribution,
  WorkbenchPhase.BlockStartup
);
workbenchContributionsRegistry.registerWorkbenchContribution(
  SettingsEditorTitleContribution,
  LifecyclePhase.Restored
);
registerEditorContribution(
  SettingsEditorContribution.ID,
  SettingsEditorContribution,
  EditorContributionInstantiation.AfterFirstRender
);
MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
  title: nls.localize(
    { key: "miPreferences", comment: ["&& denotes a mnemonic"] },
    "&&Preferences"
  ),
  submenu: MenuId.MenubarPreferencesMenu,
  group: "5_autosave",
  order: 2,
  when: IsMacNativeContext.toNegated()
  // on macOS native the preferences menu is separate under the application menu
});
