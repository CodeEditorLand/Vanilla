import { Disposable } from "vs/base/common/lifecycle";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { CodeActionsExtensionPoint } from "vs/workbench/contrib/codeActions/common/codeActionsExtensionPoint";
import { IExtensionPoint } from "vs/workbench/services/extensions/common/extensionsRegistry";
export declare const editorConfiguration: IConfigurationNode;
export declare const notebookEditorConfiguration: IConfigurationNode;
export declare class CodeActionsContribution extends Disposable implements IWorkbenchContribution {
    private readonly languageFeatures;
    private _contributedCodeActions;
    private settings;
    private readonly _onDidChangeContributions;
    constructor(codeActionsExtensionPoint: IExtensionPoint<CodeActionsExtensionPoint[]>, keybindingService: IKeybindingService, languageFeatures: ILanguageFeaturesService);
    private updateSettingsFromCodeActionProviders;
    private updateConfigurationSchema;
    private updateConfigurationSchemaFromContribs;
    private getSourceActions;
    private getSchemaAdditions;
}
