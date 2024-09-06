import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { EditorAction } from "../../../../editor/browser/editorExtensions.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { IEditorOptions } from "../../../../editor/common/config/editorOptions.js";
import { ILanguageConfigurationService } from "../../../../editor/common/languages/languageConfigurationRegistry.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import { IAccessibilityService } from "../../../../platform/accessibility/common/accessibility.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { ICommentThreadWidget } from "../common/commentThreadWidget.js";
export declare const ctxCommentEditorFocused: RawContextKey<boolean>;
export declare const MIN_EDITOR_HEIGHT: number;
export declare const MAX_EDITOR_HEIGHT: number;
export interface LayoutableEditor {
    getLayoutInfo(): {
        height: number;
    };
}
export declare class SimpleCommentEditor extends CodeEditorWidget {
    private _parentThread;
    private _commentEditorFocused;
    private _commentEditorEmpty;
    constructor(domElement: HTMLElement, options: IEditorOptions, scopedContextKeyService: IContextKeyService, parentThread: ICommentThreadWidget, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, themeService: IThemeService, notificationService: INotificationService, accessibilityService: IAccessibilityService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    getParentThread(): ICommentThreadWidget;
    protected _getActions(): Iterable<EditorAction>;
    static getEditorOptions(configurationService: IConfigurationService): IEditorOptions;
}
export declare function calculateEditorHeight(parentEditor: LayoutableEditor, editor: ICodeEditor, currentHeight: number): number;
