import { IStringDictionary } from "vs/base/common/collections";
import { Event } from "vs/base/common/event";
import { IMatch } from "vs/base/common/filters";
import { IJSONSchema, IJSONSchemaMap } from "vs/base/common/jsonSchema";
import { ResolvedKeybinding } from "vs/base/common/keybindings";
import { URI } from "vs/base/common/uri";
import { IRange } from "vs/editor/common/core/range";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ConfigurationTarget } from "vs/platform/configuration/common/configuration";
import { ConfigurationDefaultValueSource, ConfigurationScope, EditPresentationTypes, IExtensionInfo } from "vs/platform/configuration/common/configurationRegistry";
import { IEditorOptions } from "vs/platform/editor/common/editor";
import { IExtensionDescription } from "vs/platform/extensions/common/extensions";
import { ResolvedKeybindingItem } from "vs/platform/keybinding/common/resolvedKeybindingItem";
import { IEditorPane } from "vs/workbench/common/editor";
import { EditorInput } from "vs/workbench/common/editor/editorInput";
import { Settings2EditorModel } from "vs/workbench/services/preferences/common/preferencesModels";
export declare enum SettingValueType {
    Null = "null",
    Enum = "enum",
    String = "string",
    MultilineString = "multiline-string",
    Integer = "integer",
    Number = "number",
    Boolean = "boolean",
    Array = "array",
    Exclude = "exclude",
    Include = "include",
    Complex = "complex",
    NullableInteger = "nullable-integer",
    NullableNumber = "nullable-number",
    Object = "object",
    BooleanObject = "boolean-object",
    LanguageTag = "language-tag",
    ExtensionToggle = "extension-toggle"
}
export interface ISettingsGroup {
    id: string;
    range: IRange;
    title: string;
    titleRange: IRange;
    sections: ISettingsSection[];
    order?: number;
    extensionInfo?: IExtensionInfo;
}
export interface ISettingsSection {
    titleRange?: IRange;
    title?: string;
    settings: ISetting[];
}
export interface ISetting {
    range: IRange;
    key: string;
    keyRange: IRange;
    value: any;
    valueRange: IRange;
    description: string[];
    descriptionIsMarkdown?: boolean;
    descriptionRanges: IRange[];
    overrides?: ISetting[];
    overrideOf?: ISetting;
    deprecationMessage?: string;
    deprecationMessageIsMarkdown?: boolean;
    scope?: ConfigurationScope;
    type?: string | string[];
    order?: number;
    arrayItemType?: string;
    objectProperties?: IJSONSchemaMap;
    objectPatternProperties?: IJSONSchemaMap;
    objectAdditionalProperties?: boolean | IJSONSchema;
    enum?: string[];
    enumDescriptions?: string[];
    enumDescriptionsAreMarkdown?: boolean;
    uniqueItems?: boolean;
    tags?: string[];
    disallowSyncIgnore?: boolean;
    restricted?: boolean;
    extensionInfo?: IExtensionInfo;
    validator?: (value: any) => string | null;
    enumItemLabels?: string[];
    editPresentation?: EditPresentationTypes;
    nonLanguageSpecificDefaultValueSource?: ConfigurationDefaultValueSource;
    isLanguageTagSetting?: boolean;
    categoryLabel?: string;
    allKeysAreBoolean?: boolean;
    displayExtensionId?: string;
    title?: string;
    extensionGroupTitle?: string;
    internalOrder?: number;
}
export interface IExtensionSetting extends ISetting {
    extensionName?: string;
    extensionPublisher?: string;
}
export interface ISearchResult {
    filterMatches: ISettingMatch[];
    exactMatch?: boolean;
    metadata?: IFilterMetadata;
}
export interface ISearchResultGroup {
    id: string;
    label: string;
    result: ISearchResult;
    order: number;
}
export interface IFilterResult {
    query?: string;
    filteredGroups: ISettingsGroup[];
    allGroups: ISettingsGroup[];
    matches: IRange[];
    metadata?: IStringDictionary<IFilterMetadata>;
    exactMatch?: boolean;
}
/**
 * The ways a setting could match a query,
 * sorted in increasing order of relevance.
 */
