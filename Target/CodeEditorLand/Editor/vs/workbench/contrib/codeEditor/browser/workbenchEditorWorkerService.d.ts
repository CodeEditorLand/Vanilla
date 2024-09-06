import { EditorWorkerService } from "vs/editor/browser/services/editorWorkerService";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IModelService } from "vs/editor/common/services/model";
import { ITextResourceConfigurationService } from "vs/editor/common/services/textResourceConfiguration";
import { ILogService } from "vs/platform/log/common/log";
export declare class WorkbenchEditorWorkerService extends EditorWorkerService {
    constructor(modelService: IModelService, configurationService: ITextResourceConfigurationService, logService: ILogService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
}
