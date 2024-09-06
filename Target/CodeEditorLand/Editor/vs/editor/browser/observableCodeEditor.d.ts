import { Disposable, DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { IObservable, ITransaction } from "vs/base/common/observable";
import { ICodeEditor, IOverlayWidgetPosition } from "vs/editor/browser/editorBrowser";
import { EditorOption, FindComputedEditorOptionValueById } from "vs/editor/common/config/editorOptions";
import { Selection } from "vs/editor/common/core/selection";
import { ICursorSelectionChangedEvent } from "vs/editor/common/cursorEvents";
import { IModelDeltaDecoration, ITextModel } from "vs/editor/common/model";
import { IModelContentChangedEvent } from "vs/editor/common/textModelEvents";
/**
 * Returns a facade for the code editor that provides observables for various states/events.
 */
export declare function observableCodeEditor(editor: ICodeEditor): ObservableCodeEditor;
export declare class ObservableCodeEditor extends Disposable {
    readonly editor: ICodeEditor;
    private static readonly _map;
    /**
     * Make sure that editor is not disposed yet!
     */
    static get(editor: ICodeEditor): ObservableCodeEditor;
    private _updateCounter;
    private _currentTransaction;
    private _beginUpdate;
    private _endUpdate;
    private constructor();
    forceUpdate(): void;
    forceUpdate<T>(cb: (tx: ITransaction) => T): T;
    private _forceUpdate;
    private readonly _model;
    readonly model: IObservable<ITextModel | null>;
    readonly isReadonly: any;
    private readonly _versionId;
    readonly versionId: IObservable<number | null, IModelContentChangedEvent | undefined>;
    private readonly _selections;
    readonly selections: IObservable<Selection[] | null, ICursorSelectionChangedEvent | undefined>;
    readonly positions: any;
    readonly isFocused: any;
    readonly value: any;
    readonly valueIsEmpty: any;
    readonly cursorSelection: any;
    readonly cursorPosition: any;
    readonly onDidType: any;
    readonly scrollTop: any;
    readonly scrollLeft: any;
    readonly layoutInfo: any;
    readonly layoutInfoContentLeft: any;
    readonly layoutInfoDecorationsLeft: any;
    readonly contentWidth: any;
    getOption<T extends EditorOption>(id: T): IObservable<FindComputedEditorOptionValueById<T>>;
    setDecorations(decorations: IObservable<IModelDeltaDecoration[]>): IDisposable;
    private _overlayWidgetCounter;
    createOverlayWidget(widget: IObservableOverlayWidget): IDisposable;
}
interface IObservableOverlayWidget {
    get domNode(): HTMLElement;
    readonly position: IObservable<IOverlayWidgetPosition | null>;
    readonly minContentWidthInPx: IObservable<number>;
    get allowEditorOverflow(): boolean;
}
type RemoveUndefined<T> = T extends undefined ? never : T;
export declare function reactToChange<T, TChange>(observable: IObservable<T, TChange>, cb: (value: T, deltas: RemoveUndefined<TChange>[]) => void): IDisposable;
export declare function reactToChangeWithStore<T, TChange>(observable: IObservable<T, TChange>, cb: (value: T, deltas: RemoveUndefined<TChange>[], store: DisposableStore) => void): IDisposable;
export {};
