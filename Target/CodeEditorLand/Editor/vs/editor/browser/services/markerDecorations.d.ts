import type { IEditorContribution } from "../../common/editorCommon.js";
import { IMarkerDecorationsService } from "../../common/services/markerDecorations.js";
import type { ICodeEditor } from "../editorBrowser.js";
export declare class MarkerDecorationsContribution implements IEditorContribution {
    static readonly ID: string;
    constructor(_editor: ICodeEditor, _markerDecorationsService: IMarkerDecorationsService);
    dispose(): void;
}
