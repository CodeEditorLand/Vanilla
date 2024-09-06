import { Disposable } from "vs/base/common/lifecycle";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IWorkbenchExtensionEnablementService } from "vs/workbench/services/extensionManagement/common/extensionManagement";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { ILanguageStatusService } from "vs/workbench/services/languageStatus/common/languageStatusService";
export declare class DefaultFormatter extends Disposable implements IWorkbenchContribution {
    private readonly _extensionService;
    private readonly _extensionEnablementService;
    private readonly _configService;
    private readonly _notificationService;
    private readonly _dialogService;
    private readonly _quickInputService;
    private readonly _languageService;
    private readonly _languageFeaturesService;
    private readonly _languageStatusService;
    private readonly _editorService;
    static readonly configName = "editor.defaultFormatter";
    static extensionIds: (string | null)[];
    static extensionItemLabels: string[];
    static extensionDescriptions: string[];
    private readonly _languageStatusStore;
    constructor(_extensionService: IExtensionService, _extensionEnablementService: IWorkbenchExtensionEnablementService, _configService: IConfigurationService, _notificationService: INotificationService, _dialogService: IDialogService, _quickInputService: IQuickInputService, _languageService: ILanguageService, _languageFeaturesService: ILanguageFeaturesService, _languageStatusService: ILanguageStatusService, _editorService: IEditorService);
    private _updateConfigValues;
    static _maybeQuotes(s: string): string;
    private _analyzeFormatter;
    private _selectFormatter;
    private _pickAndPersistDefaultFormatter;
    private _updateStatus;
}
