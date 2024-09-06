import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ExtHostLanguageModelToolsShape, IMainContext, IToolDataDto } from "vs/workbench/api/common/extHost.protocol";
import { IToolInvocation, IToolResult } from "vs/workbench/contrib/chat/common/languageModelToolsService";
import type * as vscode from "vscode";
export declare class ExtHostLanguageModelTools implements ExtHostLanguageModelToolsShape {
    /** A map of tools that were registered in this EH */
    private readonly _registeredTools;
    private readonly _proxy;
    private readonly _tokenCountFuncs;
    /** A map of all known tools, from other EHs or registered in vscode core */
    private readonly _allTools;
    constructor(mainContext: IMainContext);
    $countTokensForInvocation(callId: string, input: string, token: CancellationToken): Promise<number>;
    invokeTool(toolId: string, options: vscode.LanguageModelToolInvocationOptions, token: CancellationToken): Promise<vscode.LanguageModelToolResult>;
    $onDidChangeTools(tools: IToolDataDto[]): void;
    get tools(): vscode.LanguageModelToolDescription[];
    $invokeTool(dto: IToolInvocation, token: CancellationToken): Promise<IToolResult>;
    registerTool(extension: IExtensionDescription, name: string, tool: vscode.LanguageModelTool): IDisposable;
}
