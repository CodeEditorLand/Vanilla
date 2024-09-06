import { Disposable } from "vs/base/common/lifecycle";
import { IConfirmation, IConfirmationResult, IDialogService, IInput, IInputResult, IPrompt, IPromptResult, IPromptResultWithCancel, IPromptWithCustomCancel, IPromptWithDefaultCancel } from "vs/platform/dialogs/common/dialogs";
import { ILogService } from "vs/platform/log/common/log";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
export declare class DialogService extends Disposable implements IDialogService {
    private readonly environmentService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    readonly model: any;
    readonly onWillShowDialog: any;
    readonly onDidShowDialog: any;
    constructor(environmentService: IWorkbenchEnvironmentService, logService: ILogService);
    private skipDialogs;
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    prompt<T>(prompt: IPromptWithCustomCancel<T>): Promise<IPromptResultWithCancel<T>>;
    prompt<T>(prompt: IPromptWithDefaultCancel<T>): Promise<IPromptResult<T>>;
    prompt<T>(prompt: IPrompt<T>): Promise<IPromptResult<T>>;
    input(input: IInput): Promise<IInputResult>;
    info(message: string, detail?: string): Promise<void>;
    warn(message: string, detail?: string): Promise<void>;
    error(message: string, detail?: string): Promise<void>;
    about(): Promise<void>;
}
