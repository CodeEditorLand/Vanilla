import { EditorAutoIndentStrategy } from "vs/editor/common/config/editorOptions";
import { Range } from "vs/editor/common/core/range";
import { CompleteEnterAction } from "vs/editor/common/languages/languageConfiguration";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ITextModel } from "vs/editor/common/model";
export declare function getEnterAction(autoIndent: EditorAutoIndentStrategy, model: ITextModel, range: Range, languageConfigurationService: ILanguageConfigurationService): CompleteEnterAction | null;
