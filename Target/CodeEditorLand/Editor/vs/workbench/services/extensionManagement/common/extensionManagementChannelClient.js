import { delta } from "../../../../base/common/arrays.js";
import { Emitter } from "../../../../base/common/event.js";
import { compare } from "../../../../base/common/strings.js";
import {
  ExtensionManagementChannelClient as BaseExtensionManagementChannelClient
} from "../../../../platform/extensionManagement/common/extensionManagementIpc.js";
import {
  ExtensionIdentifier,
  ExtensionType
} from "../../../../platform/extensions/common/extensions.js";
class ProfileAwareExtensionManagementChannelClient extends BaseExtensionManagementChannelClient {
  constructor(channel, userDataProfileService, uriIdentityService) {
    super(channel);
    this.userDataProfileService = userDataProfileService;
    this.uriIdentityService = uriIdentityService;
    this._register(
      userDataProfileService.onDidChangeCurrentProfile((e) => {
        if (!this.uriIdentityService.extUri.isEqual(
          e.previous.extensionsResource,
          e.profile.extensionsResource
        )) {
          e.join(this.whenProfileChanged(e));
        }
      })
    );
  }
  _onDidChangeProfile = this._register(
    new Emitter()
  );
  onDidChangeProfile = this._onDidChangeProfile.event;
  async fireEvent(arg0, arg1) {
    if (Array.isArray(arg1)) {
      const event = arg0;
      const data = arg1;
      const filtered = [];
      for (const e of data) {
        const result = this.filterEvent(
          e.profileLocation,
          e.applicationScoped ?? e.local?.isApplicationScoped ?? false
        );
        if (result instanceof Promise ? await result : result) {
          filtered.push(e);
        }
      }
      if (filtered.length) {
        event.fire(filtered);
      }
    } else {
      const event = arg0;
      const data = arg1;
      const result = this.filterEvent(
        data.profileLocation,
        data.applicationScoped ?? data.local?.isApplicationScoped ?? false
      );
      if (result instanceof Promise ? await result : result) {
        event.fire(data);
      }
    }
  }
  async install(vsix, installOptions) {
    installOptions = {
      ...installOptions,
      profileLocation: await this.getProfileLocation(
        installOptions?.profileLocation
      )
    };
    return super.install(vsix, installOptions);
  }
  async installFromLocation(location, profileLocation) {
    return super.installFromLocation(
      location,
      await this.getProfileLocation(profileLocation)
    );
  }
  async installFromGallery(extension, installOptions) {
    installOptions = {
      ...installOptions,
      profileLocation: await this.getProfileLocation(
        installOptions?.profileLocation
      )
    };
    return super.installFromGallery(extension, installOptions);
  }
  async installGalleryExtensions(extensions) {
    const infos = [];
    for (const extension of extensions) {
      infos.push({
        ...extension,
        options: {
          ...extension.options,
          profileLocation: await this.getProfileLocation(
            extension.options?.profileLocation
          )
        }
      });
    }
    return super.installGalleryExtensions(infos);
  }
  async uninstall(extension, options) {
    options = {
      ...options,
      profileLocation: await this.getProfileLocation(
        options?.profileLocation
      )
    };
    return super.uninstall(extension, options);
  }
  async uninstallExtensions(extensions) {
    const infos = [];
    for (const { extension, options } of extensions) {
      infos.push({
        extension,
        options: {
          ...options,
          profileLocation: await this.getProfileLocation(
            options?.profileLocation
          )
        }
      });
    }
    return super.uninstallExtensions(infos);
  }
  async getInstalled(type = null, extensionsProfileResource, productVersion) {
    return super.getInstalled(
      type,
      await this.getProfileLocation(extensionsProfileResource),
      productVersion
    );
  }
  async updateMetadata(local, metadata, extensionsProfileResource) {
    return super.updateMetadata(
      local,
      metadata,
      await this.getProfileLocation(extensionsProfileResource)
    );
  }
  async toggleAppliationScope(local, fromProfileLocation) {
    return super.toggleAppliationScope(
      local,
      await this.getProfileLocation(fromProfileLocation)
    );
  }
  async copyExtensions(fromProfileLocation, toProfileLocation) {
    return super.copyExtensions(
      await this.getProfileLocation(fromProfileLocation),
      await this.getProfileLocation(toProfileLocation)
    );
  }
  async whenProfileChanged(e) {
    const previousProfileLocation = await this.getProfileLocation(
      e.previous.extensionsResource
    );
    const currentProfileLocation = await this.getProfileLocation(
      e.profile.extensionsResource
    );
    if (this.uriIdentityService.extUri.isEqual(
      previousProfileLocation,
      currentProfileLocation
    )) {
      return;
    }
    const eventData = await this.switchExtensionsProfile(
      previousProfileLocation,
      currentProfileLocation
    );
    this._onDidChangeProfile.fire(eventData);
  }
  async switchExtensionsProfile(previousProfileLocation, currentProfileLocation, preserveExtensions) {
    const oldExtensions = await this.getInstalled(
      ExtensionType.User,
      previousProfileLocation
    );
    const newExtensions = await this.getInstalled(
      ExtensionType.User,
      currentProfileLocation
    );
    if (preserveExtensions?.length) {
      const extensionsToInstall = [];
      for (const extension of oldExtensions) {
        if (preserveExtensions.some(
          (id) => ExtensionIdentifier.equals(extension.identifier.id, id)
        ) && !newExtensions.some(
          (e) => ExtensionIdentifier.equals(
            e.identifier.id,
            extension.identifier.id
          )
        )) {
          extensionsToInstall.push(extension.identifier);
        }
      }
      if (extensionsToInstall.length) {
        await this.installExtensionsFromProfile(
          extensionsToInstall,
          previousProfileLocation,
          currentProfileLocation
        );
      }
    }
    return delta(
      oldExtensions,
      newExtensions,
      (a, b) => compare(
        `${ExtensionIdentifier.toKey(a.identifier.id)}@${a.manifest.version}`,
        `${ExtensionIdentifier.toKey(b.identifier.id)}@${b.manifest.version}`
      )
    );
  }
  async getProfileLocation(profileLocation) {
    return profileLocation ?? this.userDataProfileService.currentProfile.extensionsResource;
  }
}
export {
  ProfileAwareExtensionManagementChannelClient
};
