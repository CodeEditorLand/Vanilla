import type { Event } from "../../../common/event.js";
import type { IListContextMenuEvent, IListEvent, IListGestureEvent, IListMouseEvent, IListRenderer, IListTouchEvent } from "../list/list.js";
export interface ITableColumn<TRow, TCell> {
    readonly label: string;
    readonly tooltip?: string;
    readonly weight: number;
    readonly templateId: string;
    readonly minimumWidth?: number;
    readonly maximumWidth?: number;
    readonly onDidChangeWidthConstraints?: Event<void>;
    project(row: TRow): TCell;
}
export interface ITableVirtualDelegate<TRow> {
    readonly headerRowHeight: number;
    getHeight(row: TRow): number;
}
export interface ITableRenderer<TCell, TTemplateData> extends IListRenderer<TCell, TTemplateData> {
}
export interface ITableEvent<TRow> extends IListEvent<TRow> {
}
export interface ITableMouseEvent<TRow> extends IListMouseEvent<TRow> {
}
export interface ITableTouchEvent<TRow> extends IListTouchEvent<TRow> {
}
export interface ITableGestureEvent<TRow> extends IListGestureEvent<TRow> {
}
export interface ITableContextMenuEvent<TRow> extends IListContextMenuEvent<TRow> {
}
export declare class TableError extends Error {
    constructor(user: string, message: string);
}