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
import {
  Disposable
} from "../../../../base/common/lifecycle.js";
import { isFalsyOrWhitespace } from "../../../../base/common/strings.js";
import { localize } from "../../../../nls.js";
import {
  MenuId,
  MenuRegistry,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import {
  IAuthenticationService
} from "../../../services/authentication/common/authentication.js";
import { IBrowserWorkbenchEnvironmentService } from "../../../services/environment/browser/environmentService.js";
import {
  Extensions
} from "../../../services/extensionManagement/common/extensionFeatures.js";
import { ExtensionsRegistry } from "../../../services/extensions/common/extensionsRegistry.js";
import { ManageTrustedExtensionsForAccountAction } from "./actions/manageTrustedExtensionsForAccountAction.js";
import { SignOutOfAccountAction } from "./actions/signOutOfAccountAction.js";
const codeExchangeProxyCommand = CommandsRegistry.registerCommand(
  "workbench.getCodeExchangeProxyEndpoints",
  (accessor, _) => {
    const environmentService = accessor.get(
      IBrowserWorkbenchEnvironmentService
    );
    return environmentService.options?.codeExchangeProxyEndpoints;
  }
);
const authenticationDefinitionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: {
      type: "string",
      description: localize(
        "authentication.id",
        "The id of the authentication provider."
      )
    },
    label: {
      type: "string",
      description: localize(
        "authentication.label",
        "The human readable name of the authentication provider."
      )
    }
  }
};
const authenticationExtPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "authentication",
  jsonSchema: {
    description: localize(
      {
        key: "authenticationExtensionPoint",
        comment: [`'Contributes' means adds here`]
      },
      "Contributes authentication"
    ),
    type: "array",
    items: authenticationDefinitionSchema
  },
  activationEventsGenerator: /* @__PURE__ */ __name((authenticationProviders, result) => {
    for (const authenticationProvider of authenticationProviders) {
      if (authenticationProvider.id) {
        result.push(
          `onAuthenticationRequest:${authenticationProvider.id}`
        );
      }
    }
  }, "activationEventsGenerator")
});
class AuthenticationDataRenderer extends Disposable {
  static {
    __name(this, "AuthenticationDataRenderer");
  }
  type = "table";
  shouldRender(manifest) {
    return !!manifest.contributes?.authentication;
  }
  render(manifest) {
    const authentication = manifest.contributes?.authentication || [];
    if (!authentication.length) {
      return { data: { headers: [], rows: [] }, dispose: /* @__PURE__ */ __name(() => {
      }, "dispose") };
    }
    const headers = [
      localize("authenticationlabel", "Label"),
      localize("authenticationid", "ID")
    ];
    const rows = authentication.sort((a, b) => a.label.localeCompare(b.label)).map((auth) => {
      return [auth.label, auth.id];
    });
    return {
      data: {
        headers,
        rows
      },
      dispose: /* @__PURE__ */ __name(() => {
      }, "dispose")
    };
  }
}
const extensionFeature = Registry.as(
  Extensions.ExtensionFeaturesRegistry
).registerExtensionFeature({
  id: "authentication",
  label: localize("authentication", "Authentication"),
  access: {
    canToggle: false
  },
  renderer: new SyncDescriptor(AuthenticationDataRenderer)
});
let AuthenticationContribution = class extends Disposable {
  constructor(_authenticationService, _environmentService) {
    super();
    this._authenticationService = _authenticationService;
    this._environmentService = _environmentService;
    this._register(codeExchangeProxyCommand);
    this._register(extensionFeature);
    if (_authenticationService.getProviderIds().length) {
      this._clearPlaceholderMenuItem();
    }
    this._registerHandlers();
    this._registerAuthenticationExtentionPointHandler();
    this._registerEnvContributedAuthenticationProviders();
    this._registerActions();
  }
  static {
    __name(this, "AuthenticationContribution");
  }
  static ID = "workbench.contrib.authentication";
  _placeholderMenuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
    command: {
      id: "noAuthenticationProviders",
      title: localize(
        "authentication.Placeholder",
        "No accounts requested yet..."
      ),
      precondition: ContextKeyExpr.false()
    }
  });
  _registerAuthenticationExtentionPointHandler() {
    authenticationExtPoint.setHandler((extensions, { added, removed }) => {
      added.forEach((point) => {
        for (const provider of point.value) {
          if (isFalsyOrWhitespace(provider.id)) {
            point.collector.error(
              localize(
                "authentication.missingId",
                "An authentication contribution must specify an id."
              )
            );
            continue;
          }
          if (isFalsyOrWhitespace(provider.label)) {
            point.collector.error(
              localize(
                "authentication.missingLabel",
                "An authentication contribution must specify a label."
              )
            );
            continue;
          }
          if (this._authenticationService.declaredProviders.some(
            (p) => p.id === provider.id
          )) {
            point.collector.error(
              localize(
                "authentication.idConflict",
                "This authentication id '{0}' has already been registered",
                provider.id
              )
            );
          } else {
            this._authenticationService.registerDeclaredAuthenticationProvider(
              provider
            );
          }
        }
      });
      const removedExtPoints = removed.flatMap((r) => r.value);
      removedExtPoints.forEach((point) => {
        const provider = this._authenticationService.declaredProviders.find(
          (provider2) => provider2.id === point.id
        );
        if (provider) {
          this._authenticationService.unregisterDeclaredAuthenticationProvider(
            provider.id
          );
        }
      });
    });
  }
  _registerEnvContributedAuthenticationProviders() {
    if (!this._environmentService.options?.authenticationProviders?.length) {
      return;
    }
    for (const provider of this._environmentService.options.authenticationProviders) {
      this._authenticationService.registerAuthenticationProvider(
        provider.id,
        provider
      );
    }
  }
  _registerHandlers() {
    this._register(
      this._authenticationService.onDidRegisterAuthenticationProvider(
        (_e) => {
          this._clearPlaceholderMenuItem();
        }
      )
    );
    this._register(
      this._authenticationService.onDidUnregisterAuthenticationProvider(
        (_e) => {
          if (!this._authenticationService.getProviderIds().length) {
            this._placeholderMenuItem = MenuRegistry.appendMenuItem(
              MenuId.AccountsContext,
              {
                command: {
                  id: "noAuthenticationProviders",
                  title: localize("loading", "Loading..."),
                  precondition: ContextKeyExpr.false()
                }
              }
            );
          }
        }
      )
    );
  }
  _registerActions() {
    this._register(registerAction2(SignOutOfAccountAction));
    this._register(
      registerAction2(ManageTrustedExtensionsForAccountAction)
    );
  }
  _clearPlaceholderMenuItem() {
    this._placeholderMenuItem?.dispose();
    this._placeholderMenuItem = void 0;
  }
};
AuthenticationContribution = __decorateClass([
  __decorateParam(0, IAuthenticationService),
  __decorateParam(1, IBrowserWorkbenchEnvironmentService)
], AuthenticationContribution);
registerWorkbenchContribution2(
  AuthenticationContribution.ID,
  AuthenticationContribution,
  WorkbenchPhase.AfterRestored
);
export {
  AuthenticationContribution
};
//# sourceMappingURL=authentication.contribution.js.map
