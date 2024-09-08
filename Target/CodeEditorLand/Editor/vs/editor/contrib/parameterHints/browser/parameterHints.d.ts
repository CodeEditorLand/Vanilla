import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, type ServicesAccessor } from "../../../browser/editorExtensions.js";
import type { IEditorContribution } from "../../../common/editorCommon.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { type TriggerContext } from "./parameterHintsModel.js";
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
