import { ILogService } from "vs/platform/log/common/log";
import { MainThreadSpeechShape } from "vs/workbench/api/common/extHost.protocol";
import { IKeywordRecognitionEvent, ISpeechProviderMetadata, ISpeechService, ISpeechToTextEvent, ITextToSpeechEvent } from "vs/workbench/contrib/speech/common/speechService";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class MainThreadSpeech implements MainThreadSpeechShape {
    private readonly speechService;
    private readonly logService;
    private readonly proxy;
    private readonly providerRegistrations;
    private readonly speechToTextSessions;
    private readonly textToSpeechSessions;
    private readonly keywordRecognitionSessions;
    constructor(extHostContext: IExtHostContext, speechService: ISpeechService, logService: ILogService);
    $registerProvider(handle: number, identifier: string, metadata: ISpeechProviderMetadata): void;
    $unregisterProvider(handle: number): void;
    $emitSpeechToTextEvent(session: number, event: ISpeechToTextEvent): void;
    $emitTextToSpeechEvent(session: number, event: ITextToSpeechEvent): void;
    $emitKeywordRecognitionEvent(session: number, event: IKeywordRecognitionEvent): void;
    dispose(): void;
}
