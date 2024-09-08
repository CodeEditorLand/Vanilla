import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { IMarker } from "../../../../platform/markers/common/markers.js";
import type { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, type IActionOptions, type ServicesAccessor } from "../../../browser/editorExtensions.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import type { IEditorContribution } from "../../../common/editorCommon.js";
import { IMarkerNavigationService } from "./markerNavigationService.js";
export declare class MarkerController implements IEditorContribution {
    private readonly _markerNavigationService;
    private readonly _contextKeyService;
    private readonly _editorService;
    private readonly _instantiationService;
    static readonly ID = "editor.contrib.markerController";
    static get(editor: ICodeEditor): MarkerController | null;
    private readonly _editor;
    private readonly _widgetVisible;
    private readonly _sessionDispoables;
    private _model?;
    private _widget?;
    constructor(editor: ICodeEditor, _markerNavigationService: IMarkerNavigationService, _contextKeyService: IContextKeyService, _editorService: ICodeEditorService, _instantiationService: IInstantiationService);
    dispose(): void;
    private _cleanUp;
    private _getOrCreateModel;
    close(focusEditor?: boolean): void;
    showAtMarker(marker: IMarker): void;
    nagivate(next: boolean, multiFile: boolean): Promise<void>;
}
declare class MarkerNavigationAction extends EditorAction {
    private readonly _next;
    private readonly _multiFile;
    constructor(_next: boolean, _multiFile: boolean, opts: IActionOptions);
    run(_accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class NextMarkerAction extends MarkerNavigationAction {
    static ID: string;
    static LABEL: string;
    constructor();
}
export {};
