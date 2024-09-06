import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ISingleEditOperation } from "vs/editor/common/core/editOperation";
import { Position } from "vs/editor/common/core/position";
import { IModelDeltaDecoration } from "vs/editor/common/model";
import { IEditorWorkerService } from "vs/editor/common/services/editorWorker";
import { IModelService } from "vs/editor/common/services/model";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { HunkInformation, Session } from "vs/workbench/contrib/inlineChat/browser/inlineChatSession";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
import { InlineChatZoneWidget } from "./inlineChatZoneWidget";
export interface IEditObserver {
    start(): void;
    stop(): void;
}
export declare const enum HunkAction {
    Accept = 0,
    Discard = 1,
    MoveNext = 2,
    MovePrev = 3,
    ToggleDiff = 4
}
export declare abstract class EditModeStrategy {
    protected readonly _session: Session;
    protected readonly _editor: ICodeEditor;
    protected readonly _zone: InlineChatZoneWidget;
    private readonly _textFileService;
    protected readonly _instaService: IInstantiationService;
    protected static _decoBlock: any;
    protected readonly _store: any;
    protected readonly _onDidAccept: any;
    protected readonly _onDidDiscard: any;
    readonly onDidAccept: Event<void>;
    readonly onDidDiscard: Event<void>;
    constructor(_session: Session, _editor: ICodeEditor, _zone: InlineChatZoneWidget, _textFileService: ITextFileService, _instaService: IInstantiationService);
    dispose(): void;
    performHunkAction(_hunk: HunkInformation | undefined, action: HunkAction): void;
    protected _doApplyChanges(ignoreLocal: boolean): Promise<void>;
    abstract apply(): Promise<void>;
    cancel(): any;
    abstract makeProgressiveChanges(edits: ISingleEditOperation[], obs: IEditObserver, timings: ProgressingEditsOptions, undoStopBefore: boolean): Promise<void>;
    abstract makeChanges(edits: ISingleEditOperation[], obs: IEditObserver, undoStopBefore: boolean): Promise<void>;
    abstract renderChanges(): Promise<Position | undefined>;
    abstract hasFocus(): boolean;
    getWholeRangeDecoration(): IModelDeltaDecoration[];
}
export declare class PreviewStrategy extends EditModeStrategy {
    private readonly _ctxDocumentChanged;
    constructor(session: Session, editor: ICodeEditor, zone: InlineChatZoneWidget, modelService: IModelService, contextKeyService: IContextKeyService, textFileService: ITextFileService, instaService: IInstantiationService);
    dispose(): void;
    apply(): Promise<void>;
    makeChanges(): Promise<void>;
    makeProgressiveChanges(): Promise<void>;
    renderChanges(): Promise<undefined>;
    hasFocus(): boolean;
}
export interface ProgressingEditsOptions {
    duration: number;
    token: CancellationToken;
}
export declare class LiveStrategy extends EditModeStrategy {
    private readonly _showOverlayToolbar;
    protected readonly _editorWorkerService: IEditorWorkerService;
    private readonly _accessibilityService;
    private readonly _configService;
    private readonly _decoInsertedText;
    private readonly _decoInsertedTextRange;
    private readonly _ctxCurrentChangeHasDiff;
    private readonly _ctxCurrentChangeShowsDiff;
    private readonly _progressiveEditingDecorations;
    private _editCount;
    constructor(session: Session, editor: ICodeEditor, zone: InlineChatZoneWidget, _showOverlayToolbar: boolean, contextKeyService: IContextKeyService, _editorWorkerService: IEditorWorkerService, _accessibilityService: IAccessibilityService, _configService: IConfigurationService, textFileService: ITextFileService, instaService: IInstantiationService);
    dispose(): void;
    private _resetDiff;
    apply(): Promise<void>;
    cancel(): any;
    makeChanges(edits: ISingleEditOperation[], obs: IEditObserver, undoStopBefore: boolean): Promise<void>;
    makeProgressiveChanges(edits: ISingleEditOperation[], obs: IEditObserver, opts: ProgressingEditsOptions, undoStopBefore: boolean): Promise<void>;
    private _makeChanges;
    performHunkAction(hunk: HunkInformation | undefined, action: HunkAction): void;
    private _findDisplayData;
    private readonly _hunkDisplayData;
    renderChanges(): Promise<any>;
    private _updateSummaryMessage;
    hasFocus(): boolean;
    getWholeRangeDecoration(): IModelDeltaDecoration[];
}
