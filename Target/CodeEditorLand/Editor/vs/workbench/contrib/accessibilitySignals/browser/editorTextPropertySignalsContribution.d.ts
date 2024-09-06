import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
export declare class EditorTextPropertySignalsContribution extends Disposable implements IWorkbenchContribution {
    private readonly _editorService;
    private readonly _instantiationService;
    private readonly _accessibilitySignalService;
    private readonly _textProperties;
    private readonly _someAccessibilitySignalIsEnabled;
    private readonly _activeEditorObservable;
    constructor(_editorService: IEditorService, _instantiationService: IInstantiationService, _accessibilitySignalService: IAccessibilitySignalService);
    private _registerAccessibilitySignalsForEditor;
}
