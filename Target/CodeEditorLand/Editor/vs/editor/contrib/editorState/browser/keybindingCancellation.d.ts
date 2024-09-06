import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
export declare class EditorKeybindingCancellationTokenSource extends CancellationTokenSource {
    readonly editor: ICodeEditor;
    private readonly _unregister;
    constructor(editor: ICodeEditor, parent?: CancellationToken);
    dispose(): void;
}
