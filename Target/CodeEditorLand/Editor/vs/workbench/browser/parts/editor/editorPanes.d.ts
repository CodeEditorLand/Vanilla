import { IDomNodePagePosition } from "vs/base/browser/dom";
import { IBoundarySashes } from "vs/base/browser/ui/sash/sash";
import { Disposable } from "vs/base/common/lifecycle";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IEditorProgressService } from "vs/platform/progress/common/progress";
import { IWorkspaceTrustManagementService } from "vs/platform/workspace/common/workspaceTrust";
import { IEditorGroupView, IInternalEditorOpenOptions } from "vs/workbench/browser/parts/editor/editor";
import { EditorPane } from "vs/workbench/browser/parts/editor/editorPane";
import { IEditorOpenContext, IVisibleEditorPane } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { IHostService } from "vs/workbench/services/host/browser/host";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
export interface IOpenEditorResult {
    /**
     * The editor pane used for opening. This can be a generic
     * placeholder in certain cases, e.g. when workspace trust
     * is required, or an editor fails to restore.
     *
     * Will be `undefined` if an error occurred while trying to
     * open the editor and in cases where no placeholder is being
     * used.
     */
    readonly pane?: EditorPane;
    /**
     * Whether the editor changed as a result of opening.
     */
    readonly changed?: boolean;
    /**
     * This property is set when an editor fails to restore and
     * is shown with a generic place holder. It allows callers
     * to still present the error to the user in that case.
     */
    readonly error?: Error;
    /**
     * This property indicates whether the open editor operation was
     * cancelled or not. The operation may have been cancelled
     * in case another editor open operation was triggered right
     * after cancelling this one out.
     */
    readonly cancelled?: boolean;
}
export declare class EditorPanes extends Disposable {
    private readonly editorGroupParent;
    private readonly editorPanesParent;
    private readonly groupView;
    private readonly layoutService;
    private readonly instantiationService;
    private readonly editorProgressService;
    private readonly workspaceTrustService;
    private readonly logService;
    private readonly dialogService;
    private readonly hostService;
    private readonly _onDidFocus;
    readonly onDidFocus: any;
    private _onDidChangeSizeConstraints;
    readonly onDidChangeSizeConstraints: any;
    get minimumWidth(): any;
    get minimumHeight(): any;
    get maximumWidth(): any;
    get maximumHeight(): any;
    private _activeEditorPane;
    get activeEditorPane(): IVisibleEditorPane | null;
    private readonly editorPanes;
    private readonly activeEditorPaneDisposables;
    private pagePosition;
    private boundarySashes;
    private readonly editorOperation;
    private readonly editorPanesRegistry;
    constructor(editorGroupParent: HTMLElement, editorPanesParent: HTMLElement, groupView: IEditorGroupView, layoutService: IWorkbenchLayoutService, instantiationService: IInstantiationService, editorProgressService: IEditorProgressService, workspaceTrustService: IWorkspaceTrustManagementService, logService: ILogService, dialogService: IDialogService, hostService: IHostService);
    private registerListeners;
    private onDidChangeWorkspaceTrust;
    openEditor(editor: EditorInput, options: IEditorOptions | undefined, internalOptions: IInternalEditorOpenOptions | undefined, context?: IEditorOpenContext): Promise<IOpenEditorResult>;
    private doShowError;
    private doShowErrorDialog;
    private doOpenEditor;
    private shouldRestoreFocus;
    private getEditorPaneDescriptor;
    private doShowEditorPane;
    private doCreateEditorPane;
    private doInstantiateEditorPane;
    private doSetActiveEditorPane;
    private doSetInput;
    private doHideActiveEditorPane;
    closeEditor(editor: EditorInput): void;
    setVisible(visible: boolean): void;
    layout(pagePosition: IDomNodePagePosition): void;
    setBoundarySashes(sashes: IBoundarySashes): void;
    private safeRun;
}
