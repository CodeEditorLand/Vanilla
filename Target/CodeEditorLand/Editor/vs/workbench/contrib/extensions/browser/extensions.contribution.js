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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { Event } from "../../../../base/common/event.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { mnemonicButtonLabel } from "../../../../base/common/labels.js";
import {
  Disposable,
  DisposableStore,
  isDisposable
} from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { isWeb } from "../../../../base/common/platform.js";
import { URI } from "../../../../base/common/uri.js";
import {
  CopyAction,
  CutAction,
  PasteAction
} from "../../../../editor/contrib/clipboard/browser/clipboard.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
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
import {
  IDialogService,
  IFileDialogService
} from "../../../../platform/dialogs/common/dialogs.js";
import {
  EXTENSION_INSTALL_SOURCE_CONTEXT,
  ExtensionInstallSource,
  ExtensionsLocalizedLabel,
  IExtensionGalleryService,
  IExtensionManagementService,
  InstallOperation,
  PreferencesLocalizedLabel
} from "../../../../platform/extensionManagement/common/extensionManagement.js";
import {
  areSameExtensions,
  getIdAndVersion
} from "../../../../platform/extensionManagement/common/extensionManagementUtil.js";
import { ExtensionStorageService } from "../../../../platform/extensionManagement/common/extensionStorage.js";
import { IExtensionRecommendationNotificationService } from "../../../../platform/extensionRecommendations/common/extensionRecommendations.js";
import { EXTENSION_CATEGORIES } from "../../../../platform/extensions/common/extensions.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import * as jsonContributionRegistry from "../../../../platform/jsonschemas/common/jsonContributionRegistry.js";
import {
  INotificationService,
  Severity
} from "../../../../platform/notification/common/notification.js";
import { ProgressLocation } from "../../../../platform/progress/common/progress.js";
import {
  Extensions
} from "../../../../platform/quickinput/common/quickAccess.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import {
  EditorPaneDescriptor
} from "../../../browser/editor.js";
import {
  Extensions as ConfigurationMigrationExtensions
} from "../../../common/configuration.js";
import {
  ResourceContextKey,
  WorkbenchStateContext
} from "../../../common/contextkeys.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import { EditorExtensions } from "../../../common/editor.js";
import {
  Extensions as ViewContainerExtensions,
  ViewContainerLocation
} from "../../../common/views.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
  EnablementState,
  extensionsConfigurationNodeBase,
  IExtensionManagementServerService,
  IWorkbenchExtensionEnablementService,
  IWorkbenchExtensionManagementService
} from "../../../services/extensionManagement/common/extensionManagement.js";
import {
  IExtensionIgnoredRecommendationsService,
  IExtensionRecommendationsService
} from "../../../services/extensionRecommendations/common/extensionRecommendations.js";
import { IWorkspaceExtensionsConfigService } from "../../../services/extensionRecommendations/common/workspaceExtensionsConfig.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { IPaneCompositePartService } from "../../../services/panecomposite/browser/panecomposite.js";
import { IPreferencesService } from "../../../services/preferences/common/preferences.js";
import { CONTEXT_SYNC_ENABLEMENT } from "../../../services/userDataSync/common/userDataSync.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { WORKSPACE_TRUST_EXTENSION_SUPPORT } from "../../../services/workspaces/common/workspaceTrust.js";
import { CONTEXT_KEYBINDINGS_EDITOR } from "../../preferences/common/preferences.js";
import { Query } from "../common/extensionQuery.js";
import {
  AutoUpdateConfigurationKey,
  CONTEXT_HAS_GALLERY,
  ExtensionRuntimeActionType,
  extensionsSearchActionsMenu,
  HasOutdatedExtensionsContext,
  IExtensionsWorkbenchService,
  INSTALL_ACTIONS_GROUP,
  INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
  LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID,
  OUTDATED_EXTENSIONS_VIEW_ID,
  SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID,
  THEME_ACTIONS_GROUP,
  TOGGLE_IGNORE_EXTENSION_ACTION_ID,
  UPDATE_ACTIONS_GROUP,
  VIEWLET_ID,
  WORKSPACE_RECOMMENDATIONS_VIEW_ID
} from "../common/extensions.js";
import {
  ExtensionsConfigurationSchema,
  ExtensionsConfigurationSchemaId
} from "../common/extensionsFileTemplate.js";
import { ExtensionsInput } from "../common/extensionsInput.js";
import { KeymapExtensions } from "../common/extensionsUtils.js";
import { ShowRuntimeExtensionsAction } from "./abstractRuntimeExtensionsEditor.js";
import { DeprecatedExtensionsChecker } from "./deprecatedExtensionsChecker.js";
import { ExtensionEditor } from "./extensionEditor.js";
import { ExtensionEnablementWorkspaceTrustTransitionParticipant } from "./extensionEnablementWorkspaceTrustTransitionParticipant.js";
import { ExtensionRecommendationNotificationService } from "./extensionRecommendationNotificationService.js";
import { ExtensionRecommendationsService } from "./extensionRecommendationsService.js";
import {
  ClearLanguageAction,
  ConfigureWorkspaceFolderRecommendedExtensionsAction,
  ConfigureWorkspaceRecommendedExtensionsAction,
  InstallAction,
  InstallAnotherVersionAction,
  InstallSpecificVersionOfExtensionAction,
  PromptExtensionInstallFailureAction,
  ReinstallAction,
  SearchExtensionsAction,
  SetColorThemeAction,
  SetFileIconThemeAction,
  SetProductIconThemeAction,
  ToggleAutoUpdateForExtensionAction,
  ToggleAutoUpdatesForPublisherAction,
  TogglePreReleaseExtensionAction
} from "./extensionsActions.js";
import { ExtensionActivationProgress } from "./extensionsActivationProgress.js";
import { ExtensionsCompletionItemsProvider } from "./extensionsCompletionItemsProvider.js";
import { ExtensionDependencyChecker } from "./extensionsDependencyChecker.js";
import {
  clearSearchResultsIcon,
  configureRecommendedIcon,
  extensionsViewIcon,
  filterIcon,
  installWorkspaceRecommendedIcon,
  refreshIcon
} from "./extensionsIcons.js";
import {
  InstallExtensionQuickAccessProvider,
  ManageExtensionsQuickAccessProvider
} from "./extensionsQuickAccess.js";
import {
  BuiltInExtensionsContext,
  DefaultViewsContext,
  ExtensionsSortByContext,
  ExtensionsViewletViewsContribution,
  ExtensionsViewPaneContainer,
  MaliciousExtensionChecker,
  RecommendedExtensionsContext,
  SearchHasTextContext,
  SearchMarketplaceExtensionsContext,
  StatusUpdater
} from "./extensionsViewlet.js";
import { ExtensionsWorkbenchService } from "./extensionsWorkbenchService.js";
import { UnsupportedExtensionsMigrationContrib } from "./unsupportedExtensionsMigrationContribution.js";
registerSingleton(
  IExtensionsWorkbenchService,
  ExtensionsWorkbenchService,
  InstantiationType.Eager
);
registerSingleton(
  IExtensionRecommendationNotificationService,
  ExtensionRecommendationNotificationService,
  InstantiationType.Delayed
);
registerSingleton(
  IExtensionRecommendationsService,
  ExtensionRecommendationsService,
  InstantiationType.Eager
);
Registry.as(
  Extensions.Quickaccess
).registerQuickAccessProvider({
  ctor: ManageExtensionsQuickAccessProvider,
  prefix: ManageExtensionsQuickAccessProvider.PREFIX,
  placeholder: localize(
    "manageExtensionsQuickAccessPlaceholder",
    "Press Enter to manage extensions."
  ),
  helpEntries: [
    { description: localize("manageExtensionsHelp", "Manage Extensions") }
  ]
});
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    ExtensionEditor,
    ExtensionEditor.ID,
    localize("extension", "Extension")
  ),
  [new SyncDescriptor(ExtensionsInput)]
);
Registry.as(
  ViewContainerExtensions.ViewContainersRegistry
).registerViewContainer(
  {
    id: VIEWLET_ID,
    title: localize2("extensions", "Extensions"),
    openCommandActionDescriptor: {
      id: VIEWLET_ID,
      mnemonicTitle: localize(
        { key: "miViewExtensions", comment: ["&& denotes a mnemonic"] },
        "E&&xtensions"
      ),
      keybindings: {
        primary: KeyMod.CtrlCmd | KeyMod.Shift | KeyCode.KeyX
      },
      order: 4
    },
    ctorDescriptor: new SyncDescriptor(ExtensionsViewPaneContainer),
    icon: extensionsViewIcon,
    order: 4,
    rejectAddedViews: true,
    alwaysUseContainerInfo: true
  },
  ViewContainerLocation.Sidebar
);
Registry.as(
  ConfigurationExtensions.Configuration
).registerConfiguration({
  ...extensionsConfigurationNodeBase,
  properties: {
    "extensions.autoUpdate": {
      enum: [true, "onlyEnabledExtensions", false],
      enumItemLabels: [
        localize("all", "All Extensions"),
        localize("enabled", "Only Enabled Extensions"),
        localize("none", "None")
      ],
      enumDescriptions: [
        localize(
          "extensions.autoUpdate.true",
          "Download and install updates automatically for all extensions."
        ),
        localize(
          "extensions.autoUpdate.enabled",
          "Download and install updates automatically only for enabled extensions."
        ),
        localize(
          "extensions.autoUpdate.false",
          "Extensions are not automatically updated."
        )
      ],
      description: localize(
        "extensions.autoUpdate",
        "Controls the automatic update behavior of extensions. The updates are fetched from a Microsoft online service."
      ),
      default: true,
      scope: ConfigurationScope.APPLICATION,
      tags: ["usesOnlineServices"]
    },
    "extensions.autoCheckUpdates": {
      type: "boolean",
      description: localize(
        "extensionsCheckUpdates",
        "When enabled, automatically checks extensions for updates. If an extension has an update, it is marked as outdated in the Extensions view. The updates are fetched from a Microsoft online service."
      ),
      default: true,
      scope: ConfigurationScope.APPLICATION,
      tags: ["usesOnlineServices"]
    },
    "extensions.ignoreRecommendations": {
      type: "boolean",
      description: localize(
        "extensionsIgnoreRecommendations",
        "When enabled, the notifications for extension recommendations will not be shown."
      ),
      default: false
    },
    "extensions.showRecommendationsOnlyOnDemand": {
      type: "boolean",
      deprecationMessage: localize(
        "extensionsShowRecommendationsOnlyOnDemand_Deprecated",
        "This setting is deprecated. Use extensions.ignoreRecommendations setting to control recommendation notifications. Use Extensions view's visibility actions to hide Recommended view by default."
      ),
      default: false,
      tags: ["usesOnlineServices"]
    },
    "extensions.closeExtensionDetailsOnViewChange": {
      type: "boolean",
      description: localize(
        "extensionsCloseExtensionDetailsOnViewChange",
        "When enabled, editors with extension details will be automatically closed upon navigating away from the Extensions View."
      ),
      default: false
    },
    "extensions.confirmedUriHandlerExtensionIds": {
      type: "array",
      items: {
        type: "string"
      },
      description: localize(
        "handleUriConfirmedExtensions",
        "When an extension is listed here, a confirmation prompt will not be shown when that extension handles a URI."
      ),
      default: [],
      scope: ConfigurationScope.APPLICATION
    },
    "extensions.webWorker": {
      type: ["boolean", "string"],
      enum: [true, false, "auto"],
      enumDescriptions: [
        localize(
          "extensionsWebWorker.true",
          "The Web Worker Extension Host will always be launched."
        ),
        localize(
          "extensionsWebWorker.false",
          "The Web Worker Extension Host will never be launched."
        ),
        localize(
          "extensionsWebWorker.auto",
          "The Web Worker Extension Host will be launched when a web extension needs it."
        )
      ],
      description: localize(
        "extensionsWebWorker",
        "Enable web worker extension host."
      ),
      default: "auto"
    },
    "extensions.supportVirtualWorkspaces": {
      type: "object",
      markdownDescription: localize(
        "extensions.supportVirtualWorkspaces",
        "Override the virtual workspaces support of an extension."
      ),
      patternProperties: {
        "([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          type: "boolean",
          default: false
        }
      },
      additionalProperties: false,
      default: {},
      defaultSnippets: [
        {
          body: {
            "pub.name": false
          }
        }
      ]
    },
    "extensions.experimental.affinity": {
      type: "object",
      markdownDescription: localize(
        "extensions.affinity",
        "Configure an extension to execute in a different extension host process."
      ),
      patternProperties: {
        "([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          type: "integer",
          default: 1
        }
      },
      additionalProperties: false,
      default: {},
      defaultSnippets: [
        {
          body: {
            "pub.name": 1
          }
        }
      ]
    },
    [WORKSPACE_TRUST_EXTENSION_SUPPORT]: {
      type: "object",
      scope: ConfigurationScope.APPLICATION,
      markdownDescription: localize(
        "extensions.supportUntrustedWorkspaces",
        "Override the untrusted workspace support of an extension. Extensions using `true` will always be enabled. Extensions using `limited` will always be enabled, and the extension will hide functionality that requires trust. Extensions using `false` will only be enabled only when the workspace is trusted."
      ),
      patternProperties: {
        "([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$": {
          type: "object",
          properties: {
            supported: {
              type: ["boolean", "string"],
              enum: [true, false, "limited"],
              enumDescriptions: [
                localize(
                  "extensions.supportUntrustedWorkspaces.true",
                  "Extension will always be enabled."
                ),
                localize(
                  "extensions.supportUntrustedWorkspaces.false",
                  "Extension will only be enabled only when the workspace is trusted."
                ),
                localize(
                  "extensions.supportUntrustedWorkspaces.limited",
                  "Extension will always be enabled, and the extension will hide functionality requiring trust."
                )
              ],
              description: localize(
                "extensions.supportUntrustedWorkspaces.supported",
                "Defines the untrusted workspace support setting for the extension."
              )
            },
            version: {
              type: "string",
              description: localize(
                "extensions.supportUntrustedWorkspaces.version",
                "Defines the version of the extension for which the override should be applied. If not specified, the override will be applied independent of the extension version."
              )
            }
          }
        }
      }
    },
    "extensions.experimental.deferredStartupFinishedActivation": {
      type: "boolean",
      description: localize(
        "extensionsDeferredStartupFinishedActivation",
        "When enabled, extensions which declare the `onStartupFinished` activation event will be activated after a timeout."
      ),
      default: false
    },
    "extensions.experimental.issueQuickAccess": {
      type: "boolean",
      description: localize(
        "extensionsInQuickAccess",
        "When enabled, extensions can be searched for via Quick Access and report issues from there."
      ),
      default: true
    }
  }
});
const jsonRegistry = Registry.as(jsonContributionRegistry.Extensions.JSONContribution);
jsonRegistry.registerSchema(
  ExtensionsConfigurationSchemaId,
  ExtensionsConfigurationSchema
);
CommandsRegistry.registerCommand(
  "_extensions.manage",
  (accessor, extensionId, tab, preserveFocus, feature) => {
    const extensionService = accessor.get(IExtensionsWorkbenchService);
    const extension = extensionService.local.find(
      (e) => areSameExtensions(e.identifier, { id: extensionId })
    );
    if (extension) {
      extensionService.open(extension, { tab, preserveFocus, feature });
    } else {
      throw new Error(
        localize("notFound", "Extension '{0}' not found.", extensionId)
      );
    }
  }
);
CommandsRegistry.registerCommand(
  "extension.open",
  async (accessor, extensionId, tab, preserveFocus, feature, sideByside) => {
    const extensionService = accessor.get(IExtensionsWorkbenchService);
    const commandService = accessor.get(ICommandService);
    const [extension] = await extensionService.getExtensions(
      [{ id: extensionId }],
      CancellationToken.None
    );
    if (extension) {
      return extensionService.open(extension, {
        tab,
        preserveFocus,
        feature,
        sideByside
      });
    }
    return commandService.executeCommand(
      "_extensions.manage",
      extensionId,
      tab,
      preserveFocus,
      feature
    );
  }
);
CommandsRegistry.registerCommand({
  id: "workbench.extensions.installExtension",
  metadata: {
    description: localize(
      "workbench.extensions.installExtension.description",
      "Install the given extension"
    ),
    args: [
      {
        name: "extensionIdOrVSIXUri",
        description: localize(
          "workbench.extensions.installExtension.arg.decription",
          "Extension id or VSIX resource uri"
        ),
        constraint: (value) => typeof value === "string" || value instanceof URI
      },
      {
        name: "options",
        description: "(optional) Options for installing the extension. Object with the following properties: `installOnlyNewlyAddedFromExtensionPackVSIX`: When enabled, VS Code installs only newly added extensions from the extension pack VSIX. This option is considered only when installing VSIX. ",
        isOptional: true,
        schema: {
          type: "object",
          properties: {
            installOnlyNewlyAddedFromExtensionPackVSIX: {
              type: "boolean",
              description: localize(
                "workbench.extensions.installExtension.option.installOnlyNewlyAddedFromExtensionPackVSIX",
                "When enabled, VS Code installs only newly added extensions from the extension pack VSIX. This option is considered only while installing a VSIX."
              ),
              default: false
            },
            installPreReleaseVersion: {
              type: "boolean",
              description: localize(
                "workbench.extensions.installExtension.option.installPreReleaseVersion",
                "When enabled, VS Code installs the pre-release version of the extension if available."
              ),
              default: false
            },
            donotSync: {
              type: "boolean",
              description: localize(
                "workbench.extensions.installExtension.option.donotSync",
                "When enabled, VS Code do not sync this extension when Settings Sync is on."
              ),
              default: false
            },
            justification: {
              type: ["string", "object"],
              description: localize(
                "workbench.extensions.installExtension.option.justification",
                "Justification for installing the extension. This is a string or an object that can be used to pass any information to the installation handlers. i.e. `{reason: 'This extension wants to open a URI', action: 'Open URI'}` will show a message box with the reason and action upon install."
              )
            },
            enable: {
              type: "boolean",
              description: localize(
                "workbench.extensions.installExtension.option.enable",
                "When enabled, the extension will be enabled if it is installed but disabled. If the extension is already enabled, this has no effect."
              ),
              default: false
            },
            context: {
              type: "object",
              description: localize(
                "workbench.extensions.installExtension.option.context",
                "Context for the installation. This is a JSON object that can be used to pass any information to the installation handlers. i.e. `{skipWalkthrough: true}` will skip opening the walkthrough upon install."
              )
            }
          }
        }
      }
    ]
  },
  handler: async (accessor, arg, options) => {
    const extensionsWorkbenchService = accessor.get(
      IExtensionsWorkbenchService
    );
    const extensionManagementService = accessor.get(
      IWorkbenchExtensionManagementService
    );
    const extensionGalleryService = accessor.get(IExtensionGalleryService);
    try {
      if (typeof arg === "string") {
        const [id, version] = getIdAndVersion(arg);
        const extension = extensionsWorkbenchService.local.find(
          (e) => areSameExtensions(e.identifier, { id, uuid: version })
        );
        if (extension?.enablementState === EnablementState.DisabledByExtensionKind) {
          const [gallery] = await extensionGalleryService.getExtensions(
            [
              {
                id,
                preRelease: options?.installPreReleaseVersion
              }
            ],
            CancellationToken.None
          );
          if (!gallery) {
            throw new Error(
              localize(
                "notFound",
                "Extension '{0}' not found.",
                arg
              )
            );
          }
          await extensionManagementService.installFromGallery(
            gallery,
            {
              isMachineScoped: options?.donotSync ? true : void 0,
              installPreReleaseVersion: options?.installPreReleaseVersion,
              installGivenVersion: !!version,
              context: {
                ...options?.context,
                [EXTENSION_INSTALL_SOURCE_CONTEXT]: ExtensionInstallSource.COMMAND
              }
            }
          );
        } else {
          await extensionsWorkbenchService.install(
            arg,
            {
              version,
              installPreReleaseVersion: options?.installPreReleaseVersion,
              context: {
                ...options?.context,
                [EXTENSION_INSTALL_SOURCE_CONTEXT]: ExtensionInstallSource.COMMAND
              },
              justification: options?.justification,
              enable: options?.enable,
              isMachineScoped: options?.donotSync ? true : void 0
            },
            ProgressLocation.Notification
          );
        }
      } else {
        const vsix = URI.revive(arg);
        await extensionsWorkbenchService.install(vsix, {
          installOnlyNewlyAddedFromExtensionPack: options?.installOnlyNewlyAddedFromExtensionPackVSIX,
          installGivenVersion: true
        });
      }
    } catch (e) {
      onUnexpectedError(e);
      throw e;
    }
  }
});
CommandsRegistry.registerCommand({
  id: "workbench.extensions.uninstallExtension",
  metadata: {
    description: localize(
      "workbench.extensions.uninstallExtension.description",
      "Uninstall the given extension"
    ),
    args: [
      {
        name: localize(
          "workbench.extensions.uninstallExtension.arg.name",
          "Id of the extension to uninstall"
        ),
        schema: {
          type: "string"
        }
      }
    ]
  },
  handler: async (accessor, id) => {
    if (!id) {
      throw new Error(localize("id required", "Extension id required."));
    }
    const extensionManagementService = accessor.get(
      IExtensionManagementService
    );
    const installed = await extensionManagementService.getInstalled();
    const [extensionToUninstall] = installed.filter(
      (e) => areSameExtensions(e.identifier, { id })
    );
    if (!extensionToUninstall) {
      throw new Error(
        localize(
          "notInstalled",
          "Extension '{0}' is not installed. Make sure you use the full extension ID, including the publisher, e.g.: ms-dotnettools.csharp.",
          id
        )
      );
    }
    if (extensionToUninstall.isBuiltin) {
      throw new Error(
        localize(
          "builtin",
          "Extension '{0}' is a Built-in extension and cannot be installed",
          id
        )
      );
    }
    try {
      await extensionManagementService.uninstall(extensionToUninstall);
    } catch (e) {
      onUnexpectedError(e);
      throw e;
    }
  }
});
CommandsRegistry.registerCommand({
  id: "workbench.extensions.search",
  metadata: {
    description: localize(
      "workbench.extensions.search.description",
      "Search for a specific extension"
    ),
    args: [
      {
        name: localize(
          "workbench.extensions.search.arg.name",
          "Query to use in search"
        ),
        schema: { type: "string" }
      }
    ]
  },
  handler: async (accessor, query = "") => {
    const paneCompositeService = accessor.get(IPaneCompositePartService);
    const viewlet = await paneCompositeService.openPaneComposite(
      VIEWLET_ID,
      ViewContainerLocation.Sidebar,
      true
    );
    if (!viewlet) {
      return;
    }
    viewlet.getViewPaneContainer().search(
      query
    );
    viewlet.focus();
  }
});
function overrideActionForActiveExtensionEditorWebview(command, f) {
  command?.addImplementation(105, "extensions-editor", (accessor) => {
    const editorService = accessor.get(IEditorService);
    const editor = editorService.activeEditorPane;
    if (editor instanceof ExtensionEditor) {
      if (editor.activeWebview?.isFocused) {
        f(editor.activeWebview);
        return true;
      }
    }
    return false;
  });
}
overrideActionForActiveExtensionEditorWebview(
  CopyAction,
  (webview) => webview.copy()
);
overrideActionForActiveExtensionEditorWebview(
  CutAction,
  (webview) => webview.cut()
);
overrideActionForActiveExtensionEditorWebview(
  PasteAction,
  (webview) => webview.paste()
);
const CONTEXT_HAS_LOCAL_SERVER = new RawContextKey(
  "hasLocalServer",
  false
);
const CONTEXT_HAS_REMOTE_SERVER = new RawContextKey(
  "hasRemoteServer",
  false
);
const CONTEXT_HAS_WEB_SERVER = new RawContextKey(
  "hasWebServer",
  false
);
async function runAction(action) {
  try {
    await action.run();
  } finally {
    if (isDisposable(action)) {
      action.dispose();
    }
  }
}
let ExtensionsContributions = class extends Disposable {
  constructor(extensionManagementServerService, extensionGalleryService, contextKeyService, paneCompositeService, extensionsWorkbenchService, extensionEnablementService, instantiationService, dialogService, commandService) {
    super();
    this.extensionManagementServerService = extensionManagementServerService;
    this.paneCompositeService = paneCompositeService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.extensionEnablementService = extensionEnablementService;
    this.instantiationService = instantiationService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    const hasGalleryContext = CONTEXT_HAS_GALLERY.bindTo(contextKeyService);
    if (extensionGalleryService.isEnabled()) {
      hasGalleryContext.set(true);
    }
    const hasLocalServerContext = CONTEXT_HAS_LOCAL_SERVER.bindTo(contextKeyService);
    if (this.extensionManagementServerService.localExtensionManagementServer) {
      hasLocalServerContext.set(true);
    }
    const hasRemoteServerContext = CONTEXT_HAS_REMOTE_SERVER.bindTo(contextKeyService);
    if (this.extensionManagementServerService.remoteExtensionManagementServer) {
      hasRemoteServerContext.set(true);
    }
    const hasWebServerContext = CONTEXT_HAS_WEB_SERVER.bindTo(contextKeyService);
    if (this.extensionManagementServerService.webExtensionManagementServer) {
      hasWebServerContext.set(true);
    }
    this.registerGlobalActions();
    this.registerContextMenuActions();
    this.registerQuickAccessProvider();
  }
  registerQuickAccessProvider() {
    if (this.extensionManagementServerService.localExtensionManagementServer || this.extensionManagementServerService.remoteExtensionManagementServer || this.extensionManagementServerService.webExtensionManagementServer) {
      Registry.as(
        Extensions.Quickaccess
      ).registerQuickAccessProvider({
        ctor: InstallExtensionQuickAccessProvider,
        prefix: InstallExtensionQuickAccessProvider.PREFIX,
        placeholder: localize(
          "installExtensionQuickAccessPlaceholder",
          "Type the name of an extension to install or search."
        ),
        helpEntries: [
          {
            description: localize(
              "installExtensionQuickAccessHelp",
              "Install or Search Extensions"
            )
          }
        ]
      });
    }
  }
  // Global actions
  registerGlobalActions() {
    this._register(
      MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
        command: {
          id: VIEWLET_ID,
          title: localize(
            {
              key: "miPreferencesExtensions",
              comment: ["&& denotes a mnemonic"]
            },
            "&&Extensions"
          )
        },
        group: "2_configuration",
        order: 3
      })
    );
    this._register(
      MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
        command: {
          id: VIEWLET_ID,
          title: localize("showExtensions", "Extensions")
        },
        group: "2_configuration",
        order: 3
      })
    );
    this.registerExtensionAction({
      id: "workbench.extensions.action.focusExtensionsView",
      title: localize2("focusExtensions", "Focus on Extensions View"),
      category: ExtensionsLocalizedLabel,
      f1: true,
      run: async (accessor) => {
        await accessor.get(IPaneCompositePartService).openPaneComposite(
          VIEWLET_ID,
          ViewContainerLocation.Sidebar,
          true
        );
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installExtensions",
      title: localize2("installExtensions", "Install Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          CONTEXT_HAS_GALLERY,
          ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER,
            CONTEXT_HAS_WEB_SERVER
          )
        )
      },
      run: async (accessor) => {
        accessor.get(IViewsService).openViewContainer(VIEWLET_ID, true);
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showRecommendedKeymapExtensions",
      title: localize2("showRecommendedKeymapExtensionsShort", "Keymaps"),
      category: PreferencesLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: CONTEXT_HAS_GALLERY
        },
        {
          id: MenuId.EditorTitle,
          when: ContextKeyExpr.and(
            CONTEXT_KEYBINDINGS_EDITOR,
            CONTEXT_HAS_GALLERY
          ),
          group: "2_keyboard_discover_actions"
        }
      ],
      menuTitles: {
        [MenuId.EditorTitle.id]: localize(
          "importKeyboardShortcutsFroms",
          "Migrate Keyboard Shortcuts from..."
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@recommended:keymaps "
        )
      )
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showLanguageExtensions",
      title: localize2(
        "showLanguageExtensionsShort",
        "Language Extensions"
      ),
      category: PreferencesLocalizedLabel,
      menu: {
        id: MenuId.CommandPalette,
        when: CONTEXT_HAS_GALLERY
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@recommended:languages "
        )
      )
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.checkForUpdates",
      title: localize2("checkForUpdates", "Check for Extension Updates"),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.and(
            CONTEXT_HAS_GALLERY,
            ContextKeyExpr.or(
              CONTEXT_HAS_LOCAL_SERVER,
              CONTEXT_HAS_REMOTE_SERVER,
              CONTEXT_HAS_WEB_SERVER
            )
          )
        },
        {
          id: MenuId.ViewContainerTitle,
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals("viewContainer", VIEWLET_ID),
            CONTEXT_HAS_GALLERY
          ),
          group: "1_updates",
          order: 1
        }
      ],
      run: async () => {
        await this.extensionsWorkbenchService.checkForUpdates();
        const outdated = this.extensionsWorkbenchService.outdated;
        if (outdated.length) {
          return runAction(
            this.instantiationService.createInstance(
              SearchExtensionsAction,
              "@outdated "
            )
          );
        } else {
          return this.dialogService.info(
            localize(
              "noUpdatesAvailable",
              "All extensions are up to date."
            )
          );
        }
      }
    });
    const enableAutoUpdateWhenCondition = ContextKeyExpr.equals(
      `config.${AutoUpdateConfigurationKey}`,
      false
    );
    this.registerExtensionAction({
      id: "workbench.extensions.action.enableAutoUpdate",
      title: localize2(
        "enableAutoUpdate",
        "Enable Auto Update for All Extensions"
      ),
      category: ExtensionsLocalizedLabel,
      precondition: enableAutoUpdateWhenCondition,
      menu: [
        {
          id: MenuId.ViewContainerTitle,
          order: 5,
          group: "1_updates",
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals("viewContainer", VIEWLET_ID),
            enableAutoUpdateWhenCondition
          )
        },
        {
          id: MenuId.CommandPalette
        }
      ],
      run: (accessor) => accessor.get(IExtensionsWorkbenchService).updateAutoUpdateValue(true)
    });
    const disableAutoUpdateWhenCondition = ContextKeyExpr.notEquals(
      `config.${AutoUpdateConfigurationKey}`,
      false
    );
    this.registerExtensionAction({
      id: "workbench.extensions.action.disableAutoUpdate",
      title: localize2(
        "disableAutoUpdate",
        "Disable Auto Update for All Extensions"
      ),
      precondition: disableAutoUpdateWhenCondition,
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.ViewContainerTitle,
          order: 5,
          group: "1_updates",
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals("viewContainer", VIEWLET_ID),
            disableAutoUpdateWhenCondition
          )
        },
        {
          id: MenuId.CommandPalette
        }
      ],
      run: (accessor) => accessor.get(IExtensionsWorkbenchService).updateAutoUpdateValue(false)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.updateAllExtensions",
      title: localize2("updateAll", "Update All Extensions"),
      category: ExtensionsLocalizedLabel,
      precondition: HasOutdatedExtensionsContext,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.and(
            CONTEXT_HAS_GALLERY,
            ContextKeyExpr.or(
              CONTEXT_HAS_LOCAL_SERVER,
              CONTEXT_HAS_REMOTE_SERVER,
              CONTEXT_HAS_WEB_SERVER
            )
          )
        },
        {
          id: MenuId.ViewContainerTitle,
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals("viewContainer", VIEWLET_ID),
            ContextKeyExpr.or(
              ContextKeyExpr.has(
                `config.${AutoUpdateConfigurationKey}`
              ).negate(),
              ContextKeyExpr.equals(
                `config.${AutoUpdateConfigurationKey}`,
                "onlyEnabledExtensions"
              )
            )
          ),
          group: "1_updates",
          order: 2
        },
        {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals(
            "view",
            OUTDATED_EXTENSIONS_VIEW_ID
          ),
          group: "navigation",
          order: 1
        }
      ],
      icon: installWorkspaceRecommendedIcon,
      run: async () => {
        const outdated = this.extensionsWorkbenchService.outdated;
        const results = await this.extensionsWorkbenchService.updateAll();
        results.forEach((result) => {
          if (result.error) {
            const extension = outdated.find(
              (extension2) => areSameExtensions(
                extension2.identifier,
                result.identifier
              )
            );
            if (extension) {
              runAction(
                this.instantiationService.createInstance(
                  PromptExtensionInstallFailureAction,
                  extension,
                  extension.latestVersion,
                  InstallOperation.Update,
                  result.error
                )
              );
            }
          }
        });
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.enableAll",
      title: localize2("enableAll", "Enable All Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER,
            CONTEXT_HAS_WEB_SERVER
          )
        },
        {
          id: MenuId.ViewContainerTitle,
          when: ContextKeyExpr.equals("viewContainer", VIEWLET_ID),
          group: "2_enablement",
          order: 1
        }
      ],
      run: async () => {
        const extensionsToEnable = this.extensionsWorkbenchService.local.filter(
          (e) => !!e.local && this.extensionEnablementService.canChangeEnablement(
            e.local
          ) && !this.extensionEnablementService.isEnabled(e.local)
        );
        if (extensionsToEnable.length) {
          await this.extensionsWorkbenchService.setEnablement(
            extensionsToEnable,
            EnablementState.EnabledGlobally
          );
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.enableAllWorkspace",
      title: localize2(
        "enableAllWorkspace",
        "Enable All Extensions for this Workspace"
      ),
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          WorkbenchStateContext.notEqualsTo("empty"),
          ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER,
            CONTEXT_HAS_WEB_SERVER
          )
        )
      },
      run: async () => {
        const extensionsToEnable = this.extensionsWorkbenchService.local.filter(
          (e) => !!e.local && this.extensionEnablementService.canChangeEnablement(
            e.local
          ) && !this.extensionEnablementService.isEnabled(e.local)
        );
        if (extensionsToEnable.length) {
          await this.extensionsWorkbenchService.setEnablement(
            extensionsToEnable,
            EnablementState.EnabledWorkspace
          );
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.disableAll",
      title: localize2("disableAll", "Disable All Installed Extensions"),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER,
            CONTEXT_HAS_WEB_SERVER
          )
        },
        {
          id: MenuId.ViewContainerTitle,
          when: ContextKeyExpr.equals("viewContainer", VIEWLET_ID),
          group: "2_enablement",
          order: 2
        }
      ],
      run: async () => {
        const extensionsToDisable = this.extensionsWorkbenchService.local.filter(
          (e) => !e.isBuiltin && !!e.local && this.extensionEnablementService.isEnabled(
            e.local
          ) && this.extensionEnablementService.canChangeEnablement(
            e.local
          )
        );
        if (extensionsToDisable.length) {
          await this.extensionsWorkbenchService.setEnablement(
            extensionsToDisable,
            EnablementState.DisabledGlobally
          );
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.disableAllWorkspace",
      title: localize2(
        "disableAllWorkspace",
        "Disable All Installed Extensions for this Workspace"
      ),
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          WorkbenchStateContext.notEqualsTo("empty"),
          ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER,
            CONTEXT_HAS_WEB_SERVER
          )
        )
      },
      run: async () => {
        const extensionsToDisable = this.extensionsWorkbenchService.local.filter(
          (e) => !e.isBuiltin && !!e.local && this.extensionEnablementService.isEnabled(
            e.local
          ) && this.extensionEnablementService.canChangeEnablement(
            e.local
          )
        );
        if (extensionsToDisable.length) {
          await this.extensionsWorkbenchService.setEnablement(
            extensionsToDisable,
            EnablementState.DisabledWorkspace
          );
        }
      }
    });
    this.registerExtensionAction({
      id: SELECT_INSTALL_VSIX_EXTENSION_COMMAND_ID,
      title: localize2("InstallFromVSIX", "Install from VSIX..."),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER
          )
        },
        {
          id: MenuId.ViewContainerTitle,
          when: ContextKeyExpr.and(
            ContextKeyExpr.equals("viewContainer", VIEWLET_ID),
            ContextKeyExpr.or(
              CONTEXT_HAS_LOCAL_SERVER,
              CONTEXT_HAS_REMOTE_SERVER
            )
          ),
          group: "3_install",
          order: 1
        }
      ],
      run: async (accessor) => {
        const fileDialogService = accessor.get(IFileDialogService);
        const commandService = accessor.get(ICommandService);
        const vsixPaths = await fileDialogService.showOpenDialog({
          title: localize("installFromVSIX", "Install from VSIX"),
          filters: [
            { name: "VSIX Extensions", extensions: ["vsix"] }
          ],
          canSelectFiles: true,
          canSelectMany: true,
          openLabel: mnemonicButtonLabel(
            localize(
              {
                key: "installButton",
                comment: ["&& denotes a mnemonic"]
              },
              "&&Install"
            )
          )
        });
        if (vsixPaths) {
          await commandService.executeCommand(
            INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
            vsixPaths
          );
        }
      }
    });
    this.registerExtensionAction({
      id: INSTALL_EXTENSION_FROM_VSIX_COMMAND_ID,
      title: localize("installVSIX", "Install Extension VSIX"),
      menu: [
        {
          id: MenuId.ExplorerContext,
          group: "extensions",
          when: ContextKeyExpr.and(
            ResourceContextKey.Extension.isEqualTo(".vsix"),
            ContextKeyExpr.or(
              CONTEXT_HAS_LOCAL_SERVER,
              CONTEXT_HAS_REMOTE_SERVER
            )
          )
        }
      ],
      run: async (accessor, resources) => {
        const extensionsWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const hostService = accessor.get(IHostService);
        const notificationService = accessor.get(INotificationService);
        const vsixs = Array.isArray(resources) ? resources : [resources];
        const result = await Promise.allSettled(
          vsixs.map(
            async (vsix) => await extensionsWorkbenchService.install(vsix, {
              installGivenVersion: true
            })
          )
        );
        let error, requireReload = false, requireRestart = false;
        for (const r of result) {
          if (r.status === "rejected") {
            error = new Error(r.reason);
            break;
          }
          requireReload = requireReload || r.value.runtimeState?.action === ExtensionRuntimeActionType.ReloadWindow;
          requireRestart = requireRestart || r.value.runtimeState?.action === ExtensionRuntimeActionType.RestartExtensions;
        }
        if (error) {
          throw error;
        }
        if (requireReload) {
          notificationService.prompt(
            Severity.Info,
            localize(
              "InstallVSIXAction.successReload",
              "Completed installing extension from VSIX. Please reload Visual Studio Code to enable it."
            ),
            [
              {
                label: localize(
                  "InstallVSIXAction.reloadNow",
                  "Reload Now"
                ),
                run: () => hostService.reload()
              }
            ]
          );
        } else if (requireRestart) {
          notificationService.prompt(
            Severity.Info,
            localize(
              "InstallVSIXAction.successRestart",
              "Completed installing extension from VSIX. Please restart extensions to enable it."
            ),
            [
              {
                label: localize(
                  "InstallVSIXAction.restartExtensions",
                  "Restart Extensions"
                ),
                run: () => extensionsWorkbenchService.updateRunningExtensions()
              }
            ]
          );
        } else {
          notificationService.prompt(
            Severity.Info,
            localize(
              "InstallVSIXAction.successNoReload",
              "Completed installing extension."
            ),
            []
          );
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installExtensionFromLocation",
      title: localize2(
        "installExtensionFromLocation",
        "Install Extension from Location..."
      ),
      category: Categories.Developer,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.or(
            CONTEXT_HAS_WEB_SERVER,
            CONTEXT_HAS_LOCAL_SERVER
          )
        }
      ],
      run: async (accessor) => {
        const extensionManagementService = accessor.get(
          IWorkbenchExtensionManagementService
        );
        if (isWeb) {
          return new Promise((c, e) => {
            const quickInputService = accessor.get(IQuickInputService);
            const disposables = new DisposableStore();
            const quickPick = disposables.add(
              quickInputService.createQuickPick()
            );
            quickPick.title = localize(
              "installFromLocation",
              "Install Extension from Location"
            );
            quickPick.customButton = true;
            quickPick.customLabel = localize(
              "install button",
              "Install"
            );
            quickPick.placeholder = localize(
              "installFromLocationPlaceHolder",
              "Location of the web extension"
            );
            quickPick.ignoreFocusOut = true;
            disposables.add(
              Event.any(
                quickPick.onDidAccept,
                quickPick.onDidCustom
              )(async () => {
                quickPick.hide();
                if (quickPick.value) {
                  try {
                    await extensionManagementService.installFromLocation(
                      URI.parse(quickPick.value)
                    );
                  } catch (error) {
                    e(error);
                    return;
                  }
                }
                c();
              })
            );
            disposables.add(
              quickPick.onDidHide(() => disposables.dispose())
            );
            quickPick.show();
          });
        } else {
          const fileDialogService = accessor.get(IFileDialogService);
          const extensionLocation = await fileDialogService.showOpenDialog({
            canSelectFolders: true,
            canSelectFiles: false,
            canSelectMany: false,
            title: localize(
              "installFromLocation",
              "Install Extension from Location"
            )
          });
          if (extensionLocation?.[0]) {
            await extensionManagementService.installFromLocation(
              extensionLocation[0]
            );
          }
        }
      }
    });
    const extensionsFilterSubMenu = new MenuId("extensionsFilterSubMenu");
    MenuRegistry.appendMenuItem(extensionsSearchActionsMenu, {
      submenu: extensionsFilterSubMenu,
      title: localize("filterExtensions", "Filter Extensions..."),
      group: "navigation",
      order: 2,
      icon: filterIcon
    });
    const showFeaturedExtensionsId = "extensions.filter.featured";
    this.registerExtensionAction({
      id: showFeaturedExtensionsId,
      title: localize2(
        "showFeaturedExtensions",
        "Show Featured Extensions"
      ),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: CONTEXT_HAS_GALLERY
        },
        {
          id: extensionsFilterSubMenu,
          when: CONTEXT_HAS_GALLERY,
          group: "1_predefined",
          order: 1
        }
      ],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(
          "featured filter",
          "Featured"
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@featured "
        )
      )
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showPopularExtensions",
      title: localize2(
        "showPopularExtensions",
        "Show Popular Extensions"
      ),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: CONTEXT_HAS_GALLERY
        },
        {
          id: extensionsFilterSubMenu,
          when: CONTEXT_HAS_GALLERY,
          group: "1_predefined",
          order: 2
        }
      ],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(
          "most popular filter",
          "Most Popular"
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@popular "
        )
      )
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showRecommendedExtensions",
      title: localize2(
        "showRecommendedExtensions",
        "Show Recommended Extensions"
      ),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: CONTEXT_HAS_GALLERY
        },
        {
          id: extensionsFilterSubMenu,
          when: CONTEXT_HAS_GALLERY,
          group: "1_predefined",
          order: 2
        }
      ],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(
          "most popular recommended",
          "Recommended"
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@recommended "
        )
      )
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.recentlyPublishedExtensions",
      title: localize2(
        "recentlyPublishedExtensions",
        "Show Recently Published Extensions"
      ),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: CONTEXT_HAS_GALLERY
        },
        {
          id: extensionsFilterSubMenu,
          when: CONTEXT_HAS_GALLERY,
          group: "1_predefined",
          order: 2
        }
      ],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(
          "recently published filter",
          "Recently Published"
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@recentlyPublished "
        )
      )
    });
    const extensionsCategoryFilterSubMenu = new MenuId(
      "extensionsCategoryFilterSubMenu"
    );
    MenuRegistry.appendMenuItem(extensionsFilterSubMenu, {
      submenu: extensionsCategoryFilterSubMenu,
      title: localize("filter by category", "Category"),
      when: CONTEXT_HAS_GALLERY,
      group: "2_categories",
      order: 1
    });
    EXTENSION_CATEGORIES.forEach((category, index) => {
      this.registerExtensionAction({
        id: `extensions.actions.searchByCategory.${category}`,
        title: category,
        menu: [
          {
            id: extensionsCategoryFilterSubMenu,
            when: CONTEXT_HAS_GALLERY,
            order: index
          }
        ],
        run: () => runAction(
          this.instantiationService.createInstance(
            SearchExtensionsAction,
            `@category:"${category.toLowerCase()}"`
          )
        )
      });
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.listBuiltInExtensions",
      title: localize2(
        "showBuiltInExtensions",
        "Show Built-in Extensions"
      ),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER,
            CONTEXT_HAS_WEB_SERVER
          )
        },
        {
          id: extensionsFilterSubMenu,
          group: "3_installed",
          order: 2
        }
      ],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(
          "builtin filter",
          "Built-in"
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@builtin "
        )
      )
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.extensionUpdates",
      title: localize2("extensionUpdates", "Show Extension Updates"),
      category: ExtensionsLocalizedLabel,
      precondition: CONTEXT_HAS_GALLERY,
      f1: true,
      menu: [
        {
          id: extensionsFilterSubMenu,
          group: "3_installed",
          when: CONTEXT_HAS_GALLERY,
          order: 1
        }
      ],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(
          "extension updates filter",
          "Updates"
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@updates"
        )
      )
    });
    this.registerExtensionAction({
      id: LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID,
      title: localize2(
        "showWorkspaceUnsupportedExtensions",
        "Show Extensions Unsupported By Workspace"
      ),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER
          )
        },
        {
          id: extensionsFilterSubMenu,
          group: "3_installed",
          order: 5,
          when: ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER
          )
        }
      ],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(
          "workspace unsupported filter",
          "Workspace Unsupported"
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@workspaceUnsupported"
        )
      )
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showEnabledExtensions",
      title: localize2(
        "showEnabledExtensions",
        "Show Enabled Extensions"
      ),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER,
            CONTEXT_HAS_WEB_SERVER
          )
        },
        {
          id: extensionsFilterSubMenu,
          group: "3_installed",
          order: 3
        }
      ],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(
          "enabled filter",
          "Enabled"
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@enabled "
        )
      )
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showDisabledExtensions",
      title: localize2(
        "showDisabledExtensions",
        "Show Disabled Extensions"
      ),
      category: ExtensionsLocalizedLabel,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER,
            CONTEXT_HAS_WEB_SERVER
          )
        },
        {
          id: extensionsFilterSubMenu,
          group: "3_installed",
          order: 4
        }
      ],
      menuTitles: {
        [extensionsFilterSubMenu.id]: localize(
          "disabled filter",
          "Disabled"
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          SearchExtensionsAction,
          "@disabled "
        )
      )
    });
    const extensionsSortSubMenu = new MenuId("extensionsSortSubMenu");
    MenuRegistry.appendMenuItem(extensionsFilterSubMenu, {
      submenu: extensionsSortSubMenu,
      title: localize("sorty by", "Sort By"),
      when: ContextKeyExpr.and(
        ContextKeyExpr.or(CONTEXT_HAS_GALLERY, DefaultViewsContext)
      ),
      group: "4_sort",
      order: 1
    });
    [
      {
        id: "installs",
        title: localize("sort by installs", "Install Count"),
        precondition: BuiltInExtensionsContext.negate()
      },
      {
        id: "rating",
        title: localize("sort by rating", "Rating"),
        precondition: BuiltInExtensionsContext.negate()
      },
      {
        id: "name",
        title: localize("sort by name", "Name"),
        precondition: BuiltInExtensionsContext.negate()
      },
      {
        id: "publishedDate",
        title: localize("sort by published date", "Published Date"),
        precondition: BuiltInExtensionsContext.negate()
      },
      {
        id: "updateDate",
        title: localize("sort by update date", "Updated Date"),
        precondition: ContextKeyExpr.and(
          SearchMarketplaceExtensionsContext.negate(),
          RecommendedExtensionsContext.negate(),
          BuiltInExtensionsContext.negate()
        )
      }
    ].map(({ id, title, precondition }, index) => {
      this.registerExtensionAction({
        id: `extensions.sort.${id}`,
        title,
        precondition,
        menu: [
          {
            id: extensionsSortSubMenu,
            when: ContextKeyExpr.or(
              CONTEXT_HAS_GALLERY,
              DefaultViewsContext
            ),
            order: index
          }
        ],
        toggled: ExtensionsSortByContext.isEqualTo(id),
        run: async () => {
          const viewlet = await this.paneCompositeService.openPaneComposite(
            VIEWLET_ID,
            ViewContainerLocation.Sidebar,
            true
          );
          const extensionsViewPaneContainer = viewlet?.getViewPaneContainer();
          const currentQuery = Query.parse(
            extensionsViewPaneContainer.searchValue || ""
          );
          extensionsViewPaneContainer.search(
            new Query(currentQuery.value, id).toString()
          );
          extensionsViewPaneContainer.focus();
        }
      });
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.clearExtensionsSearchResults",
      title: localize2(
        "clearExtensionsSearchResults",
        "Clear Extensions Search Results"
      ),
      category: ExtensionsLocalizedLabel,
      icon: clearSearchResultsIcon,
      f1: true,
      precondition: SearchHasTextContext,
      menu: {
        id: extensionsSearchActionsMenu,
        group: "navigation",
        order: 1
      },
      run: async (accessor) => {
        const viewPaneContainer = accessor.get(IViewsService).getActiveViewPaneContainerWithId(VIEWLET_ID);
        if (viewPaneContainer) {
          const extensionsViewPaneContainer = viewPaneContainer;
          extensionsViewPaneContainer.search("");
          extensionsViewPaneContainer.focus();
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.refreshExtension",
      title: localize2("refreshExtension", "Refresh"),
      category: ExtensionsLocalizedLabel,
      icon: refreshIcon,
      f1: true,
      menu: {
        id: MenuId.ViewContainerTitle,
        when: ContextKeyExpr.equals("viewContainer", VIEWLET_ID),
        group: "navigation",
        order: 2
      },
      run: async (accessor) => {
        const viewPaneContainer = accessor.get(IViewsService).getActiveViewPaneContainerWithId(VIEWLET_ID);
        if (viewPaneContainer) {
          await viewPaneContainer.refresh();
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installWorkspaceRecommendedExtensions",
      title: localize(
        "installWorkspaceRecommendedExtensions",
        "Install Workspace Recommended Extensions"
      ),
      icon: installWorkspaceRecommendedIcon,
      menu: {
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.equals(
          "view",
          WORKSPACE_RECOMMENDATIONS_VIEW_ID
        ),
        group: "navigation",
        order: 1
      },
      run: async (accessor) => {
        const view = accessor.get(IViewsService).getActiveViewWithId(
          WORKSPACE_RECOMMENDATIONS_VIEW_ID
        );
        return view.installWorkspaceRecommendations();
      }
    });
    this.registerExtensionAction({
      id: ConfigureWorkspaceFolderRecommendedExtensionsAction.ID,
      title: ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL,
      icon: configureRecommendedIcon,
      menu: [
        {
          id: MenuId.CommandPalette,
          when: WorkbenchStateContext.notEqualsTo("empty")
        },
        {
          id: MenuId.ViewTitle,
          when: ContextKeyExpr.equals(
            "view",
            WORKSPACE_RECOMMENDATIONS_VIEW_ID
          ),
          group: "navigation",
          order: 2
        }
      ],
      run: () => runAction(
        this.instantiationService.createInstance(
          ConfigureWorkspaceFolderRecommendedExtensionsAction,
          ConfigureWorkspaceFolderRecommendedExtensionsAction.ID,
          ConfigureWorkspaceFolderRecommendedExtensionsAction.LABEL
        )
      )
    });
    this.registerExtensionAction({
      id: InstallSpecificVersionOfExtensionAction.ID,
      title: {
        value: InstallSpecificVersionOfExtensionAction.LABEL,
        original: "Install Specific Version of Extension..."
      },
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          CONTEXT_HAS_GALLERY,
          ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER,
            CONTEXT_HAS_WEB_SERVER
          )
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          InstallSpecificVersionOfExtensionAction,
          InstallSpecificVersionOfExtensionAction.ID,
          InstallSpecificVersionOfExtensionAction.LABEL
        )
      )
    });
    this.registerExtensionAction({
      id: ReinstallAction.ID,
      title: {
        value: ReinstallAction.LABEL,
        original: "Reinstall Extension..."
      },
      category: Categories.Developer,
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          CONTEXT_HAS_GALLERY,
          ContextKeyExpr.or(
            CONTEXT_HAS_LOCAL_SERVER,
            CONTEXT_HAS_REMOTE_SERVER
          )
        )
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          ReinstallAction,
          ReinstallAction.ID,
          ReinstallAction.LABEL
        )
      )
    });
  }
  // Extension Context Menu
  registerContextMenuActions() {
    this.registerExtensionAction({
      id: SetColorThemeAction.ID,
      title: SetColorThemeAction.TITLE,
      menu: {
        id: MenuId.ExtensionContext,
        group: THEME_ACTIONS_GROUP,
        order: 0,
        when: ContextKeyExpr.and(
          ContextKeyExpr.not("inExtensionEditor"),
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.has("extensionHasColorThemes")
        )
      },
      run: async (accessor, extensionId) => {
        const extensionWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extension = extensionWorkbenchService.local.find(
          (e) => areSameExtensions(e.identifier, { id: extensionId })
        );
        if (extension) {
          const action = instantiationService.createInstance(
            SetColorThemeAction
          );
          action.extension = extension;
          return action.run();
        }
      }
    });
    this.registerExtensionAction({
      id: SetFileIconThemeAction.ID,
      title: SetFileIconThemeAction.TITLE,
      menu: {
        id: MenuId.ExtensionContext,
        group: THEME_ACTIONS_GROUP,
        order: 0,
        when: ContextKeyExpr.and(
          ContextKeyExpr.not("inExtensionEditor"),
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.has("extensionHasFileIconThemes")
        )
      },
      run: async (accessor, extensionId) => {
        const extensionWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extension = extensionWorkbenchService.local.find(
          (e) => areSameExtensions(e.identifier, { id: extensionId })
        );
        if (extension) {
          const action = instantiationService.createInstance(
            SetFileIconThemeAction
          );
          action.extension = extension;
          return action.run();
        }
      }
    });
    this.registerExtensionAction({
      id: SetProductIconThemeAction.ID,
      title: SetProductIconThemeAction.TITLE,
      menu: {
        id: MenuId.ExtensionContext,
        group: THEME_ACTIONS_GROUP,
        order: 0,
        when: ContextKeyExpr.and(
          ContextKeyExpr.not("inExtensionEditor"),
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.has("extensionHasProductIconThemes")
        )
      },
      run: async (accessor, extensionId) => {
        const extensionWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extension = extensionWorkbenchService.local.find(
          (e) => areSameExtensions(e.identifier, { id: extensionId })
        );
        if (extension) {
          const action = instantiationService.createInstance(
            SetProductIconThemeAction
          );
          action.extension = extension;
          return action.run();
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showPreReleaseVersion",
      title: localize2(
        "show pre-release version",
        "Show Pre-Release Version"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: INSTALL_ACTIONS_GROUP,
        order: 0,
        when: ContextKeyExpr.and(
          ContextKeyExpr.has("inExtensionEditor"),
          ContextKeyExpr.has("galleryExtensionHasPreReleaseVersion"),
          ContextKeyExpr.not("showPreReleaseVersion"),
          ContextKeyExpr.not("isBuiltinExtension")
        )
      },
      run: async (accessor, extensionId) => {
        const extensionWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const extension = (await extensionWorkbenchService.getExtensions(
          [{ id: extensionId }],
          CancellationToken.None
        ))[0];
        extensionWorkbenchService.open(extension, {
          showPreReleaseVersion: true
        });
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.showReleasedVersion",
      title: localize2("show released version", "Show Release Version"),
      menu: {
        id: MenuId.ExtensionContext,
        group: INSTALL_ACTIONS_GROUP,
        order: 1,
        when: ContextKeyExpr.and(
          ContextKeyExpr.has("inExtensionEditor"),
          ContextKeyExpr.has("galleryExtensionHasPreReleaseVersion"),
          ContextKeyExpr.has("extensionHasReleaseVersion"),
          ContextKeyExpr.has("showPreReleaseVersion"),
          ContextKeyExpr.not("isBuiltinExtension")
        )
      },
      run: async (accessor, extensionId) => {
        const extensionWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const extension = (await extensionWorkbenchService.getExtensions(
          [{ id: extensionId }],
          CancellationToken.None
        ))[0];
        extensionWorkbenchService.open(extension, {
          showPreReleaseVersion: false
        });
      }
    });
    this.registerExtensionAction({
      id: ToggleAutoUpdateForExtensionAction.ID,
      title: ToggleAutoUpdateForExtensionAction.LABEL,
      category: ExtensionsLocalizedLabel,
      precondition: ContextKeyExpr.and(
        ContextKeyExpr.or(
          ContextKeyExpr.notEquals(
            `config.${AutoUpdateConfigurationKey}`,
            "onlyEnabledExtensions"
          ),
          ContextKeyExpr.equals("isExtensionEnabled", true)
        ),
        ContextKeyExpr.not("extensionDisallowInstall")
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: UPDATE_ACTIONS_GROUP,
        order: 1,
        when: ContextKeyExpr.and(
          ContextKeyExpr.not("inExtensionEditor"),
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.not("isBuiltinExtension")
        )
      },
      run: async (accessor, id) => {
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extensionWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const extension = extensionWorkbenchService.local.find(
          (e) => areSameExtensions(e.identifier, { id })
        );
        if (extension) {
          const action = instantiationService.createInstance(
            ToggleAutoUpdateForExtensionAction
          );
          action.extension = extension;
          return action.run();
        }
      }
    });
    this.registerExtensionAction({
      id: ToggleAutoUpdatesForPublisherAction.ID,
      title: {
        value: ToggleAutoUpdatesForPublisherAction.LABEL,
        original: "Auto Update (Publisher)"
      },
      category: ExtensionsLocalizedLabel,
      precondition: ContextKeyExpr.equals(
        `config.${AutoUpdateConfigurationKey}`,
        false
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: UPDATE_ACTIONS_GROUP,
        order: 2,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.not("isBuiltinExtension")
        )
      },
      run: async (accessor, id) => {
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extensionWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const extension = extensionWorkbenchService.local.find(
          (e) => areSameExtensions(e.identifier, { id })
        );
        if (extension) {
          const action = instantiationService.createInstance(
            ToggleAutoUpdatesForPublisherAction
          );
          action.extension = extension;
          return action.run();
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.switchToPreRlease",
      title: localize(
        "enablePreRleaseLabel",
        "Switch to Pre-Release Version"
      ),
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.ExtensionContext,
        group: INSTALL_ACTIONS_GROUP,
        order: 2,
        when: ContextKeyExpr.and(
          CONTEXT_HAS_GALLERY,
          ContextKeyExpr.has("galleryExtensionHasPreReleaseVersion"),
          ContextKeyExpr.not("installedExtensionIsOptedToPreRelease"),
          ContextKeyExpr.not("inExtensionEditor"),
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.not("isBuiltinExtension")
        )
      },
      run: async (accessor, id) => {
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extensionWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const extension = extensionWorkbenchService.local.find(
          (e) => areSameExtensions(e.identifier, { id })
        );
        if (extension) {
          const action = instantiationService.createInstance(
            TogglePreReleaseExtensionAction
          );
          action.extension = extension;
          return action.run();
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.switchToRelease",
      title: localize(
        "disablePreRleaseLabel",
        "Switch to Release Version"
      ),
      category: ExtensionsLocalizedLabel,
      menu: {
        id: MenuId.ExtensionContext,
        group: INSTALL_ACTIONS_GROUP,
        order: 2,
        when: ContextKeyExpr.and(
          CONTEXT_HAS_GALLERY,
          ContextKeyExpr.has("galleryExtensionHasPreReleaseVersion"),
          ContextKeyExpr.has("installedExtensionIsOptedToPreRelease"),
          ContextKeyExpr.not("inExtensionEditor"),
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.not("isBuiltinExtension")
        )
      },
      run: async (accessor, id) => {
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extensionWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const extension = extensionWorkbenchService.local.find(
          (e) => areSameExtensions(e.identifier, { id })
        );
        if (extension) {
          const action = instantiationService.createInstance(
            TogglePreReleaseExtensionAction
          );
          action.extension = extension;
          return action.run();
        }
      }
    });
    this.registerExtensionAction({
      id: ClearLanguageAction.ID,
      title: ClearLanguageAction.TITLE,
      menu: {
        id: MenuId.ExtensionContext,
        group: INSTALL_ACTIONS_GROUP,
        order: 0,
        when: ContextKeyExpr.and(
          ContextKeyExpr.not("inExtensionEditor"),
          ContextKeyExpr.has("canSetLanguage"),
          ContextKeyExpr.has("isActiveLanguagePackExtension")
        )
      },
      run: async (accessor, extensionId) => {
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extensionsWorkbenchService = accessor.get(
          IExtensionsWorkbenchService
        );
        const extension = (await extensionsWorkbenchService.getExtensions(
          [{ id: extensionId }],
          CancellationToken.None
        ))[0];
        const action = instantiationService.createInstance(ClearLanguageAction);
        action.extension = extension;
        return action.run();
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installAndDonotSync",
      title: localize(
        "install installAndDonotSync",
        "Install (Do not Sync)"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "0_install",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("extensionStatus", "uninstalled"),
          ContextKeyExpr.has("isGalleryExtension"),
          ContextKeyExpr.not("extensionDisallowInstall"),
          CONTEXT_SYNC_ENABLEMENT
        ),
        order: 1
      },
      run: async (accessor, extensionId) => {
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extension = this.extensionsWorkbenchService.local.filter(
          (e) => areSameExtensions(e.identifier, { id: extensionId })
        )[0] || (await this.extensionsWorkbenchService.getExtensions(
          [{ id: extensionId }],
          CancellationToken.None
        ))[0];
        if (extension) {
          const action = instantiationService.createInstance(
            InstallAction,
            {
              isMachineScoped: true
            }
          );
          action.extension = extension;
          return action.run();
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.installPrereleaseAndDonotSync",
      title: localize(
        "installPrereleaseAndDonotSync",
        "Install Pre-Release (Do not Sync)"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "0_install",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("extensionStatus", "uninstalled"),
          ContextKeyExpr.has("isGalleryExtension"),
          ContextKeyExpr.has("extensionHasPreReleaseVersion"),
          ContextKeyExpr.not("extensionDisallowInstall"),
          CONTEXT_SYNC_ENABLEMENT
        ),
        order: 2
      },
      run: async (accessor, extensionId) => {
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extension = this.extensionsWorkbenchService.local.filter(
          (e) => areSameExtensions(e.identifier, { id: extensionId })
        )[0] || (await this.extensionsWorkbenchService.getExtensions(
          [{ id: extensionId }],
          CancellationToken.None
        ))[0];
        if (extension) {
          const action = instantiationService.createInstance(
            InstallAction,
            {
              isMachineScoped: true,
              preRelease: true
            }
          );
          action.extension = extension;
          return action.run();
        }
      }
    });
    this.registerExtensionAction({
      id: InstallAnotherVersionAction.ID,
      title: InstallAnotherVersionAction.LABEL,
      menu: {
        id: MenuId.ExtensionContext,
        group: "0_install",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("extensionStatus", "uninstalled"),
          ContextKeyExpr.has("isGalleryExtension"),
          ContextKeyExpr.not("extensionDisallowInstall")
        ),
        order: 3
      },
      run: async (accessor, extensionId) => {
        const instantiationService = accessor.get(
          IInstantiationService
        );
        const extension = this.extensionsWorkbenchService.local.filter(
          (e) => areSameExtensions(e.identifier, { id: extensionId })
        )[0] || (await this.extensionsWorkbenchService.getExtensions(
          [{ id: extensionId }],
          CancellationToken.None
        ))[0];
        if (extension) {
          return instantiationService.createInstance(
            InstallAnotherVersionAction,
            extension,
            false
          ).run();
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.copyExtension",
      title: localize2(
        "workbench.extensions.action.copyExtension",
        "Copy"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "1_copy"
      },
      run: async (accessor, extensionId) => {
        const clipboardService = accessor.get(IClipboardService);
        const extension = this.extensionsWorkbenchService.local.filter(
          (e) => areSameExtensions(e.identifier, { id: extensionId })
        )[0] || (await this.extensionsWorkbenchService.getExtensions(
          [{ id: extensionId }],
          CancellationToken.None
        ))[0];
        if (extension) {
          const name = localize(
            "extensionInfoName",
            "Name: {0}",
            extension.displayName
          );
          const id = localize(
            "extensionInfoId",
            "Id: {0}",
            extensionId
          );
          const description = localize(
            "extensionInfoDescription",
            "Description: {0}",
            extension.description
          );
          const verision = localize(
            "extensionInfoVersion",
            "Version: {0}",
            extension.version
          );
          const publisher = localize(
            "extensionInfoPublisher",
            "Publisher: {0}",
            extension.publisherDisplayName
          );
          const link = extension.url ? localize(
            "extensionInfoVSMarketplaceLink",
            "VS Marketplace Link: {0}",
            `${extension.url}`
          ) : null;
          const clipboardStr = `${name}
${id}
${description}
${verision}
${publisher}${link ? "\n" + link : ""}`;
          await clipboardService.writeText(clipboardStr);
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.copyExtensionId",
      title: localize2(
        "workbench.extensions.action.copyExtensionId",
        "Copy Extension ID"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "1_copy"
      },
      run: async (accessor, id) => accessor.get(IClipboardService).writeText(id)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.configure",
      title: localize2(
        "workbench.extensions.action.configure",
        "Extension Settings"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "2_configure",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.has("extensionHasConfiguration")
        ),
        order: 1
      },
      run: async (accessor, id) => accessor.get(IPreferencesService).openSettings({ jsonEditor: false, query: `@ext:${id}` })
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.configureKeybindings",
      title: localize2(
        "workbench.extensions.action.configureKeybindings",
        "Extension Keyboard Shortcuts"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "2_configure",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.has("extensionHasKeybindings")
        ),
        order: 2
      },
      run: async (accessor, id) => accessor.get(IPreferencesService).openGlobalKeybindingSettings(false, {
        query: `@ext:${id}`
      })
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.toggleApplyToAllProfiles",
      title: localize2(
        "workbench.extensions.action.toggleApplyToAllProfiles",
        "Apply Extension to all Profiles"
      ),
      toggled: ContextKeyExpr.has("isApplicationScopedExtension"),
      menu: {
        id: MenuId.ExtensionContext,
        group: "2_configure",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("extensionStatus", "installed"),
          ContextKeyExpr.has(
            "isDefaultApplicationScopedExtension"
          ).negate(),
          ContextKeyExpr.has("isBuiltinExtension").negate(),
          ContextKeyExpr.equals("isWorkspaceScopedExtension", false)
        ),
        order: 3
      },
      run: async (accessor, _, extensionArg) => {
        const uriIdentityService = accessor.get(IUriIdentityService);
        const extension = extensionArg.location ? this.extensionsWorkbenchService.installed.find(
          (e) => uriIdentityService.extUri.isEqual(
            e.local?.location,
            extensionArg.location
          )
        ) : void 0;
        if (extension) {
          return this.extensionsWorkbenchService.toggleApplyExtensionToAllProfiles(
            extension
          );
        }
      }
    });
    this.registerExtensionAction({
      id: TOGGLE_IGNORE_EXTENSION_ACTION_ID,
      title: localize2(
        "workbench.extensions.action.toggleIgnoreExtension",
        "Sync This Extension"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "2_configure",
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("extensionStatus", "installed"),
          CONTEXT_SYNC_ENABLEMENT,
          ContextKeyExpr.equals("isWorkspaceScopedExtension", false)
        ),
        order: 4
      },
      run: async (accessor, id) => {
        const extension = this.extensionsWorkbenchService.local.find(
          (e) => areSameExtensions({ id }, e.identifier)
        );
        if (extension) {
          return this.extensionsWorkbenchService.toggleExtensionIgnoredToSync(
            extension
          );
        }
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.ignoreRecommendation",
      title: localize2(
        "workbench.extensions.action.ignoreRecommendation",
        "Ignore Recommendation"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "3_recommendations",
        when: ContextKeyExpr.has("isExtensionRecommended"),
        order: 1
      },
      run: async (accessor, id) => accessor.get(IExtensionIgnoredRecommendationsService).toggleGlobalIgnoredRecommendation(id, true)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.undoIgnoredRecommendation",
      title: localize2(
        "workbench.extensions.action.undoIgnoredRecommendation",
        "Undo Ignored Recommendation"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "3_recommendations",
        when: ContextKeyExpr.has("isUserIgnoredRecommendation"),
        order: 1
      },
      run: async (accessor, id) => accessor.get(IExtensionIgnoredRecommendationsService).toggleGlobalIgnoredRecommendation(id, false)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.addExtensionToWorkspaceRecommendations",
      title: localize2(
        "workbench.extensions.action.addExtensionToWorkspaceRecommendations",
        "Add to Workspace Recommendations"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "3_recommendations",
        when: ContextKeyExpr.and(
          WorkbenchStateContext.notEqualsTo("empty"),
          ContextKeyExpr.has("isBuiltinExtension").negate(),
          ContextKeyExpr.has(
            "isExtensionWorkspaceRecommended"
          ).negate(),
          ContextKeyExpr.has("isUserIgnoredRecommendation").negate(),
          ContextKeyExpr.notEquals("extensionSource", "resource")
        ),
        order: 2
      },
      run: (accessor, id) => accessor.get(IWorkspaceExtensionsConfigService).toggleRecommendation(id)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.removeExtensionFromWorkspaceRecommendations",
      title: localize2(
        "workbench.extensions.action.removeExtensionFromWorkspaceRecommendations",
        "Remove from Workspace Recommendations"
      ),
      menu: {
        id: MenuId.ExtensionContext,
        group: "3_recommendations",
        when: ContextKeyExpr.and(
          WorkbenchStateContext.notEqualsTo("empty"),
          ContextKeyExpr.has("isBuiltinExtension").negate(),
          ContextKeyExpr.has("isExtensionWorkspaceRecommended")
        ),
        order: 2
      },
      run: (accessor, id) => accessor.get(IWorkspaceExtensionsConfigService).toggleRecommendation(id)
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.addToWorkspaceRecommendations",
      title: localize2(
        "workbench.extensions.action.addToWorkspaceRecommendations",
        "Add Extension to Workspace Recommendations"
      ),
      category: localize("extensions", "Extensions"),
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          WorkbenchStateContext.isEqualTo("workspace"),
          ContextKeyExpr.equals("resourceScheme", Schemas.extension)
        )
      },
      async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const workspaceExtensionsConfigService = accessor.get(
          IWorkspaceExtensionsConfigService
        );
        if (!(editorService.activeEditor instanceof ExtensionsInput)) {
          return;
        }
        const extensionId = editorService.activeEditor.extension.identifier.id.toLowerCase();
        const recommendations = await workspaceExtensionsConfigService.getRecommendations();
        if (recommendations.includes(extensionId)) {
          return;
        }
        await workspaceExtensionsConfigService.toggleRecommendation(
          extensionId
        );
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.addToWorkspaceFolderRecommendations",
      title: localize2(
        "workbench.extensions.action.addToWorkspaceFolderRecommendations",
        "Add Extension to Workspace Folder Recommendations"
      ),
      category: localize("extensions", "Extensions"),
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          WorkbenchStateContext.isEqualTo("folder"),
          ContextKeyExpr.equals("resourceScheme", Schemas.extension)
        )
      },
      run: () => this.commandService.executeCommand(
        "workbench.extensions.action.addToWorkspaceRecommendations"
      )
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.addToWorkspaceIgnoredRecommendations",
      title: localize2(
        "workbench.extensions.action.addToWorkspaceIgnoredRecommendations",
        "Add Extension to Workspace Ignored Recommendations"
      ),
      category: localize("extensions", "Extensions"),
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          WorkbenchStateContext.isEqualTo("workspace"),
          ContextKeyExpr.equals("resourceScheme", Schemas.extension)
        )
      },
      async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const workspaceExtensionsConfigService = accessor.get(
          IWorkspaceExtensionsConfigService
        );
        if (!(editorService.activeEditor instanceof ExtensionsInput)) {
          return;
        }
        const extensionId = editorService.activeEditor.extension.identifier.id.toLowerCase();
        const unwantedRecommendations = await workspaceExtensionsConfigService.getUnwantedRecommendations();
        if (unwantedRecommendations.includes(extensionId)) {
          return;
        }
        await workspaceExtensionsConfigService.toggleUnwantedRecommendation(
          extensionId
        );
      }
    });
    this.registerExtensionAction({
      id: "workbench.extensions.action.addToWorkspaceFolderIgnoredRecommendations",
      title: localize2(
        "workbench.extensions.action.addToWorkspaceFolderIgnoredRecommendations",
        "Add Extension to Workspace Folder Ignored Recommendations"
      ),
      category: localize("extensions", "Extensions"),
      menu: {
        id: MenuId.CommandPalette,
        when: ContextKeyExpr.and(
          WorkbenchStateContext.isEqualTo("folder"),
          ContextKeyExpr.equals("resourceScheme", Schemas.extension)
        )
      },
      run: () => this.commandService.executeCommand(
        "workbench.extensions.action.addToWorkspaceIgnoredRecommendations"
      )
    });
    this.registerExtensionAction({
      id: ConfigureWorkspaceRecommendedExtensionsAction.ID,
      title: {
        value: ConfigureWorkspaceRecommendedExtensionsAction.LABEL,
        original: "Configure Recommended Extensions (Workspace)"
      },
      category: localize("extensions", "Extensions"),
      menu: {
        id: MenuId.CommandPalette,
        when: WorkbenchStateContext.isEqualTo("workspace")
      },
      run: () => runAction(
        this.instantiationService.createInstance(
          ConfigureWorkspaceRecommendedExtensionsAction,
          ConfigureWorkspaceRecommendedExtensionsAction.ID,
          ConfigureWorkspaceRecommendedExtensionsAction.LABEL
        )
      )
    });
  }
  registerExtensionAction(extensionActionOptions) {
    const menus = extensionActionOptions.menu ? Array.isArray(extensionActionOptions.menu) ? extensionActionOptions.menu : [extensionActionOptions.menu] : [];
    let menusWithOutTitles = [];
    const menusWithTitles = [];
    if (extensionActionOptions.menuTitles) {
      for (let index = 0; index < menus.length; index++) {
        const menu = menus[index];
        const menuTitle = extensionActionOptions.menuTitles[menu.id.id];
        if (menuTitle) {
          menusWithTitles.push({
            id: menu.id,
            item: {
              ...menu,
              command: {
                id: extensionActionOptions.id,
                title: menuTitle
              }
            }
          });
        } else {
          menusWithOutTitles.push(menu);
        }
      }
    } else {
      menusWithOutTitles = menus;
    }
    const disposables = new DisposableStore();
    disposables.add(
      registerAction2(
        class extends Action2 {
          constructor() {
            super({
              ...extensionActionOptions,
              menu: menusWithOutTitles
            });
          }
          run(accessor, ...args) {
            return extensionActionOptions.run(accessor, ...args);
          }
        }
      )
    );
    if (menusWithTitles.length) {
      disposables.add(MenuRegistry.appendMenuItems(menusWithTitles));
    }
    return disposables;
  }
};
ExtensionsContributions = __decorateClass([
  __decorateParam(0, IExtensionManagementServerService),
  __decorateParam(1, IExtensionGalleryService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IPaneCompositePartService),
  __decorateParam(4, IExtensionsWorkbenchService),
  __decorateParam(5, IWorkbenchExtensionEnablementService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IDialogService),
  __decorateParam(8, ICommandService)
], ExtensionsContributions);
let ExtensionStorageCleaner = class {
  constructor(extensionManagementService, storageService) {
    ExtensionStorageService.removeOutdatedExtensionVersions(
      extensionManagementService,
      storageService
    );
  }
};
ExtensionStorageCleaner = __decorateClass([
  __decorateParam(0, IExtensionManagementService),
  __decorateParam(1, IStorageService)
], ExtensionStorageCleaner);
const workbenchRegistry = Registry.as(
  WorkbenchExtensions.Workbench
);
workbenchRegistry.registerWorkbenchContribution(
  ExtensionsContributions,
  LifecyclePhase.Restored
);
workbenchRegistry.registerWorkbenchContribution(
  StatusUpdater,
  LifecyclePhase.Eventually
);
workbenchRegistry.registerWorkbenchContribution(
  MaliciousExtensionChecker,
  LifecyclePhase.Eventually
);
workbenchRegistry.registerWorkbenchContribution(
  KeymapExtensions,
  LifecyclePhase.Restored
);
workbenchRegistry.registerWorkbenchContribution(
  ExtensionsViewletViewsContribution,
  LifecyclePhase.Restored
);
workbenchRegistry.registerWorkbenchContribution(
  ExtensionActivationProgress,
  LifecyclePhase.Eventually
);
workbenchRegistry.registerWorkbenchContribution(
  ExtensionDependencyChecker,
  LifecyclePhase.Eventually
);
workbenchRegistry.registerWorkbenchContribution(
  ExtensionEnablementWorkspaceTrustTransitionParticipant,
  LifecyclePhase.Restored
);
workbenchRegistry.registerWorkbenchContribution(
  ExtensionsCompletionItemsProvider,
  LifecyclePhase.Restored
);
workbenchRegistry.registerWorkbenchContribution(
  UnsupportedExtensionsMigrationContrib,
  LifecyclePhase.Eventually
);
workbenchRegistry.registerWorkbenchContribution(
  DeprecatedExtensionsChecker,
  LifecyclePhase.Eventually
);
if (isWeb) {
  workbenchRegistry.registerWorkbenchContribution(
    ExtensionStorageCleaner,
    LifecyclePhase.Eventually
  );
}
registerAction2(ShowRuntimeExtensionsAction);
Registry.as(
  ConfigurationMigrationExtensions.ConfigurationMigration
).registerConfigurationMigrations([
  {
    key: AutoUpdateConfigurationKey,
    migrateFn: (value, accessor) => {
      if (value === "onlySelectedExtensions") {
        return { value: false };
      }
      return [];
    }
  }
]);
export {
  CONTEXT_HAS_LOCAL_SERVER,
  CONTEXT_HAS_REMOTE_SERVER,
  CONTEXT_HAS_WEB_SERVER
};
