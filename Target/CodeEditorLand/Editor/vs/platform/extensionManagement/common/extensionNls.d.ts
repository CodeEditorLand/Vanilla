import type { IExtensionManifest } from "../../extensions/common/extensions.js";
import type { ILogger } from "../../log/common/log.js";
export interface ITranslations {
    [key: string]: string | {
        message: string;
        comment: string[];
    } | undefined;
}
export declare function localizeManifest(logger: ILogger, extensionManifest: IExtensionManifest, translations: ITranslations, fallbackTranslations?: ITranslations): IExtensionManifest;
