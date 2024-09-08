import type { Color } from "../../../common/color.js";
import { Event } from "../../../common/event.js";
import { type IDisposable } from "../../../common/lifecycle.js";
import type { IView, IViewSize } from "../grid/grid.js";
import type { IBoundarySashes } from "../sash/sash.js";
import { type ISplitViewStyles } from "../splitview/splitview.js";
export interface CenteredViewState {
    targetWidth: number;
    leftMarginRatio: number;
    rightMarginRatio: number;
}
export interface ICenteredViewStyles extends ISplitViewStyles {
    background: Color;
}
export declare class CenteredViewLayout implements IDisposable {
    private container;
    private view;
    state: CenteredViewState;
    private centeredLayoutFixedWidth;
    private splitView?;
    private lastLayoutPosition;
    private style;
    private didLayout;
    private emptyViews;
    private readonly splitViewDisposables;
    constructor(container: HTMLElement, view: IView, state?: CenteredViewState, centeredLayoutFixedWidth?: boolean);
    get minimumWidth(): number;
    get maximumWidth(): number;
    get minimumHeight(): number;
    get maximumHeight(): number;
    get onDidChange(): Event<IViewSize | undefined>;
    private _boundarySashes;
    get boundarySashes(): IBoundarySashes;
    set boundarySashes(boundarySashes: IBoundarySashes);
    layout(width: number, height: number, top: number, left: number): void;
    private resizeSplitViews;
    setFixedWidth(option: boolean): void;
    private updateState;
    isActive(): boolean;
    styles(style: ICenteredViewStyles): void;
    activate(active: boolean): void;
    isDefault(state: CenteredViewState): boolean;
    dispose(): void;
}
