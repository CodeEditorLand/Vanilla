import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { CodeEditorWidget, ICodeEditorWidgetOptions } from "vs/editor/browser/widget/codeEditor/codeEditorWidget";
import { IEditorOptions } from "vs/editor/common/config/editorOptions";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IThemeService } from "vs/platform/theme/common/themeService";
export declare class EmbeddedCodeEditorWidget extends CodeEditorWidget {
    private readonly _parentEditor;
    private readonly _overwriteOptions;
    constructor(domElement: HTMLElement, options: IEditorOptions, codeEditorWidgetOptions: ICodeEditorWidgetOptions, parentEditor: ICodeEditor, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, contextKeyService: IContextKeyService, themeService: IThemeService, notificationService: INotificationService, accessibilityService: IAccessibilityService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    getParentEditor(): ICodeEditor;
    private _onParentConfigurationChanged;
    updateOptions(newOptions: IEditorOptions): void;
}
