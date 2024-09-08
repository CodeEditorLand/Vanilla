import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { URI } from "../../../../../../base/common/uri.js";
import type { IActiveCodeEditor } from "../../../../../../editor/browser/editorBrowser.js";
import type { ISingleEditOperation } from "../../../../../../editor/common/core/editOperation.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.js";
import { IEditorWorkerService } from "../../../../../../editor/common/services/editorWorker.js";
import { IModelService } from "../../../../../../editor/common/services/model.js";
import { IContextKeyService } from "../../../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../../../platform/storage/common/storage.js";
import type { IChatModel } from "../../../../chat/common/chatModel.js";
import { IChatService } from "../../../../chat/common/chatService.js";
import type { ProgressingEditsOptions } from "../../../../inlineChat/browser/inlineChatStrategies.js";
import { INotebookExecutionStateService } from "../../../common/notebookExecutionStateService.js";
import type { ICellViewModel, INotebookEditor, INotebookEditorContribution } from "../../notebookBrowser.js";
export interface INotebookCellTextModelLike {
    uri: URI;
    viewType: string;
}
export declare class NotebookChatController extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    private readonly _instantiationService;
    private readonly _contextKeyService;
    private readonly _editorWorkerService;
    private readonly _modelService;
    private readonly _languageService;
    private _executionStateService;
    private readonly _storageService;
    private readonly _chatService;
    static id: string;
    static counter: number;
    static get(editor: INotebookEditor): NotebookChatController | null;
    private static _storageKey;
    private static _promptHistory;
    private _historyOffset;
    private _historyCandidate;
    private _historyUpdate;
    private _promptCache;
    private readonly _onDidChangePromptCache;
    readonly onDidChangePromptCache: import("../../../../../../base/common/event.js").Event<{
        cell: URI;
    }>;
    private _strategy;
    private _sessionCtor;
    private _warmupRequestCts?;
    private _activeRequestCts?;
    private readonly _ctxHasActiveRequest;
    private readonly _ctxCellWidgetFocused;
    private readonly _ctxUserDidEdit;
    private readonly _ctxOuterFocusPosition;
    private readonly _userEditingDisposables;
    private readonly _widgetDisposableStore;
    private _focusTracker;
    private _widget;
    private readonly _model;
    constructor(_notebookEditor: INotebookEditor, _instantiationService: IInstantiationService, _contextKeyService: IContextKeyService, _editorWorkerService: IEditorWorkerService, _modelService: IModelService, _languageService: ILanguageService, _executionStateService: INotebookExecutionStateService, _storageService: IStorageService, _chatService: IChatService);
    private _registerFocusTracker;
    run(index: number, input: string | undefined, autoSend: boolean | undefined): void;
    restore(editingCell: ICellViewModel, input: string): void;
    private _disposeWidget;
    private _createWidget;
    private _startSession;
    private _scrollWidgetIntoView;
    private _focusWidget;
    private _updateNotebookEditorFocusNSelections;
    hasSession(chatModel: IChatModel): boolean;
    getSessionInputUri(): URI | undefined;
    acceptInput(): Promise<void>;
    private _makeChanges;
    private _updateUserEditingState;
    acceptSession(): Promise<void>;
    focusAbove(): Promise<void>;
    focusNext(): Promise<void>;
    hasFocus(): any;
    focus(): void;
    focusNearestWidget(index: number, direction: "above" | "below"): void;
    populateHistory(up: boolean): void;
    cancelCurrentRequest(discard: boolean): Promise<void>;
    getEditingCell(): ICellViewModel | null | undefined;
    discard(): void;
    dismiss(discard: boolean): void;
    isCellGeneratedByChat(cell: ICellViewModel): boolean;
    getPromptFromCache(cell: ICellViewModel): string | undefined;
    dispose(): void;
}
export declare class EditStrategy {
    private _editCount;
    constructor();
    makeProgressiveChanges(editor: IActiveCodeEditor, edits: ISingleEditOperation[], opts: ProgressingEditsOptions): Promise<void>;
    makeChanges(editor: IActiveCodeEditor, edits: ISingleEditOperation[]): Promise<void>;
}
