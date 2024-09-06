import { CancellationToken } from "vs/base/common/cancellation";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IPosition, Position } from "vs/editor/common/core/position";
import { IRange } from "vs/editor/common/core/range";
import { ISelection } from "vs/editor/common/core/selection";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { TextEdit } from "vs/editor/common/languages";
import { IEditorWorkerService } from "vs/editor/common/services/editorWorker";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IChatService } from "vs/workbench/contrib/chat/common/chatService";
import { HunkInformation, Session } from "vs/workbench/contrib/inlineChat/browser/inlineChatSession";
import { INotebookEditorService } from "vs/workbench/contrib/notebook/browser/services/notebookEditorService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IInlineChatSavingService } from "./inlineChatSavingService";
import { IInlineChatSessionService } from "./inlineChatSessionService";
export declare const enum State {
    CREATE_SESSION = "CREATE_SESSION",
    INIT_UI = "INIT_UI",
    WAIT_FOR_INPUT = "WAIT_FOR_INPUT",
    SHOW_REQUEST = "SHOW_REQUEST",
    PAUSE = "PAUSE",
    CANCEL = "CANCEL",
    ACCEPT = "DONE"
}
export declare abstract class InlineChatRunOptions {
    initialSelection?: ISelection;
    initialRange?: IRange;
    message?: string;
    autoSend?: boolean;
    existingSession?: Session;
    isUnstashed?: boolean;
    position?: IPosition;
    withIntentDetection?: boolean;
    headless?: boolean;
    static isInlineChatRunOptions(options: any): options is InlineChatRunOptions;
}
export declare class InlineChatController implements IEditorContribution {
    private readonly _editor;
    private readonly _instaService;
    private readonly _inlineChatSessionService;
    private readonly _inlineChatSavingService;
    private readonly _editorWorkerService;
    private readonly _logService;
    private readonly _configurationService;
    private readonly _dialogService;
    private readonly _chatService;
    private readonly _editorService;
    static get(editor: ICodeEditor): any;
    private _isDisposed;
    private readonly _store;
    private readonly _ui;
    private readonly _ctxVisible;
    private readonly _ctxEditing;
    private readonly _ctxResponseType;
    private readonly _ctxUserDidEdit;
    private readonly _ctxRequestInProgress;
    private readonly _ctxSupportsReportIssue;
    private readonly _messages;
    protected readonly _onDidEnterState: any;
    readonly onDidEnterState: any;
    private readonly _onWillStartSession;
    readonly onWillStartSession: any;
    get chatWidget(): any;
    private readonly _sessionStore;
    private readonly _stashedSession;
    private _session?;
    private _strategy?;
    constructor(_editor: ICodeEditor, _instaService: IInstantiationService, _inlineChatSessionService: IInlineChatSessionService, _inlineChatSavingService: IInlineChatSavingService, _editorWorkerService: IEditorWorkerService, _logService: ILogService, _configurationService: IConfigurationService, _dialogService: IDialogService, contextKeyService: IContextKeyService, _chatService: IChatService, _editorService: IEditorService, notebookEditorService: INotebookEditorService);
    dispose(): void;
    private _log;
    getMessage(): string | undefined;
    getId(): string;
    private _getMode;
    getWidgetPosition(): Position | undefined;
    private _currentRun?;
    run(options?: InlineChatRunOptions | undefined): Promise<void>;
    protected _nextState(state: State, options: InlineChatRunOptions): Promise<void>;
    private [State.CREATE_SESSION];
    private [State.INIT_UI];
    private [State.WAIT_FOR_INPUT];
    private [State.SHOW_REQUEST];
    private [State.PAUSE];
    private [State.ACCEPT];
    private [State.CANCEL];
    private _showWidget;
    private _resetWidget;
    private _updateCtxResponseType;
    private _createChatTextEditGroupState;
    private _makeChanges;
    private _forcedPlaceholder;
    private _updatePlaceholder;
    private _getPlaceholderText;
    showSaveHint(): void;
    acceptInput(): any;
    updateInput(text: string, selectAll?: boolean): void;
    cancelCurrentRequest(): void;
    arrowOut(up: boolean): void;
    focus(): void;
    hasFocus(): boolean;
    viewInChat(): Promise<void>;
    acceptSession(): void;
    acceptHunk(hunkInfo?: HunkInformation): any;
    discardHunk(hunkInfo?: HunkInformation): any;
    toggleDiff(hunkInfo?: HunkInformation): any;
    moveHunk(next: boolean): void;
    cancelSession(): Promise<void>;
    finishExistingSession(): void;
    reportIssue(): void;
    unstashLastSession(): Session | undefined;
    joinCurrentRun(): Promise<void> | undefined;
    reviewEdits(anchor: IRange, stream: AsyncIterable<TextEdit>, token: CancellationToken): Promise<boolean>;
}
