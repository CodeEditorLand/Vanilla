import { type Event } from "../../../base/common/event.js";
import type { ICodeEditor } from "../../../editor/browser/editorBrowser.js";
import type { ISingleEditOperation } from "../../../editor/common/core/editOperation.js";
import { Range, type IRange } from "../../../editor/common/core/range.js";
import { Selection, type ISelection } from "../../../editor/common/core/selection.js";
import { type IDecorationOptions } from "../../../editor/common/editorCommon.js";
import type { ITextModel } from "../../../editor/common/model.js";
import type { IModelService } from "../../../editor/common/services/model.js";
import type { IClipboardService } from "../../../platform/clipboard/common/clipboardService.js";
import type { IEditorPane } from "../../common/editor.js";
import { TextEditorRevealType, type IApplyEditsOptions, type IEditorPropertiesChangeData, type IResolvedTextEditorConfiguration, type ITextEditorConfigurationUpdate, type IUndoStopOptions } from "../common/extHost.protocol.js";
import type { MainThreadDocuments } from "./mainThreadDocuments.js";
export interface IFocusTracker {
    onGainedFocus(): void;
    onLostFocus(): void;
}
export declare class MainThreadTextEditorProperties {
    readonly selections: Selection[];
    readonly options: IResolvedTextEditorConfiguration;
    readonly visibleRanges: Range[];
    static readFromEditor(previousProperties: MainThreadTextEditorProperties | null, model: ITextModel, codeEditor: ICodeEditor | null): MainThreadTextEditorProperties;
    private static _readSelectionsFromCodeEditor;
    private static _readOptionsFromCodeEditor;
    private static _readVisibleRangesFromCodeEditor;
    constructor(selections: Selection[], options: IResolvedTextEditorConfiguration, visibleRanges: Range[]);
    generateDelta(oldProps: MainThreadTextEditorProperties | null, selectionChangeSource: string | null): IEditorPropertiesChangeData | null;
    private static _selectionsEqual;
    private static _rangesEqual;
    private static _optionsEqual;
}
/**
 * Text Editor that is permanently bound to the same model.
 * It can be bound or not to a CodeEditor.
 */
export declare class MainThreadTextEditor {
    private readonly _id;
    private readonly _model;
    private readonly _mainThreadDocuments;
    private readonly _modelService;
    private readonly _clipboardService;
    private readonly _modelListeners;
    private _codeEditor;
    private readonly _focusTracker;
    private readonly _codeEditorListeners;
    private _properties;
    private readonly _onPropertiesChanged;
    constructor(id: string, model: ITextModel, codeEditor: ICodeEditor, focusTracker: IFocusTracker, mainThreadDocuments: MainThreadDocuments, modelService: IModelService, clipboardService: IClipboardService);
    dispose(): void;
    private _updatePropertiesNow;
    private _setProperties;
    getId(): string;
    getModel(): ITextModel;
    getCodeEditor(): ICodeEditor | null;
    hasCodeEditor(codeEditor: ICodeEditor | null): boolean;
    setCodeEditor(codeEditor: ICodeEditor | null): void;
    isVisible(): boolean;
    getProperties(): MainThreadTextEditorProperties;
    get onPropertiesChanged(): Event<IEditorPropertiesChangeData>;
    setSelections(selections: ISelection[]): void;
    private _setIndentConfiguration;
    setConfiguration(newConfiguration: ITextEditorConfigurationUpdate): void;
    setDecorations(key: string, ranges: IDecorationOptions[]): void;
    setDecorationsFast(key: string, _ranges: number[]): void;
    revealRange(range: IRange, revealType: TextEditorRevealType): void;
    isFocused(): boolean;
    matches(editor: IEditorPane): boolean;
    applyEdits(versionIdCheck: number, edits: ISingleEditOperation[], opts: IApplyEditsOptions): boolean;
    insertSnippet(modelVersionId: number, template: string, ranges: readonly IRange[], opts: IUndoStopOptions): Promise<boolean>;
}
