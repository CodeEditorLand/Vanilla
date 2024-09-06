import { CancellationToken } from "vs/base/common/cancellation";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Position } from "vs/editor/common/core/position";
import { Range } from "vs/editor/common/core/range";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { LanguageFeatureRegistry } from "vs/editor/common/languageFeatureRegistry";
import * as languages from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
export declare class SmartSelectController implements IEditorContribution {
    private readonly _editor;
    private readonly _languageFeaturesService;
    static readonly ID = "editor.contrib.smartSelectController";
    static get(editor: ICodeEditor): SmartSelectController | null;
    private _state?;
    private _selectionListener?;
    private _ignoreSelection;
    constructor(_editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    run(forward: boolean): Promise<void>;
}
export interface SelectionRangesOptions {
    selectLeadingAndTrailingWhitespace: boolean;
    selectSubwords: boolean;
}
export declare function provideSelectionRanges(registry: LanguageFeatureRegistry<languages.SelectionRangeProvider>, model: ITextModel, positions: Position[], options: SelectionRangesOptions, token: CancellationToken): Promise<Range[][]>;
