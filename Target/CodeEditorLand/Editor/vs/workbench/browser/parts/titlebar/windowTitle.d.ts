import { CodeWindow } from "vs/base/browser/window";
import { Disposable } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ILabelService } from "vs/platform/label/common/label";
import { IProductService } from "vs/platform/product/common/productService";
import { IWorkspaceContextService } from "vs/platform/workspace/common/workspace";
import { ITitleProperties, ITitleVariable } from "vs/workbench/browser/parts/titlebar/titlebarPart";
import { IEditorGroupsContainer } from "vs/workbench/services/editor/common/editorGroupsService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IBrowserWorkbenchEnvironmentService } from "vs/workbench/services/environment/browser/environmentService";
import { IUserDataProfileService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare const defaultWindowTitle: string;
export declare const defaultWindowTitleSeparator: string;
export declare class WindowTitle extends Disposable {
    protected readonly configurationService: IConfigurationService;
    private readonly contextKeyService;
    protected readonly environmentService: IBrowserWorkbenchEnvironmentService;
    private readonly contextService;
    private readonly labelService;
    private readonly userDataProfileService;
    private readonly productService;
    private readonly viewsService;
    private static readonly NLS_USER_IS_ADMIN;
    private static readonly NLS_EXTENSION_HOST;
    private static readonly TITLE_DIRTY;
    private readonly properties;
    private readonly variables;
    private readonly activeEditorListeners;
    private readonly titleUpdater;
    private readonly onDidChangeEmitter;
    readonly onDidChange: any;
    get value(): string;
    get workspaceName(): any;
    get fileName(): string | undefined;
    private title;
    private titleIncludesFocusedView;
    private readonly editorService;
    private readonly windowId;
    constructor(targetWindow: CodeWindow, editorGroupsContainer: IEditorGroupsContainer | "main", configurationService: IConfigurationService, contextKeyService: IContextKeyService, editorService: IEditorService, environmentService: IBrowserWorkbenchEnvironmentService, contextService: IWorkspaceContextService, labelService: ILabelService, userDataProfileService: IUserDataProfileService, productService: IProductService, viewsService: IViewsService);
    private registerListeners;
    private onConfigurationChanged;
    private updateTitleIncludesFocusedView;
    private onActiveEditorChange;
    private doUpdateTitle;
    private getFullWindowTitle;
    getTitleDecorations(): {
        prefix: string | undefined;
        suffix: string | undefined;
    };
    updateProperties(properties: ITitleProperties): void;
    registerVariables(variables: ITitleVariable[]): void;
    /**
     * Possible template values:
     *
     * {activeEditorLong}: e.g. /Users/Development/myFolder/myFileFolder/myFile.txt
     * {activeEditorMedium}: e.g. myFolder/myFileFolder/myFile.txt
     * {activeEditorShort}: e.g. myFile.txt
     * {activeFolderLong}: e.g. /Users/Development/myFolder/myFileFolder
     * {activeFolderMedium}: e.g. myFolder/myFileFolder
     * {activeFolderShort}: e.g. myFileFolder
     * {rootName}: e.g. myFolder1, myFolder2, myFolder3
     * {rootPath}: e.g. /Users/Development
     * {folderName}: e.g. myFolder
     * {folderPath}: e.g. /Users/Development/myFolder
     * {appName}: e.g. VS Code
     * {remoteName}: e.g. SSH
     * {dirty}: indicator
     * {focusedView}: e.g. Terminal
     * {separator}: conditional separator
     */
    getWindowTitle(): string;
    isCustomTitleFormat(): boolean;
}
