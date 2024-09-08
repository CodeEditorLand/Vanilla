import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { Event } from "../../../../base/common/event.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import type { IActiveCodeEditor, ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import type { IRange } from "../../../../editor/common/core/range.js";
import type { IValidEditOperation } from "../../../../editor/common/model.js";
import type { EditMode } from "../common/inlineChat.js";
import type { Session, StashedSession } from "./inlineChatSession.js";
export interface ISessionKeyComputer {
    getComparisonKey(editor: ICodeEditor, uri: URI): string;
}
export declare const IInlineChatSessionService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IInlineChatSessionService>;
export interface IInlineChatSessionEvent {
    readonly editor: ICodeEditor;
    readonly session: Session;
}
export interface IInlineChatSessionEndEvent extends IInlineChatSessionEvent {
    readonly endedByExternalCause: boolean;
}
export interface IInlineChatSessionService {
    _serviceBrand: undefined;
    onWillStartSession: Event<IActiveCodeEditor>;
    onDidMoveSession: Event<IInlineChatSessionEvent>;
    onDidStashSession: Event<IInlineChatSessionEvent>;
    onDidEndSession: Event<IInlineChatSessionEndEvent>;
    createSession(editor: IActiveCodeEditor, options: {
        editMode: EditMode;
        wholeRange?: IRange;
        session?: Session;
        headless?: boolean;
    }, token: CancellationToken): Promise<Session | undefined>;
    moveSession(session: Session, newEditor: ICodeEditor): void;
    getCodeEditor(session: Session): ICodeEditor;
    getSession(editor: ICodeEditor, uri: URI): Session | undefined;
    releaseSession(session: Session): void;
    stashSession(session: Session, editor: ICodeEditor, undoCancelEdits: IValidEditOperation[]): StashedSession;
    registerSessionKeyComputer(scheme: string, value: ISessionKeyComputer): IDisposable;
    dispose(): void;
}
