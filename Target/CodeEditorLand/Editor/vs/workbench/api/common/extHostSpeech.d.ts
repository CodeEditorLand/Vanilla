import { IDisposable } from "vs/base/common/lifecycle";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { ExtHostSpeechShape, IMainContext } from "vs/workbench/api/common/extHost.protocol";
import type * as vscode from "vscode";
export declare class ExtHostSpeech implements ExtHostSpeechShape {
    private static ID_POOL;
    private readonly proxy;
    private readonly providers;
    private readonly sessions;
    private readonly synthesizers;
    constructor(mainContext: IMainContext);
    $createSpeechToTextSession(handle: number, session: number, language?: string): Promise<void>;
    $cancelSpeechToTextSession(session: number): Promise<void>;
    $createTextToSpeechSession(handle: number, session: number, language?: string): Promise<void>;
    $synthesizeSpeech(session: number, text: string): Promise<void>;
    $cancelTextToSpeechSession(session: number): Promise<void>;
    $createKeywordRecognitionSession(handle: number, session: number): Promise<void>;
    $cancelKeywordRecognitionSession(session: number): Promise<void>;
    registerProvider(extension: ExtensionIdentifier, identifier: string, provider: vscode.SpeechProvider): IDisposable;
}
