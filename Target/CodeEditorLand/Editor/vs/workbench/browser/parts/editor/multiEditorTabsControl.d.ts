import "./media/multieditortabscontrol.css";
import { Dimension } from "../../../../base/browser/dom.js";
import { ITreeViewsDnDService } from "../../../../editor/common/services/treeViewsDndService.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextMenuService } from "../../../../platform/contextview/browser/contextView.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.js";
import { type IEditorPartOptions, type IToolbarActions } from "../../../common/editor.js";
import type { IReadonlyEditorGroupModel } from "../../../common/editor/editorGroupModel.js";
import type { EditorInput } from "../../../common/editor/editorInput.js";
import { IEditorResolverService } from "../../../services/editor/common/editorResolverService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { IPathService } from "../../../services/path/common/pathService.js";
import type { EditorServiceImpl, IEditorGroupView, IEditorGroupsView, IEditorPartsView, IInternalEditorOpenOptions } from "./editor.js";
import { EditorTabsControl } from "./editorTabsControl.js";
import type { IEditorTitleControlDimensions } from "./editorTitleControl.js";
interface IMultiEditorTabsControlLayoutOptions {
    /**
     * Whether to force revealing the active tab, even when
     * the dimensions have not changed. This can be the case
     * when a tab was made active and needs to be revealed.
     */
    readonly forceRevealActiveTab?: true;
}
export declare class MultiEditorTabsControl extends EditorTabsControl {
    private readonly editorService;
    private readonly pathService;
    private readonly treeViewsDragAndDropService;
    private static readonly SCROLLBAR_SIZES;
    private static readonly TAB_WIDTH;
    private static readonly DRAG_OVER_OPEN_TAB_THRESHOLD;
    private static readonly MOUSE_WHEEL_EVENT_THRESHOLD;
    private static readonly MOUSE_WHEEL_DISTANCE_THRESHOLD;
    private titleContainer;
    private tabsAndActionsContainer;
    private tabsContainer;
    private tabsScrollbar;
    private tabSizingFixedDisposables;
    private readonly closeEditorAction;
    private readonly unpinEditorAction;
    private readonly tabResourceLabels;
    private tabLabels;
    private activeTabLabel;
    private tabActionBars;
    private tabDisposables;
    private dimensions;
    private readonly layoutScheduler;
    private blockRevealActiveTab;
    private path;
    private lastMouseWheelEventTime;
    private isMouseOverTabs;
    constructor(parent: HTMLElement, editorPartsView: IEditorPartsView, groupsView: IEditorGroupsView, groupView: IEditorGroupView, tabsModel: IReadonlyEditorGroupModel, contextMenuService: IContextMenuService, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, notificationService: INotificationService, quickInputService: IQuickInputService, themeService: IThemeService, editorService: EditorServiceImpl, pathService: IPathService, treeViewsDragAndDropService: ITreeViewsDnDService, editorResolverService: IEditorResolverService, hostService: IHostService);
    protected create(parent: HTMLElement): void;
    private createTabsScrollbar;
    private updateTabsScrollbarSizing;
    private updateTabSizing;
    private updateTabsFixedWidth;
    private getTabsScrollbarSizing;
    private registerTabsContainerListeners;
    private doHandleDecorationsChange;
    protected updateEditorActionsToolbar(): void;
    openEditor(editor: EditorInput, options?: IInternalEditorOpenOptions): boolean;
    openEditors(editors: EditorInput[]): boolean;
    private handleOpenedEditors;
    private didActiveEditorChange;
    private equalsEditorInputLabel;
    beforeCloseEditor(editor: EditorInput): void;
    closeEditor(editor: EditorInput): void;
    closeEditors(editors: EditorInput[]): void;
    private handleClosedEditors;
    moveEditor(editor: EditorInput, fromTabIndex: number, targeTabIndex: number): void;
    pinEditor(editor: EditorInput): void;
    stickEditor(editor: EditorInput): void;
    unstickEditor(editor: EditorInput): void;
    private doHandleStickyEditorChange;
    setActive(isGroupActive: boolean): void;
    updateEditorSelections(): void;
    private updateEditorLabelScheduler;
    updateEditorLabel(editor: EditorInput): void;
    private doUpdateEditorLabels;
    updateEditorDirty(editor: EditorInput): void;
    updateOptions(oldOptions: IEditorPartOptions, newOptions: IEditorPartOptions): void;
    updateStyles(): void;
    private forEachTab;
    private withTab;
    private doWithTab;
    private createTab;
    private toEditorIndex;
    private lastSingleSelectSelectedEditor;
    private registerTabListeners;
    private isSupportedDropTransfer;
    private updateDropFeedback;
    private dropTarget;
    private updateDropTarget;
    private getTabDragOverLocation;
    private computeDropTarget;
    private selectEditor;
    private selectEditorsBetween;
    private unselectEditor;
    private unselectAllEditors;
    private computeTabLabels;
    private shortenTabLabels;
    private getLabelConfigFlags;
    private redraw;
    private redrawTab;
    private redrawTabLabel;
    private redrawTabSelectedActiveAndDirty;
    private doRedrawTabActive;
    private doRedrawTabDirty;
    private redrawTabBorders;
    protected prepareEditorActions(editorActions: IToolbarActions): IToolbarActions;
    getHeight(): number;
    private computeHeight;
    layout(dimensions: IEditorTitleControlDimensions, options?: IMultiEditorTabsControlLayoutOptions): Dimension;
    private doLayout;
    private doLayoutTabs;
    private doLayoutTabsWrapping;
    private doLayoutTabsNonWrapping;
    private updateTabsControlVisibility;
    private get visible();
    private getTabAndIndex;
    private getTabAtIndex;
    private getLastTab;
    private blockRevealActiveTabOnce;
    private originatesFromTabActionBar;
    private onDrop;
    dispose(): void;
}
export {};