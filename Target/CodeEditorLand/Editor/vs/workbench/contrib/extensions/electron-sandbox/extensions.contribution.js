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
import { Codicon } from "../../../../base/common/codicons.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import {
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IExtensionRecommendationNotificationService } from "../../../../platform/extensionRecommendations/common/extensionRecommendations.js";
import { ExtensionRecommendationNotificationServiceChannel } from "../../../../platform/extensionRecommendations/common/extensionRecommendationsIpc.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { ISharedProcessService } from "../../../../platform/ipc/electron-sandbox/services.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  EditorPaneDescriptor
} from "../../../browser/editor.js";
import { ActiveEditorContext } from "../../../common/contextkeys.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import {
  EditorExtensions
} from "../../../common/editor.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { RuntimeExtensionsInput } from "../common/runtimeExtensionsInput.js";
import {
  DebugExtensionHostAction,
  DebugExtensionsContribution
} from "./debugExtensionHostAction.js";
import { ExtensionHostProfileService } from "./extensionProfileService.js";
import {
  CleanUpExtensionsFolderAction,
  OpenExtensionsFolderAction
} from "./extensionsActions.js";
import { ExtensionsAutoProfiler } from "./extensionsAutoProfiler.js";
import { RemoteExtensionsInitializerContribution } from "./remoteExtensionsInit.js";
import {
  CONTEXT_EXTENSION_HOST_PROFILE_RECORDED,
  CONTEXT_PROFILE_SESSION_STATE,
  IExtensionHostProfileService,
  RuntimeExtensionsEditor,
  SaveExtensionHostProfileAction,
  StartExtensionHostProfileAction,
  StopExtensionHostProfileAction
} from "./runtimeExtensionsEditor.js";
registerSingleton(
  IExtensionHostProfileService,
  ExtensionHostProfileService,
  InstantiationType.Delayed
);
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    RuntimeExtensionsEditor,
    RuntimeExtensionsEditor.ID,
    localize("runtimeExtension", "Running Extensions")
  ),
  [new SyncDescriptor(RuntimeExtensionsInput)]
);
class RuntimeExtensionsInputSerializer {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return RuntimeExtensionsInput.instance;
  }
}
Registry.as(
  EditorExtensions.EditorFactory
).registerEditorSerializer(
  RuntimeExtensionsInput.ID,
  RuntimeExtensionsInputSerializer
);
let ExtensionsContributions = class extends Disposable {
  constructor(extensionRecommendationNotificationService, sharedProcessService) {
    super();
    sharedProcessService.registerChannel(
      "extensionRecommendationNotification",
      new ExtensionRecommendationNotificationServiceChannel(
        extensionRecommendationNotificationService
      )
    );
    this._register(registerAction2(OpenExtensionsFolderAction));
    this._register(registerAction2(CleanUpExtensionsFolderAction));
  }
};
ExtensionsContributions = __decorateClass([
  __decorateParam(0, IExtensionRecommendationNotificationService),
  __decorateParam(1, ISharedProcessService)
], ExtensionsContributions);
const workbenchRegistry = Registry.as(
  WorkbenchExtensions.Workbench
);
workbenchRegistry.registerWorkbenchContribution(
  ExtensionsContributions,
  LifecyclePhase.Restored
);
workbenchRegistry.registerWorkbenchContribution(
  ExtensionsAutoProfiler,
  LifecyclePhase.Eventually
);
workbenchRegistry.registerWorkbenchContribution(
  RemoteExtensionsInitializerContribution,
  LifecyclePhase.Restored
);
workbenchRegistry.registerWorkbenchContribution(
  DebugExtensionsContribution,
  LifecyclePhase.Restored
);
CommandsRegistry.registerCommand(
  DebugExtensionHostAction.ID,
  (accessor, ...args) => {
    const instantiationService = accessor.get(IInstantiationService);
    return instantiationService.createInstance(DebugExtensionHostAction).run(args);
  }
);
CommandsRegistry.registerCommand(
  StartExtensionHostProfileAction.ID,
  (accessor) => {
    const instantiationService = accessor.get(IInstantiationService);
    instantiationService.createInstance(
      StartExtensionHostProfileAction,
      StartExtensionHostProfileAction.ID,
      StartExtensionHostProfileAction.LABEL
    ).run();
  }
);
CommandsRegistry.registerCommand(
  StopExtensionHostProfileAction.ID,
  (accessor) => {
    const instantiationService = accessor.get(IInstantiationService);
    instantiationService.createInstance(
      StopExtensionHostProfileAction,
      StopExtensionHostProfileAction.ID,
      StopExtensionHostProfileAction.LABEL
    ).run();
  }
);
CommandsRegistry.registerCommand(
  SaveExtensionHostProfileAction.ID,
  (accessor) => {
    const instantiationService = accessor.get(IInstantiationService);
    instantiationService.createInstance(
      SaveExtensionHostProfileAction,
      SaveExtensionHostProfileAction.ID,
      SaveExtensionHostProfileAction.LABEL
    ).run();
  }
);
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: DebugExtensionHostAction.ID,
    title: DebugExtensionHostAction.LABEL,
    icon: Codicon.debugStart
  },
  group: "navigation",
  when: ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID)
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: DebugExtensionHostAction.ID,
    title: localize("debugExtensionHost", "Debug Extensions In New Window"),
    category: localize("developer", "Developer"),
    icon: Codicon.debugStart
  }
});
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: StartExtensionHostProfileAction.ID,
    title: StartExtensionHostProfileAction.LABEL,
    icon: Codicon.circleFilled
  },
  group: "navigation",
  when: ContextKeyExpr.and(
    ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID),
    CONTEXT_PROFILE_SESSION_STATE.notEqualsTo("running")
  )
});
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: StopExtensionHostProfileAction.ID,
    title: StopExtensionHostProfileAction.LABEL,
    icon: Codicon.debugStop
  },
  group: "navigation",
  when: ContextKeyExpr.and(
    ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID),
    CONTEXT_PROFILE_SESSION_STATE.isEqualTo("running")
  )
});
MenuRegistry.appendMenuItem(MenuId.EditorTitle, {
  command: {
    id: SaveExtensionHostProfileAction.ID,
    title: SaveExtensionHostProfileAction.LABEL,
    icon: Codicon.saveAll,
    precondition: CONTEXT_EXTENSION_HOST_PROFILE_RECORDED
  },
  group: "navigation",
  when: ContextKeyExpr.and(
    ActiveEditorContext.isEqualTo(RuntimeExtensionsEditor.ID)
  )
});
