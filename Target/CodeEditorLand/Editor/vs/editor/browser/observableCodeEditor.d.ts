import { Disposable, IDisposable } from '../../base/common/lifecycle.js';
import { IObservable, ITransaction } from '../../base/common/observable.js';
import { ICodeEditor, IOverlayWidgetPosition } from './editorBrowser.js';
import { EditorOption, FindComputedEditorOptionValueById } from '../common/config/editorOptions.js';
import { Position } from '../common/core/position.js';
import { Selection } from '../common/core/selection.js';
import { ICursorSelectionChangedEvent } from '../common/cursorEvents.js';
import { IModelDeltaDecoration, ITextModel } from '../common/model.js';
import { IModelContentChangedEvent } from '../common/textModelEvents.js';
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
    readonly isReadonly: IObservable<boolean, unknown>;
    private readonly _versionId;
    readonly versionId: IObservable<number | null, IModelContentChangedEvent | undefined>;
    private readonly _selections;
    readonly selections: IObservable<Selection[] | null, ICursorSelectionChangedEvent | undefined>;
    readonly positions: IObservable<readonly Position[] | null, unknown>;
    readonly isFocused: IObservable<boolean, unknown>;
    readonly value: import("../../base/common/observable.js").ISettableObservable<string, void>;
    readonly valueIsEmpty: IObservable<boolean, unknown>;
    readonly cursorSelection: IObservable<Selection | null, unknown>;
    readonly cursorPosition: IObservable<Position | null, unknown>;
    readonly onDidType: import("../../base/common/observable.js").IObservableSignal<string>;
    readonly scrollTop: IObservable<number, unknown>;
    readonly scrollLeft: IObservable<number, unknown>;
    readonly layoutInfo: IObservable<import("../common/config/editorOptions.js").EditorLayoutInfo, unknown>;
    readonly layoutInfoContentLeft: IObservable<number, unknown>;
    readonly layoutInfoDecorationsLeft: IObservable<number, unknown>;
    readonly contentWidth: IObservable<number, unknown>;
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
export {};
