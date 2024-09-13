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
import { RunOnceScheduler } from "../../../../base/common/async.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import {
  Extensions as ConfigurationExtensions,
  ConfigurationScope
} from "../../../../platform/configuration/common/configurationRegistry.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope
} from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { applicationConfigurationNodeBase } from "../../../common/configuration.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { WelcomeWidget } from "./welcomeWidget.js";
const configurationKey = "workbench.welcome.experimental.dialog";
let WelcomeDialogContribution = class extends Disposable {
  static {
    __name(this, "WelcomeDialogContribution");
  }
  isRendered = false;
  constructor(storageService, environmentService, configurationService, contextService, codeEditorService, instantiationService, commandService, telemetryService, openerService, editorService) {
    super();
    if (!storageService.isNew(StorageScope.APPLICATION)) {
      return;
    }
    const setting = configurationService.inspect(configurationKey);
    if (!setting.value) {
      return;
    }
    const welcomeDialog = environmentService.options?.welcomeDialog;
    if (!welcomeDialog) {
      return;
    }
    this._register(
      editorService.onDidActiveEditorChange(() => {
        if (!this.isRendered) {
          const codeEditor = codeEditorService.getActiveCodeEditor();
          if (codeEditor?.hasModel()) {
            const scheduler = new RunOnceScheduler(() => {
              const notificationsVisible = contextService.contextMatchesRules(
                ContextKeyExpr.deserialize(
                  "notificationCenterVisible"
                )
              ) || contextService.contextMatchesRules(
                ContextKeyExpr.deserialize(
                  "notificationToastsVisible"
                )
              );
              if (codeEditor === codeEditorService.getActiveCodeEditor() && !notificationsVisible) {
                this.isRendered = true;
                const welcomeWidget = new WelcomeWidget(
                  codeEditor,
                  instantiationService,
                  commandService,
                  telemetryService,
                  openerService
                );
                welcomeWidget.render(
                  welcomeDialog.title,
                  welcomeDialog.message,
                  welcomeDialog.buttonText,
                  welcomeDialog.buttonCommand
                );
              }
            }, 3e3);
            this._register(
              codeEditor.onDidChangeModelContent((e) => {
                if (!this.isRendered) {
                  scheduler.schedule();
                }
              })
            );
          }
        }
      })
    );
  }
};
WelcomeDialogContribution = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IBrowserWorkbenchEnvironmentService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ICodeEditorService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IEditorService)
], WelcomeDialogContribution);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(
  WelcomeDialogContribution,
  LifecyclePhase.Eventually
);
const configurationRegistry = Registry.as(
  ConfigurationExtensions.Configuration
);
configurationRegistry.registerConfiguration({
  ...applicationConfigurationNodeBase,
  properties: {
    "workbench.welcome.experimental.dialog": {
      scope: ConfigurationScope.APPLICATION,
      type: "boolean",
      default: false,
      tags: ["experimental"],
      description: localize(
        "workbench.welcome.dialog",
        "When enabled, a welcome widget is shown in the editor"
      )
    }
  }
});
//# sourceMappingURL=welcomeDialog.contribution.js.map
