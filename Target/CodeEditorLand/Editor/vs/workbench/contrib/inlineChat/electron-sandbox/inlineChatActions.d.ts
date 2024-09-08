import type { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import type { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { AbstractInlineChatAction } from "../browser/inlineChatActions.js";
import type { InlineChatController } from "../browser/inlineChatController.js";
export declare class HoldToSpeak extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ...args: any[]): void;
}
