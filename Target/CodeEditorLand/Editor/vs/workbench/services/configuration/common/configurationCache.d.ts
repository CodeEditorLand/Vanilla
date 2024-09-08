import type { URI } from "../../../../base/common/uri.js";
import type { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { type IFileService } from "../../../../platform/files/common/files.js";
import type { ConfigurationKey, IConfigurationCache } from "./configuration.js";
export declare class ConfigurationCache implements IConfigurationCache {
    private readonly donotCacheResourcesWithSchemes;
    private readonly fileService;
    private readonly cacheHome;
    private readonly cachedConfigurations;
    constructor(donotCacheResourcesWithSchemes: string[], environmentService: IEnvironmentService, fileService: IFileService);
    needsCaching(resource: URI): boolean;
    read(key: ConfigurationKey): Promise<string>;
    write(key: ConfigurationKey, content: string): Promise<void>;
    remove(key: ConfigurationKey): Promise<void>;
    private getCachedConfiguration;
}
