var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Queue } from "../../../../base/common/async.js";
import { VSBuffer } from "../../../../base/common/buffer.js";
import { joinPath } from "../../../../base/common/resources.js";
import {
  FileOperationResult
} from "../../../../platform/files/common/files.js";
class ConfigurationCache {
  constructor(donotCacheResourcesWithSchemes, environmentService, fileService) {
    this.donotCacheResourcesWithSchemes = donotCacheResourcesWithSchemes;
    this.fileService = fileService;
    this.cacheHome = environmentService.cacheHome;
  }
  static {
    __name(this, "ConfigurationCache");
  }
  cacheHome;
  cachedConfigurations = /* @__PURE__ */ new Map();
  needsCaching(resource) {
    return !this.donotCacheResourcesWithSchemes.includes(resource.scheme);
  }
  read(key) {
    return this.getCachedConfiguration(key).read();
  }
  write(key, content) {
    return this.getCachedConfiguration(key).save(content);
  }
  remove(key) {
    return this.getCachedConfiguration(key).remove();
  }
  getCachedConfiguration({
    type,
    key
  }) {
    const k = `${type}:${key}`;
    let cachedConfiguration = this.cachedConfigurations.get(k);
    if (!cachedConfiguration) {
      cachedConfiguration = new CachedConfiguration(
        { type, key },
        this.cacheHome,
        this.fileService
      );
      this.cachedConfigurations.set(k, cachedConfiguration);
    }
    return cachedConfiguration;
  }
}
class CachedConfiguration {
  constructor({ type, key }, cacheHome, fileService) {
    this.fileService = fileService;
    this.cachedConfigurationFolderResource = joinPath(
      cacheHome,
      "CachedConfigurations",
      type,
      key
    );
    this.cachedConfigurationFileResource = joinPath(
      this.cachedConfigurationFolderResource,
      type === "workspaces" ? "workspace.json" : "configuration.json"
    );
    this.queue = new Queue();
  }
  static {
    __name(this, "CachedConfiguration");
  }
  queue;
  cachedConfigurationFolderResource;
  cachedConfigurationFileResource;
  async read() {
    try {
      const content = await this.fileService.readFile(
        this.cachedConfigurationFileResource
      );
      return content.value.toString();
    } catch (e) {
      return "";
    }
  }
  async save(content) {
    const created = await this.createCachedFolder();
    if (created) {
      await this.queue.queue(async () => {
        await this.fileService.writeFile(
          this.cachedConfigurationFileResource,
          VSBuffer.fromString(content)
        );
      });
    }
  }
  async remove() {
    try {
      await this.queue.queue(
        () => this.fileService.del(this.cachedConfigurationFolderResource, {
          recursive: true,
          useTrash: false
        })
      );
    } catch (error) {
      if (error.fileOperationResult !== FileOperationResult.FILE_NOT_FOUND) {
        throw error;
      }
    }
  }
  async createCachedFolder() {
    if (await this.fileService.exists(
      this.cachedConfigurationFolderResource
    )) {
      return true;
    }
    try {
      await this.fileService.createFolder(
        this.cachedConfigurationFolderResource
      );
      return true;
    } catch (error) {
      return false;
    }
  }
}
export {
  ConfigurationCache
};
//# sourceMappingURL=configurationCache.js.map
