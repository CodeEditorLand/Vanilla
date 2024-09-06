import { URI } from "vs/base/common/uri";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IModelService } from "vs/editor/common/services/model";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { BaseTextEditorModel } from "vs/workbench/common/editor/textEditorModel";
import { ILanguageDetectionService } from "vs/workbench/services/languageDetection/common/languageDetectionWorkerService";
/**
 * An editor model for in-memory, readonly text content that
 * is backed by an existing editor model.
 */
export declare class TextResourceEditorModel extends BaseTextEditorModel {
    constructor(resource: URI, languageService: ILanguageService, modelService: IModelService, languageDetectionService: ILanguageDetectionService, accessibilityService: IAccessibilityService);
    dispose(): void;
}
