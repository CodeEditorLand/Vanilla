import { Disposable } from "vs/base/common/lifecycle";
import { type MainThreadTerminalShellIntegrationShape } from "vs/workbench/api/common/extHost.protocol";
import { ITerminalService } from "vs/workbench/contrib/terminal/browser/terminal";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { type IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class MainThreadTerminalShellIntegration extends Disposable implements MainThreadTerminalShellIntegrationShape {
    private readonly _terminalService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _terminalService: ITerminalService, workbenchEnvironmentService: IWorkbenchEnvironmentService);
    $executeCommand(terminalId: number, commandLine: string): void;
    private _convertCwdToUri;
}
