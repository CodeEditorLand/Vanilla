import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction2, ServicesAccessor } from "vs/editor/browser/editorExtensions";
import { IEditorContribution } from "vs/editor/common/editorCommon";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
export declare const CTX_INLINE_CHAT_EXPANSION: any;
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
