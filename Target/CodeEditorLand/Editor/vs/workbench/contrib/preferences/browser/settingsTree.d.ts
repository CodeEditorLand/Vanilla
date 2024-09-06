import { Button } from "vs/base/browser/ui/button/button";
import { SimpleIconLabel } from "vs/base/browser/ui/iconLabel/simpleIconLabel";
import { Toggle } from "vs/base/browser/ui/toggle/toggle";
import { ToolBar } from "vs/base/browser/ui/toolbar/toolbar";
import { IList } from "vs/base/browser/ui/tree/indexTreeModel";
import { IObjectTreeOptions } from "vs/base/browser/ui/tree/objectTree";
import { ObjectTreeModel } from "vs/base/browser/ui/tree/objectTreeModel";
import { ITreeFilter, ITreeModel, ITreeNode, ITreeRenderer, TreeFilterResult, TreeVisibility } from "vs/base/browser/ui/tree/tree";
import { IAction } from "vs/base/common/actions";
import { Event } from "vs/base/common/event";
import { Disposable, DisposableStore } from "vs/base/common/lifecycle";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ConfigurationScope } from "vs/platform/configuration/common/configurationRegistry";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService, IContextViewService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IListService, WorkbenchObjectTree } from "vs/platform/list/browser/listService";
import { ILogService } from "vs/platform/log/common/log";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IProductService } from "vs/platform/product/common/productService";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IUserDataProfilesService } from "vs/platform/userDataProfile/common/userDataProfile";
import { IUserDataSyncEnablementService } from "vs/platform/userDataSync/common/userDataSync";
import { IExtensionsWorkbenchService } from "vs/workbench/contrib/extensions/common/extensions";
import { SettingsTarget } from "vs/workbench/contrib/preferences/browser/preferencesWidgets";
import { ISettingOverrideClickEvent, SettingsTreeIndicatorsLabel } from "vs/workbench/contrib/preferences/browser/settingsEditorSettingIndicators";
import { ITOCEntry } from "vs/workbench/contrib/preferences/browser/settingsLayout";
import { ISettingsEditorViewState, SettingsTreeElement, SettingsTreeGroupChild, SettingsTreeNewExtensionsElement, SettingsTreeSettingElement } from "vs/workbench/contrib/preferences/browser/settingsTreeModels";
import { IWorkbenchConfigurationService } from "vs/workbench/services/configuration/common/configuration";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { ISetting, ISettingsGroup, SettingValueType } from "vs/workbench/services/preferences/common/preferences";
export declare function resolveSettingsTree(tocData: ITOCEntry<string>, coreSettingsGroups: ISettingsGroup[], logService: ILogService): {
    tree: ITOCEntry<ISetting>;
    leftoverSettings: Set<ISetting>;
};
export declare function resolveConfiguredUntrustedSettings(groups: ISettingsGroup[], target: SettingsTarget, languageFilter: string | undefined, configurationService: IWorkbenchConfigurationService): ISetting[];
export declare function createTocTreeForExtensionSettings(extensionService: IExtensionService, groups: ISettingsGroup[]): Promise<ITOCEntry<ISetting>>;
export declare function createSettingMatchRegExp(pattern: string): RegExp;
interface IDisposableTemplate {
    readonly toDispose: DisposableStore;
}
interface ISettingItemTemplate<T = any> extends IDisposableTemplate {
    onChange?: (value: T) => void;
    context?: SettingsTreeSettingElement;
    containerElement: HTMLElement;
    categoryElement: HTMLElement;
    labelElement: SimpleIconLabel;
    descriptionElement: HTMLElement;
    controlElement: HTMLElement;
    deprecationWarningElement: HTMLElement;
    indicatorsLabel: SettingsTreeIndicatorsLabel;
    toolbar: ToolBar;
    readonly elementDisposables: DisposableStore;
}
interface ISettingBoolItemTemplate extends ISettingItemTemplate<boolean> {
    checkbox: Toggle;
}
interface ISettingComplexItemTemplate extends ISettingItemTemplate<void> {
    button: HTMLElement;
    validationErrorMessageElement: HTMLElement;
}
interface ISettingNewExtensionsTemplate extends IDisposableTemplate {
    button: Button;
    context?: SettingsTreeNewExtensionsElement;
}
export interface ISettingChangeEvent {
    key: string;
    value: any;
    type: SettingValueType | SettingValueType[];
    manualReset: boolean;
    scope: ConfigurationScope | undefined;
}
export interface ISettingLinkClickEvent {
    source: SettingsTreeSettingElement;
    targetKey: string;
}
export interface HeightChangeParams {
    element: SettingsTreeElement;
    height: number;
}
export declare abstract class AbstractSettingRenderer extends Disposable implements ITreeRenderer<SettingsTreeElement, never, any> {
    private readonly settingActions;
    private readonly disposableActionFactory;
    protected readonly _themeService: IThemeService;
    protected readonly _contextViewService: IContextViewService;
    protected readonly _openerService: IOpenerService;
    protected readonly _instantiationService: IInstantiationService;
    protected readonly _commandService: ICommandService;
    protected readonly _contextMenuService: IContextMenuService;
    protected readonly _keybindingService: IKeybindingService;
    protected readonly _configService: IConfigurationService;
    protected readonly _extensionsService: IExtensionService;
    protected readonly _extensionsWorkbenchService: IExtensionsWorkbenchService;
    protected readonly _productService: IProductService;
    protected readonly _telemetryService: ITelemetryService;
    protected readonly _hoverService: IHoverService;
    /** To override */
    abstract get templateId(): string;
    static readonly CONTROL_CLASS = "setting-control-focus-target";
    static readonly CONTROL_SELECTOR: string;
    static readonly CONTENTS_CLASS = "setting-item-contents";
    static readonly CONTENTS_SELECTOR: string;
    static readonly ALL_ROWS_SELECTOR = ".monaco-list-row";
    static readonly SETTING_KEY_ATTR = "data-key";
    static readonly SETTING_ID_ATTR = "data-id";
    static readonly ELEMENT_FOCUSABLE_ATTR = "data-focusable";
    private readonly _onDidClickOverrideElement;
    readonly onDidClickOverrideElement: Event<ISettingOverrideClickEvent>;
    protected readonly _onDidChangeSetting: any;
    readonly onDidChangeSetting: Event<ISettingChangeEvent>;
    protected readonly _onDidOpenSettings: any;
    readonly onDidOpenSettings: Event<string>;
    private readonly _onDidClickSettingLink;
    readonly onDidClickSettingLink: Event<ISettingLinkClickEvent>;
    protected readonly _onDidFocusSetting: any;
    readonly onDidFocusSetting: Event<SettingsTreeSettingElement>;
    private ignoredSettings;
    private readonly _onDidChangeIgnoredSettings;
    readonly onDidChangeIgnoredSettings: Event<void>;
    protected readonly _onDidChangeSettingHeight: any;
    readonly onDidChangeSettingHeight: Event<HeightChangeParams>;
    protected readonly _onApplyFilter: any;
    readonly onApplyFilter: Event<string>;
    private readonly markdownRenderer;
    constructor(settingActions: IAction[], disposableActionFactory: (setting: ISetting, settingTarget: SettingsTarget) => IAction[], _themeService: IThemeService, _contextViewService: IContextViewService, _openerService: IOpenerService, _instantiationService: IInstantiationService, _commandService: ICommandService, _contextMenuService: IContextMenuService, _keybindingService: IKeybindingService, _configService: IConfigurationService, _extensionsService: IExtensionService, _extensionsWorkbenchService: IExtensionsWorkbenchService, _productService: IProductService, _telemetryService: ITelemetryService, _hoverService: IHoverService);
    abstract renderTemplate(container: HTMLElement): any;
    abstract renderElement(element: ITreeNode<SettingsTreeSettingElement, never>, index: number, templateData: any): void;
    protected renderCommonTemplate(tree: any, _container: HTMLElement, typeClass: string): ISettingItemTemplate;
    protected addSettingElementFocusHandler(template: ISettingItemTemplate): void;
    protected renderSettingToolbar(container: HTMLElement): ToolBar;
    protected renderSettingElement(node: ITreeNode<SettingsTreeSettingElement, never>, index: number, template: ISettingItemTemplate | ISettingBoolItemTemplate): void;
    private updateSettingTabbable;
    private renderSettingMarkdown;
    protected abstract renderValue(dataElement: SettingsTreeSettingElement, template: ISettingItemTemplate, onChange: (value: any) => void): void;
    disposeTemplate(template: IDisposableTemplate): void;
    disposeElement(_element: ITreeNode<SettingsTreeElement>, _index: number, template: IDisposableTemplate, _height: number | undefined): void;
}
export declare class SettingNewExtensionsRenderer implements ITreeRenderer<SettingsTreeNewExtensionsElement, never, ISettingNewExtensionsTemplate> {
    private readonly _commandService;
    templateId: string;
    constructor(_commandService: ICommandService);
    renderTemplate(container: HTMLElement): ISettingNewExtensionsTemplate;
    renderElement(element: ITreeNode<SettingsTreeNewExtensionsElement, never>, index: number, templateData: ISettingNewExtensionsTemplate): void;
    disposeTemplate(template: IDisposableTemplate): void;
}
export declare class SettingComplexRenderer extends AbstractSettingRenderer implements ITreeRenderer<SettingsTreeSettingElement, never, ISettingComplexItemTemplate> {
    private static readonly EDIT_IN_JSON_LABEL;
    templateId: string;
    renderTemplate(container: HTMLElement): ISettingComplexItemTemplate;
    renderElement(element: ITreeNode<SettingsTreeSettingElement, never>, index: number, templateData: ISettingComplexItemTemplate): void;
    protected renderValue(dataElement: SettingsTreeSettingElement, template: ISettingComplexItemTemplate, onChange: (value: string) => void): void;
    private renderValidations;
}
export declare class SettingTreeRenderers extends Disposable {
    private readonly _instantiationService;
    private readonly _contextMenuService;
    private readonly _contextViewService;
    private readonly _userDataProfilesService;
    private readonly _userDataSyncEnablementService;
    readonly onDidClickOverrideElement: Event<ISettingOverrideClickEvent>;
    private readonly _onDidChangeSetting;
    readonly onDidChangeSetting: Event<ISettingChangeEvent>;
    readonly onDidDismissExtensionSetting: Event<string>;
    readonly onDidOpenSettings: Event<string>;
    readonly onDidClickSettingLink: Event<ISettingLinkClickEvent>;
    readonly onDidFocusSetting: Event<SettingsTreeSettingElement>;
    readonly onDidChangeSettingHeight: Event<HeightChangeParams>;
    readonly onApplyFilter: Event<string>;
    readonly allRenderers: ITreeRenderer<SettingsTreeElement, never, any>[];
    private readonly settingActions;
    constructor(_instantiationService: IInstantiationService, _contextMenuService: IContextMenuService, _contextViewService: IContextViewService, _userDataProfilesService: IUserDataProfilesService, _userDataSyncEnablementService: IUserDataSyncEnablementService);
    private getActionsForSetting;
    cancelSuggesters(): void;
    showContextMenu(element: SettingsTreeSettingElement, settingDOMElement: HTMLElement): void;
    getSettingDOMElementForDOMElement(domElement: HTMLElement): HTMLElement | null;
    getDOMElementsForSettingKey(treeContainer: HTMLElement, key: string): NodeListOf<HTMLElement>;
    getKeyForDOMElementInSetting(element: HTMLElement): string | null;
    getIdForDOMElementInSetting(element: HTMLElement): string | null;
    dispose(): void;
}
export declare class SettingsTreeFilter implements ITreeFilter<SettingsTreeElement> {
    private viewState;
    private environmentService;
    constructor(viewState: ISettingsEditorViewState, environmentService: IWorkbenchEnvironmentService);
    filter(element: SettingsTreeElement, parentVisibility: TreeVisibility): TreeFilterResult<void>;
    private settingContainedInGroup;
}
export declare class NonCollapsibleObjectTreeModel<T> extends ObjectTreeModel<T> {
    isCollapsible(element: T): boolean;
    setCollapsed(element: T, collapsed?: boolean, recursive?: boolean): boolean;
}
export declare class SettingsTree extends WorkbenchObjectTree<SettingsTreeElement> {
    constructor(container: HTMLElement, viewState: ISettingsEditorViewState, renderers: ITreeRenderer<any, void, any>[], contextKeyService: IContextKeyService, listService: IListService, configurationService: IWorkbenchConfigurationService, instantiationService: IInstantiationService, languageService: ILanguageService, userDataProfilesService: IUserDataProfilesService);
    protected createModel(user: string, view: IList<ITreeNode<SettingsTreeGroupChild>>, options: IObjectTreeOptions<SettingsTreeGroupChild>): ITreeModel<SettingsTreeGroupChild | null, void, SettingsTreeGroupChild | null>;
}
export {};
