import { type ISingleEditOperation } from "../../../common/core/editOperation.js";
import type { ILanguageConfigurationService } from "../../../common/languages/languageConfigurationRegistry.js";
import type { ITextModel } from "../../../common/model.js";
export declare function getReindentEditOperations(model: ITextModel, languageConfigurationService: ILanguageConfigurationService, startLineNumber: number, endLineNumber: number): ISingleEditOperation[];
