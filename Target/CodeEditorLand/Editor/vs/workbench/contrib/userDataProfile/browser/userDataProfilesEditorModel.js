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
  Action,
  Separator
} from "../../../../base/common/actions.js";
import {
  RunOnceScheduler,
  createCancelablePromise
} from "../../../../base/common/async.js";
import {
  CancellationToken,
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { getErrorMessage } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../base/common/map.js";
import { equals } from "../../../../base/common/objects.js";
import { isWeb } from "../../../../base/common/platform.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { URI } from "../../../../base/common/uri.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import { localize } from "../../../../nls.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { InMemoryFileSystemProvider } from "../../../../platform/files/common/inMemoryFilesystemProvider.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IOpenerService } from "../../../../platform/opener/common/opener.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  IUserDataProfilesService,
  ProfileResourceType,
  isUserDataProfile,
  toUserDataProfile
} from "../../../../platform/userDataProfile/common/userDataProfile.js";
import { API_OPEN_EDITOR_COMMAND_ID } from "../../../browser/parts/editor/editorCommands.js";
import { CONFIG_NEW_WINDOW_PROFILE } from "../../../common/configuration.js";
import { EditorModel } from "../../../common/editor/editorModel.js";
import { SIDE_GROUP } from "../../../services/editor/common/editorService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import {
  ExtensionsResourceExportTreeItem,
  ExtensionsResourceImportTreeItem
} from "../../../services/userDataProfile/browser/extensionsResource.js";
import {
  KeybindingsResource,
  KeybindingsResourceTreeItem
} from "../../../services/userDataProfile/browser/keybindingsResource.js";
import {
  SettingsResource,
  SettingsResourceTreeItem
} from "../../../services/userDataProfile/browser/settingsResource.js";
import {
  SnippetsResource,
  SnippetsResourceTreeItem
} from "../../../services/userDataProfile/browser/snippetsResource.js";
import {
  TasksResource,
  TasksResourceTreeItem
} from "../../../services/userDataProfile/browser/tasksResource.js";
import {
  IUserDataProfileImportExportService,
  IUserDataProfileManagementService,
  IUserDataProfileService,
  isProfileURL
} from "../../../services/userDataProfile/common/userDataProfile.js";
function isProfileResourceTypeElement(element) {
  return element.resourceType !== void 0;
}
function isProfileResourceChildElement(element) {
  return element.label !== void 0;
}
let AbstractUserDataProfileElement = class extends Disposable {
  constructor(name, icon, flags, isActive, userDataProfileManagementService, userDataProfilesService, commandService, instantiationService) {
    super();
    this.userDataProfileManagementService = userDataProfileManagementService;
    this.userDataProfilesService = userDataProfilesService;
    this.commandService = commandService;
    this.instantiationService = instantiationService;
    this._name = name;
    this._icon = icon;
    this._flags = flags;
    this._active = isActive;
    this._register(this.onDidChange((e) => {
      if (!e.message) {
        this.validate();
      }
      this.save();
    }));
  }
  _onDidChange = this._register(
    new Emitter()
  );
  onDidChange = this._onDidChange.event;
  saveScheduler = this._register(
    new RunOnceScheduler(() => this.doSave(), 500)
  );
  _name = "";
  get name() {
    return this._name;
  }
  set name(name) {
    name = name.trim();
    if (this._name !== name) {
      this._name = name;
      this._onDidChange.fire({ name: true });
    }
  }
  _icon;
  get icon() {
    return this._icon;
  }
  set icon(icon) {
    if (this._icon !== icon) {
      this._icon = icon;
      this._onDidChange.fire({ icon: true });
    }
  }
  _flags;
  get flags() {
    return this._flags;
  }
  set flags(flags) {
    if (!equals(this._flags, flags)) {
      this._flags = flags;
      this._onDidChange.fire({ flags: true });
    }
  }
  _active = false;
  get active() {
    return this._active;
  }
  set active(active) {
    if (this._active !== active) {
      this._active = active;
      this._onDidChange.fire({ active: true });
    }
  }
  _message;
  get message() {
    return this._message;
  }
  set message(message) {
    if (this._message !== message) {
      this._message = message;
      this._onDidChange.fire({ message: true });
    }
  }
  _disabled = false;
  get disabled() {
    return this._disabled;
  }
  set disabled(saving) {
    if (this._disabled !== saving) {
      this._disabled = saving;
      this._onDidChange.fire({ disabled: true });
    }
  }
  getFlag(key) {
    return this.flags?.[key] ?? false;
  }
  setFlag(key, value) {
    const flags = this.flags ? { ...this.flags } : {};
    if (value) {
      flags[key] = true;
    } else {
      delete flags[key];
    }
    this.flags = flags;
  }
  validate() {
    if (!this.name) {
      this.message = localize(
        "name required",
        "Profile name is required and must be a non-empty value."
      );
      return;
    }
    if (this.shouldValidateName() && this.name !== this.getInitialName() && this.userDataProfilesService.profiles.some(
      (p) => p.name === this.name
    )) {
      this.message = localize(
        "profileExists",
        "Profile with name {0} already exists.",
        this.name
      );
      return;
    }
    if (this.flags && this.flags.settings && this.flags.keybindings && this.flags.tasks && this.flags.snippets && this.flags.extensions) {
      this.message = localize(
        "invalid configurations",
        "The profile should contain at least one configuration."
      );
      return;
    }
    this.message = void 0;
  }
  async getChildren(resourceType) {
    if (resourceType === void 0) {
      const resourceTypes = [
        ProfileResourceType.Settings,
        ProfileResourceType.Keybindings,
        ProfileResourceType.Tasks,
        ProfileResourceType.Snippets,
        ProfileResourceType.Extensions
      ];
      return Promise.all(
        resourceTypes.map(
          async (r) => {
            const children = r === ProfileResourceType.Settings || r === ProfileResourceType.Keybindings || r === ProfileResourceType.Tasks ? await this.getChildrenForResourceType(r) : [];
            return {
              handle: r,
              checkbox: void 0,
              resourceType: r,
              action: children.length ? new Action(
                "_open",
                localize("open", "Open to the Side"),
                ThemeIcon.asClassName(Codicon.goToFile),
                true,
                () => children[0]?.action?.run()
              ) : void 0
            };
          }
        )
      );
    }
    return this.getChildrenForResourceType(resourceType);
  }
  async getChildrenForResourceType(resourceType) {
    return [];
  }
  async getChildrenFromProfile(profile, resourceType) {
    profile = this.getFlag(resourceType) ? this.userDataProfilesService.defaultProfile : profile;
    let children = [];
    switch (resourceType) {
      case ProfileResourceType.Settings:
        children = await this.instantiationService.createInstance(SettingsResourceTreeItem, profile).getChildren();
        break;
      case ProfileResourceType.Keybindings:
        children = await this.instantiationService.createInstance(KeybindingsResourceTreeItem, profile).getChildren();
        break;
      case ProfileResourceType.Snippets:
        children = await this.instantiationService.createInstance(SnippetsResourceTreeItem, profile).getChildren() ?? [];
        break;
      case ProfileResourceType.Tasks:
        children = await this.instantiationService.createInstance(TasksResourceTreeItem, profile).getChildren();
        break;
      case ProfileResourceType.Extensions:
        children = await this.instantiationService.createInstance(ExtensionsResourceExportTreeItem, profile).getChildren();
        break;
    }
    return children.map(
      (child) => this.toUserDataProfileResourceChildElement(child)
    );
  }
  toUserDataProfileResourceChildElement(child) {
    return {
      handle: child.handle,
      checkbox: child.checkbox,
      label: child.label?.label ?? "",
      resource: URI.revive(child.resourceUri),
      icon: child.themeIcon,
      action: new Action(
        "_openChild",
        localize("open", "Open to the Side"),
        ThemeIcon.asClassName(Codicon.goToFile),
        true,
        async () => {
          if (child.parent.type === ProfileResourceType.Extensions) {
            await this.commandService.executeCommand(
              "extension.open",
              child.handle,
              void 0,
              true,
              void 0,
              true
            );
          } else if (child.resourceUri) {
            await this.commandService.executeCommand(
              API_OPEN_EDITOR_COMMAND_ID,
              child.resourceUri,
              [SIDE_GROUP],
              void 0
            );
          }
        }
      )
    };
  }
  getInitialName() {
    return "";
  }
  shouldValidateName() {
    return true;
  }
  save() {
    this.saveScheduler.schedule();
  }
  hasUnsavedChanges(profile) {
    if (this.name !== profile.name) {
      return true;
    }
    if (this.icon !== profile.icon) {
      return true;
    }
    if (!equals(this.flags ?? {}, profile.useDefaultFlags ?? {})) {
      return true;
    }
    return false;
  }
  async saveProfile(profile) {
    if (!this.hasUnsavedChanges(profile)) {
      return;
    }
    this.validate();
    if (this.message) {
      return;
    }
    const useDefaultFlags = this.flags ? this.flags.settings && this.flags.keybindings && this.flags.tasks && this.flags.globalState && this.flags.extensions ? void 0 : this.flags : void 0;
    return await this.userDataProfileManagementService.updateProfile(
      profile,
      {
        name: this.name,
        icon: this.icon,
        useDefaultFlags: profile.useDefaultFlags && !useDefaultFlags ? {} : useDefaultFlags
      }
    );
  }
};
AbstractUserDataProfileElement = __decorateClass([
  __decorateParam(4, IUserDataProfileManagementService),
  __decorateParam(5, IUserDataProfilesService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IInstantiationService)
], AbstractUserDataProfileElement);
let UserDataProfileElement = class extends AbstractUserDataProfileElement {
  constructor(_profile, titleButtons, actions, userDataProfileService, configurationService, userDataProfileManagementService, userDataProfilesService, commandService, instantiationService) {
    super(
      _profile.name,
      _profile.icon,
      _profile.useDefaultFlags,
      userDataProfileService.currentProfile.id === _profile.id,
      userDataProfileManagementService,
      userDataProfilesService,
      commandService,
      instantiationService
    );
    this._profile = _profile;
    this.titleButtons = titleButtons;
    this.actions = actions;
    this.userDataProfileService = userDataProfileService;
    this.configurationService = configurationService;
    this._isNewWindowProfile = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE) === this.profile.name;
    this._register(configurationService.onDidChangeConfiguration(
      (e) => {
        if (e.affectsConfiguration(CONFIG_NEW_WINDOW_PROFILE)) {
          this.isNewWindowProfile = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE) === this.profile.name;
        }
      }
    ));
    this._register(this.userDataProfileService.onDidChangeCurrentProfile(() => this.active = this.userDataProfileService.currentProfile.id === this.profile.id));
    this._register(this.userDataProfilesService.onDidChangeProfiles(({ updated }) => {
      const profile = updated.find((p) => p.id === this.profile.id);
      if (profile) {
        this._profile = profile;
        this.reset();
        this._onDidChange.fire({ profile: true });
      }
    }));
  }
  get profile() {
    return this._profile;
  }
  reset() {
    this.name = this._profile.name;
    this.icon = this._profile.icon;
    this.flags = this._profile.useDefaultFlags;
  }
  async toggleNewWindowProfile() {
    if (this._isNewWindowProfile) {
      await this.configurationService.updateValue(
        CONFIG_NEW_WINDOW_PROFILE,
        null
      );
    } else {
      await this.configurationService.updateValue(
        CONFIG_NEW_WINDOW_PROFILE,
        this.profile.name
      );
    }
  }
  _isNewWindowProfile = false;
  get isNewWindowProfile() {
    return this._isNewWindowProfile;
  }
  set isNewWindowProfile(isNewWindowProfile) {
    if (this._isNewWindowProfile !== isNewWindowProfile) {
      this._isNewWindowProfile = isNewWindowProfile;
      this._onDidChange.fire({ newWindowProfile: true });
    }
  }
  async toggleCurrentWindowProfile() {
    if (this.userDataProfileService.currentProfile.id === this.profile.id) {
      await this.userDataProfileManagementService.switchProfile(
        this.userDataProfilesService.defaultProfile
      );
    } else {
      await this.userDataProfileManagementService.switchProfile(
        this.profile
      );
    }
  }
  async doSave() {
    await this.saveProfile(this.profile);
  }
  async getChildrenForResourceType(resourceType) {
    return this.getChildrenFromProfile(this.profile, resourceType);
  }
  getInitialName() {
    return this.profile.name;
  }
};
UserDataProfileElement = __decorateClass([
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, IUserDataProfileManagementService),
  __decorateParam(6, IUserDataProfilesService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IInstantiationService)
], UserDataProfileElement);
const USER_DATA_PROFILE_TEMPLATE_PREVIEW_SCHEME = "userdataprofiletemplatepreview";
let NewProfileElement = class extends AbstractUserDataProfileElement {
  constructor(name, copyFrom, titleButtons, actions, fileService, userDataProfileImportExportService, userDataProfileManagementService, userDataProfilesService, commandService, instantiationService) {
    super(
      name,
      void 0,
      void 0,
      false,
      userDataProfileManagementService,
      userDataProfilesService,
      commandService,
      instantiationService
    );
    this.titleButtons = titleButtons;
    this.actions = actions;
    this.fileService = fileService;
    this.userDataProfileImportExportService = userDataProfileImportExportService;
    this.defaultName = name;
    this._copyFrom = copyFrom;
    this._copyFlags = this.getCopyFlagsFrom(copyFrom);
    this.initialize();
    this._register(this.fileService.registerProvider(USER_DATA_PROFILE_TEMPLATE_PREVIEW_SCHEME, this._register(new InMemoryFileSystemProvider())));
  }
  _copyFromTemplates = new ResourceMap();
  get copyFromTemplates() {
    return this._copyFromTemplates;
  }
  templatePromise;
  template = null;
  defaultName;
  defaultIcon;
  _copyFrom;
  get copyFrom() {
    return this._copyFrom;
  }
  set copyFrom(copyFrom) {
    if (this._copyFrom !== copyFrom) {
      this._copyFrom = copyFrom;
      this._onDidChange.fire({ copyFrom: true });
      this.flags = void 0;
      this.copyFlags = this.getCopyFlagsFrom(copyFrom);
      if (copyFrom instanceof URI) {
        this.templatePromise?.cancel();
        this.templatePromise = void 0;
      }
      this.initialize();
    }
  }
  _copyFlags;
  get copyFlags() {
    return this._copyFlags;
  }
  set copyFlags(flags) {
    if (!equals(this._copyFlags, flags)) {
      this._copyFlags = flags;
      this._onDidChange.fire({ copyFlags: true });
    }
  }
  _previewProfile;
  get previewProfile() {
    return this._previewProfile;
  }
  set previewProfile(profile) {
    if (this._previewProfile !== profile) {
      this._previewProfile = profile;
      this._onDidChange.fire({ preview: true });
    }
  }
  getCopyFlagsFrom(copyFrom) {
    return copyFrom ? {
      settings: true,
      keybindings: true,
      snippets: true,
      tasks: true,
      extensions: true
    } : void 0;
  }
  async initialize() {
    this.disabled = true;
    try {
      if (this.copyFrom instanceof URI) {
        await this.resolveTemplate(this.copyFrom);
        if (this.template) {
          this.copyFromTemplates.set(
            this.copyFrom,
            this.template.name
          );
          if (this.defaultName === this.name) {
            this.name = this.defaultName = this.template.name ?? "";
          }
          if (this.defaultIcon === this.icon) {
            this.icon = this.defaultIcon = this.template.icon;
          }
          this.setCopyFlag(
            ProfileResourceType.Settings,
            !!this.template.settings
          );
          this.setCopyFlag(
            ProfileResourceType.Keybindings,
            !!this.template.keybindings
          );
          this.setCopyFlag(
            ProfileResourceType.Tasks,
            !!this.template.tasks
          );
          this.setCopyFlag(
            ProfileResourceType.Snippets,
            !!this.template.snippets
          );
          this.setCopyFlag(
            ProfileResourceType.Extensions,
            !!this.template.extensions
          );
          this._onDidChange.fire({ copyFromInfo: true });
        }
        return;
      }
      if (isUserDataProfile(this.copyFrom)) {
        if (this.defaultName === this.name) {
          this.name = this.defaultName = localize(
            "copy from",
            "{0} (Copy)",
            this.copyFrom.name
          );
        }
        if (this.defaultIcon === this.icon) {
          this.icon = this.defaultIcon = this.copyFrom.icon;
        }
        this.setCopyFlag(ProfileResourceType.Settings, true);
        this.setCopyFlag(ProfileResourceType.Keybindings, true);
        this.setCopyFlag(ProfileResourceType.Tasks, true);
        this.setCopyFlag(ProfileResourceType.Snippets, true);
        this.setCopyFlag(ProfileResourceType.Extensions, true);
        this._onDidChange.fire({ copyFromInfo: true });
        return;
      }
      if (this.defaultName === this.name) {
        this.name = this.defaultName = localize("untitled", "Untitled");
      }
      if (this.defaultIcon === this.icon) {
        this.icon = this.defaultIcon = void 0;
      }
      this.setCopyFlag(ProfileResourceType.Settings, false);
      this.setCopyFlag(ProfileResourceType.Keybindings, false);
      this.setCopyFlag(ProfileResourceType.Tasks, false);
      this.setCopyFlag(ProfileResourceType.Snippets, false);
      this.setCopyFlag(ProfileResourceType.Extensions, false);
      this._onDidChange.fire({ copyFromInfo: true });
    } finally {
      this.disabled = false;
    }
  }
  async resolveTemplate(uri) {
    if (!this.templatePromise) {
      this.templatePromise = createCancelablePromise(async (token) => {
        const template = await this.userDataProfileImportExportService.resolveProfileTemplate(
          uri
        );
        if (!token.isCancellationRequested) {
          this.template = template;
        }
      });
    }
    await this.templatePromise;
    return this.template;
  }
  hasResource(resourceType) {
    if (this.template) {
      switch (resourceType) {
        case ProfileResourceType.Settings:
          return !!this.template.settings;
        case ProfileResourceType.Keybindings:
          return !!this.template.keybindings;
        case ProfileResourceType.Snippets:
          return !!this.template.snippets;
        case ProfileResourceType.Tasks:
          return !!this.template.tasks;
        case ProfileResourceType.Extensions:
          return !!this.template.extensions;
      }
    }
    return true;
  }
  getCopyFlag(key) {
    return this.copyFlags?.[key] ?? false;
  }
  setCopyFlag(key, value) {
    const flags = this.copyFlags ? { ...this.copyFlags } : {};
    flags[key] = value;
    this.copyFlags = flags;
  }
  getCopyFromName() {
    if (isUserDataProfile(this.copyFrom)) {
      return this.copyFrom.name;
    }
    if (this.copyFrom instanceof URI) {
      return this.copyFromTemplates.get(this.copyFrom);
    }
    return void 0;
  }
  async getChildrenForResourceType(resourceType) {
    if (this.getFlag(resourceType)) {
      return this.getChildrenFromProfile(
        this.userDataProfilesService.defaultProfile,
        resourceType
      );
    }
    if (!this.getCopyFlag(resourceType)) {
      return [];
    }
    if (this.copyFrom instanceof URI) {
      await this.resolveTemplate(this.copyFrom);
      if (!this.template) {
        return [];
      }
      return this.getChildrenFromProfileTemplate(
        this.template,
        resourceType
      );
    }
    if (this.copyFrom) {
      return this.getChildrenFromProfile(this.copyFrom, resourceType);
    }
    return [];
  }
  async getChildrenFromProfileTemplate(profileTemplate, resourceType) {
    const profile = toUserDataProfile(
      generateUuid(),
      this.name,
      URI.file("/root").with({
        scheme: USER_DATA_PROFILE_TEMPLATE_PREVIEW_SCHEME
      }),
      URI.file("/cache").with({
        scheme: USER_DATA_PROFILE_TEMPLATE_PREVIEW_SCHEME
      })
    );
    switch (resourceType) {
      case ProfileResourceType.Settings:
        if (profileTemplate.settings) {
          await this.instantiationService.createInstance(SettingsResource).apply(profileTemplate.settings, profile);
          return this.getChildrenFromProfile(profile, resourceType);
        }
        return [];
      case ProfileResourceType.Keybindings:
        if (profileTemplate.keybindings) {
          await this.instantiationService.createInstance(KeybindingsResource).apply(profileTemplate.keybindings, profile);
          return this.getChildrenFromProfile(profile, resourceType);
        }
        return [];
      case ProfileResourceType.Snippets:
        if (profileTemplate.snippets) {
          await this.instantiationService.createInstance(SnippetsResource).apply(profileTemplate.snippets, profile);
          return this.getChildrenFromProfile(profile, resourceType);
        }
        return [];
      case ProfileResourceType.Tasks:
        if (profileTemplate.tasks) {
          await this.instantiationService.createInstance(TasksResource).apply(profileTemplate.tasks, profile);
          return this.getChildrenFromProfile(profile, resourceType);
        }
        return [];
      case ProfileResourceType.Extensions:
        if (profileTemplate.extensions) {
          const children = await this.instantiationService.createInstance(
            ExtensionsResourceImportTreeItem,
            profileTemplate.extensions
          ).getChildren();
          return children.map(
            (child) => this.toUserDataProfileResourceChildElement(child)
          );
        }
        return [];
    }
    return [];
  }
  shouldValidateName() {
    return !this.copyFrom;
  }
  getInitialName() {
    return this.previewProfile?.name ?? "";
  }
  async doSave() {
    if (this.previewProfile) {
      const profile = await this.saveProfile(this.previewProfile);
      if (profile) {
        this.previewProfile = profile;
      }
    }
  }
};
NewProfileElement = __decorateClass([
  __decorateParam(4, IFileService),
  __decorateParam(5, IUserDataProfileImportExportService),
  __decorateParam(6, IUserDataProfileManagementService),
  __decorateParam(7, IUserDataProfilesService),
  __decorateParam(8, ICommandService),
  __decorateParam(9, IInstantiationService)
], NewProfileElement);
let UserDataProfilesEditorModel = class extends EditorModel {
  constructor(userDataProfileService, userDataProfilesService, userDataProfileManagementService, userDataProfileImportExportService, dialogService, telemetryService, hostService, productService, openerService, instantiationService) {
    super();
    this.userDataProfileService = userDataProfileService;
    this.userDataProfilesService = userDataProfilesService;
    this.userDataProfileManagementService = userDataProfileManagementService;
    this.userDataProfileImportExportService = userDataProfileImportExportService;
    this.dialogService = dialogService;
    this.telemetryService = telemetryService;
    this.hostService = hostService;
    this.productService = productService;
    this.openerService = openerService;
    this.instantiationService = instantiationService;
    for (const profile of userDataProfilesService.profiles) {
      if (!profile.isTransient) {
        this._profiles.push(this.createProfileElement(profile));
      }
    }
    this._register(toDisposable(() => this._profiles.splice(0, this._profiles.length).map(([, disposables]) => disposables.dispose())));
    this._register(userDataProfilesService.onDidChangeProfiles((e) => this.onDidChangeProfiles(e)));
  }
  static INSTANCE;
  static getInstance(instantiationService) {
    if (!UserDataProfilesEditorModel.INSTANCE) {
      UserDataProfilesEditorModel.INSTANCE = instantiationService.createInstance(
        UserDataProfilesEditorModel
      );
    }
    return UserDataProfilesEditorModel.INSTANCE;
  }
  _profiles = [];
  get profiles() {
    return this._profiles.map(([profile]) => profile).sort((a, b) => {
      if (a instanceof NewProfileElement) {
        return 1;
      }
      if (b instanceof NewProfileElement) {
        return -1;
      }
      if (a instanceof UserDataProfileElement && a.profile.isDefault) {
        return -1;
      }
      if (b instanceof UserDataProfileElement && b.profile.isDefault) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }
  newProfileElement;
  _onDidChange = this._register(
    new Emitter()
  );
  onDidChange = this._onDidChange.event;
  templates;
  onDidChangeProfiles(e) {
    let changed = false;
    for (const profile of e.added) {
      if (!profile.isTransient && profile.name !== this.newProfileElement?.name) {
        changed = true;
        this._profiles.push(this.createProfileElement(profile));
      }
    }
    for (const profile of e.removed) {
      if (profile.id === this.newProfileElement?.previewProfile?.id) {
        this.newProfileElement.previewProfile = void 0;
      }
      const index = this._profiles.findIndex(
        ([p]) => p instanceof UserDataProfileElement && p.profile.id === profile.id
      );
      if (index !== -1) {
        changed = true;
        this._profiles.splice(index, 1).map(([, disposables]) => disposables.dispose());
      }
    }
    if (changed) {
      this._onDidChange.fire(void 0);
    }
  }
  getTemplates() {
    if (!this.templates) {
      this.templates = this.userDataProfileManagementService.getBuiltinProfileTemplates();
    }
    return this.templates;
  }
  createProfileElement(profile) {
    const disposables = new DisposableStore();
    const activateAction = disposables.add(
      new Action(
        "userDataProfile.activate",
        localize("active", "Use this Profile for Current Window"),
        ThemeIcon.asClassName(Codicon.check),
        true,
        () => this.userDataProfileManagementService.switchProfile(
          profileElement.profile
        )
      )
    );
    const copyFromProfileAction = disposables.add(
      new Action(
        "userDataProfile.copyFromProfile",
        localize("copyFromProfile", "Duplicate..."),
        ThemeIcon.asClassName(Codicon.copy),
        true,
        () => this.createNewProfile(profileElement.profile)
      )
    );
    const exportAction = disposables.add(
      new Action(
        "userDataProfile.export",
        localize("export", "Export..."),
        ThemeIcon.asClassName(Codicon.export),
        true,
        () => this.userDataProfileImportExportService.exportProfile(
          profile
        )
      )
    );
    const deleteAction = disposables.add(
      new Action(
        "userDataProfile.delete",
        localize("delete", "Delete"),
        ThemeIcon.asClassName(Codicon.trash),
        true,
        () => this.removeProfile(profileElement.profile)
      )
    );
    const newWindowAction = disposables.add(
      new Action(
        "userDataProfile.newWindow",
        localize(
          "open new window",
          "Open New Window with this Profile"
        ),
        ThemeIcon.asClassName(Codicon.emptyWindow),
        true,
        () => this.openWindow(profileElement.profile)
      )
    );
    const primaryActions = [];
    primaryActions.push(activateAction);
    primaryActions.push(newWindowAction);
    const secondaryActions = [];
    secondaryActions.push(copyFromProfileAction);
    secondaryActions.push(exportAction);
    if (!profile.isDefault) {
      secondaryActions.push(new Separator());
      secondaryActions.push(deleteAction);
    }
    const profileElement = disposables.add(
      this.instantiationService.createInstance(
        UserDataProfileElement,
        profile,
        [[], []],
        [primaryActions, secondaryActions]
      )
    );
    activateAction.enabled = this.userDataProfileService.currentProfile.id !== profileElement.profile.id;
    disposables.add(
      this.userDataProfileService.onDidChangeCurrentProfile(
        () => activateAction.enabled = this.userDataProfileService.currentProfile.id !== profileElement.profile.id
      )
    );
    return [profileElement, disposables];
  }
  async createNewProfile(copyFrom) {
    if (this.newProfileElement) {
      const result = await this.dialogService.confirm({
        type: "info",
        message: localize(
          "new profile exists",
          "A new profile is already being created. Do you want to discard it and create a new one?"
        ),
        primaryButton: localize("discard", "Discard & Create"),
        cancelButton: localize("cancel", "Cancel")
      });
      if (!result.confirmed) {
        return;
      }
      this.revert();
    }
    if (copyFrom instanceof URI) {
      try {
        await this.userDataProfileImportExportService.resolveProfileTemplate(
          copyFrom
        );
      } catch (error) {
        this.dialogService.error(getErrorMessage(error));
        return;
      }
    }
    if (!this.newProfileElement) {
      const disposables = new DisposableStore();
      const cancellationTokenSource = new CancellationTokenSource();
      disposables.add(
        toDisposable(() => cancellationTokenSource.dispose(true))
      );
      const primaryActions = [];
      const secondaryActions = [];
      const createAction = disposables.add(
        new Action(
          "userDataProfile.create",
          localize("create", "Create"),
          void 0,
          true,
          () => this.saveNewProfile(
            false,
            cancellationTokenSource.token
          )
        )
      );
      primaryActions.push(createAction);
      if (isWeb && copyFrom instanceof URI && isProfileURL(copyFrom)) {
        primaryActions.push(
          new Action(
            "userDataProfile.createInDesktop",
            localize(
              "import in desktop",
              "Create in {0}",
              this.productService.nameLong
            ),
            void 0,
            true,
            () => this.openerService.open(copyFrom, {
              openExternal: true
            })
          )
        );
      }
      const cancelAction = disposables.add(
        new Action(
          "userDataProfile.cancel",
          localize("cancel", "Cancel"),
          ThemeIcon.asClassName(Codicon.trash),
          true,
          () => this.discardNewProfile()
        )
      );
      secondaryActions.push(cancelAction);
      const previewProfileAction = disposables.add(
        new Action(
          "userDataProfile.preview",
          localize("preview", "Preview"),
          ThemeIcon.asClassName(Codicon.openPreview),
          true,
          () => this.previewNewProfile(cancellationTokenSource.token)
        )
      );
      if (!isWeb) {
        secondaryActions.push(previewProfileAction);
      }
      const exportAction = disposables.add(
        new Action(
          "userDataProfile.export",
          localize("export", "Export..."),
          ThemeIcon.asClassName(Codicon.export),
          isUserDataProfile(copyFrom),
          () => this.exportNewProfile(cancellationTokenSource.token)
        )
      );
      this.newProfileElement = disposables.add(
        this.instantiationService.createInstance(
          NewProfileElement,
          copyFrom ? "" : localize("untitled", "Untitled"),
          copyFrom,
          [primaryActions, secondaryActions],
          [[cancelAction], [exportAction]]
        )
      );
      const updateCreateActionLabel = () => {
        if (createAction.enabled) {
          if (this.newProfileElement?.copyFrom && this.userDataProfilesService.profiles.some(
            (p) => p.name === this.newProfileElement?.name
          )) {
            createAction.label = localize("replace", "Replace");
          } else {
            createAction.label = localize("create", "Create");
          }
        }
      };
      updateCreateActionLabel();
      disposables.add(
        this.newProfileElement.onDidChange((e) => {
          if (e.preview) {
            previewProfileAction.checked = !!this.newProfileElement?.previewProfile;
          }
          if (e.disabled || e.message) {
            previewProfileAction.enabled = createAction.enabled = !this.newProfileElement?.disabled && !this.newProfileElement?.message;
          }
          if (e.name || e.copyFrom) {
            updateCreateActionLabel();
            exportAction.enabled = isUserDataProfile(
              this.newProfileElement?.copyFrom
            );
          }
        })
      );
      disposables.add(
        this.userDataProfilesService.onDidChangeProfiles((e) => {
          updateCreateActionLabel();
          this.newProfileElement?.validate();
        })
      );
      this._profiles.push([this.newProfileElement, disposables]);
      this._onDidChange.fire(this.newProfileElement);
    }
    return this.newProfileElement;
  }
  revert() {
    this.removeNewProfile();
    this._onDidChange.fire(void 0);
  }
  removeNewProfile() {
    if (this.newProfileElement) {
      const index = this._profiles.findIndex(
        ([p]) => p === this.newProfileElement
      );
      if (index !== -1) {
        this._profiles.splice(index, 1).map(([, disposables]) => disposables.dispose());
      }
      this.newProfileElement = void 0;
    }
  }
  async previewNewProfile(token) {
    if (!this.newProfileElement) {
      return;
    }
    if (this.newProfileElement.previewProfile) {
      return;
    }
    const profile = await this.saveNewProfile(true, token);
    if (profile) {
      this.newProfileElement.previewProfile = profile;
      await this.openWindow(profile);
    }
  }
  async exportNewProfile(token) {
    if (!this.newProfileElement) {
      return;
    }
    if (!isUserDataProfile(this.newProfileElement.copyFrom)) {
      return;
    }
    const profile = toUserDataProfile(
      generateUuid(),
      this.newProfileElement.name,
      this.newProfileElement.copyFrom.location,
      this.newProfileElement.copyFrom.cacheHome,
      {
        icon: this.newProfileElement.icon,
        useDefaultFlags: this.newProfileElement.flags
      },
      this.userDataProfilesService.defaultProfile
    );
    await this.userDataProfileImportExportService.exportProfile(
      profile,
      this.newProfileElement.copyFlags
    );
  }
  async saveNewProfile(transient, token) {
    if (!this.newProfileElement) {
      return void 0;
    }
    this.newProfileElement.validate();
    if (this.newProfileElement.message) {
      return void 0;
    }
    this.newProfileElement.disabled = true;
    let profile;
    try {
      if (this.newProfileElement.previewProfile) {
        if (!transient) {
          profile = await this.userDataProfileManagementService.updateProfile(
            this.newProfileElement.previewProfile,
            { transient: false }
          );
        }
      } else {
        const { flags, icon, name, copyFrom } = this.newProfileElement;
        const useDefaultFlags = flags ? flags.settings && flags.keybindings && flags.tasks && flags.globalState && flags.extensions ? void 0 : flags : void 0;
        const createProfileTelemetryData = {
          source: copyFrom instanceof URI ? "template" : isUserDataProfile(copyFrom) ? "profile" : copyFrom ? "external" : void 0
        };
        if (copyFrom instanceof URI) {
          const template = await this.newProfileElement.resolveTemplate(copyFrom);
          if (template) {
            this.telemetryService.publicLog2(
              "userDataProfile.createFromTemplate",
              createProfileTelemetryData
            );
            profile = await this.userDataProfileImportExportService.createProfileFromTemplate(
              template,
              {
                name,
                useDefaultFlags,
                icon,
                resourceTypeFlags: this.newProfileElement.copyFlags,
                transient
              },
              token ?? CancellationToken.None
            );
          }
        } else if (isUserDataProfile(copyFrom)) {
          this.telemetryService.publicLog2(
            "userDataProfile.createFromProfile",
            createProfileTelemetryData
          );
          profile = await this.userDataProfileImportExportService.createFromProfile(
            copyFrom,
            {
              name,
              useDefaultFlags,
              icon,
              resourceTypeFlags: this.newProfileElement.copyFlags,
              transient
            },
            token ?? CancellationToken.None
          );
        } else {
          this.telemetryService.publicLog2(
            "userDataProfile.createEmptyProfile",
            createProfileTelemetryData
          );
          profile = await this.userDataProfileManagementService.createProfile(
            name,
            { useDefaultFlags, icon, transient }
          );
        }
      }
    } finally {
      if (this.newProfileElement) {
        this.newProfileElement.disabled = false;
      }
    }
    if (token?.isCancellationRequested) {
      if (profile) {
        try {
          await this.userDataProfileManagementService.removeProfile(
            profile
          );
        } catch (error) {
        }
      }
      return;
    }
    if (profile && !profile.isTransient && this.newProfileElement) {
      this.removeNewProfile();
      const existing = this._profiles.find(
        ([p]) => p.name === profile.name
      );
      if (existing) {
        this._onDidChange.fire(existing[0]);
      } else {
        this.onDidChangeProfiles({
          added: [profile],
          removed: [],
          updated: [],
          all: this.userDataProfilesService.profiles
        });
      }
    }
    return profile;
  }
  async discardNewProfile() {
    if (!this.newProfileElement) {
      return;
    }
    if (this.newProfileElement.previewProfile) {
      await this.userDataProfileManagementService.removeProfile(
        this.newProfileElement.previewProfile
      );
    }
    this.removeNewProfile();
    this._onDidChange.fire(void 0);
  }
  async removeProfile(profile) {
    const result = await this.dialogService.confirm({
      type: "info",
      message: localize(
        "deleteProfile",
        "Are you sure you want to delete the profile '{0}'?",
        profile.name
      ),
      primaryButton: localize("delete", "Delete"),
      cancelButton: localize("cancel", "Cancel")
    });
    if (result.confirmed) {
      await this.userDataProfileManagementService.removeProfile(profile);
    }
  }
  async openWindow(profile) {
    await this.hostService.openWindow({ forceProfile: profile.name });
  }
};
UserDataProfilesEditorModel = __decorateClass([
  __decorateParam(0, IUserDataProfileService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IUserDataProfileManagementService),
  __decorateParam(3, IUserDataProfileImportExportService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IProductService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IInstantiationService)
], UserDataProfilesEditorModel);
export {
  AbstractUserDataProfileElement,
  NewProfileElement,
  UserDataProfileElement,
  UserDataProfilesEditorModel,
  isProfileResourceChildElement,
  isProfileResourceTypeElement
};
