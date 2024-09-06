import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
export declare const IRemoteExtensionsScannerService: any;
export declare const RemoteExtensionsScannerChannelName = "remoteExtensionsScanner";
export interface IRemoteExtensionsScannerService {
    readonly _serviceBrand: undefined;
    whenExtensionsReady(): Promise<void>;
    scanExtensions(): Promise<IExtensionDescription[]>;
}
