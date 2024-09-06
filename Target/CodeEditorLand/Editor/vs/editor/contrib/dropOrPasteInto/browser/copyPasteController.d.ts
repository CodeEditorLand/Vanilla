import { HierarchicalKind } from "vs/base/common/hierarchicalKind";
import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IBulkEditService } from "vs/editor/browser/services/bulkEditService";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IProgressService } from "vs/platform/progress/common/progress";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
export declare const changePasteTypeCommandId = "editor.changePasteType";
export declare const pasteWidgetVisibleCtx: any;
type PastePreference = HierarchicalKind | {
    providerId: string;
};
export declare class CopyPasteController extends Disposable implements IEditorContribution {
    private readonly _bulkEditService;
    private readonly _clipboardService;
    private readonly _languageFeaturesService;
    private readonly _quickInputService;
    private readonly _progressService;
    static readonly ID = "editor.contrib.copyPasteActionController";
    static get(editor: ICodeEditor): CopyPasteController | null;
    /**
     * Global tracking the last copy operation.
     *
     * This is shared across all editors so that you can copy and paste between groups.
     *
     * TODO: figure out how to make this work with multiple windows
     */
    private static _currentCopyOperation?;
    private readonly _editor;
    private _currentPasteOperation?;
    private _pasteAsActionContext?;
    private readonly _pasteProgressManager;
    private readonly _postPasteWidgetManager;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, _bulkEditService: IBulkEditService, _clipboardService: IClipboardService, _languageFeaturesService: ILanguageFeaturesService, _quickInputService: IQuickInputService, _progressService: IProgressService);
    changePasteType(): void;
    pasteAs(preferred?: PastePreference): void;
    clearWidgets(): void;
    private isPasteAsEnabled;
    finishedPaste(): Promise<void>;
    private handleCopy;
    private handlePaste;
    private showPasteAsNoEditMessage;
    private doPasteInline;
    private showPasteAsPick;
    private setCopyMetadata;
    private fetchCopyMetadata;
    private mergeInDataFromCopy;
    private getPasteEdits;
    private applyDefaultPasteHandler;
    /**
     * Filter out providers if they:
     * - Don't handle any of the data transfer types we have
     * - Don't match the preferred paste kind
     */
    private isSupportedPasteProvider;
    private providerMatchesPreference;
}
export {};
