import { CancellationToken } from "vs/base/common/cancellation";
import { IStringDictionary } from "vs/base/common/collections";
import { IExtensionRecommendations } from "vs/base/common/product";
import { IExtensionGalleryService, IGalleryExtension } from "vs/platform/extensionManagement/common/extensionManagement";
import { IProductService } from "vs/platform/product/common/productService";
import { ISearchResult, ISettingsEditorModel } from "vs/workbench/services/preferences/common/preferences";
export interface IWorkbenchSettingsConfiguration {
    workbench: {
        settings: {
            openDefaultSettings: boolean;
            naturalLanguageSearchEndpoint: string;
            naturalLanguageSearchKey: string;
            naturalLanguageSearchAutoIngestFeedback: boolean;
            useNaturalLanguageSearchPost: boolean;
            enableNaturalLanguageSearch: boolean;
            enableNaturalLanguageSearchFeedback: boolean;
        };
    };
}
export interface IEndpointDetails {
    urlBase: string;
    key?: string;
}
export declare const IPreferencesSearchService: any;
export interface IPreferencesSearchService {
    readonly _serviceBrand: undefined;
    getLocalSearchProvider(filter: string): ISearchProvider;
    getRemoteSearchProvider(filter: string, newExtensionsOnly?: boolean): ISearchProvider | undefined;
}
export interface ISearchProvider {
    searchModel(preferencesModel: ISettingsEditorModel, token?: CancellationToken): Promise<ISearchResult | null>;
}
export interface IRemoteSearchProvider extends ISearchProvider {
    setFilter(filter: string): void;
}
export declare const SETTINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = "settings.action.clearSearchResults";
export declare const SETTINGS_EDITOR_COMMAND_SHOW_CONTEXT_MENU = "settings.action.showContextMenu";
export declare const SETTINGS_EDITOR_COMMAND_SUGGEST_FILTERS = "settings.action.suggestFilters";
export declare const CONTEXT_SETTINGS_EDITOR: any;
export declare const CONTEXT_SETTINGS_JSON_EDITOR: any;
export declare const CONTEXT_SETTINGS_SEARCH_FOCUS: any;
export declare const CONTEXT_TOC_ROW_FOCUS: any;
export declare const CONTEXT_SETTINGS_ROW_FOCUS: any;
export declare const CONTEXT_KEYBINDINGS_EDITOR: any;
export declare const CONTEXT_KEYBINDINGS_SEARCH_FOCUS: any;
export declare const CONTEXT_KEYBINDING_FOCUS: any;
export declare const CONTEXT_WHEN_FOCUS: any;
export declare const KEYBINDINGS_EDITOR_COMMAND_SEARCH = "keybindings.editor.searchKeybindings";
export declare const KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_RESULTS = "keybindings.editor.clearSearchResults";
export declare const KEYBINDINGS_EDITOR_COMMAND_CLEAR_SEARCH_HISTORY = "keybindings.editor.clearSearchHistory";
export declare const KEYBINDINGS_EDITOR_COMMAND_RECORD_SEARCH_KEYS = "keybindings.editor.recordSearchKeys";
export declare const KEYBINDINGS_EDITOR_COMMAND_SORTBY_PRECEDENCE = "keybindings.editor.toggleSortByPrecedence";
export declare const KEYBINDINGS_EDITOR_COMMAND_DEFINE = "keybindings.editor.defineKeybinding";
export declare const KEYBINDINGS_EDITOR_COMMAND_ADD = "keybindings.editor.addKeybinding";
export declare const KEYBINDINGS_EDITOR_COMMAND_DEFINE_WHEN = "keybindings.editor.defineWhenExpression";
export declare const KEYBINDINGS_EDITOR_COMMAND_ACCEPT_WHEN = "keybindings.editor.acceptWhenExpression";
export declare const KEYBINDINGS_EDITOR_COMMAND_REJECT_WHEN = "keybindings.editor.rejectWhenExpression";
export declare const KEYBINDINGS_EDITOR_COMMAND_REMOVE = "keybindings.editor.removeKeybinding";
export declare const KEYBINDINGS_EDITOR_COMMAND_RESET = "keybindings.editor.resetKeybinding";
export declare const KEYBINDINGS_EDITOR_COMMAND_COPY = "keybindings.editor.copyKeybindingEntry";
export declare const KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND = "keybindings.editor.copyCommandKeybindingEntry";
export declare const KEYBINDINGS_EDITOR_COMMAND_COPY_COMMAND_TITLE = "keybindings.editor.copyCommandTitle";
export declare const KEYBINDINGS_EDITOR_COMMAND_SHOW_SIMILAR = "keybindings.editor.showConflicts";
export declare const KEYBINDINGS_EDITOR_COMMAND_FOCUS_KEYBINDINGS = "keybindings.editor.focusKeybindings";
export declare const KEYBINDINGS_EDITOR_SHOW_DEFAULT_KEYBINDINGS = "keybindings.editor.showDefaultKeybindings";
export declare const KEYBINDINGS_EDITOR_SHOW_USER_KEYBINDINGS = "keybindings.editor.showUserKeybindings";
export declare const KEYBINDINGS_EDITOR_SHOW_EXTENSION_KEYBINDINGS = "keybindings.editor.showExtensionKeybindings";
export declare const MODIFIED_SETTING_TAG = "modified";
export declare const EXTENSION_SETTING_TAG = "ext:";
export declare const FEATURE_SETTING_TAG = "feature:";
export declare const ID_SETTING_TAG = "id:";
export declare const LANGUAGE_SETTING_TAG = "lang:";
export declare const GENERAL_TAG_SETTING_TAG = "tag:";
export declare const POLICY_SETTING_TAG = "hasPolicy";
export declare const WORKSPACE_TRUST_SETTING_TAG = "workspaceTrust";
export declare const REQUIRE_TRUSTED_WORKSPACE_SETTING_TAG = "requireTrustedWorkspace";
export declare const KEYBOARD_LAYOUT_OPEN_PICKER = "workbench.action.openKeyboardLayoutPicker";
export declare const ENABLE_LANGUAGE_FILTER = true;
export declare const ENABLE_EXTENSION_TOGGLE_SETTINGS = true;
export type ExtensionToggleData = {
    settingsEditorRecommendedExtensions: IStringDictionary<IExtensionRecommendations>;
    recommendedExtensionsGalleryInfo: IStringDictionary<IGalleryExtension>;
    commonlyUsed: string[];
};
export declare function getExperimentalExtensionToggleData(extensionGalleryService: IExtensionGalleryService, productService: IProductService): Promise<ExtensionToggleData | undefined>;
/**
 * Compares two nullable numbers such that null values always come after defined ones.
 */
export declare function compareTwoNullableNumbers(a: number | undefined, b: number | undefined): number;
