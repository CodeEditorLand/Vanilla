import type { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import type { ITextResourcePropertiesService } from "../../../common/services/textResourceConfiguration.js";
export declare class TestTextResourcePropertiesService implements ITextResourcePropertiesService {
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    constructor(configurationService: IConfigurationService);
    getEOL(resource: URI, language?: string): string;
}
