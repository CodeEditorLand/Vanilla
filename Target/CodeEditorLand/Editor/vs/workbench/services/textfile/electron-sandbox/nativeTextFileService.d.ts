import { URI } from "../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { IModelService } from "../../../../editor/common/services/model.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IDialogService, IFileDialogService } from "../../../../platform/dialogs/common/dialogs.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { IDecorationsService } from "../../decorations/common/decorations.js";
import { INativeWorkbenchEnvironmentService } from "../../environment/electron-sandbox/environmentService.js";
import { IElevatedFileService } from "../../files/common/elevatedFileService.js";
import { IFilesConfigurationService } from "../../filesConfiguration/common/filesConfigurationService.js";
import { ILifecycleService } from "../../lifecycle/common/lifecycle.js";
import { IPathService } from "../../path/common/pathService.js";
import { IUntitledTextEditorService } from "../../untitled/common/untitledTextEditorService.js";
import { IWorkingCopyFileService } from "../../workingCopy/common/workingCopyFileService.js";
import { AbstractTextFileService } from "../browser/textFileService.js";
import { IReadTextFileOptions, ITextFileContent, ITextFileStreamContent } from "../common/textfiles.js";
export declare class NativeTextFileService extends AbstractTextFileService {
    protected readonly environmentService: INativeWorkbenchEnvironmentService;
    constructor(fileService: IFileService, untitledTextEditorService: IUntitledTextEditorService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, modelService: IModelService, environmentService: INativeWorkbenchEnvironmentService, dialogService: IDialogService, fileDialogService: IFileDialogService, textResourceConfigurationService: ITextResourceConfigurationService, filesConfigurationService: IFilesConfigurationService, codeEditorService: ICodeEditorService, pathService: IPathService, workingCopyFileService: IWorkingCopyFileService, uriIdentityService: IUriIdentityService, languageService: ILanguageService, elevatedFileService: IElevatedFileService, logService: ILogService, decorationsService: IDecorationsService);
    private registerListeners;
    private onWillShutdown;
    read(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileContent>;
    readStream(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileStreamContent>;
    private ensureLimits;
}
