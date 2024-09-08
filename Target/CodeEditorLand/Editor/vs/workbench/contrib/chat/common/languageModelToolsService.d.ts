import type { CancellationToken } from "../../../../base/common/cancellation.js";
import { type Event } from "../../../../base/common/event.js";
import type { IJSONSchema } from "../../../../base/common/jsonSchema.js";
import { Disposable, type IDisposable } from "../../../../base/common/lifecycle.js";
import type { ThemeIcon } from "../../../../base/common/themables.js";
import type { URI } from "../../../../base/common/uri.js";
import { type ContextKeyExpression, IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
export interface IToolData {
    id: string;
    name?: string;
    icon?: {
        dark: URI;
        light?: URI;
    } | ThemeIcon;
    when?: ContextKeyExpression;
    displayName?: string;
    userDescription?: string;
    modelDescription: string;
    parametersSchema?: IJSONSchema;
    canBeInvokedManually?: boolean;
}
export interface IToolInvocation {
    callId: string;
    toolId: string;
    parameters: any;
    tokenBudget?: number;
}
export interface IToolResult {
    [contentType: string]: any;
    string: string;
}
export interface IToolImpl {
    invoke(dto: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
}
export declare const ILanguageModelToolsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageModelToolsService>;
export type CountTokensCallback = (input: string, token: CancellationToken) => Promise<number>;
export interface ILanguageModelToolsService {
    _serviceBrand: undefined;
    onDidChangeTools: Event<void>;
    registerToolData(toolData: IToolData): IDisposable;
    registerToolImplementation(name: string, tool: IToolImpl): IDisposable;
    getTools(): Iterable<Readonly<IToolData>>;
    getTool(id: string): IToolData | undefined;
    getToolByName(name: string): IToolData | undefined;
    invokeTool(dto: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
}
export declare class LanguageModelToolsService extends Disposable implements ILanguageModelToolsService {
    private readonly _extensionService;
    private readonly _contextKeyService;
    _serviceBrand: undefined;
    private _onDidChangeTools;
    readonly onDidChangeTools: Event<void>;
    /** Throttle tools updates because it sends all tools and runs on context key updates */
    private _onDidChangeToolsScheduler;
    private _tools;
    private _toolContextKeys;
    constructor(_extensionService: IExtensionService, _contextKeyService: IContextKeyService);
    registerToolData(toolData: IToolData): IDisposable;
    private _refreshAllToolContextKeys;
    registerToolImplementation(name: string, tool: IToolImpl): IDisposable;
    getTools(): Iterable<Readonly<IToolData>>;
    getTool(id: string): IToolData | undefined;
    private _getToolEntry;
    getToolByName(name: string): IToolData | undefined;
    invokeTool(dto: IToolInvocation, countTokens: CountTokensCallback, token: CancellationToken): Promise<IToolResult>;
}
