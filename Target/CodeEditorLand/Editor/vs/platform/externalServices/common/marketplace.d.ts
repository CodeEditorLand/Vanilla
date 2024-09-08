import type { IHeaders } from "../../../base/parts/request/common/request.js";
import type { IConfigurationService } from "../../configuration/common/configuration.js";
import type { IEnvironmentService } from "../../environment/common/environment.js";
import type { IFileService } from "../../files/common/files.js";
import type { IProductService } from "../../product/common/productService.js";
import type { IStorageService } from "../../storage/common/storage.js";
import { type ITelemetryService } from "../../telemetry/common/telemetry.js";
export declare function resolveMarketplaceHeaders(version: string, productService: IProductService, environmentService: IEnvironmentService, configurationService: IConfigurationService, fileService: IFileService, storageService: IStorageService | undefined, telemetryService: ITelemetryService): Promise<IHeaders>;
