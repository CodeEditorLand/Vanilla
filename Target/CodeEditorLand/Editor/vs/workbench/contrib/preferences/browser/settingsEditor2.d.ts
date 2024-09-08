import * as DOM from "../../../../base/browser/dom.js";
import type { ITreeElement } from "../../../../base/browser/ui/tree/tree.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import "./media/settingsEditor2.css";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IExtensionGalleryService, IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { IProductService } from "../../../../platform/product/common/productService.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { IUserDataSyncEnablementService } from "../../../../platform/userDataSync/common/userDataSync.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.js";
import { EditorPane } from "../../../browser/parts/editor/editorPane.js";
import type { IEditorOpenContext, IEditorPane } from "../../../common/editor.js";
import { IWorkbenchConfigurationService } from "../../../services/configuration/common/configuration.js";
import { IEditorGroupsService, type IEditorGroup } from "../../../services/editor/common/editorGroupsService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IPreferencesService, type ISettingsEditorOptions } from "../../../services/preferences/common/preferences.js";
import type { SettingsEditor2Input } from "../../../services/preferences/common/preferencesEditorInput.js";
import { IUserDataProfileService } from "../../../services/userDataProfile/common/userDataProfile.js";
import { IUserDataSyncWorkbenchService } from "../../../services/userDataSync/common/userDataSync.js";
import { IPreferencesSearchService } from "../common/preferences.js";
import { SettingsTreeGroupElement, type SettingsTreeGroupChild } from "./settingsTreeModels.js";
export declare enum SettingsFocusContext {
    Search = 0,
    TableOfContents = 1,
    SettingTree = 2,
    SettingControl = 3
}
export declare function createGroupIterator(group: SettingsTreeGroupElement): Iterable<ITreeElement<SettingsTreeGroupChild>>;
export declare class SettingsEditor2 extends EditorPane {
    private readonly configurationService;
    private readonly preferencesService;
    private readonly instantiationService;
    private readonly preferencesSearchService;
    private readonly logService;
    private readonly storageService;
    protected editorGroupService: IEditorGroupsService;
    private readonly userDataSyncWorkbenchService;
    private readonly userDataSyncEnablementService;
    private readonly workspaceTrustManagementService;
    private readonly extensionService;
    private readonly languageService;
    private readonly extensionManagementService;
    private readonly productService;
    private readonly extensionGalleryService;
    private readonly editorProgressService;
    static readonly ID: string;
    private static NUM_INSTANCES;
    private static SEARCH_DEBOUNCE;
    private static SETTING_UPDATE_FAST_DEBOUNCE;
    private static SETTING_UPDATE_SLOW_DEBOUNCE;
    private static CONFIG_SCHEMA_UPDATE_DELAYER;
    private static TOC_MIN_WIDTH;
    private static TOC_RESET_WIDTH;
    private static EDITOR_MIN_WIDTH;
    private static NARROW_TOTAL_WIDTH;
    private static SUGGESTIONS;
    private static shouldSettingUpdateFast;
    private defaultSettingsEditorModel;
    private readonly modelDisposables;
    private rootElement;
    private headerContainer;
    private bodyContainer;
    private searchWidget;
    private countElement;
    private controlsElement;
    private settingsTargetsWidget;
    private splitView;
    private settingsTreeContainer;
    private settingsTree;
    private settingRenderers;
    private tocTreeModel;
    private settingsTreeModel;
    private noResultsMessage;
    private clearFilterLinkContainer;
    private tocTreeContainer;
    private tocTree;
    private delayedFilterLogging;
    private searchDelayer;
    private searchInProgress;
    private searchInputDelayer;
    private updatedConfigSchemaDelayer;
    private settingFastUpdateDelayer;
    private settingSlowUpdateDelayer;
    private pendingSettingUpdate;
    private readonly viewState;
    private _searchResultModel;
    private searchResultLabel;
    private lastSyncedLabel;
    private settingsOrderByTocIndex;
    private tocRowFocused;
    private settingRowFocused;
    private inSettingsEditorContextKey;
    private searchFocusContextKey;
    private scheduledRefreshes;
    private _currentFocusContext;
    /** Don't spam warnings */
    private hasWarnedMissingSettings;
    private tocTreeDisposed;
    /** Persist the search query upon reloads */
    private editorMemento;
    private tocFocusedElement;
    private treeFocusedElement;
    private settingsTreeScrollTop;
    private dimension;
    private installedExtensionIds;
    private dismissedExtensionSettings;
    private readonly DISMISSED_EXTENSION_SETTINGS_STORAGE_KEY;
    private readonly DISMISSED_EXTENSION_SETTINGS_DELIMITER;
    private readonly inputChangeListener;
    constructor(group: IEditorGroup, telemetryService: ITelemetryService, configurationService: IWorkbenchConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, themeService: IThemeService, preferencesService: IPreferencesService, instantiationService: IInstantiationService, preferencesSearchService: IPreferencesSearchService, logService: ILogService, contextKeyService: IContextKeyService, storageService: IStorageService, editorGroupService: IEditorGroupsService, userDataSyncWorkbenchService: IUserDataSyncWorkbenchService, userDataSyncEnablementService: IUserDataSyncEnablementService, workspaceTrustManagementService: IWorkspaceTrustManagementService, extensionService: IExtensionService, languageService: ILanguageService, extensionManagementService: IExtensionManagementService, productService: IProductService, extensionGalleryService: IExtensionGalleryService, editorProgressService: IEditorProgressService, userDataProfileService: IUserDataProfileService);
    private whenCurrentProfileChanged;
    get minimumWidth(): number;
    get maximumWidth(): number;
    get minimumHeight(): number;
    set minimumWidth(value: number);
    set maximumWidth(value: number);
    private get currentSettingsModel();
    private get searchResultModel();
    private set searchResultModel(value);
    private get focusedSettingDOMElement();
    get currentFocusContext(): SettingsFocusContext;
    protected createEditor(parent: HTMLElement): void;
    setInput(input: SettingsEditor2Input, options: ISettingsEditorOptions | undefined, context: IEditorOpenContext, token: CancellationToken): Promise<void>;
    private refreshInstalledExtensionsList;
    private restoreCachedState;
    getViewState(): object | undefined;
    setOptions(options: ISettingsEditorOptions | undefined): void;
    private _setOptions;
    clearInput(): void;
    layout(dimension: DOM.Dimension): void;
    focus(): void;
    protected setEditorVisible(visible: boolean): void;
    focusSettings(focusSettingInput?: boolean): void;
    focusTOC(): void;
    showContextMenu(): void;
    focusSearch(filter?: string, selectAll?: boolean): void;
    clearSearchResults(): void;
    clearSearchFilters(): void;
    private updateInputAriaLabel;
    /**
     * Render the header of the Settings editor, which includes the content above the splitview.
     */
    private createHeader;
    private onDidSettingsTargetChange;
    private onDidDismissExtensionSetting;
    private onDidClickSetting;
    switchToSettingsFile(): Promise<IEditorPane | undefined>;
    private openSettingsFile;
    private createBody;
    private addCtrlAInterceptor;
    private createTOC;
    private applyFilter;
    private removeLanguageFilters;
    private createSettingsTree;
    private onDidChangeSetting;
    private updateTreeScrollSync;
    private getAncestors;
    private updateChangedSetting;
    private reportModifiedSetting;
    private scheduleRefresh;
    private createSettingsOrderByTocIndex;
    private refreshModels;
    private onConfigUpdate;
    private updateElementsByKey;
    private getActiveControlInSettingsTree;
    private renderTree;
    private contextViewFocused;
    private refreshSingleElement;
    private refreshTree;
    private refreshTOCTree;
    private updateModifiedLabelForKey;
    private onSearchInputChanged;
    private parseSettingFromJSON;
    /**
     * Toggles the visibility of the Settings editor table of contents during a search
     * depending on the behavior.
     */
    private toggleTocBySearchBehaviorType;
    private triggerSearch;
    /**
     * Return a fake SearchResultModel which can hold a flat list of all settings, to be filtered (@modified etc)
     */
    private createFilterModel;
    private reportFilteringUsed;
    private triggerFilterPreferences;
    private onDidFinishSearch;
    private localFilterPreferences;
    private remoteSearchPreferences;
    private filterOrSearchPreferences;
    private renderResultCountMessages;
    private _filterOrSearchPreferencesModel;
    private layoutSplitView;
    protected saveState(): void;
}
