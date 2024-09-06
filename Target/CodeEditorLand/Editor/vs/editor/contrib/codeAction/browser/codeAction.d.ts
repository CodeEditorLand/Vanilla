import { CancellationToken } from "vs/base/common/cancellation";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Range } from "vs/editor/common/core/range";
import { Selection } from "vs/editor/common/core/selection";
import { LanguageFeatureRegistry } from "vs/editor/common/languageFeatureRegistry";
import * as languages from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IProgress } from "vs/platform/progress/common/progress";
import { CodeActionItem, CodeActionSet, CodeActionTrigger } from "../common/types";
export declare const codeActionCommandId = "editor.action.codeAction";
export declare const quickFixCommandId = "editor.action.quickFix";
export declare const autoFixCommandId = "editor.action.autoFix";
export declare const refactorCommandId = "editor.action.refactor";
export declare const refactorPreviewCommandId = "editor.action.refactor.preview";
export declare const sourceActionCommandId = "editor.action.sourceAction";
export declare const organizeImportsCommandId = "editor.action.organizeImports";
export declare const fixAllCommandId = "editor.action.fixAll";
export declare function getCodeActions(registry: LanguageFeatureRegistry<languages.CodeActionProvider>, model: ITextModel, rangeOrSelection: Range | Selection, trigger: CodeActionTrigger, progress: IProgress<languages.CodeActionProvider>, token: CancellationToken): Promise<CodeActionSet>;
export declare enum ApplyCodeActionReason {
    OnSave = "onSave",
    FromProblemsView = "fromProblemsView",
    FromCodeActions = "fromCodeActions",
    FromAILightbulb = "fromAILightbulb"
}
export declare function applyCodeAction(accessor: ServicesAccessor, item: CodeActionItem, codeActionReason: ApplyCodeActionReason, options?: {
    readonly preview?: boolean;
    readonly editor?: ICodeEditor;
}, token?: CancellationToken): Promise<void>;
