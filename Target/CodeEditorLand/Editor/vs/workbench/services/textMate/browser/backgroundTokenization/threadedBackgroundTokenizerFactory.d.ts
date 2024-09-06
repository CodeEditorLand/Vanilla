import { IDisposable } from "vs/base/common/lifecycle";
import { IObservable } from "vs/base/common/observable";
import { IBackgroundTokenizationStore, IBackgroundTokenizer } from "vs/editor/common/languages";
import { ILanguageService } from "vs/editor/common/languages/language";
import { ITextModel } from "vs/editor/common/model";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IEnvironmentService } from "vs/platform/environment/common/environment";
import { IExtensionResourceLoaderService } from "vs/platform/extensionResourceLoader/common/extensionResourceLoader";
import { INotificationService } from "vs/platform/notification/common/notification";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IValidGrammarDefinition } from "vs/workbench/services/textMate/common/TMScopeRegistry";
import type { IRawTheme } from "vscode-textmate";
export declare class ThreadedBackgroundTokenizerFactory implements IDisposable {
    private readonly _reportTokenizationTime;
    private readonly _shouldTokenizeAsync;
    private readonly _extensionResourceLoaderService;
    private readonly _configurationService;
    private readonly _languageService;
    private readonly _environmentService;
    private readonly _notificationService;
    private readonly _telemetryService;
    private static _reportedMismatchingTokens;
    private _workerProxyPromise;
    private _worker;
    private _workerProxy;
    private readonly _workerTokenizerControllers;
    private _currentTheme;
    private _currentTokenColorMap;
    private _grammarDefinitions;
    constructor(_reportTokenizationTime: (timeMs: number, languageId: string, sourceExtensionId: string | undefined, lineLength: number, isRandomSample: boolean) => void, _shouldTokenizeAsync: () => boolean, _extensionResourceLoaderService: IExtensionResourceLoaderService, _configurationService: IConfigurationService, _languageService: ILanguageService, _environmentService: IEnvironmentService, _notificationService: INotificationService, _telemetryService: ITelemetryService);
    dispose(): void;
    createBackgroundTokenizer(textModel: ITextModel, tokenStore: IBackgroundTokenizationStore, maxTokenizationLineLength: IObservable<number>): IBackgroundTokenizer | undefined;
    setGrammarDefinitions(grammarDefinitions: IValidGrammarDefinition[]): void;
    acceptTheme(theme: IRawTheme, colorMap: string[]): void;
    private _getWorkerProxy;
    private _createWorkerProxy;
    private _disposeWorker;
}