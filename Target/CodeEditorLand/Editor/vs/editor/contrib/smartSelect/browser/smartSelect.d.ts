import { CancellationToken } from "../../../../base/common/cancellation.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import type { IEditorContribution } from "../../../common/editorCommon.js";
import type { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import type * as languages from "../../../common/languages.js";
import type { ITextModel } from "../../../common/model.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
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
