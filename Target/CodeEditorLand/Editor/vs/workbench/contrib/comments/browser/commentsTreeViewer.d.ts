import { ActionBar, IActionViewItemProvider } from "vs/base/browser/ui/actionbar/actionbar";
import { IListRenderer } from "vs/base/browser/ui/list/list";
import { IListStyles } from "vs/base/browser/ui/list/listWidget";
import { ITreeFilter, ITreeNode, TreeFilterResult, TreeVisibility } from "vs/base/browser/ui/tree/tree";
import { IAction } from "vs/base/common/actions";
import { IMatch } from "vs/base/common/filters";
import { IDisposable } from "vs/base/common/lifecycle";
import { ILocalizedString } from "vs/platform/action/common/action";
import { IMenuService } from "vs/platform/actions/common/actions";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IHoverService } from "vs/platform/hover/browser/hover";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IKeybindingService } from "vs/platform/keybinding/common/keybinding";
import { IListService, IWorkbenchAsyncDataTreeOptions, WorkbenchObjectTree } from "vs/platform/list/browser/listService";
import { IOpenerService } from "vs/platform/opener/common/opener";
import { IStyleOverride } from "vs/platform/theme/browser/defaultStyles";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IResourceLabel, ResourceLabels } from "vs/workbench/browser/labels";
import { FilterOptions } from "vs/workbench/contrib/comments/browser/commentsFilterOptions";
import { CommentsModel } from "vs/workbench/contrib/comments/browser/commentsModel";
import { TimestampWidget } from "vs/workbench/contrib/comments/browser/timestamp";
import { CommentNode, ResourceWithCommentThreads } from "vs/workbench/contrib/comments/common/commentModel";
export declare const COMMENTS_VIEW_ID = "workbench.panel.comments";
export declare const COMMENTS_VIEW_STORAGE_ID = "Comments";
export declare const COMMENTS_VIEW_TITLE: ILocalizedString;
interface IResourceTemplateData {
    resourceLabel: IResourceLabel;
    separator: HTMLElement;
    owner: HTMLElement;
}
interface ICommentThreadTemplateData {
    threadMetadata: {
        relevance: HTMLElement;
        icon: HTMLElement;
        userNames: HTMLSpanElement;
        timestamp: TimestampWidget;
        separator: HTMLElement;
        commentPreview: HTMLSpanElement;
        range: HTMLSpanElement;
    };
    repliesMetadata: {
        container: HTMLElement;
        icon: HTMLElement;
        count: HTMLSpanElement;
        lastReplyDetail: HTMLSpanElement;
        separator: HTMLElement;
        timestamp: TimestampWidget;
    };
    actionBar: ActionBar;
    disposables: IDisposable[];
}
export declare class ResourceWithCommentsRenderer implements IListRenderer<ITreeNode<ResourceWithCommentThreads>, IResourceTemplateData> {
    private labels;
    templateId: string;
    constructor(labels: ResourceLabels);
    renderTemplate(container: HTMLElement): {
        resourceLabel: any;
        owner: any;
        separator: any;
    };
    renderElement(node: ITreeNode<ResourceWithCommentThreads>, index: number, templateData: IResourceTemplateData, height: number | undefined): void;
    disposeTemplate(templateData: IResourceTemplateData): void;
}
export declare class CommentsMenus implements IDisposable {
    private readonly menuService;
    private contextKeyService;
    constructor(menuService: IMenuService);
    getResourceActions(element: CommentNode): {
        actions: IAction[];
    };
    getResourceContextActions(element: CommentNode): IAction[];
    setContextKeyService(service: IContextKeyService): void;
    private getActions;
    dispose(): void;
}
export declare class CommentNodeRenderer implements IListRenderer<ITreeNode<CommentNode>, ICommentThreadTemplateData> {
    private actionViewItemProvider;
    private menus;
    private readonly openerService;
    private readonly configurationService;
    private readonly hoverService;
    private themeService;
    templateId: string;
    constructor(actionViewItemProvider: IActionViewItemProvider, menus: CommentsMenus, openerService: IOpenerService, configurationService: IConfigurationService, hoverService: IHoverService, themeService: IThemeService);
    renderTemplate(container: HTMLElement): {
        threadMetadata: {
            icon: any;
            userNames: any;
            timestamp: any;
            relevance: any;
            separator: any;
            commentPreview: any;
            range: any;
        };
        repliesMetadata: {
            container: any;
            icon: any;
            count: any;
            lastReplyDetail: any;
            separator: any;
            timestamp: any;
        };
        actionBar: any;
        disposables: any[];
    };
    private getCountString;
    private getRenderedComment;
    private getIcon;
    renderElement(node: ITreeNode<CommentNode>, index: number, templateData: ICommentThreadTemplateData, height: number | undefined): void;
    private getCommentThreadWidgetStateColor;
    disposeTemplate(templateData: ICommentThreadTemplateData): void;
}
export interface ICommentsListOptions extends IWorkbenchAsyncDataTreeOptions<any, any> {
    overrideStyles?: IStyleOverride<IListStyles>;
}
declare const enum FilterDataType {
    Resource = 0,
    Comment = 1
}
interface ResourceFilterData {
    type: FilterDataType.Resource;
    uriMatches: IMatch[];
}
interface CommentFilterData {
    type: FilterDataType.Comment;
    textMatches: IMatch[];
}
type FilterData = ResourceFilterData | CommentFilterData;
export declare class Filter implements ITreeFilter<ResourceWithCommentThreads | CommentNode, FilterData> {
    options: FilterOptions;
    constructor(options: FilterOptions);
    filter(element: ResourceWithCommentThreads | CommentNode, parentVisibility: TreeVisibility): TreeFilterResult<FilterData>;
    private filterResourceMarkers;
    private filterCommentNode;
}
export declare class CommentsList extends WorkbenchObjectTree<CommentsModel | ResourceWithCommentThreads | CommentNode, any> {
    private readonly contextMenuService;
    private readonly keybindingService;
    private readonly menus;
    constructor(labels: ResourceLabels, container: HTMLElement, options: ICommentsListOptions, contextKeyService: IContextKeyService, listService: IListService, instantiationService: IInstantiationService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, keybindingService: IKeybindingService);
    private commentsOnContextMenu;
    filterComments(): void;
    getVisibleItemCount(): number;
}
export {};
