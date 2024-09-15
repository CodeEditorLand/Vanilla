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
import { Registry } from "../../../../platform/registry/common/platform.js";
import { IWorkbenchContribution, registerWorkbenchContribution2, WorkbenchPhase } from "../../../common/contributions.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { AuthenticationSession, IAuthenticationService } from "../../../services/authentication/common/authentication.js";
import { Action2, MenuId, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { IActivityService, NumberBadge } from "../../../services/activity/common/activity.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { IStorageService, StorageScope, StorageTarget } from "../../../../platform/storage/common/storage.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IConfigurationRegistry, Extensions as ConfigurationExtensions, ConfigurationScope } from "../../../../platform/configuration/common/configurationRegistry.js";
import { applicationConfigurationNodeBase } from "../../../common/configuration.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IRequestService, asText } from "../../../../platform/request/common/request.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { isWeb } from "../../../../base/common/platform.js";
const accountsBadgeConfigKey = "workbench.accounts.experimental.showEntitlements";
let EntitlementsContribution = class extends Disposable {
  constructor(contextService, telemetryService, authenticationService, productService, storageService, extensionManagementService, activityService, extensionService, configurationService, requestService) {
    super();
    this.contextService = contextService;
    this.telemetryService = telemetryService;
    this.authenticationService = authenticationService;
    this.productService = productService;
    this.storageService = storageService;
    this.extensionManagementService = extensionManagementService;
    this.activityService = activityService;
    this.extensionService = extensionService;
    this.configurationService = configurationService;
    this.requestService = requestService;
    if (!this.productService.gitHubEntitlement || isWeb) {
      return;
    }
    this.extensionManagementService.getInstalled().then(async (exts) => {
      const installed = exts.find((value) => ExtensionIdentifier.equals(value.identifier.id, this.productService.gitHubEntitlement.extensionId));
      if (installed) {
        this.disableEntitlements();
      } else {
        this.registerListeners();
      }
    });
  }
  static {
    __name(this, "EntitlementsContribution");
  }
  isInitialized = false;
  showAccountsBadgeContextKey = new RawContextKey(accountsBadgeConfigKey, false).bindTo(this.contextService);
  accountsMenuBadgeDisposable = this._register(new MutableDisposable());
  registerListeners() {
    if (this.storageService.getBoolean(accountsBadgeConfigKey, StorageScope.APPLICATION) === false) {
      return;
    }
    this._register(this.extensionService.onDidChangeExtensions(async (result) => {
      for (const ext of result.added) {
        if (ExtensionIdentifier.equals(this.productService.gitHubEntitlement.extensionId, ext.identifier)) {
          this.disableEntitlements();
          return;
        }
      }
    }));
    this._register(this.authenticationService.onDidChangeSessions(async (e) => {
      if (e.providerId === this.productService.gitHubEntitlement.providerId && e.event.added?.length) {
        await this.enableEntitlements(e.event.added[0]);
      } else if (e.providerId === this.productService.gitHubEntitlement.providerId && e.event.removed?.length) {
        this.showAccountsBadgeContextKey.set(false);
        this.accountsMenuBadgeDisposable.clear();
      }
    }));
    this._register(this.authenticationService.onDidRegisterAuthenticationProvider(async (e) => {
      if (e.id === this.productService.gitHubEntitlement.providerId) {
        await this.enableEntitlements((await this.authenticationService.getSessions(e.id))[0]);
      }
    }));
  }
  async getEntitlementsInfo(session) {
    if (this.isInitialized) {
      return [false, ""];
    }
    const context = await this.requestService.request({
      type: "GET",
      url: this.productService.gitHubEntitlement.entitlementUrl,
      headers: {
        "Authorization": `Bearer ${session.accessToken}`
      }
    }, CancellationToken.None);
    if (context.res.statusCode && context.res.statusCode !== 200) {
      return [false, ""];
    }
    const result = await asText(context);
    if (!result) {
      return [false, ""];
    }
    let parsedResult;
    try {
      parsedResult = JSON.parse(result);
    } catch (err) {
      return [false, ""];
    }
    if (!(this.productService.gitHubEntitlement.enablementKey in parsedResult) || !parsedResult[this.productService.gitHubEntitlement.enablementKey]) {
      this.telemetryService.publicLog2("entitlements.enabled", { enabled: false });
      return [false, ""];
    }
    this.telemetryService.publicLog2("entitlements.enabled", { enabled: true });
    this.isInitialized = true;
    const orgs = parsedResult["organization_list"];
    return [true, orgs && orgs.length > 0 ? orgs[0].name ? orgs[0].name : orgs[0].login : void 0];
  }
  async enableEntitlements(session) {
    if (!session) {
      return;
    }
    const showAccountsBadge = this.configurationService.inspect(accountsBadgeConfigKey).value ?? false;
    const [enabled, org] = await this.getEntitlementsInfo(session);
    if (enabled && showAccountsBadge) {
      this.createAccountsBadge(org);
      this.showAccountsBadgeContextKey.set(showAccountsBadge);
      this.telemetryService.publicLog2(accountsBadgeConfigKey, { enabled: true });
    }
  }
  disableEntitlements() {
    this.storageService.store(accountsBadgeConfigKey, false, StorageScope.APPLICATION, StorageTarget.MACHINE);
    this.showAccountsBadgeContextKey.set(false);
    this.accountsMenuBadgeDisposable.clear();
  }
  async createAccountsBadge(org) {
    const menuTitle = org ? this.productService.gitHubEntitlement.command.title.replace("{{org}}", org) : this.productService.gitHubEntitlement.command.titleWithoutPlaceHolder;
    const badge = new NumberBadge(1, () => menuTitle);
    this.accountsMenuBadgeDisposable.value = this.activityService.showAccountsActivity({ badge });
    this.contextService.onDidChangeContext((e) => {
      if (e.affectsSome(/* @__PURE__ */ new Set([accountsBadgeConfigKey]))) {
        if (!this.contextService.getContextKeyValue(accountsBadgeConfigKey)) {
          this.accountsMenuBadgeDisposable.clear();
        }
      }
    });
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.entitlementAction",
          title: menuTitle,
          f1: false,
          menu: {
            id: MenuId.AccountsContext,
            group: "5_AccountsEntitlements",
            when: ContextKeyExpr.equals(accountsBadgeConfigKey, true)
          }
        });
      }
      async run(accessor) {
        const productService = accessor.get(IProductService);
        const commandService = accessor.get(ICommandService);
        const contextKeyService = accessor.get(IContextKeyService);
        const storageService = accessor.get(IStorageService);
        const dialogService = accessor.get(IDialogService);
        const telemetryService = accessor.get(ITelemetryService);
        const confirmation = await dialogService.confirm({
          type: "question",
          message: productService.gitHubEntitlement.confirmationMessage,
          primaryButton: productService.gitHubEntitlement.confirmationAction
        });
        if (confirmation.confirmed) {
          commandService.executeCommand(productService.gitHubEntitlement.command.action, productService.gitHubEntitlement.extensionId);
          telemetryService.publicLog2("accountsEntitlements.action", {
            command: productService.gitHubEntitlement.command.action
          });
        } else {
          telemetryService.publicLog2("accountsEntitlements.action", {
            command: productService.gitHubEntitlement.command.action + "-dismissed"
          });
        }
        const contextKey = new RawContextKey(accountsBadgeConfigKey, false).bindTo(contextKeyService);
        contextKey.set(false);
        storageService.store(accountsBadgeConfigKey, false, StorageScope.APPLICATION, StorageTarget.MACHINE);
      }
    }));
  }
};
EntitlementsContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IAuthenticationService),
  __decorateParam(3, IProductService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IExtensionManagementService),
  __decorateParam(6, IActivityService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IConfigurationService),
  __decorateParam(9, IRequestService)
], EntitlementsContribution);
const configurationRegistry = Registry.as(ConfigurationExtensions.Configuration);
configurationRegistry.registerConfiguration({
  ...applicationConfigurationNodeBase,
  properties: {
    "workbench.accounts.experimental.showEntitlements": {
      scope: ConfigurationScope.MACHINE,
      type: "boolean",
      default: false,
      tags: ["experimental"],
      description: localize("workbench.accounts.showEntitlements", "When enabled, available entitlements for the account will be show in the accounts menu.")
    }
  }
});
registerWorkbenchContribution2("workbench.contrib.entitlements", EntitlementsContribution, WorkbenchPhase.BlockRestore);
//# sourceMappingURL=accountsEntitlements.contribution.js.map
