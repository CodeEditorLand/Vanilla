import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IShellLaunchConfig, ITerminalBackend, ITerminalProfile, TerminalLocation } from "vs/platform/terminal/common/terminal";
import { ITerminalInstance, ITerminalInstanceService } from "vs/workbench/contrib/terminal/browser/terminal";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
export declare class TerminalInstanceService extends Disposable implements ITerminalInstanceService {
    private readonly _instantiationService;
    private readonly _contextKeyService;
    _serviceBrand: undefined;
    private _terminalShellTypeContextKey;
    private _terminalInRunCommandPicker;
    private _backendRegistration;
    private readonly _onDidCreateInstance;
    get onDidCreateInstance(): Event<ITerminalInstance>;
    constructor(_instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, environmentService: IWorkbenchEnvironmentService);
    createInstance(profile: ITerminalProfile, target: TerminalLocation): ITerminalInstance;
    createInstance(shellLaunchConfig: IShellLaunchConfig, target: TerminalLocation): ITerminalInstance;
    convertProfileToShellLaunchConfig(shellLaunchConfigOrProfile?: IShellLaunchConfig | ITerminalProfile, cwd?: string | URI): IShellLaunchConfig;
    getBackend(remoteAuthority?: string): Promise<ITerminalBackend | undefined>;
    getRegisteredBackends(): IterableIterator<ITerminalBackend>;
    didRegisterBackend(remoteAuthority?: string): void;
}
