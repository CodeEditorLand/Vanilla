import type * as vscode from "vscode";
import type { CancellationToken } from "../../../base/common/cancellation.js";
import { type IDisposable } from "../../../base/common/lifecycle.js";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import type { IChatRequestVariableValue } from "../../contrib/chat/common/chatVariables.js";
import { type ExtHostChatVariablesShape, type IMainContext } from "./extHost.protocol.js";
export declare class ExtHostChatVariables implements ExtHostChatVariablesShape {
    private static _idPool;
    private readonly _resolver;
    private readonly _proxy;
    constructor(mainContext: IMainContext);
    $resolveVariable(handle: number, requestId: string, messageText: string, token: CancellationToken): Promise<IChatRequestVariableValue | undefined>;
    registerVariableResolver(extension: IExtensionDescription, id: string, name: string, userDescription: string, modelDescription: string | undefined, isSlow: boolean | undefined, resolver: vscode.ChatVariableResolver, fullName?: string, themeIconId?: string): IDisposable;
}
