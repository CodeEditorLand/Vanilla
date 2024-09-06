import { ITreeElement, ITreeNode, ITreeRenderer } from "vs/base/browser/ui/tree/tree";
import { Iterable } from "vs/base/common/iterator";
import { DisposableStore } from "vs/base/common/lifecycle";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IListService, WorkbenchObjectTree } from "vs/platform/list/browser/listService";
import { ISettingsEditorViewState, SearchResultModel, SettingsTreeElement, SettingsTreeGroupElement } from "vs/workbench/contrib/preferences/browser/settingsTreeModels";
import { IWorkbenchEnvironmentService } from "vs/workbench/services/environment/common/environmentService";
export declare class TOCTreeModel {
    private _viewState;
    private environmentService;
    private _currentSearchModel;
    private _settingsTreeRoot;
    constructor(_viewState: ISettingsEditorViewState, environmentService: IWorkbenchEnvironmentService);
    get settingsTreeRoot(): SettingsTreeGroupElement;
    set settingsTreeRoot(value: SettingsTreeGroupElement);
    get currentSearchModel(): SearchResultModel | null;
    set currentSearchModel(model: SearchResultModel | null);
    get children(): SettingsTreeElement[];
    update(): void;
    private updateGroupCount;
    private getGroupCount;
}
interface ITOCEntryTemplate {
    labelElement: HTMLElement;
    countElement: HTMLElement;
    elementDisposables: DisposableStore;
}
export declare class TOCRenderer implements ITreeRenderer<SettingsTreeGroupElement, never, ITOCEntryTemplate> {
    private readonly _hoverService;
    templateId: string;
    constructor(_hoverService: IHoverService);
    renderTemplate(container: HTMLElement): ITOCEntryTemplate;
    renderElement(node: ITreeNode<SettingsTreeGroupElement>, index: number, template: ITOCEntryTemplate): void;
    disposeTemplate(templateData: ITOCEntryTemplate): void;
}
export declare function createTOCIterator(model: TOCTreeModel | SettingsTreeGroupElement, tree: TOCTree): Iterable<ITreeElement<SettingsTreeGroupElement>>;
export declare class TOCTree extends WorkbenchObjectTree<SettingsTreeGroupElement> {
    constructor(container: HTMLElement, viewState: ISettingsEditorViewState, contextKeyService: IContextKeyService, listService: IListService, configurationService: IConfigurationService, hoverService: IHoverService, instantiationService: IInstantiationService);
}
export {};
