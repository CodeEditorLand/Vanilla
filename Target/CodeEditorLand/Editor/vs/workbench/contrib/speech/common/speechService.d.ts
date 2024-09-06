import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
export declare const ISpeechService: any;
export declare const HasSpeechProvider: any;
export declare const SpeechToTextInProgress: any;
export declare const TextToSpeechInProgress: any;
export interface ISpeechProviderMetadata {
    readonly extension: ExtensionIdentifier;
    readonly displayName: string;
}
export declare enum SpeechToTextStatus {
    Started = 1,
    Recognizing = 2,
    Recognized = 3,
    Stopped = 4,
    Error = 5
}
export interface ISpeechToTextEvent {
    readonly status: SpeechToTextStatus;
    readonly text?: string;
}
export interface ISpeechToTextSession {
    readonly onDidChange: Event<ISpeechToTextEvent>;
}
export declare enum TextToSpeechStatus {
    Started = 1,
    Stopped = 2,
    Error = 3
}
export interface ITextToSpeechEvent {
    readonly status: TextToSpeechStatus;
    readonly text?: string;
}
export interface ITextToSpeechSession {
    readonly onDidChange: Event<ITextToSpeechEvent>;
    synthesize(text: string): Promise<void>;
}
export declare enum KeywordRecognitionStatus {
    Recognized = 1,
    Stopped = 2,
    Canceled = 3
}
export interface IKeywordRecognitionEvent {
    readonly status: KeywordRecognitionStatus;
    readonly text?: string;
}
export interface IKeywordRecognitionSession {
    readonly onDidChange: Event<IKeywordRecognitionEvent>;
}
export interface ISpeechToTextSessionOptions {
    readonly language?: string;
}
export interface ITextToSpeechSessionOptions {
    readonly language?: string;
}
export interface ISpeechProvider {
    readonly metadata: ISpeechProviderMetadata;
    createSpeechToTextSession(token: CancellationToken, options?: ISpeechToTextSessionOptions): ISpeechToTextSession;
    createTextToSpeechSession(token: CancellationToken, options?: ITextToSpeechSessionOptions): ITextToSpeechSession;
    createKeywordRecognitionSession(token: CancellationToken): IKeywordRecognitionSession;
}
export interface ISpeechService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeHasSpeechProvider: Event<void>;
    readonly hasSpeechProvider: boolean;
    registerSpeechProvider(identifier: string, provider: ISpeechProvider): IDisposable;
    readonly onDidStartSpeechToTextSession: Event<void>;
    readonly onDidEndSpeechToTextSession: Event<void>;
    readonly hasActiveSpeechToTextSession: boolean;
    /**
     * Starts to transcribe speech from the default microphone. The returned
     * session object provides an event to subscribe for transcribed text.
     */
    createSpeechToTextSession(token: CancellationToken, context?: string): Promise<ISpeechToTextSession>;
    readonly onDidStartTextToSpeechSession: Event<void>;
    readonly onDidEndTextToSpeechSession: Event<void>;
    readonly hasActiveTextToSpeechSession: boolean;
    /**
     * Creates a synthesizer to synthesize speech from text. The returned
     * session object provides a method to synthesize text and listen for
     * events.
     */
    createTextToSpeechSession(token: CancellationToken, context?: string): Promise<ITextToSpeechSession>;
    readonly onDidStartKeywordRecognition: Event<void>;
    readonly onDidEndKeywordRecognition: Event<void>;
    readonly hasActiveKeywordRecognition: boolean;
    /**
     * Starts to recognize a keyword from the default microphone. The returned
     * status indicates if the keyword was recognized or if the session was
     * stopped.
     */
    recognizeKeyword(token: CancellationToken): Promise<KeywordRecognitionStatus>;
}
export declare const enum AccessibilityVoiceSettingId {
    SpeechTimeout = "accessibility.voice.speechTimeout",
    AutoSynthesize = "accessibility.voice.autoSynthesize",
    SpeechLanguage = "accessibility.voice.speechLanguage"
}
export declare const SPEECH_LANGUAGE_CONFIG = AccessibilityVoiceSettingId.SpeechLanguage;
export declare const SPEECH_LANGUAGES: {
    "da-DK": {
        name: any;
    };
    "de-DE": {
        name: any;
    };
    "en-AU": {
        name: any;
    };
    "en-CA": {
        name: any;
    };
    "en-GB": {
        name: any;
    };
    "en-IE": {
        name: any;
    };
    "en-IN": {
        name: any;
    };
    "en-NZ": {
        name: any;
    };
    "en-US": {
        name: any;
    };
    "es-ES": {
        name: any;
    };
    "es-MX": {
        name: any;
    };
    "fr-CA": {
        name: any;
    };
    "fr-FR": {
        name: any;
    };
    "hi-IN": {
        name: any;
    };
    "it-IT": {
        name: any;
    };
    "ja-JP": {
        name: any;
    };
    "ko-KR": {
        name: any;
    };
    "nl-NL": {
        name: any;
    };
    "pt-PT": {
        name: any;
    };
    "pt-BR": {
        name: any;
    };
    "ru-RU": {
        name: any;
    };
    "sv-SE": {
        name: any;
    };
    "tr-TR": {
        name: any;
    };
    "zh-CN": {
        name: any;
    };
    "zh-HK": {
        name: any;
    };
    "zh-TW": {
        name: any;
    };
};
export declare function speechLanguageConfigToLanguage(config: unknown, lang?: any): string;
