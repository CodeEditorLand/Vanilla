import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IObservable, IReader } from "vs/base/common/observable";
import { CodeEditorWidget } from "vs/editor/browser/widget/codeEditor/codeEditorWidget";
import { LineRange } from "vs/editor/common/core/lineRange";
import { OffsetRange } from "vs/editor/common/core/offsetRange";
export declare class EditorGutter<T extends IGutterItemInfo = IGutterItemInfo> extends Disposable {
    private readonly _editor;
    private readonly _domNode;
    private readonly itemProvider;
    private readonly scrollTop;
    private readonly isScrollTopZero;
    private readonly modelAttached;
    private readonly editorOnDidChangeViewZones;
    private readonly editorOnDidContentSizeChange;
    private readonly domNodeSizeChanged;
    constructor(_editor: CodeEditorWidget, _domNode: HTMLElement, itemProvider: IGutterItemProvider<T>);
    dispose(): void;
    private readonly views;
    private render;
}
export interface IGutterItemProvider<TItem extends IGutterItemInfo> {
    getIntersectingGutterItems(range: LineRange, reader: IReader): TItem[];
    createView(item: IObservable<TItem>, target: HTMLElement): IGutterItemView;
}
export interface IGutterItemInfo {
    id: string;
    range: LineRange;
}
export interface IGutterItemView extends IDisposable {
    layout(itemRange: OffsetRange, viewRange: OffsetRange): void;
}