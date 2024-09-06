import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { IEditorWorkerService } from "vs/editor/common/services/editorWorker";
export declare class SectionHeaderDetector extends Disposable implements IEditorContribution {
    private readonly editor;
    private readonly languageConfigurationService;
    private readonly editorWorkerService;
    static readonly ID: string;
    private options;
    private decorations;
    private computeSectionHeaders;
    private computePromise;
    private currentOccurrences;
    constructor(editor: ICodeEditor, languageConfigurationService: ILanguageConfigurationService, editorWorkerService: IEditorWorkerService);
    private createOptions;
    private findSectionHeaders;
    private updateDecorations;
    private stop;
    dispose(): void;
}
