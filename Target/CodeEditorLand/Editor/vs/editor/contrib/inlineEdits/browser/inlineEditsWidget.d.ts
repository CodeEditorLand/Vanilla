import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable, ISettableObservable } from '../../../../base/common/observable.js';
import './inlineEditsWidget.css';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { LineRange } from '../../../common/core/lineRange.js';
import { DetailedLineRangeMapping } from '../../../common/diff/rangeMapping.js';
import { MenuWorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
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
    protected readonly _toolbar: MenuWorkbenchToolBar;
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
