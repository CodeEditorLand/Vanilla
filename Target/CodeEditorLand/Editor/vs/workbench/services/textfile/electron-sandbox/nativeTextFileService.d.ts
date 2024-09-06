import { URI } from "vs/base/common/uri";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelService } from "vs/editor/common/services/model";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { IDialogService, IFileDialogService } from "vs/platform/dialogs/common/dialogs";
import { IFileService } from "vs/platform/files/common/files";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IDecorationsService } from "vs/workbench/services/decorations/common/decorations";
import { INativeWorkbenchEnvironmentService } from "vs/workbench/services/environment/electron-sandbox/environmentService";
import { IElevatedFileService } from "vs/workbench/services/files/common/elevatedFileService";
import { IFilesConfigurationService } from "vs/workbench/services/filesConfiguration/common/filesConfigurationService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
import { IPathService } from "vs/workbench/services/path/common/pathService";
import { AbstractTextFileService } from "vs/workbench/services/textfile/browser/textFileService";
import { IReadTextFileOptions, ITextFileContent, ITextFileStreamContent } from "vs/workbench/services/textfile/common/textfiles";
import { IUntitledTextEditorService } from "vs/workbench/services/untitled/common/untitledTextEditorService";
import { IWorkingCopyFileService } from "vs/workbench/services/workingCopy/common/workingCopyFileService";
export declare class NativeTextFileService extends AbstractTextFileService {
    protected readonly environmentService: INativeWorkbenchEnvironmentService;
    constructor(fileService: IFileService, untitledTextEditorService: IUntitledTextEditorService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, modelService: IModelService, environmentService: INativeWorkbenchEnvironmentService, dialogService: IDialogService, fileDialogService: IFileDialogService, textResourceConfigurationService: ITextResourceConfigurationService, filesConfigurationService: IFilesConfigurationService, codeEditorService: ICodeEditorService, pathService: IPathService, workingCopyFileService: IWorkingCopyFileService, uriIdentityService: IUriIdentityService, languageService: ILanguageService, elevatedFileService: IElevatedFileService, logService: ILogService, decorationsService: IDecorationsService);
    private registerListeners;
    private onWillShutdown;
    read(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileContent>;
    readStream(resource: URI, options?: IReadTextFileOptions): Promise<ITextFileStreamContent>;
    private ensureLimits;
}
