import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IActiveCodeEditor, ICodeEditor } from "vs/editor/browser/editorBrowser";
import { Range } from "vs/editor/common/core/range";
import { ILanguageService } from "vs/editor/common/languages/language";
import { IValidEditOperation } from "vs/editor/common/model";
import { IEditorWorkerService } from "vs/editor/common/services/editorWorker";
import { IModelService } from "vs/editor/common/services/model";
import { ITextModelService } from "vs/editor/common/services/resolverService";
import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { ILogService } from "vs/platform/log/common/log";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { IChatService } from "vs/workbench/contrib/chat/common/chatService";
import { EditMode } from "vs/workbench/contrib/inlineChat/common/inlineChat";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles";
import { Session, StashedSession } from "./inlineChatSession";
import { IInlineChatSessionEndEvent, IInlineChatSessionEvent, IInlineChatSessionService, ISessionKeyComputer } from "./inlineChatSessionService";
export declare class InlineChatError extends Error {
    static readonly code = "InlineChatError";
    constructor(message: string);
}
export declare class InlineChatSessionServiceImpl implements IInlineChatSessionService {
    private readonly _telemetryService;
    private readonly _modelService;
    private readonly _textModelService;
    private readonly _editorWorkerService;
    private readonly _logService;
    private readonly _instaService;
    private readonly _editorService;
    private readonly _textFileService;
    private readonly _languageService;
    private readonly _chatService;
    private readonly _chatAgentService;
    _serviceBrand: undefined;
    private readonly _store;
    private readonly _onWillStartSession;
    readonly onWillStartSession: Event<IActiveCodeEditor>;
    private readonly _onDidMoveSession;
    readonly onDidMoveSession: Event<IInlineChatSessionEvent>;
    private readonly _onDidEndSession;
    readonly onDidEndSession: Event<IInlineChatSessionEndEvent>;
    private readonly _onDidStashSession;
    readonly onDidStashSession: Event<IInlineChatSessionEvent>;
    private readonly _sessions;
    private readonly _keyComputers;
    constructor(_telemetryService: ITelemetryService, _modelService: IModelService, _textModelService: ITextModelService, _editorWorkerService: IEditorWorkerService, _logService: ILogService, _instaService: IInstantiationService, _editorService: IEditorService, _textFileService: ITextFileService, _languageService: ILanguageService, _chatService: IChatService, _chatAgentService: IChatAgentService);
    dispose(): void;
    createSession(editor: IActiveCodeEditor, options: {
        editMode: EditMode;
        headless?: boolean;
        wholeRange?: Range;
        session?: Session;
    }, token: CancellationToken): Promise<Session | undefined>;
    moveSession(session: Session, target: ICodeEditor): void;
    releaseSession(session: Session): void;
    private _releaseSession;
    stashSession(session: Session, editor: ICodeEditor, undoCancelEdits: IValidEditOperation[]): StashedSession;
    getCodeEditor(session: Session): ICodeEditor;
    getSession(editor: ICodeEditor, uri: URI): Session | undefined;
    private _key;
    registerSessionKeyComputer(scheme: string, value: ISessionKeyComputer): IDisposable;
}
export declare class InlineChatEnabler {
    static Id: string;
    private readonly _ctxHasProvider;
    private readonly _store;
    constructor(contextKeyService: IContextKeyService, chatAgentService: IChatAgentService);
    dispose(): void;
}
