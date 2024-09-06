import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable } from "vs/base/common/lifecycle";
import { MainThreadLanguageModelToolsShape } from "vs/workbench/api/common/extHost.protocol";
import { ILanguageModelToolsService, IToolData, IToolInvocation, IToolResult } from "vs/workbench/contrib/chat/common/languageModelToolsService";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class MainThreadLanguageModelTools extends Disposable implements MainThreadLanguageModelToolsShape {
    private readonly _languageModelToolsService;
    private readonly _proxy;
    private readonly _tools;
    private readonly _countTokenCallbacks;
    constructor(extHostContext: IExtHostContext, _languageModelToolsService: ILanguageModelToolsService);
    $getTools(): Promise<IToolData[]>;
    $invokeTool(dto: IToolInvocation, token: CancellationToken): Promise<IToolResult>;
    $countTokensForInvocation(callId: string, input: string, token: CancellationToken): Promise<number>;
    $registerTool(name: string): void;
    $unregisterTool(name: string): void;
}
