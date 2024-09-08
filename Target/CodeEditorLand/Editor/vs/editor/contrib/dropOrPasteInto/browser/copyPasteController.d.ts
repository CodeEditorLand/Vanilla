import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IProgressService } from "../../../../platform/progress/common/progress.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IBulkEditService } from "../../../browser/services/bulkEditService.js";
import { type IEditorContribution } from "../../../common/editorCommon.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
export declare const changePasteTypeCommandId = "editor.changePasteType";
export declare const pasteWidgetVisibleCtx: RawContextKey<boolean>;
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
