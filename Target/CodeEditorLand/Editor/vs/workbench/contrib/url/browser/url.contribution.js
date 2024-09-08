import { URI } from "../../../../base/common/uri.js";
import { localize, localize2 } from "../../../../nls.js";
import { Categories } from "../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import {
  Extensions as ConfigurationExtensions,
  ConfigurationScope
} from "../../../../platform/configuration/common/configurationRegistry.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IURLService } from "../../../../platform/url/common/url.js";
import { workbenchConfigurationNodeBase } from "../../../common/configuration.js";
import {
  registerWorkbenchContribution2,
  Extensions as WorkbenchExtensions,
  WorkbenchPhase
} from "../../../common/contributions.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import { ExternalUriResolverContribution } from "./externalUriResolver.js";
import { manageTrustedDomainSettingsCommand } from "./trustedDomains.js";
import {
  ITrustedDomainService,
  TrustedDomainService
} from "./trustedDomainService.js";
import { TrustedDomainsFileSystemProvider } from "./trustedDomainsFileSystemProvider.js";
import { OpenerValidatorContributions } from "./trustedDomainsValidator.js";
class OpenUrlAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.url.openUrl",
      title: localize2("openUrl", "Open URL"),
      category: Categories.Developer,
      f1: true
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const urlService = accessor.get(IURLService);
    return quickInputService.input({ prompt: localize("urlToOpen", "URL to open") }).then((input) => {
      if (input) {
        const uri = URI.parse(input);
        urlService.open(uri, { originalUrl: input });
      }
    });
  }
}
registerAction2(OpenUrlAction);
CommandsRegistry.registerCommand(manageTrustedDomainSettingsCommand);
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: manageTrustedDomainSettingsCommand.id,
    title: manageTrustedDomainSettingsCommand.description.description
  }
});
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(
  OpenerValidatorContributions,
  LifecyclePhase.Restored
);
registerWorkbenchContribution2(
  TrustedDomainsFileSystemProvider.ID,
  TrustedDomainsFileSystemProvider,
  WorkbenchPhase.BlockRestore
  // registration only
);
registerWorkbenchContribution2(
  ExternalUriResolverContribution.ID,
  ExternalUriResolverContribution,
  WorkbenchPhase.BlockRestore
  // registration only
);
const configurationRegistry = Registry.as(
  ConfigurationExtensions.Configuration
);
configurationRegistry.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.trustedDomains.promptInTrustedWorkspace": {
      scope: ConfigurationScope.APPLICATION,
      type: "boolean",
      default: false,
      description: localize(
        "workbench.trustedDomains.promptInTrustedWorkspace",
        "When enabled, trusted domain prompts will appear when opening links in trusted workspaces."
      )
    }
  }
});
registerSingleton(
  ITrustedDomainService,
  TrustedDomainService,
  InstantiationType.Delayed
);
