import "vs/css!./media/suggest";
import * as dom from "vs/base/browser/dom";
import { List } from "vs/base/browser/ui/list/listWidget";
import { ResizableHTMLElement } from "vs/base/browser/ui/resizable/resizable";
import { Event } from "vs/base/common/event";
import { Disposable } from "vs/base/common/lifecycle";
import { MenuId } from "vs/platform/actions/common/actions";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { SimpleCompletionItem } from "vs/workbench/services/suggest/browser/simpleCompletionItem";
import { LineContext, SimpleCompletionModel } from "vs/workbench/services/suggest/browser/simpleCompletionModel";
import { type ISimpleSuggestWidgetFontInfo } from "vs/workbench/services/suggest/browser/simpleSuggestWidgetRenderer";
export interface ISimpleSelectedSuggestion {
    item: SimpleCompletionItem;
    index: number;
    model: SimpleCompletionModel;
}
interface IPersistedWidgetSizeDelegate {
    restore(): dom.Dimension | undefined;
    store(size: dom.Dimension): void;
    reset(): void;
}
export interface IWorkbenchSuggestWidgetOptions {
    /**
     * The {@link MenuId} to use for the status bar. Items on the menu must use the groups `'left'`
     * and `'right'`.
     */
    statusBarMenuId?: MenuId;
}
export declare class SimpleSuggestWidget extends Disposable {
    private readonly _container;
    private readonly _persistedSize;
    private readonly _getFontInfo;
    private _state;
    private _completionModel?;
    private _cappedHeight?;
    private _forceRenderingAbove;
    private _preference?;
    private readonly _pendingLayout;
    readonly element: ResizableHTMLElement;
    private readonly _listElement;
    private readonly _list;
    private readonly _status?;
    private readonly _showTimeout;
    private readonly _onDidSelect;
    readonly onDidSelect: Event<ISimpleSelectedSuggestion>;
    private readonly _onDidHide;
    readonly onDidHide: Event<this>;
    private readonly _onDidShow;
    readonly onDidShow: Event<this>;
    get list(): List<SimpleCompletionItem>;
    constructor(_container: HTMLElement, _persistedSize: IPersistedWidgetSizeDelegate, _getFontInfo: () => ISimpleSuggestWidgetFontInfo, options: IWorkbenchSuggestWidgetOptions, instantiationService: IInstantiationService);
    private _cursorPosition?;
    setCompletionModel(completionModel: SimpleCompletionModel): void;
    hasCompletions(): boolean;
    showSuggestions(selectionIndex: number, isFrozen: boolean, isAuto: boolean, cursorPosition: {
        top: number;
        left: number;
        height: number;
    }): void;
    setLineContext(lineContext: LineContext): void;
    private _setState;
    private _show;
    hide(): void;
    private _layout;
    private _resize;
    private _getLayoutInfo;
    private _onListMouseDownOrTap;
    private _onListSelection;
    private _select;
    selectNext(): boolean;
    selectNextPage(): boolean;
    selectPrevious(): boolean;
    selectPreviousPage(): boolean;
    getFocusedItem(): ISimpleSelectedSuggestion | undefined;
    forceRenderingAbove(): void;
    stopForceRenderingAbove(): void;
}
export {};
