import { Disposable } from "vs/base/common/lifecycle";
import { IObservable, ISettableObservable } from "vs/base/common/observable";
import "vs/css!./inlineEditsWidget";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { LineRange } from "vs/editor/common/core/lineRange";
import { DetailedLineRangeMapping } from "vs/editor/common/diff/rangeMapping";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare class InlineEdit {
    readonly range: LineRange;
    readonly newLines: string[];
    readonly changes: readonly DetailedLineRangeMapping[];
    constructor(range: LineRange, newLines: string[], changes: readonly DetailedLineRangeMapping[]);
}
export declare class InlineEditsWidget extends Disposable {
    private readonly _editor;
    private readonly _edit;
    private readonly _userPrompt;
    private readonly _instantiationService;
    private readonly _editorObs;
    private readonly _elements;
    protected readonly _toolbar: any;
    private readonly _previewTextModel;
    private readonly _setText;
    private readonly _promptTextModel;
    private readonly _promptEditor;
    private readonly _previewEditor;
    private readonly _previewEditorObs;
    private readonly _decorations;
    private readonly _layout1;
    private readonly _layout;
    constructor(_editor: ICodeEditor, _edit: IObservable<InlineEdit | undefined>, _userPrompt: ISettableObservable<string | undefined>, _instantiationService: IInstantiationService);
}
