import { Disposable } from "vs/base/common/lifecycle";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction, ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { TriggerContext } from "vs/editor/contrib/parameterHints/browser/parameterHintsModel";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare class ParameterHintsController extends Disposable implements IEditorContribution {
    static readonly ID = "editor.controller.parameterHints";
    static get(editor: ICodeEditor): ParameterHintsController | null;
    private readonly editor;
    private readonly model;
    private readonly widget;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, languageFeaturesService: ILanguageFeaturesService);
    cancel(): void;
    previous(): void;
    next(): void;
    trigger(context: TriggerContext): void;
}
export declare class TriggerParameterHintsAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): void;
}
