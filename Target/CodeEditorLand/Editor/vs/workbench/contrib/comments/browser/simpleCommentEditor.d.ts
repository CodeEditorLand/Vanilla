import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction } from "vs/editor/browser/editorExtensions";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { CodeEditorWidget } from "vs/editor/browser/widget/codeEditor/codeEditorWidget";
import { IEditorOptions } from "vs/editor/common/config/editorOptions";
import { ILanguageConfigurationService } from "vs/editor/common/languages/languageConfigurationRegistry";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IAccessibilityService } from "vs/platform/accessibility/common/accessibility";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ICommentThreadWidget } from "vs/workbench/contrib/comments/common/commentThreadWidget";
export declare const ctxCommentEditorFocused: any;
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
