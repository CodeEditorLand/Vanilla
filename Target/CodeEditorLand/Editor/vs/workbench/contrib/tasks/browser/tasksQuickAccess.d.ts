import { CancellationToken } from "vs/base/common/cancellation";
import { DisposableStore } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from "vs/platform/quickinput/browser/pickerQuickAccess";
import { IQuickInputService, IQuickPickSeparator } from "vs/platform/quickinput/common/quickInput";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ITaskService } from "vs/workbench/contrib/tasks/common/taskService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
export declare class TasksQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private _taskService;
    private _configurationService;
    private _quickInputService;
    private _notificationService;
    private _dialogService;
    private _themeService;
    private _storageService;
    static PREFIX: string;
    constructor(extensionService: IExtensionService, _taskService: ITaskService, _configurationService: IConfigurationService, _quickInputService: IQuickInputService, _notificationService: INotificationService, _dialogService: IDialogService, _themeService: IThemeService, _storageService: IStorageService);
    protected _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken): Promise<Array<IPickerQuickAccessItem | IQuickPickSeparator>>;
    private _toTask;
}
