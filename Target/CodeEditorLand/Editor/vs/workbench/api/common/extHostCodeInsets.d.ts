import type * as vscode from "vscode";
import type { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { type WebviewRemoteInfo } from "../../contrib/webview/common/webview.js";
import type { ExtHostEditorInsetsShape, MainThreadEditorInsetsShape } from "./extHost.protocol.js";
import type { ExtHostEditors } from "./extHostTextEditors.js";
export declare class ExtHostEditorInsets implements ExtHostEditorInsetsShape {
    private readonly _proxy;
    private readonly _editors;
    private readonly _remoteInfo;
    private _handlePool;
    private readonly _disposables;
    private _insets;
    constructor(_proxy: MainThreadEditorInsetsShape, _editors: ExtHostEditors, _remoteInfo: WebviewRemoteInfo);
    dispose(): void;
    createWebviewEditorInset(editor: vscode.TextEditor, line: number, height: number, options: vscode.WebviewOptions | undefined, extension: IExtensionDescription): vscode.WebviewEditorInset;
    $onDidDispose(handle: number): void;
    $onDidReceiveMessage(handle: number, message: any): void;
}
