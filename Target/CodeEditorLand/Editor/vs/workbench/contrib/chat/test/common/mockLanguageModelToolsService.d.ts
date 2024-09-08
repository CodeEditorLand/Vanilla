import type { CancellationToken } from "../../../../../base/common/cancellation.js";
import { Event } from "../../../../../base/common/event.js";
import { type IDisposable } from "../../../../../base/common/lifecycle.js";
import type { CountTokensCallback, ILanguageModelToolsService, IToolData, IToolImpl, IToolInvocation, IToolResult } from "../../common/languageModelToolsService.js";
export declare class MockLanguageModelToolsService implements ILanguageModelToolsService {
    _serviceBrand: undefined;
    constructor();
    onDidChangeTools: Event<void>;
    registerToolData(toolData: IToolData): IDisposable;
    registerToolImplementation(name: string, tool: IToolImpl): IDisposable;
    getTools(): Iterable<Readonly<IToolData>>;
    getTool(id: string): IToolData | undefined;
    getToolByName(name: string): IToolData | undefined;
    invokeTool(dto: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
}
