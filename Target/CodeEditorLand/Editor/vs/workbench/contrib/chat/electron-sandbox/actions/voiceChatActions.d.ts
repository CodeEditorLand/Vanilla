import "vs/css!./media/voiceChatActions";
import { Disposable } from "vs/base/common/lifecycle";
import { Action2, IAction2Options } from "vs/platform/actions/common/actions";
import { ICommandService } from "vs/platform/commands/common/commands";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService, ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IWorkbenchContribution } from "vs/workbench/common/contributions";
import { IChatExecuteActionContext } from "vs/workbench/contrib/chat/browser/actions/chatExecuteActions";
import { IChatAgentService } from "vs/workbench/contrib/chat/common/chatAgents";
import { ISpeechService } from "vs/workbench/contrib/speech/common/speechService";
import { IEditorService } from "vs/workbench/services/editor/common/editorService";
import { IHostService } from "vs/workbench/services/host/browser/host";
export declare const VOICE_KEY_HOLD_THRESHOLD = 500;
declare class VoiceChatWithHoldModeAction extends Action2 {
    private readonly target;
    constructor(desc: Readonly<IAction2Options>, target: "view" | "inline" | "quick");
    run(accessor: ServicesAccessor, context?: IChatExecuteActionContext): Promise<void>;
}
export declare class VoiceChatInChatViewAction extends VoiceChatWithHoldModeAction {
    static readonly ID = "workbench.action.chat.voiceChatInChatView";
    constructor();
}
export declare class HoldToVoiceChatInChatViewAction extends Action2 {
    static readonly ID = "workbench.action.chat.holdToVoiceChatInChatView";
    constructor();
    run(accessor: ServicesAccessor, context?: IChatExecuteActionContext): Promise<void>;
}
export declare class InlineVoiceChatAction extends VoiceChatWithHoldModeAction {
    static readonly ID = "workbench.action.chat.inlineVoiceChat";
    constructor();
}
export declare class QuickVoiceChatAction extends VoiceChatWithHoldModeAction {
    static readonly ID = "workbench.action.chat.quickVoiceChat";
    constructor();
}
export declare class StartVoiceChatAction extends Action2 {
    static readonly ID = "workbench.action.chat.startVoiceChat";
    constructor();
    run(accessor: ServicesAccessor, context?: IChatExecuteActionContext): Promise<void>;
}
export declare class StopListeningAction extends Action2 {
    static readonly ID = "workbench.action.chat.stopListening";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class StopListeningAndSubmitAction extends Action2 {
    static readonly ID = "workbench.action.chat.stopListeningAndSubmit";
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare function parseNextChatResponseChunk(text: string, offset: number): {
    readonly chunk: string | undefined;
    readonly offset: number;
};
export declare class ReadChatResponseAloud extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): void;
}
export declare class StopReadAloud extends Action2 {
    static readonly ID = "workbench.action.speech.stopReadAloud";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class StopReadChatItemAloud extends Action2 {
    static readonly ID = "workbench.action.chat.stopReadChatItemAloud";
    constructor();
    run(accessor: ServicesAccessor, ...args: any[]): Promise<void>;
}
export declare class KeywordActivationContribution extends Disposable implements IWorkbenchContribution {
    private readonly speechService;
    private readonly configurationService;
    private readonly commandService;
    private readonly editorService;
    private readonly hostService;
    private readonly chatAgentService;
    static readonly ID = "workbench.contrib.keywordActivation";
    static SETTINGS_VALUE: {
        OFF: string;
        INLINE_CHAT: string;
        QUICK_CHAT: string;
        VIEW_CHAT: string;
        CHAT_IN_CONTEXT: string;
    };
    private activeSession;
    constructor(speechService: ISpeechService, configurationService: IConfigurationService, commandService: ICommandService, instantiationService: IInstantiationService, editorService: IEditorService, hostService: IHostService, chatAgentService: IChatAgentService);
    private registerListeners;
    private updateConfiguration;
    private handleKeywordActivation;
    private enableKeywordActivation;
    private getKeywordCommand;
    private disableKeywordActivation;
    dispose(): void;
}
declare abstract class BaseInstallSpeechProviderAction extends Action2 {
    private static readonly SPEECH_EXTENSION_ID;
    run(accessor: ServicesAccessor): Promise<void>;
    protected abstract getJustification(): string;
}
export declare class InstallSpeechProviderForVoiceChatAction extends BaseInstallSpeechProviderAction {
    static readonly ID = "workbench.action.chat.installProviderForVoiceChat";
    constructor();
    protected getJustification(): string;
}
export declare class InstallSpeechProviderForSynthesizeChatAction extends BaseInstallSpeechProviderAction {
    static readonly ID = "workbench.action.chat.installProviderForSynthesis";
    constructor();
    protected getJustification(): string;
}
export {};
