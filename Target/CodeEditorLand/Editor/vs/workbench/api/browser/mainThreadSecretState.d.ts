import { Disposable } from "vs/base/common/lifecycle";
import { ILogService } from "vs/platform/log/common/log";
import { ISecretStorageService } from "vs/platform/secrets/common/secrets";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { MainThreadSecretStateShape } from "../common/extHost.protocol";
export declare class MainThreadSecretState extends Disposable implements MainThreadSecretStateShape {
    private readonly secretStorageService;
    private readonly logService;
    private readonly _proxy;
    private readonly _sequencer;
    constructor(extHostContext: IExtHostContext, secretStorageService: ISecretStorageService, logService: ILogService, environmentService: IBrowserWorkbenchEnvironmentService);
    $getPassword(extensionId: string, key: string): Promise<string | undefined>;
    private doGetPassword;
    $setPassword(extensionId: string, key: string, value: string): Promise<void>;
    private doSetPassword;
    $deletePassword(extensionId: string, key: string): Promise<void>;
    private doDeletePassword;
    private getKey;
    private parseKey;
}
