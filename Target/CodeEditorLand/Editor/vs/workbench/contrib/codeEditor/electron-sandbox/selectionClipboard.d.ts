import { Disposable } from "../../../../base/common/lifecycle.js";
import type { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { type IEditorContribution } from "../../../../editor/common/editorCommon.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
export declare class SelectionClipboard extends Disposable implements IEditorContribution {
    private static readonly SELECTION_LENGTH_LIMIT;
    constructor(editor: ICodeEditor, clipboardService: IClipboardService);
    dispose(): void;
}
