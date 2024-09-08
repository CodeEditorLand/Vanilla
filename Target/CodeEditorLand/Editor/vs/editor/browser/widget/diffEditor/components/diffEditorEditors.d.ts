import { Disposable } from "../../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../platform/keybinding/common/keybinding.js";
import { type IEditorOptions } from "../../../../common/config/editorOptions.js";
import { Position } from "../../../../common/core/position.js";
import type { IContentSizeChangedEvent } from "../../../../common/editorCommon.js";
import type { CodeEditorWidget, ICodeEditorWidgetOptions } from "../../codeEditor/codeEditorWidget.js";
import type { DiffEditorOptions } from "../diffEditorOptions.js";
import type { IDiffCodeEditorWidgetOptions } from "../diffEditorWidget.js";
export declare class DiffEditorEditors extends Disposable {
    private readonly originalEditorElement;
    private readonly modifiedEditorElement;
    private readonly _options;
    private _argCodeEditorWidgetOptions;
    private readonly _createInnerEditor;
    private readonly _instantiationService;
    private readonly _keybindingService;
    readonly original: CodeEditorWidget;
    readonly modified: CodeEditorWidget;
    private readonly _onDidContentSizeChange;
    get onDidContentSizeChange(): import("../../../../../base/common/event.js").Event<IContentSizeChangedEvent>;
    readonly modifiedScrollTop: import("../../../../../base/common/observable.js").IObservable<number, unknown>;
    readonly modifiedScrollHeight: import("../../../../../base/common/observable.js").IObservable<number, unknown>;
    readonly modifiedObs: import("../../../observableCodeEditor.js").ObservableCodeEditor;
    readonly originalObs: import("../../../observableCodeEditor.js").ObservableCodeEditor;
    readonly modifiedModel: import("../../../../../base/common/observable.js").IObservable<import("../../../../common/model.js").ITextModel | null, unknown>;
    readonly modifiedSelections: import("../../../../../base/common/observable.js").IObservable<import("../../../../common/core/selection.js").Selection[], unknown>;
    readonly modifiedCursor: import("../../../../../base/common/observable.js").IObservable<Position, unknown>;
    readonly originalCursor: import("../../../../../base/common/observable.js").IObservable<Position, unknown>;
    readonly isOriginalFocused: import("../../../../../base/common/observable.js").IObservable<boolean, unknown>;
    readonly isModifiedFocused: import("../../../../../base/common/observable.js").IObservable<boolean, unknown>;
    readonly isFocused: import("../../../../../base/common/observable.js").IObservable<boolean, unknown>;
    constructor(originalEditorElement: HTMLElement, modifiedEditorElement: HTMLElement, _options: DiffEditorOptions, _argCodeEditorWidgetOptions: IDiffCodeEditorWidgetOptions, _createInnerEditor: (instantiationService: IInstantiationService, container: HTMLElement, options: Readonly<IEditorOptions>, editorWidgetOptions: ICodeEditorWidgetOptions) => CodeEditorWidget, _instantiationService: IInstantiationService, _keybindingService: IKeybindingService);
    private _createLeftHandSideEditor;
    private _createRightHandSideEditor;
    private _constructInnerEditor;
    private _adjustOptionsForLeftHandSide;
    private _adjustOptionsForRightHandSide;
    private _adjustOptionsForSubEditor;
    private _updateAriaLabel;
}