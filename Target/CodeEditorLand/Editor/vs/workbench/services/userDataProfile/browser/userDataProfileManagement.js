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
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { CancellationError } from "../../../../base/common/errors.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { equals } from "../../../../base/common/objects.js";
import { localize } from "../../../../nls.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import {
  IRequestService,
  asJson
} from "../../../../platform/request/common/request.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  IUserDataProfilesService
} from "../../../../platform/userDataProfile/common/userDataProfile.js";
import {
  IWorkspaceContextService,
  toWorkspaceIdentifier
} from "../../../../platform/workspace/common/workspace.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.js";
import { IExtensionService } from "../../extensions/common/extensions.js";
import { IHostService } from "../../host/browser/host.js";
import {
  IUserDataProfileManagementService,
  IUserDataProfileService
} from "../common/userDataProfile.js";
let UserDataProfileManagementService = class extends Disposable {
  constructor(userDataProfilesService, userDataProfileService, hostService, dialogService, workspaceContextService, extensionService, environmentService, telemetryService, productService, requestService, logService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileService = userDataProfileService;
    this.hostService = hostService;
    this.dialogService = dialogService;
    this.workspaceContextService = workspaceContextService;
    this.extensionService = extensionService;
    this.environmentService = environmentService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.requestService = requestService;
    this.logService = logService;
    this._register(userDataProfilesService.onDidChangeProfiles((e) => this.onDidChangeProfiles(e)));
    this._register(userDataProfilesService.onDidResetWorkspaces(() => this.onDidResetWorkspaces()));
    this._register(userDataProfileService.onDidChangeCurrentProfile((e) => this.onDidChangeCurrentProfile(e)));
    this._register(userDataProfilesService.onDidChangeProfiles((e) => {
      const updatedCurrentProfile = e.updated.find((p) => this.userDataProfileService.currentProfile.id === p.id);
      if (updatedCurrentProfile) {
        this.changeCurrentProfile(updatedCurrentProfile, localize("reload message when updated", "The current profile has been updated. Please reload to switch back to the updated profile"));
      }
    }));
  }
  static {
    __name(this, "UserDataProfileManagementService");
  }
  _serviceBrand;
  onDidChangeProfiles(e) {
    if (e.removed.some(
      (profile) => profile.id === this.userDataProfileService.currentProfile.id
    )) {
      this.changeCurrentProfile(
        this.userDataProfilesService.defaultProfile,
        localize(
          "reload message when removed",
          "The current profile has been removed. Please reload to switch back to default profile"
        )
      );
      return;
    }
  }
  onDidResetWorkspaces() {
    if (!this.userDataProfileService.currentProfile.isDefault) {
      this.changeCurrentProfile(
        this.userDataProfilesService.defaultProfile,
        localize(
          "reload message when removed",
          "The current profile has been removed. Please reload to switch back to default profile"
        )
      );
      return;
    }
  }
  async onDidChangeCurrentProfile(e) {
    if (e.previous.isTransient) {
      await this.userDataProfilesService.cleanUpTransientProfiles();
    }
  }
  async createProfile(name, options) {
    return this.userDataProfilesService.createNamedProfile(name, options);
  }
  async createAndEnterProfile(name, options) {
    const profile = await this.userDataProfilesService.createNamedProfile(
      name,
      options,
      toWorkspaceIdentifier(this.workspaceContextService.getWorkspace())
    );
    await this.changeCurrentProfile(profile);
    this.telemetryService.publicLog2("profileManagementActionExecuted", { id: "createAndEnterProfile" });
    return profile;
  }
  async createAndEnterTransientProfile() {
    const profile = await this.userDataProfilesService.createTransientProfile(
      toWorkspaceIdentifier(
        this.workspaceContextService.getWorkspace()
      )
    );
    await this.changeCurrentProfile(profile);
    this.telemetryService.publicLog2("profileManagementActionExecuted", {
      id: "createAndEnterTransientProfile"
    });
    return profile;
  }
  async updateProfile(profile, updateOptions) {
    if (!this.userDataProfilesService.profiles.some(
      (p) => p.id === profile.id
    )) {
      throw new Error(`Profile ${profile.name} does not exist`);
    }
    if (profile.isDefault) {
      throw new Error(
        localize(
          "cannotRenameDefaultProfile",
          "Cannot rename the default profile"
        )
      );
    }
    const updatedProfile = await this.userDataProfilesService.updateProfile(
      profile,
      updateOptions
    );
    this.telemetryService.publicLog2("profileManagementActionExecuted", { id: "updateProfile" });
    return updatedProfile;
  }
  async removeProfile(profile) {
    if (!this.userDataProfilesService.profiles.some(
      (p) => p.id === profile.id
    )) {
      throw new Error(`Profile ${profile.name} does not exist`);
    }
    if (profile.isDefault) {
      throw new Error(
        localize(
          "cannotDeleteDefaultProfile",
          "Cannot delete the default profile"
        )
      );
    }
    await this.userDataProfilesService.removeProfile(profile);
    this.telemetryService.publicLog2("profileManagementActionExecuted", { id: "removeProfile" });
  }
  async switchProfile(profile) {
    const workspaceIdentifier = toWorkspaceIdentifier(
      this.workspaceContextService.getWorkspace()
    );
    if (!this.userDataProfilesService.profiles.some(
      (p) => p.id === profile.id
    )) {
      throw new Error(`Profile ${profile.name} does not exist`);
    }
    if (this.userDataProfileService.currentProfile.id === profile.id) {
      return;
    }
    await this.userDataProfilesService.setProfileForWorkspace(
      workspaceIdentifier,
      profile
    );
    await this.changeCurrentProfile(profile);
    this.telemetryService.publicLog2("profileManagementActionExecuted", { id: "switchProfile" });
  }
  async getBuiltinProfileTemplates() {
    if (this.productService.profileTemplatesUrl) {
      try {
        const context = await this.requestService.request(
          {
            type: "GET",
            url: this.productService.profileTemplatesUrl
          },
          CancellationToken.None
        );
        if (context.res.statusCode === 200) {
          return await asJson(context) || [];
        } else {
          this.logService.error(
            "Could not get profile templates.",
            context.res.statusCode
          );
        }
      } catch (error) {
        this.logService.error(error);
      }
    }
    return [];
  }
  async changeCurrentProfile(profile, reloadMessage) {
    const isRemoteWindow = !!this.environmentService.remoteAuthority;
    const shouldRestartExtensionHosts = this.userDataProfileService.currentProfile.id !== profile.id || !equals(
      this.userDataProfileService.currentProfile.useDefaultFlags,
      profile.useDefaultFlags
    );
    if (shouldRestartExtensionHosts) {
      if (!isRemoteWindow) {
        if (!await this.extensionService.stopExtensionHosts(
          localize("switch profile", "Switching to a profile.")
        )) {
          if (this.userDataProfilesService.profiles.some(
            (p) => p.id === this.userDataProfileService.currentProfile.id
          )) {
            await this.userDataProfilesService.setProfileForWorkspace(
              toWorkspaceIdentifier(
                this.workspaceContextService.getWorkspace()
              ),
              this.userDataProfileService.currentProfile
            );
          }
          throw new CancellationError();
        }
      }
    }
    await this.userDataProfileService.updateCurrentProfile(profile);
    if (shouldRestartExtensionHosts) {
      if (isRemoteWindow) {
        const { confirmed } = await this.dialogService.confirm({
          message: reloadMessage ?? localize(
            "reload message",
            "Switching a profile requires reloading VS Code."
          ),
          primaryButton: localize("reload button", "&&Reload")
        });
        if (confirmed) {
          await this.hostService.reload();
        }
      } else {
        await this.extensionService.startExtensionHosts();
      }
    }
  }
};
UserDataProfileManagementService = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IUserDataProfileService),
  __decorateParam(2, IHostService),
  __decorateParam(3, IDialogService),
  __decorateParam(4, IWorkspaceContextService),
  __decorateParam(5, IExtensionService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IProductService),
  __decorateParam(9, IRequestService),
  __decorateParam(10, ILogService)
], UserDataProfileManagementService);
registerSingleton(
  IUserDataProfileManagementService,
  UserDataProfileManagementService,
  InstantiationType.Eager
);
export {
  UserDataProfileManagementService
};
//# sourceMappingURL=userDataProfileManagement.js.map
