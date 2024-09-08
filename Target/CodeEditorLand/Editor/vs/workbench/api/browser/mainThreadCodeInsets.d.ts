import { type UriComponents } from "../../../base/common/uri.js";
import { ICodeEditorService } from "../../../editor/browser/services/codeEditorService.js";
import type { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { IWebviewService } from "../../contrib/webview/browser/webview.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type IWebviewContentOptions, type MainThreadEditorInsetsShape } from "../common/extHost.protocol.js";
export declare class MainThreadEditorInsets implements MainThreadEditorInsetsShape {
    private readonly _editorService;
    private readonly _webviewService;
    private readonly _proxy;
    private readonly _disposables;
    private readonly _insets;
    constructor(context: IExtHostContext, _editorService: ICodeEditorService, _webviewService: IWebviewService);
    dispose(): void;
    $createEditorInset(handle: number, id: string, uri: UriComponents, line: number, height: number, options: IWebviewContentOptions, extensionId: ExtensionIdentifier, extensionLocation: UriComponents): Promise<void>;
    $disposeEditorInset(handle: number): void;
    $setHtml(handle: number, value: string): void;
    $setOptions(handle: number, options: IWebviewContentOptions): void;
    $postMessage(handle: number, value: any): Promise<boolean>;
    private getInset;
}
