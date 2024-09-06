import { CodeWindow } from "vs/base/browser/window";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { EditorInputCapabilities, GroupIdentifier, IUntypedEditorInput, Verbosity } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IOverlayWebview } from "vs/workbench/contrib/webview/browser/webview";
import { WebviewIconManager, WebviewIcons } from "vs/workbench/contrib/webviewPanel/browser/webviewIconManager";
export interface WebviewInputInitInfo {
    readonly viewType: string;
    readonly providedId: string | undefined;
    readonly name: string;
}
export declare class WebviewInput extends EditorInput {
    private readonly _iconManager;
    static typeId: string;
    get typeId(): string;
    get editorId(): string;
    get capabilities(): EditorInputCapabilities;
    private readonly _resourceId;
    private _name;
    private _iconPath?;
    private _group?;
    private _webview;
    private _hasTransfered;
    get resource(): any;
    readonly viewType: string;
    readonly providedId: string | undefined;
    constructor(init: WebviewInputInitInfo, webview: IOverlayWebview, _iconManager: WebviewIconManager);
    dispose(): void;
    getName(): string;
    getTitle(_verbosity?: Verbosity): string;
    getDescription(): string | undefined;
    setName(value: string): void;
    get webview(): IOverlayWebview;
    get extension(): any;
    get iconPath(): WebviewIcons | undefined;
    set iconPath(value: WebviewIcons | undefined);
    matches(other: EditorInput | IUntypedEditorInput): boolean;
    get group(): GroupIdentifier | undefined;
    updateGroup(group: GroupIdentifier): void;
    protected transfer(other: WebviewInput): WebviewInput | undefined;
    claim(claimant: unknown, targetWindow: CodeWindow, scopedContextKeyService: IContextKeyService | undefined): void;
}
