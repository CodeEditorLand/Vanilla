import type { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { IEditorSerializer } from "../../../common/editor.js";
import type { EditorInput } from "../../../common/editor/editorInput.js";
import { ITerminalEditorService, type ITerminalInstance } from "./terminal.js";
import type { TerminalEditorInput } from "./terminalEditorInput.js";
export declare class TerminalInputSerializer implements IEditorSerializer {
    private readonly _terminalEditorService;
    constructor(_terminalEditorService: ITerminalEditorService);
    canSerialize(editorInput: TerminalEditorInput): editorInput is TerminalEditorInput & {
        readonly terminalInstance: ITerminalInstance;
    };
    serialize(editorInput: TerminalEditorInput): string | undefined;
    deserialize(instantiationService: IInstantiationService, serializedEditorInput: string): EditorInput | undefined;
    private _toJson;
}
