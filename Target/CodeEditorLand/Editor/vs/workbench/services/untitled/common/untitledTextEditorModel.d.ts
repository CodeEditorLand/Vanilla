import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextEditorModel } from "../../../../editor/common/services/resolverService.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { ISaveOptions } from "../../../common/editor.js";
import { BaseTextEditorModel } from "../../../common/editor/textEditorModel.js";
import { IEditorService } from "../../editor/common/editorService.js";
import { ILanguageDetectionService } from "../../languageDetection/common/languageDetectionWorkerService.js";
import { IEncodingSupport, ILanguageSupport, ITextFileService } from "../../textfile/common/textfiles.js";
import { IWorkingCopy, IWorkingCopyBackup, IWorkingCopySaveEvent, WorkingCopyCapabilities } from "../../workingCopy/common/workingCopy.js";
import { IWorkingCopyBackupService } from "../../workingCopy/common/workingCopyBackup.js";
import { IWorkingCopyService } from "../../workingCopy/common/workingCopyService.js";
export interface IUntitledTextEditorModel extends ITextEditorModel, ILanguageSupport, IEncodingSupport, IWorkingCopy {
    /**
     * Emits an event when the encoding of this untitled model changes.
     */
    readonly onDidChangeEncoding: Event<void>;
    /**
     * Emits an event when the name of this untitled model changes.
     */
    readonly onDidChangeName: Event<void>;
    /**
     * Emits an event when this untitled model is reverted.
     */
    readonly onDidRevert: Event<void>;
    /**
     * Whether this untitled text model has an associated file path.
     */
    readonly hasAssociatedFilePath: boolean;
    /**
     * Whether this model has an explicit language or not.
     */
    readonly hasLanguageSetExplicitly: boolean;
    /**
     * Sets the encoding to use for this untitled model.
     */
    setEncoding(encoding: string): Promise<void>;
    /**
     * Resolves the untitled model.
     */
    resolve(): Promise<void>;
}
export declare class UntitledTextEditorModel extends BaseTextEditorModel implements IUntitledTextEditorModel {
    readonly resource: URI;
    readonly hasAssociatedFilePath: boolean;
    private readonly initialValue;
    private preferredLanguageId;
    private preferredEncoding;
    private readonly workingCopyBackupService;
    private readonly textResourceConfigurationService;
    private readonly workingCopyService;
    private readonly textFileService;
    private readonly labelService;
    private readonly editorService;
    private static readonly FIRST_LINE_NAME_MAX_LENGTH;
    private static readonly FIRST_LINE_NAME_CANDIDATE_MAX_LENGTH;
    private static readonly ACTIVE_EDITOR_LANGUAGE_ID;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    private readonly _onDidChangeName;
    readonly onDidChangeName: Event<void>;
    private readonly _onDidChangeDirty;
    readonly onDidChangeDirty: Event<void>;
    private readonly _onDidChangeEncoding;
    readonly onDidChangeEncoding: Event<void>;
    private readonly _onDidSave;
    readonly onDidSave: Event<IWorkingCopySaveEvent>;
    private readonly _onDidRevert;
    readonly onDidRevert: Event<void>;
    readonly typeId = "";
    readonly capabilities = WorkingCopyCapabilities.Untitled;
    private configuredLabelFormat;
    private cachedModelFirstLineWords;
    get name(): string;
    constructor(resource: URI, hasAssociatedFilePath: boolean, initialValue: string | undefined, preferredLanguageId: string | undefined, preferredEncoding: string | undefined, languageService: ILanguageService, modelService: IModelService, workingCopyBackupService: IWorkingCopyBackupService, textResourceConfigurationService: ITextResourceConfigurationService, workingCopyService: IWorkingCopyService, textFileService: ITextFileService, labelService: ILabelService, editorService: IEditorService, languageDetectionService: ILanguageDetectionService, accessibilityService: IAccessibilityService);
    private registerListeners;
    private onConfigurationChange;
    setLanguageId(languageId: string, source?: string): void;
    getLanguageId(): string | undefined;
    private configuredEncoding;
    getEncoding(): string | undefined;
    setEncoding(encoding: string): Promise<void>;
    private dirty;
    isDirty(): boolean;
    isModified(): boolean;
    private setDirty;
    save(options?: ISaveOptions): Promise<boolean>;
    revert(): Promise<void>;
    backup(token: CancellationToken): Promise<IWorkingCopyBackup>;
    private ignoreDirtyOnModelContentChange;
    resolve(): Promise<void>;
    protected installModelListeners(model: ITextModel): void;
    private onModelContentChanged;
    private updateNameFromFirstLine;
    isReadonly(): boolean;
}
