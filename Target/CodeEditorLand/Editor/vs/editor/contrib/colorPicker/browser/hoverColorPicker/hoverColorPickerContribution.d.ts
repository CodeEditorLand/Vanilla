import { Disposable } from "../../../../../base/common/lifecycle.js";
import { type ICodeEditor } from "../../../../browser/editorBrowser.js";
import type { IEditorContribution } from "../../../../common/editorCommon.js";
export declare class HoverColorPickerContribution extends Disposable implements IEditorContribution {
    private readonly _editor;
    static readonly ID: string;
    static readonly RECOMPUTE_TIME = 1000;
    constructor(_editor: ICodeEditor);
    dispose(): void;
    private onMouseDown;
}
