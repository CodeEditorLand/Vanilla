import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { IURLHandler } from "vs/platform/url/common/url";
export declare const IExtensionUrlHandler: any;
export interface IExtensionContributedURLHandler extends IURLHandler {
    extensionDisplayName: string;
}
export interface IExtensionUrlHandler {
    readonly _serviceBrand: undefined;
    registerExtensionHandler(extensionId: ExtensionIdentifier, handler: IExtensionContributedURLHandler): void;
    unregisterExtensionHandler(extensionId: ExtensionIdentifier): void;
}
export interface ExtensionUrlHandlerEvent {
    readonly extensionId: string;
}
