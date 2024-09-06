import { ICodeEditor, IDiffEditorConstructionOptions } from "vs/editor/browser/editorBrowser";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { DiffEditorWidget, IDiffCodeEditorWidgetOptions } from "vs/editor/browser/widget/diffEditor/diffEditorWidget";
import { IEditorOptions } from "vs/editor/common/config/editorOptions";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IEditorProgressService } from "vs/platform/progress/common/progress";
export declare class EmbeddedDiffEditorWidget extends DiffEditorWidget {
    private readonly _parentEditor;
    private readonly _overwriteOptions;
    constructor(domElement: HTMLElement, options: Readonly<IDiffEditorConstructionOptions>, codeEditorWidgetOptions: IDiffCodeEditorWidgetOptions, parentEditor: ICodeEditor, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, accessibilitySignalService: IAccessibilitySignalService, editorProgressService: IEditorProgressService);
    getParentEditor(): ICodeEditor;
    private _onParentConfigurationChanged;
    updateOptions(newOptions: IEditorOptions): void;
}
