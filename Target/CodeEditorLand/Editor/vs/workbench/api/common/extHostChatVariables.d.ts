import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ExtHostChatVariablesShape, IMainContext } from "vs/workbench/api/common/extHost.protocol";
import { IChatRequestVariableValue } from "vs/workbench/contrib/chat/common/chatVariables";
import type * as vscode from "vscode";
export declare class ExtHostChatVariables implements ExtHostChatVariablesShape {
    private static _idPool;
    private readonly _resolver;
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    $resolveVariable(handle: number, requestId: string, messageText: string, token: CancellationToken): Promise<IChatRequestVariableValue | undefined>;
    registerVariableResolver(extension: IExtensionDescription, id: string, name: string, userDescription: string, modelDescription: string | undefined, isSlow: boolean | undefined, resolver: vscode.ChatVariableResolver, fullName?: string, themeIconId?: string): IDisposable;
}
