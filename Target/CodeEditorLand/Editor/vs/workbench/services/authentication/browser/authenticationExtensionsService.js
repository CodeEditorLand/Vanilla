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
import {
  Disposable,
  DisposableStore,
  dispose,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import * as nls from "../../../../nls.js";
import {
  MenuId,
  MenuRegistry
} from "../../../../platform/actions/common/actions.js";
import { CommandsRegistry } from "../../../../platform/commands/common/commands.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { Severity } from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../platform/storage/common/storage.js";
import {
  IActivityService,
  NumberBadge
} from "../../activity/common/activity.js";
import {
  IAuthenticationExtensionsService,
  IAuthenticationService
} from "../common/authentication.js";
import { IAuthenticationAccessService } from "./authenticationAccessService.js";
import { IAuthenticationUsageService } from "./authenticationUsageService.js";
const SCOPESLIST_SEPARATOR = " ";
let AuthenticationExtensionsService = class extends Disposable {
  constructor(activityService, storageService, dialogService, quickInputService, _authenticationService, _authenticationUsageService, _authenticationAccessService) {
    super();
    this.activityService = activityService;
    this.storageService = storageService;
    this.dialogService = dialogService;
    this.quickInputService = quickInputService;
    this._authenticationService = _authenticationService;
    this._authenticationUsageService = _authenticationUsageService;
    this._authenticationAccessService = _authenticationAccessService;
    this.registerListeners();
  }
  _signInRequestItems = /* @__PURE__ */ new Map();
  _sessionAccessRequestItems = /* @__PURE__ */ new Map();
  _accountBadgeDisposable = this._register(
    new MutableDisposable()
  );
  registerListeners() {
    this._register(
      this._authenticationService.onDidChangeSessions(async (e) => {
        if (e.event.added?.length) {
          await this.updateNewSessionRequests(
            e.providerId,
            e.event.added
          );
        }
        if (e.event.removed?.length) {
          await this.updateAccessRequests(
            e.providerId,
            e.event.removed
          );
        }
        this.updateBadgeCount();
      })
    );
    this._register(
      this._authenticationService.onDidUnregisterAuthenticationProvider(
        (e) => {
          const accessRequests = this._sessionAccessRequestItems.get(e.id) || {};
          Object.keys(accessRequests).forEach((extensionId) => {
            this.removeAccessRequest(e.id, extensionId);
          });
        }
      )
    );
  }
  async updateNewSessionRequests(providerId, addedSessions) {
    const existingRequestsForProvider = this._signInRequestItems.get(providerId);
    if (!existingRequestsForProvider) {
      return;
    }
    Object.keys(existingRequestsForProvider).forEach((requestedScopes) => {
      if (addedSessions.some(
        (session) => session.scopes.slice().join(SCOPESLIST_SEPARATOR) === requestedScopes
      )) {
        const sessionRequest = existingRequestsForProvider[requestedScopes];
        sessionRequest?.disposables.forEach((item) => item.dispose());
        delete existingRequestsForProvider[requestedScopes];
        if (Object.keys(existingRequestsForProvider).length === 0) {
          this._signInRequestItems.delete(providerId);
        } else {
          this._signInRequestItems.set(
            providerId,
            existingRequestsForProvider
          );
        }
      }
    });
  }
  async updateAccessRequests(providerId, removedSessions) {
    const providerRequests = this._sessionAccessRequestItems.get(providerId);
    if (providerRequests) {
      Object.keys(providerRequests).forEach((extensionId) => {
        removedSessions.forEach((removed) => {
          const indexOfSession = providerRequests[extensionId].possibleSessions.findIndex(
            (session) => session.id === removed.id
          );
          if (indexOfSession) {
            providerRequests[extensionId].possibleSessions.splice(
              indexOfSession,
              1
            );
          }
        });
        if (!providerRequests[extensionId].possibleSessions.length) {
          this.removeAccessRequest(providerId, extensionId);
        }
      });
    }
  }
  updateBadgeCount() {
    this._accountBadgeDisposable.clear();
    let numberOfRequests = 0;
    this._signInRequestItems.forEach((providerRequests) => {
      Object.keys(providerRequests).forEach((request) => {
        numberOfRequests += providerRequests[request].requestingExtensionIds.length;
      });
    });
    this._sessionAccessRequestItems.forEach((accessRequest) => {
      numberOfRequests += Object.keys(accessRequest).length;
    });
    if (numberOfRequests > 0) {
      const badge = new NumberBadge(
        numberOfRequests,
        () => nls.localize("sign in", "Sign in requested")
      );
      this._accountBadgeDisposable.value = this.activityService.showAccountsActivity({ badge });
    }
  }
  removeAccessRequest(providerId, extensionId) {
    const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
    if (providerRequests[extensionId]) {
      dispose(providerRequests[extensionId].disposables);
      delete providerRequests[extensionId];
      this.updateBadgeCount();
    }
  }
  //#region Session Preference
  updateSessionPreference(providerId, extensionId, session) {
    const key = `${extensionId}-${providerId}-${session.scopes.join(SCOPESLIST_SEPARATOR)}`;
    this.storageService.store(
      key,
      session.id,
      StorageScope.WORKSPACE,
      StorageTarget.MACHINE
    );
    this.storageService.store(
      key,
      session.id,
      StorageScope.APPLICATION,
      StorageTarget.MACHINE
    );
  }
  getSessionPreference(providerId, extensionId, scopes) {
    const key = `${extensionId}-${providerId}-${scopes.join(SCOPESLIST_SEPARATOR)}`;
    return this.storageService.get(key, StorageScope.WORKSPACE) ?? this.storageService.get(key, StorageScope.APPLICATION);
  }
  removeSessionPreference(providerId, extensionId, scopes) {
    const key = `${extensionId}-${providerId}-${scopes.join(SCOPESLIST_SEPARATOR)}`;
    this.storageService.remove(key, StorageScope.WORKSPACE);
    this.storageService.remove(key, StorageScope.APPLICATION);
  }
  //#endregion
  async showGetSessionPrompt(provider, accountName, extensionId, extensionName) {
    let SessionPromptChoice;
    ((SessionPromptChoice2) => {
      SessionPromptChoice2[SessionPromptChoice2["Allow"] = 0] = "Allow";
      SessionPromptChoice2[SessionPromptChoice2["Deny"] = 1] = "Deny";
      SessionPromptChoice2[SessionPromptChoice2["Cancel"] = 2] = "Cancel";
    })(SessionPromptChoice || (SessionPromptChoice = {}));
    const { result } = await this.dialogService.prompt(
      {
        type: Severity.Info,
        message: nls.localize(
          "confirmAuthenticationAccess",
          "The extension '{0}' wants to access the {1} account '{2}'.",
          extensionName,
          provider.label,
          accountName
        ),
        buttons: [
          {
            label: nls.localize(
              {
                key: "allow",
                comment: ["&& denotes a mnemonic"]
              },
              "&&Allow"
            ),
            run: () => 0 /* Allow */
          },
          {
            label: nls.localize(
              { key: "deny", comment: ["&& denotes a mnemonic"] },
              "&&Deny"
            ),
            run: () => 1 /* Deny */
          }
        ],
        cancelButton: {
          run: () => 2 /* Cancel */
        }
      }
    );
    if (result !== 2 /* Cancel */) {
      this._authenticationAccessService.updateAllowedExtensions(
        provider.id,
        accountName,
        [
          {
            id: extensionId,
            name: extensionName,
            allowed: result === 0 /* Allow */
          }
        ]
      );
      this.removeAccessRequest(provider.id, extensionId);
    }
    return result === 0 /* Allow */;
  }
  /**
   * This function should be used only when there are sessions to disambiguate.
   */
  async selectSession(providerId, extensionId, extensionName, scopes, availableSessions) {
    const allAccounts = await this._authenticationService.getAccounts(providerId);
    if (!allAccounts.length) {
      throw new Error("No accounts available");
    }
    const disposables = new DisposableStore();
    const quickPick = disposables.add(
      this.quickInputService.createQuickPick()
    );
    quickPick.ignoreFocusOut = true;
    const accountsWithSessions = /* @__PURE__ */ new Set();
    const items = availableSessions.filter(
      (session) => !accountsWithSessions.has(session.account.label) && accountsWithSessions.add(session.account.label)
    ).map((session) => {
      return {
        label: session.account.label,
        session
      };
    });
    allAccounts.forEach((account) => {
      if (!accountsWithSessions.has(account.label)) {
        items.push({ label: account.label, account });
      }
    });
    items.push({
      label: nls.localize(
        "useOtherAccount",
        "Sign in to another account"
      )
    });
    quickPick.items = items;
    quickPick.title = nls.localize(
      {
        key: "selectAccount",
        comment: [
          "The placeholder {0} is the name of an extension. {1} is the name of the type of account, such as Microsoft or GitHub."
        ]
      },
      "The extension '{0}' wants to access a {1} account",
      extensionName,
      this._authenticationService.getProvider(providerId).label
    );
    quickPick.placeholder = nls.localize(
      "getSessionPlateholder",
      "Select an account for '{0}' to use or Esc to cancel",
      extensionName
    );
    return await new Promise((resolve, reject) => {
      disposables.add(
        quickPick.onDidAccept(async (_) => {
          quickPick.dispose();
          let session = quickPick.selectedItems[0].session;
          if (!session) {
            const account = quickPick.selectedItems[0].account;
            try {
              session = await this._authenticationService.createSession(
                providerId,
                scopes,
                { account }
              );
            } catch (e) {
              reject(e);
              return;
            }
          }
          const accountName = session.account.label;
          this._authenticationAccessService.updateAllowedExtensions(
            providerId,
            accountName,
            [
              {
                id: extensionId,
                name: extensionName,
                allowed: true
              }
            ]
          );
          this.updateSessionPreference(
            providerId,
            extensionId,
            session
          );
          this.removeAccessRequest(providerId, extensionId);
          resolve(session);
        })
      );
      disposables.add(
        quickPick.onDidHide((_) => {
          if (!quickPick.selectedItems[0]) {
            reject("User did not consent to account access");
          }
          disposables.dispose();
        })
      );
      quickPick.show();
    });
  }
  async completeSessionAccessRequest(provider, extensionId, extensionName, scopes) {
    const providerRequests = this._sessionAccessRequestItems.get(provider.id) || {};
    const existingRequest = providerRequests[extensionId];
    if (!existingRequest) {
      return;
    }
    if (!provider) {
      return;
    }
    const possibleSessions = existingRequest.possibleSessions;
    let session;
    if (provider.supportsMultipleAccounts) {
      try {
        session = await this.selectSession(
          provider.id,
          extensionId,
          extensionName,
          scopes,
          possibleSessions
        );
      } catch (_) {
      }
    } else {
      const approved = await this.showGetSessionPrompt(
        provider,
        possibleSessions[0].account.label,
        extensionId,
        extensionName
      );
      if (approved) {
        session = possibleSessions[0];
      }
    }
    if (session) {
      this._authenticationUsageService.addAccountUsage(
        provider.id,
        session.account.label,
        extensionId,
        extensionName
      );
    }
  }
  requestSessionAccess(providerId, extensionId, extensionName, scopes, possibleSessions) {
    const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
    const hasExistingRequest = providerRequests[extensionId];
    if (hasExistingRequest) {
      return;
    }
    const provider = this._authenticationService.getProvider(providerId);
    const menuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
      group: "3_accessRequests",
      command: {
        id: `${providerId}${extensionId}Access`,
        title: nls.localize(
          {
            key: "accessRequest",
            comment: [
              `The placeholder {0} will be replaced with an authentication provider''s label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count`
            ]
          },
          "Grant access to {0} for {1}... (1)",
          provider.label,
          extensionName
        )
      }
    });
    const accessCommand = CommandsRegistry.registerCommand({
      id: `${providerId}${extensionId}Access`,
      handler: async (accessor) => {
        this.completeSessionAccessRequest(
          provider,
          extensionId,
          extensionName,
          scopes
        );
      }
    });
    providerRequests[extensionId] = {
      possibleSessions,
      disposables: [menuItem, accessCommand]
    };
    this._sessionAccessRequestItems.set(providerId, providerRequests);
    this.updateBadgeCount();
  }
  async requestNewSession(providerId, scopes, extensionId, extensionName) {
    if (!this._authenticationService.isAuthenticationProviderRegistered(
      providerId
    )) {
      await new Promise((resolve, _) => {
        const dispose2 = this._authenticationService.onDidRegisterAuthenticationProvider(
          (e) => {
            if (e.id === providerId) {
              dispose2.dispose();
              resolve();
            }
          }
        );
      });
    }
    let provider;
    try {
      provider = this._authenticationService.getProvider(providerId);
    } catch (_e) {
      return;
    }
    const providerRequests = this._signInRequestItems.get(providerId);
    const scopesList = scopes.join(SCOPESLIST_SEPARATOR);
    const extensionHasExistingRequest = providerRequests && providerRequests[scopesList] && providerRequests[scopesList].requestingExtensionIds.includes(
      extensionId
    );
    if (extensionHasExistingRequest) {
      return;
    }
    const commandId = `${providerId}:${extensionId}:signIn${Object.keys(providerRequests || []).length}`;
    const menuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
      group: "2_signInRequests",
      command: {
        id: commandId,
        title: nls.localize(
          {
            key: "signInRequest",
            comment: [
              `The placeholder {0} will be replaced with an authentication provider's label. {1} will be replaced with an extension name. (1) is to indicate that this menu item contributes to a badge count.`
            ]
          },
          "Sign in with {0} to use {1} (1)",
          provider.label,
          extensionName
        )
      }
    });
    const signInCommand = CommandsRegistry.registerCommand({
      id: commandId,
      handler: async (accessor) => {
        const authenticationService = accessor.get(
          IAuthenticationService
        );
        const session = await authenticationService.createSession(
          providerId,
          scopes
        );
        this._authenticationAccessService.updateAllowedExtensions(
          providerId,
          session.account.label,
          [{ id: extensionId, name: extensionName, allowed: true }]
        );
        this.updateSessionPreference(providerId, extensionId, session);
      }
    });
    if (providerRequests) {
      const existingRequest = providerRequests[scopesList] || {
        disposables: [],
        requestingExtensionIds: []
      };
      providerRequests[scopesList] = {
        disposables: [
          ...existingRequest.disposables,
          menuItem,
          signInCommand
        ],
        requestingExtensionIds: [
          ...existingRequest.requestingExtensionIds,
          extensionId
        ]
      };
      this._signInRequestItems.set(providerId, providerRequests);
    } else {
      this._signInRequestItems.set(providerId, {
        [scopesList]: {
          disposables: [menuItem, signInCommand],
          requestingExtensionIds: [extensionId]
        }
      });
    }
    this.updateBadgeCount();
  }
};
AuthenticationExtensionsService = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, IAuthenticationService),
  __decorateParam(5, IAuthenticationUsageService),
  __decorateParam(6, IAuthenticationAccessService)
], AuthenticationExtensionsService);
registerSingleton(
  IAuthenticationExtensionsService,
  AuthenticationExtensionsService,
  InstantiationType.Delayed
);
export {
  AuthenticationExtensionsService
};
