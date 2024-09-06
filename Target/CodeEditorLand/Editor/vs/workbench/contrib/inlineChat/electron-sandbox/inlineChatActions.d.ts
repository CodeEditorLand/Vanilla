import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { AbstractInlineChatAction } from "vs/workbench/contrib/inlineChat/browser/inlineChatActions";
import { InlineChatController } from "vs/workbench/contrib/inlineChat/browser/inlineChatController";
export declare class HoldToSpeak extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ...args: any[]): void;
}
