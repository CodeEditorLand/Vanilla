import { CancellationToken } from "vs/base/common/cancellation";
import { HierarchicalKind } from "vs/base/common/hierarchicalKind";
import { Disposable } from "vs/base/common/lifecycle";
import { CodeActionProvider } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IProgress, IProgressStep } from "vs/platform/progress/common/progress";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { NotebookTextModel } from "vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { IWorkingCopyFileService } from "vs/workbench/services/workingCopy/common/workingCopyFileService";
export declare class CodeActionParticipantUtils {
    static checkAndRunFormatCodeAction(accessor: ServicesAccessor, notebookModel: NotebookTextModel, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<boolean>;
    static applyOnSaveGenericCodeActions(accessor: ServicesAccessor, model: ITextModel, codeActionsOnSave: readonly HierarchicalKind[], excludes: readonly HierarchicalKind[], progress: IProgress<IProgressStep>, token: CancellationToken): Promise<void>;
    static applyOnSaveFormatCodeAction(accessor: ServicesAccessor, model: ITextModel, formatCodeActionOnSave: HierarchicalKind, excludes: readonly HierarchicalKind[], extensionId: string | undefined, progress: IProgress<IProgressStep>, token: CancellationToken): Promise<boolean>;
    static getActionsToRun(model: ITextModel, codeActionKind: HierarchicalKind, excludes: readonly HierarchicalKind[], languageFeaturesService: ILanguageFeaturesService, progress: IProgress<CodeActionProvider>, token: CancellationToken): any;
}
export declare class SaveParticipantsContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly workingCopyFileService;
    constructor(instantiationService: IInstantiationService, workingCopyFileService: IWorkingCopyFileService);
    private registerSaveParticipants;
}
