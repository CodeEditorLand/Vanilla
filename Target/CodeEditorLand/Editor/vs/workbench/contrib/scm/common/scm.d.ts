import type { IAction } from "../../../../base/common/actions.js";
import type { Event } from "../../../../base/common/event.js";
import type { IMarkdownString } from "../../../../base/common/htmlContent.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { IObservable } from "../../../../base/common/observable.js";
import type { ResourceTree } from "../../../../base/common/resourceTree.js";
import type { ThemeIcon } from "../../../../base/common/themables.js";
import type { URI } from "../../../../base/common/uri.js";
import type { Command } from "../../../../editor/common/languages.js";
import type { ITextModel } from "../../../../editor/common/model.js";
import type { IMenu } from "../../../../platform/actions/common/actions.js";
import type { ISCMHistoryProvider } from "./history.js";
export declare const VIEWLET_ID = "workbench.view.scm";
export declare const VIEW_PANE_ID = "workbench.scm";
export declare const REPOSITORIES_VIEW_PANE_ID = "workbench.scm.repositories";
export declare const HISTORY_VIEW_PANE_ID = "workbench.scm.history";
export interface IBaselineResourceProvider {
    getBaselineResource(resource: URI): Promise<URI>;
}
export declare const ISCMService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISCMService>;
export interface ISCMResourceDecorations {
    icon?: URI | ThemeIcon;
    iconDark?: URI | ThemeIcon;
    tooltip?: string;
    strikeThrough?: boolean;
    faded?: boolean;
}
export interface ISCMResource {
    readonly resourceGroup: ISCMResourceGroup;
    readonly sourceUri: URI;
    readonly decorations: ISCMResourceDecorations;
    readonly contextValue: string | undefined;
    readonly command: Command | undefined;
    readonly multiDiffEditorOriginalUri: URI | undefined;
    readonly multiDiffEditorModifiedUri: URI | undefined;
    open(preserveFocus: boolean): Promise<void>;
}
export interface ISCMResourceGroup {
    readonly id: string;
    readonly provider: ISCMProvider;
    readonly resources: readonly ISCMResource[];
    readonly resourceTree: ResourceTree<ISCMResource, ISCMResourceGroup>;
    readonly onDidChangeResources: Event<void>;
    readonly label: string;
    readonly hideWhenEmpty: boolean;
    readonly onDidChange: Event<void>;
    readonly multiDiffEditorEnableViewChanges: boolean;
}
export interface ISCMProvider extends IDisposable {
    readonly id: string;
    readonly label: string;
    readonly contextValue: string;
    readonly name: string;
    readonly groups: readonly ISCMResourceGroup[];
    readonly onDidChangeResourceGroups: Event<void>;
    readonly onDidChangeResources: Event<void>;
    readonly rootUri?: URI;
    readonly inputBoxTextModel: ITextModel;
    readonly count: IObservable<number | undefined>;
    readonly commitTemplate: IObservable<string>;
    readonly historyProvider: IObservable<ISCMHistoryProvider | undefined>;
    readonly acceptInputCommand?: Command;
    readonly actionButton?: ISCMActionButtonDescriptor;
    readonly statusBarCommands: IObservable<readonly Command[] | undefined>;
    readonly onDidChange: Event<void>;
    getOriginalResource(uri: URI): Promise<URI | null>;
}
export interface ISCMInputValueProviderContext {
    readonly resourceGroupId: string;
    readonly resources: readonly URI[];
}
export declare enum InputValidationType {
    Error = 0,
    Warning = 1,
    Information = 2
}
export interface IInputValidation {
    message: string | IMarkdownString;
    type: InputValidationType;
}
export interface IInputValidator {
    (value: string, cursorPosition: number): Promise<IInputValidation | undefined>;
}
export declare enum SCMInputChangeReason {
    HistoryPrevious = 0,
    HistoryNext = 1
}
export interface ISCMInputChangeEvent {
    readonly value: string;
    readonly reason?: SCMInputChangeReason;
}
export interface ISCMActionButtonDescriptor {
    command: Command;
    secondaryCommands?: Command[][];
    description?: string;
    enabled: boolean;
}
export interface ISCMActionButton {
    readonly type: "actionButton";
    readonly repository: ISCMRepository;
    readonly button?: ISCMActionButtonDescriptor;
}
export interface ISCMInput {
    readonly repository: ISCMRepository;
    readonly value: string;
    setValue(value: string, fromKeyboard: boolean): void;
    readonly onDidChange: Event<ISCMInputChangeEvent>;
    placeholder: string;
    readonly onDidChangePlaceholder: Event<string>;
    validateInput: IInputValidator;
    readonly onDidChangeValidateInput: Event<void>;
    enabled: boolean;
    readonly onDidChangeEnablement: Event<boolean>;
    visible: boolean;
    readonly onDidChangeVisibility: Event<boolean>;
    setFocus(): void;
    readonly onDidChangeFocus: Event<void>;
    showValidationMessage(message: string | IMarkdownString, type: InputValidationType): void;
    readonly onDidChangeValidationMessage: Event<IInputValidation>;
    showNextHistoryValue(): void;
    showPreviousHistoryValue(): void;
}
export interface ISCMRepository extends IDisposable {
    readonly id: string;
    readonly provider: ISCMProvider;
    readonly input: ISCMInput;
}
export interface ISCMService {
    readonly _serviceBrand: undefined;
    readonly onDidAddRepository: Event<ISCMRepository>;
    readonly onDidRemoveRepository: Event<ISCMRepository>;
    readonly repositories: Iterable<ISCMRepository>;
    readonly repositoryCount: number;
    registerSCMProvider(provider: ISCMProvider): ISCMRepository;
    getRepository(id: string): ISCMRepository | undefined;
    getRepository(resource: URI): ISCMRepository | undefined;
}
export interface ISCMTitleMenu {
    readonly actions: IAction[];
    readonly secondaryActions: IAction[];
    readonly onDidChangeTitle: Event<void>;
    readonly menu: IMenu;
}
export interface ISCMRepositoryMenus {
    readonly titleMenu: ISCMTitleMenu;
    readonly repositoryMenu: IMenu;
    readonly repositoryContextMenu: IMenu;
    getResourceGroupMenu(group: ISCMResourceGroup): IMenu;
    getResourceMenu(resource: ISCMResource): IMenu;
    getResourceFolderMenu(group: ISCMResourceGroup): IMenu;
}
export interface ISCMMenus {
    getRepositoryMenus(provider: ISCMProvider): ISCMRepositoryMenus;
}
export declare enum ISCMRepositorySortKey {
    DiscoveryTime = "discoveryTime",
    Name = "name",
    Path = "path"
}
export declare const ISCMViewService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISCMViewService>;
export interface ISCMViewVisibleRepositoryChangeEvent {
    readonly added: Iterable<ISCMRepository>;
    readonly removed: Iterable<ISCMRepository>;
}
export interface ISCMViewService {
    readonly _serviceBrand: undefined;
    readonly menus: ISCMMenus;
    repositories: ISCMRepository[];
    readonly onDidChangeRepositories: Event<ISCMViewVisibleRepositoryChangeEvent>;
    visibleRepositories: readonly ISCMRepository[];
    readonly onDidChangeVisibleRepositories: Event<ISCMViewVisibleRepositoryChangeEvent>;
    isVisible(repository: ISCMRepository): boolean;
    toggleVisibility(repository: ISCMRepository, visible?: boolean): void;
    toggleSortKey(sortKey: ISCMRepositorySortKey): void;
    readonly focusedRepository: ISCMRepository | undefined;
    readonly onDidFocusRepository: Event<ISCMRepository | undefined>;
    focus(repository: ISCMRepository): void;
    /**
     * Focused repository or the repository for the active editor
     */
    readonly activeRepository: IObservable<ISCMRepository | undefined>;
}
export declare const SCM_CHANGES_EDITOR_ID = "workbench.editor.scmChangesEditor";
export type ISCMChangesEditor = {};
