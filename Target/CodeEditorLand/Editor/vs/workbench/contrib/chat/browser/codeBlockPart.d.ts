import "vs/css!./codeBlockPart";
import { CancellationToken } from "vs/base/common/cancellation";
import { Disposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IDiffEditor } from "vs/editor/browser/editorBrowser";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { CodeEditorWidget } from "vs/editor/browser/widget/codeEditor/codeEditorWidget";
import { Range } from "vs/editor/common/core/range";
import { ITextModel } from "vs/editor/common/model";
import { IModelService } from "vs/editor/common/services/model";
import { IResolvedTextEditorModel, ITextModelContentProvider, ITextModelService } from "vs/editor/common/services/resolverService";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { MenuWorkbenchToolBar } from "vs/platform/actions/browser/toolbar";
import { MenuId } from "vs/platform/actions/common/actions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILabelService } from "vs/platform/label/common/label";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { ChatTreeItem } from "vs/workbench/contrib/chat/browser/chat";
import { IChatRendererDelegate } from "vs/workbench/contrib/chat/browser/chatListRenderer";
import { ChatEditorOptions } from "vs/workbench/contrib/chat/browser/chatOptions";
import { IChatResponseModel, IChatTextEditGroup } from "vs/workbench/contrib/chat/common/chatModel";
import { IChatResponseViewModel } from "vs/workbench/contrib/chat/common/chatViewModel";
import { IMarkdownVulnerability } from "../common/annotations";
export interface ICodeBlockData {
    readonly codeBlockIndex: number;
    readonly element: unknown;
    readonly textModel: Promise<IResolvedTextEditorModel>;
    readonly languageId: string;
    readonly vulns?: readonly IMarkdownVulnerability[];
    readonly range?: Range;
    readonly parentContextKeyService?: IContextKeyService;
    readonly hideToolbar?: boolean;
}
/**
 * Special markdown code block language id used to render a local file.
 *
 * The text of the code path should be a {@link LocalFileCodeBlockData} json object.
 */
export declare const localFileLanguageId = "vscode-local-file";
export declare function parseLocalFileData(text: string): {
    uri: URI;
    range: any;
};
export interface ICodeBlockActionContext {
    code: string;
    languageId?: string;
    codeBlockIndex: number;
    element: unknown;
}
export declare class CodeBlockPart extends Disposable {
    private readonly options;
    readonly menuId: MenuId;
    protected readonly modelService: IModelService;
    private readonly configurationService;
    private readonly accessibilityService;
    protected readonly _onDidChangeContentHeight: any;
    readonly onDidChangeContentHeight: any;
    readonly editor: CodeEditorWidget;
    protected readonly toolbar: MenuWorkbenchToolBar;
    private readonly contextKeyService;
    readonly element: HTMLElement;
    private readonly vulnsButton;
    private readonly vulnsListElement;
    private currentCodeBlockData;
    private currentScrollWidth;
    private readonly disposableStore;
    private isDisposed;
    private resourceContextKey;
    constructor(options: ChatEditorOptions, menuId: MenuId, delegate: IChatRendererDelegate, overflowWidgetsDomNode: HTMLElement | undefined, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, modelService: IModelService, configurationService: IConfigurationService, accessibilityService: IAccessibilityService);
    dispose(): void;
    get uri(): URI | undefined;
    private createEditor;
    focus(): void;
    private updatePaddingForLayout;
    private _configureForScreenReader;
    private getEditorOptionsFromConfig;
    layout(width: number): void;
    private getContentHeight;
    render(data: ICodeBlockData, width: number, editable: boolean | undefined): Promise<void>;
    reset(): void;
    private clearWidgets;
    private updateEditor;
    private getVulnerabilitiesLabel;
}
export declare class ChatCodeBlockContentProvider extends Disposable implements ITextModelContentProvider {
    private readonly _modelService;
    constructor(textModelService: ITextModelService, _modelService: IModelService);
    provideTextContent(resource: URI): Promise<ITextModel | null>;
}
export interface ICodeCompareBlockActionContext {
    readonly element: IChatResponseViewModel;
    readonly diffEditor: IDiffEditor;
    readonly edit: IChatTextEditGroup;
}
export interface ICodeCompareBlockDiffData {
    modified: ITextModel;
    original: ITextModel;
    originalSha1: string;
}
export interface ICodeCompareBlockData {
    readonly element: ChatTreeItem;
    readonly edit: IChatTextEditGroup;
    readonly diffData: Promise<ICodeCompareBlockDiffData | undefined>;
    readonly parentContextKeyService?: IContextKeyService;
}
export declare class CodeCompareBlockPart extends Disposable {
    private readonly options;
    readonly menuId: MenuId;
    protected readonly modelService: IModelService;
    private readonly configurationService;
    private readonly accessibilityService;
    private readonly labelService;
    private readonly openerService;
    protected readonly _onDidChangeContentHeight: any;
    readonly onDidChangeContentHeight: any;
    private readonly contextKeyService;
    private readonly diffEditor;
    private readonly resourceLabel;
    private readonly toolbar;
    readonly element: HTMLElement;
    private readonly messageElement;
    private readonly _lastDiffEditorViewModel;
    private currentScrollWidth;
    constructor(options: ChatEditorOptions, menuId: MenuId, delegate: IChatRendererDelegate, overflowWidgetsDomNode: HTMLElement | undefined, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, modelService: IModelService, configurationService: IConfigurationService, accessibilityService: IAccessibilityService, labelService: ILabelService, openerService: IOpenerService);
    get uri(): URI | undefined;
    private createDiffEditor;
    focus(): void;
    private updatePaddingForLayout;
    private _configureForScreenReader;
    private getEditorOptionsFromConfig;
    layout(width: number): void;
    private getContentHeight;
    render(data: ICodeCompareBlockData, width: number, token: CancellationToken): Promise<void>;
    reset(): void;
    private clearWidgets;
    private updateEditor;
}
export declare class DefaultChatTextEditor {
    private readonly modelService;
    private readonly editorService;
    private readonly dialogService;
    private readonly _sha1;
    constructor(modelService: ITextModelService, editorService: ICodeEditorService, dialogService: IDialogService);
    apply(response: IChatResponseModel | IChatResponseViewModel, item: IChatTextEditGroup, diffEditor: IDiffEditor | undefined): Promise<void>;
    private _applyWithDiffEditor;
    private _apply;
    private _checkSha1;
    discard(response: IChatResponseModel | IChatResponseViewModel, item: IChatTextEditGroup): void;
}