export declare enum SettingMatchType {
    None = 0,
    LanguageTagSettingMatch = 1,
    RemoteMatch = 2,
    DescriptionOrValueMatch = 4,
    KeyMatch = 8
}
export interface ISettingMatch {
    setting: ISetting;
    matches: IRange[] | null;
    matchType: SettingMatchType;
    score: number;
}
export interface IScoredResults {
    [key: string]: IRemoteSetting;
}
export interface IRemoteSetting {
    score: number;
    key: string;
    id: string;
    defaultValue: string;
    description: string;
    packageId: string;
    extensionName?: string;
    extensionPublisher?: string;
}
export interface IFilterMetadata {
    requestUrl: string;
    requestBody: string;
    timestamp: number;
    duration: number;
    scoredResults: IScoredResults;
    /** The number of requests made, since requests are split by number of filters */
    requestCount?: number;
    /** The name of the server that actually served the request */
    context: string;
}
export interface IPreferencesEditorModel<T> {
    uri?: URI;
    getPreference(key: string): T | undefined;
    dispose(): void;
}
export type IGroupFilter = (group: ISettingsGroup) => boolean | null;
export type ISettingMatcher = (setting: ISetting, group: ISettingsGroup) => {
    matches: IRange[];
    matchType: SettingMatchType;
    score: number;
} | null;
export interface ISettingsEditorModel extends IPreferencesEditorModel<ISetting> {
    readonly onDidChangeGroups: Event<void>;
    settingsGroups: ISettingsGroup[];
    filterSettings(filter: string, groupFilter: IGroupFilter, settingMatcher: ISettingMatcher): ISettingMatch[];
    findValueMatches(filter: string, setting: ISetting): IRange[];
    updateResultGroup(id: string, resultGroup: ISearchResultGroup | undefined): IFilterResult | undefined;
}
export interface ISettingsEditorOptions extends IEditorOptions {
    target?: ConfigurationTarget;
    folderUri?: URI;
    query?: string;
    /**
     * Only works when opening the json settings file. Use `query` for settings editor.
     */
    revealSetting?: {
        key: string;
        edit?: boolean;
    };
    focusSearch?: boolean;
}
export interface IOpenSettingsOptions extends ISettingsEditorOptions {
    jsonEditor?: boolean;
    openToSide?: boolean;
}
export declare function validateSettingsEditorOptions(options: ISettingsEditorOptions): ISettingsEditorOptions;
export interface IKeybindingsEditorModel<T> extends IPreferencesEditorModel<T> {
}
export interface IKeybindingsEditorOptions extends IEditorOptions {
    query?: string;
}
export declare const IPreferencesService: any;
export interface IPreferencesService {
    readonly _serviceBrand: undefined;
    readonly onDidDefaultSettingsContentChanged: Event<URI>;
    userSettingsResource: URI;
    workspaceSettingsResource: URI | null;
    getFolderSettingsResource(resource: URI): URI | null;
    createPreferencesEditorModel(uri: URI): Promise<IPreferencesEditorModel<ISetting> | null>;
    getDefaultSettingsContent(uri: URI): string | undefined;
    hasDefaultSettingsContent(uri: URI): boolean;
    createSettings2EditorModel(): Settings2EditorModel;
    openRawDefaultSettings(): Promise<IEditorPane | undefined>;
    openSettings(options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    openApplicationSettings(options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    openUserSettings(options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    openRemoteSettings(options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    openWorkspaceSettings(options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    openFolderSettings(options: IOpenSettingsOptions & {
        folderUri: IOpenSettingsOptions["folderUri"];
    }): Promise<IEditorPane | undefined>;
    openGlobalKeybindingSettings(textual: boolean, options?: IKeybindingsEditorOptions): Promise<void>;
    openDefaultKeybindingsFile(): Promise<IEditorPane | undefined>;
    openLanguageSpecificSettings(languageId: string, options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    getEditableSettingsURI(configurationTarget: ConfigurationTarget, resource?: URI): Promise<URI | null>;
    getSetting(settingId: string): ISetting | undefined;
    createSplitJsonEditorInput(configurationTarget: ConfigurationTarget, resource: URI): EditorInput;
}
export interface KeybindingMatch {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    keyCode?: boolean;
}
export interface KeybindingMatches {
    firstPart: KeybindingMatch;
    chordPart: KeybindingMatch;
}
export interface IKeybindingItemEntry {
    id: string;
    templateId: string;
    keybindingItem: IKeybindingItem;
    commandIdMatches?: IMatch[];
    commandLabelMatches?: IMatch[];
    commandDefaultLabelMatches?: IMatch[];
    sourceMatches?: IMatch[];
    extensionIdMatches?: IMatch[];
    extensionLabelMatches?: IMatch[];
    whenMatches?: IMatch[];
    keybindingMatches?: KeybindingMatches;
}
export interface IKeybindingItem {
    keybinding: ResolvedKeybinding;
    keybindingItem: ResolvedKeybindingItem;
    commandLabel: string;
    commandDefaultLabel: string;
    command: string;
    source: string | IExtensionDescription;
    when: string;
}
export interface IKeybindingsEditorPane extends IEditorPane {
    readonly activeKeybindingEntry: IKeybindingItemEntry | null;
    readonly onDefineWhenExpression: Event<IKeybindingItemEntry>;
    readonly onLayout: Event<void>;
    search(filter: string): void;
    focusSearch(): void;
    clearSearchResults(): void;
    focusKeybindings(): void;
    recordSearchKeys(): void;
    toggleSortByPrecedence(): void;
    selectKeybinding(keybindingEntry: IKeybindingItemEntry): void;
    defineKeybinding(keybindingEntry: IKeybindingItemEntry, add: boolean): Promise<void>;
    defineWhenExpression(keybindingEntry: IKeybindingItemEntry): void;
    updateKeybinding(keybindingEntry: IKeybindingItemEntry, key: string, when: string | undefined): Promise<any>;
    removeKeybinding(keybindingEntry: IKeybindingItemEntry): Promise<any>;
    resetKeybinding(keybindingEntry: IKeybindingItemEntry): Promise<any>;
    copyKeybinding(keybindingEntry: IKeybindingItemEntry): Promise<void>;
    copyKeybindingCommand(keybindingEntry: IKeybindingItemEntry): Promise<void>;
    showSimilarKeybindings(keybindingEntry: IKeybindingItemEntry): void;
}
export declare const DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = "editor.contrib.defineKeybinding";
export interface IDefineKeybindingEditorContribution extends IEditorContribution {
    showDefineKeybindingWidget(): void;
}
export declare const FOLDER_SETTINGS_PATH = ".vscode/settings.json";
export declare const DEFAULT_SETTINGS_EDITOR_SETTING = "workbench.settings.openDefaultSettings";
export declare const USE_SPLIT_JSON_SETTING = "workbench.settings.useSplitJSON";
export declare const SETTINGS_AUTHORITY = "settings";