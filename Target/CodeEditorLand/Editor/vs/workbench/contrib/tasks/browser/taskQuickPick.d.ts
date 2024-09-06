import { Disposable, DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IDialogService } from "vs/platform/dialogs/common/dialogs";
import { INotificationService } from "vs/platform/notification/common/notification";
import { IQuickInputService, IQuickPick, IQuickPickItem, QuickPickInput } from "vs/platform/quickinput/common/quickInput";
import { IStorageService } from "vs/platform/storage/common/storage";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IWorkspace, IWorkspaceFolder } from "vs/platform/workspace/common/workspace";
import { TaskQuickPickEntryType } from "vs/workbench/contrib/tasks/browser/abstractTaskService";
import { ConfiguringTask, Task } from "vs/workbench/contrib/tasks/common/tasks";
import { ITaskService } from "vs/workbench/contrib/tasks/common/taskService";
export declare const QUICKOPEN_DETAIL_CONFIG = "task.quickOpen.detail";
export declare const QUICKOPEN_SKIP_CONFIG = "task.quickOpen.skip";
export declare function isWorkspaceFolder(folder: IWorkspace | IWorkspaceFolder): folder is IWorkspaceFolder;
export interface ITaskQuickPickEntry extends IQuickPickItem {
    task: Task | undefined | null;
}
export interface ITaskTwoLevelQuickPickEntry extends IQuickPickItem {
    task: Task | ConfiguringTask | string | undefined | null;
    settingType?: string;
}
export declare const configureTaskIcon: any;
export declare class TaskQuickPick extends Disposable {
    private _taskService;
    private _configurationService;
    private _quickInputService;
    private _notificationService;
    private _themeService;
    private _dialogService;
    private _storageService;
    private _sorter;
    private _topLevelEntries;
    constructor(_taskService: ITaskService, _configurationService: IConfigurationService, _quickInputService: IQuickInputService, _notificationService: INotificationService, _themeService: IThemeService, _dialogService: IDialogService, _storageService: IStorageService);
    private _showDetail;
    private _guessTaskLabel;
    static getTaskLabelWithIcon(task: Task | ConfiguringTask, labelGuess?: string): string;
    static applyColorStyles(task: Task | ConfiguringTask, entry: TaskQuickPickEntryType | ITaskTwoLevelQuickPickEntry, themeService: IThemeService): IDisposable | undefined;
    private _createTaskEntry;
    private _createEntriesForGroup;
    private _createTypeEntries;
    private _handleFolderTaskResult;
    private _dedupeConfiguredAndRecent;
    getTopLevelEntries(defaultEntry?: ITaskQuickPickEntry): Promise<{
        entries: QuickPickInput<ITaskTwoLevelQuickPickEntry>[];
        isSingleConfigured?: Task | ConfiguringTask;
    }>;
    handleSettingOption(selectedType: string): Promise<any>;
    show(placeHolder: string, defaultEntry?: ITaskQuickPickEntry, startAtType?: string, name?: string): Promise<Task | undefined | null>;
    private _doPickerFirstLevel;
    doPickerSecondLevel(picker: IQuickPick<ITaskTwoLevelQuickPickEntry, {
        useSeparators: true;
    }>, disposables: DisposableStore, type: string, name?: string): Promise<ITaskTwoLevelQuickPickEntry | null | undefined>;
    static allSettingEntries(configurationService: IConfigurationService): (ITaskTwoLevelQuickPickEntry & {
        settingType: string;
    })[];
    static getSettingEntry(configurationService: IConfigurationService, type: string): (ITaskTwoLevelQuickPickEntry & {
        settingType: string;
    }) | undefined;
    private _getEntriesForProvider;
    private _toTask;
}
