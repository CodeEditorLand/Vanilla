import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IEditorOptions as ICodeEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { ICodeEditorViewState } from "../../../../editor/common/editorCommon.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IEditorOpenContext } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { AbstractTextResourceEditorInput } from "../../../common/editor/textResourceEditorInput.js";
import { IEditorGroup, IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { AbstractTextCodeEditor } from "./textCodeEditor.js";
/**
 * An editor implementation that is capable of showing the contents of resource inputs. Uses
 * the TextEditor widget to show the contents.
 */
export declare abstract class AbstractTextResourceEditor extends AbstractTextCodeEditor<ICodeEditorViewState> {
    constructor(id: string, group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorGroupService: IEditorGroupsService, editorService: IEditorService, fileService: IFileService);
    setInput(input: AbstractTextResourceEditorInput, options: ITextEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    /**
     * Reveals the last line of this editor if it has a model set.
     */
    revealLastLine(): void;
    clearInput(): void;
    protected tracksEditorViewState(input: EditorInput): boolean;
}
export declare class TextResourceEditor extends AbstractTextResourceEditor {
    private readonly modelService;
    private readonly languageService;
    static readonly ID = "workbench.editors.textResourceEditor";
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, instantiationService: IInstantiationService, storageService: IStorageService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, editorService: IEditorService, editorGroupService: IEditorGroupsService, modelService: IModelService, languageService: ILanguageService, fileService: IFileService);
    protected createEditorControl(parent: HTMLElement, configuration: ICodeEditorOptions): void;
    private onDidEditorPaste;
}
