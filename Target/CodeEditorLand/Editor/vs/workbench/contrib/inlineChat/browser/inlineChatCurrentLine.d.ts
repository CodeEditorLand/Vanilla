import type { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { EditorAction2, type ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import type { IEditorContribution } from "../../../../editor/common/editorCommon.js";
import { IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IChatAgentService } from "../../chat/common/chatAgents.js";
export declare const CTX_INLINE_CHAT_EXPANSION: RawContextKey<boolean>;
export declare class InlineChatExansionContextKey implements IEditorContribution {
    static Id: string;
    private readonly _store;
    private readonly _editorListener;
    private readonly _ctxInlineChatExpansion;
    constructor(editor: ICodeEditor, contextKeyService: IContextKeyService, chatAgentService: IChatAgentService);
    dispose(): void;
    private _install;
    private _uninstall;
}
export declare class InlineChatExpandLineAction extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
