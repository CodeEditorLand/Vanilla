import { IExtensionManifest } from "vs/platform/extensions/common/extensions";
import { ILogger } from "vs/platform/log/common/log";
export interface ITranslations {
    [key: string]: string | {
        message: string;
        comment: string[];
    } | undefined;
}
export declare function localizeManifest(logger: ILogger, extensionManifest: IExtensionManifest, translations: ITranslations, fallbackTranslations?: ITranslations): IExtensionManifest;
