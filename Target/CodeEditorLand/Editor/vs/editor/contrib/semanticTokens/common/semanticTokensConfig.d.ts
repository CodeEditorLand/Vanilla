import { ITextModel } from "vs/editor/common/model";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare const SEMANTIC_HIGHLIGHTING_SETTING_ID = "editor.semanticHighlighting";
export interface IEditorSemanticHighlightingOptions {
    enabled: true | false | "configuredByTheme";
}
export declare function isSemanticColoringEnabled(model: ITextModel, themeService: IThemeService, configurationService: IConfigurationService): boolean;
