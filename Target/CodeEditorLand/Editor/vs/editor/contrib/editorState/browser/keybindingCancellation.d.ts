import { CancellationToken, CancellationTokenSource } from "vs/base/common/cancellation";
import { ICodeEditor } from "vs/editor/browser/editorBrowser";
export declare class EditorKeybindingCancellationTokenSource extends CancellationTokenSource {
    readonly editor: ICodeEditor;
    private readonly _unregister;
    constructor(editor: ICodeEditor, parent?: CancellationToken);
    dispose(): void;
}
