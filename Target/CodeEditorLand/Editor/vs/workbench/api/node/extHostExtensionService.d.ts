import { URI } from "vs/base/common/uri";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ExtensionActivationTimesBuilder } from "vs/workbench/api/common/extHostExtensionActivator";
import { AbstractExtHostExtensionService } from "vs/workbench/api/common/extHostExtensionService";
export declare class ExtHostExtensionService extends AbstractExtHostExtensionService {
    readonly extensionRuntime: any;
    protected _beforeAlmostReadyToRunExtensions(): Promise<void>;
    protected _getEntryPoint(extensionDescription: IExtensionDescription): string | undefined;
    protected _loadCommonJSModule<T>(extension: IExtensionDescription | null, module: URI, activationTimesBuilder: ExtensionActivationTimesBuilder): Promise<T>;
    $setRemoteEnvironment(env: {
        [key: string]: string | null;
    }): Promise<void>;
}
