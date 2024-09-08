import type { CancellationToken } from "../../../base/common/cancellation.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { ILanguageModelToolsService, type IToolData, type IToolInvocation, type IToolResult } from "../../contrib/chat/common/languageModelToolsService.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadLanguageModelToolsShape } from "../common/extHost.protocol.js";
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
