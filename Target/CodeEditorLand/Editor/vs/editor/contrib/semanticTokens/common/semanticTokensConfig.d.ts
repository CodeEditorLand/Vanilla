import type { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import type { IThemeService } from "../../../../platform/theme/common/themeService.js";
import type { ITextModel } from "../../../common/model.js";
export declare const SEMANTIC_HIGHLIGHTING_SETTING_ID = "editor.semanticHighlighting";
export interface IEditorSemanticHighlightingOptions {
    enabled: true | false | "configuredByTheme";
}
export declare function isSemanticColoringEnabled(model: ITextModel, themeService: IThemeService, configurationService: IConfigurationService): boolean;
