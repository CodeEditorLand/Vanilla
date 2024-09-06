import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { IEditorWorkerService } from "vs/editor/common/services/editorWorker";
import { ILanguageFeaturesService } from "vs/editor/common/services/languageFeatures";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
export declare class FormatOnType implements IEditorContribution {
    private readonly _editor;
    private readonly _languageFeaturesService;
    private readonly _workerService;
    private readonly _accessibilitySignalService;
    static readonly ID = "editor.contrib.autoFormat";
    private readonly _disposables;
    private readonly _sessionDisposables;
    constructor(_editor: ICodeEditor, _languageFeaturesService: ILanguageFeaturesService, _workerService: IEditorWorkerService, _accessibilitySignalService: IAccessibilitySignalService);
    dispose(): void;
    private _update;
    private _trigger;
}
