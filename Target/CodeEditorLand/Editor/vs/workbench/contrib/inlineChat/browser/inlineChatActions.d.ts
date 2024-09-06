import { ICodeEditor } from "vs/editor/browser/editorBrowser";
import { EditorAction2 } from "vs/editor/browser/editorExtensions";
import { Action2, IAction2Options } from "vs/platform/actions/common/actions";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { InlineChatController } from "vs/workbench/contrib/inlineChat/browser/inlineChatController";
import { HunkInformation } from "vs/workbench/contrib/inlineChat/browser/inlineChatSession";
export declare const LOCALIZED_START_INLINE_CHAT_STRING: any;
export declare const START_INLINE_CHAT: any;
export interface IHoldForSpeech {
    (accessor: ServicesAccessor, controller: InlineChatController, source: Action2): void;
}
export declare function setHoldForSpeech(holdForSpeech: IHoldForSpeech): void;
export declare class StartSessionAction extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ..._args: any[]): void;
}
export declare class UnstashSessionAction extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor, ..._args: any[]): Promise<void>;
}
export declare abstract class AbstractInlineChatAction extends EditorAction2 {
    static readonly category: any;
    constructor(desc: IAction2Options);
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ..._args: any[]): void;
    abstract runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ...args: any[]): void;
}
export declare class ArrowOutUpAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): void;
}
export declare class ArrowOutDownAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): void;
}
export declare class FocusInlineChat extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor, ..._args: any[]): void;
}
export declare class DiscardAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): Promise<void>;
}
export declare class AcceptChanges extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, hunk?: HunkInformation | any): Promise<void>;
}
export declare class DiscardHunkAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, hunk?: HunkInformation | any): Promise<void>;
}
export declare class RerunAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): Promise<void>;
}
export declare class CloseAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): Promise<void>;
}
export declare class ConfigureInlineChatAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): Promise<void>;
}
export declare class MoveToNextHunk extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ...args: any[]): void;
}
export declare class MoveToPreviousHunk extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(accessor: ServicesAccessor, ctrl: InlineChatController, editor: ICodeEditor, ...args: any[]): void;
}
export declare class ViewInChatAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, ..._args: any[]): any;
}
export declare class ToggleDiffForChange extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController, _editor: ICodeEditor, hunkInfo: HunkInformation | any): void;
}
export declare class ReportIssueAction extends AbstractInlineChatAction {
    constructor();
    runInlineChatCommand(_accessor: ServicesAccessor, ctrl: InlineChatController): void;
}
