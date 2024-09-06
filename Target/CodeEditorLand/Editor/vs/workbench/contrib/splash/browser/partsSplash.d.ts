import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { ISplashStorageService } from "vs/workbench/contrib/splash/browser/splash";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IWorkbenchLayoutService } from "vs/workbench/services/layout/browser/layoutService";
import { ILifecycleService } from "vs/workbench/services/lifecycle/common/lifecycle";
export declare class PartsSplash {
    private readonly _themeService;
    private readonly _layoutService;
    private readonly _environmentService;
    private readonly _configService;
    private readonly _partSplashService;
    static readonly ID = "workbench.contrib.partsSplash";
    private static readonly _splashElementId;
    private readonly _disposables;
    private _didChangeTitleBarStyle?;
    constructor(_themeService: IThemeService, _layoutService: IWorkbenchLayoutService, _environmentService: IWorkbenchEnvironmentService, _configService: IConfigurationService, _partSplashService: ISplashStorageService, editorGroupsService: IEditorGroupsService, lifecycleService: ILifecycleService);
    dispose(): void;
    private _savePartsSplash;
    private _shouldSaveLayoutInfo;
    private _removePartsSplash;
}
