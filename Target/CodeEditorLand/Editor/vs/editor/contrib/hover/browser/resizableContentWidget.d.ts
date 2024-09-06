import * as dom from "vs/base/browser/dom";
import { Disposable } from "vs/base/common/lifecycle";
import { ContentWidgetPositionPreference, ICodeEditor, IContentWidget, IContentWidgetPosition } from "vs/editor/browser/editorBrowser";
import { IPosition, Position } from "vs/editor/common/core/position";
export declare abstract class ResizableContentWidget extends Disposable implements IContentWidget {
    protected readonly _editor: ICodeEditor;
    readonly allowEditorOverflow: boolean;
    readonly suppressMouseDown: boolean;
    protected readonly _resizableNode: any;
    protected _contentPosition: IContentWidgetPosition | null;
    private _isResizing;
    constructor(_editor: ICodeEditor, minimumSize?: dom.IDimension);
    get isResizing(): boolean;
    abstract getId(): string;
    getDomNode(): HTMLElement;
    getPosition(): IContentWidgetPosition | null;
    get position(): Position | undefined;
    protected _availableVerticalSpaceAbove(position: IPosition): number | undefined;
    protected _availableVerticalSpaceBelow(position: IPosition): number | undefined;
    protected _findPositionPreference(widgetHeight: number, showAtPosition: IPosition): ContentWidgetPositionPreference | undefined;
    protected _resize(dimension: dom.Dimension): void;
}
