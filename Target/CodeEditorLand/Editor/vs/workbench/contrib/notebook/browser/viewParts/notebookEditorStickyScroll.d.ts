import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { IContextMenuService } from "vs/platform/contextview/browser/contextView";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { INotebookEditor } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
import { INotebookCellList } from "vs/workbench/contrib/notebook/browser/view/notebookRenderingCommon";
import { OutlineEntry } from "vs/workbench/contrib/notebook/browser/viewModel/OutlineEntry";
export declare class NotebookStickyLine extends Disposable {
    readonly element: HTMLElement;
    readonly foldingIcon: StickyFoldingIcon;
    readonly header: HTMLElement;
    readonly entry: OutlineEntry;
    readonly notebookEditor: INotebookEditor;
    constructor(element: HTMLElement, foldingIcon: StickyFoldingIcon, header: HTMLElement, entry: OutlineEntry, notebookEditor: INotebookEditor);
    private toggleFoldRange;
    private focusCell;
    static getParentCount(entry: OutlineEntry): number;
}
declare class StickyFoldingIcon {
    isCollapsed: boolean;
    dimension: number;
    domNode: HTMLElement;
    constructor(isCollapsed: boolean, dimension: number);
    setVisible(visible: boolean): void;
}
export declare class NotebookStickyScroll extends Disposable {
    private readonly domNode;
    private readonly notebookEditor;
    private readonly notebookCellList;
    private readonly layoutFn;
    private readonly _contextMenuService;
    private readonly instantiationService;
    private readonly _disposables;
    private currentStickyLines;
    private readonly _onDidChangeNotebookStickyScroll;
    readonly onDidChangeNotebookStickyScroll: Event<number>;
    private notebookCellOutlineReference?;
    private readonly _layoutDisposableStore;
    getDomNode(): HTMLElement;
    getCurrentStickyHeight(): number;
    private setCurrentStickyLines;
    private compareStickyLineMaps;
    constructor(domNode: HTMLElement, notebookEditor: INotebookEditor, notebookCellList: INotebookCellList, layoutFn: (delta: number) => void, _contextMenuService: IContextMenuService, instantiationService: IInstantiationService);
    private onContextMenu;
    private updateConfig;
    private init;
    static getVisibleOutlineEntry(visibleIndex: number, notebookOutlineEntries: OutlineEntry[]): OutlineEntry | undefined;
    private updateContent;
    private updateDisplay;
    static computeStickyHeight(entry: OutlineEntry): number;
    static checkCollapsedStickyLines(entry: OutlineEntry | undefined, numLinesToRender: number, notebookEditor: INotebookEditor): Map<OutlineEntry, {
        line: NotebookStickyLine;
        rendered: boolean;
    }>;
    private renderStickyLines;
    static createStickyElement(entry: OutlineEntry, notebookEditor: INotebookEditor): NotebookStickyLine;
    private disposeCurrentStickyLines;
    dispose(): void;
}
export declare function computeContent(notebookEditor: INotebookEditor, notebookCellList: INotebookCellList, notebookOutlineEntries: OutlineEntry[], renderedStickyHeight: number): Map<OutlineEntry, {
    line: NotebookStickyLine;
    rendered: boolean;
}>;
export {};
