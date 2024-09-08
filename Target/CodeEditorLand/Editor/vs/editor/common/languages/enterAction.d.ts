import type { EditorAutoIndentStrategy } from "../config/editorOptions.js";
import type { Range } from "../core/range.js";
import type { ITextModel } from "../model.js";
import { type CompleteEnterAction } from "./languageConfiguration.js";
import { type ILanguageConfigurationService } from "./languageConfigurationRegistry.js";
export declare function getEnterAction(autoIndent: EditorAutoIndentStrategy, model: ITextModel, range: Range, languageConfigurationService: ILanguageConfigurationService): CompleteEnterAction | null;
