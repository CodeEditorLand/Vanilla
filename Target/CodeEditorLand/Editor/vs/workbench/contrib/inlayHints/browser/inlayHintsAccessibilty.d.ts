import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare class InlayHintsAccessibility implements IEditorContribution {
    private readonly _editor;
    private readonly _accessibilitySignalService;
    private readonly _instaService;
    static readonly IsReading: any;
    static readonly ID: string;
    static get(editor: ICodeEditor): InlayHintsAccessibility | undefined;
    private readonly _ariaElement;
    private readonly _ctxIsReading;
    private readonly _sessionDispoosables;
    constructor(_editor: ICodeEditor, contextKeyService: IContextKeyService, _accessibilitySignalService: IAccessibilitySignalService, _instaService: IInstantiationService);
    dispose(): void;
    private _reset;
    private _read;
    startInlayHintsReading(): void;
    stopInlayHintsReading(): void;
}
