import { URI } from "vs/base/common/uri";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ExtensionActivationTimesBuilder } from "vs/workbench/api/common/extHostExtensionActivator";
import { AbstractExtHostExtensionService } from "vs/workbench/api/common/extHostExtensionService";
export declare class ExtHostExtensionService extends AbstractExtHostExtensionService {
    readonly extensionRuntime: any;
    private _fakeModules?;
    protected _beforeAlmostReadyToRunExtensions(): Promise<void>;
    protected _getEntryPoint(extensionDescription: IExtensionDescription): string | undefined;
    protected _loadCommonJSModule<T extends object | undefined>(extension: IExtensionDescription | null, module: URI, activationTimesBuilder: ExtensionActivationTimesBuilder): Promise<T>;
    $setRemoteEnvironment(_env: {
        [key: string]: string | null;
    }): Promise<void>;
    private _waitForDebuggerAttachment;
}
