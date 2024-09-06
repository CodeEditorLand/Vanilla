import { ISingleEditOperation } from "vs/editor/common/core/editOperation";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ITextModel } from "vs/editor/common/model";
export declare function getReindentEditOperations(model: ITextModel, languageConfigurationService: ILanguageConfigurationService, startLineNumber: number, endLineNumber: number): ISingleEditOperation[];
