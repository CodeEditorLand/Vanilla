import { CancellationToken } from "vs/base/common/cancellation";
import { SerializedError } from "vs/base/common/errors";
import { ExtensionIdentifier } from "vs/platform/extensions/common/extensions";
import { ILogService } from "vs/platform/log/common/log";
import { MainThreadLanguageModelsShape } from "vs/workbench/api/common/extHost.protocol";
import { IChatMessage, IChatResponseFragment, ILanguageModelChatMetadata, ILanguageModelChatSelector, ILanguageModelsService } from "vs/workbench/contrib/chat/common/languageModels";
import { ILanguageModelStatsService } from "vs/workbench/contrib/chat/common/languageModelStats";
import { IAuthenticationAccessService } from "vs/workbench/services/authentication/browser/authenticationAccessService";
import { IAuthenticationService } from "vs/workbench/services/authentication/common/authentication";
import { IExtensionService } from "vs/workbench/services/extensions/common/extensions";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class MainThreadLanguageModels implements MainThreadLanguageModelsShape {
    private readonly _chatProviderService;
    private readonly _languageModelStatsService;
    private readonly _logService;
    private readonly _authenticationService;
    private readonly _authenticationAccessService;
    private readonly _extensionService;
    private readonly _proxy;
    private readonly _store;
    private readonly _providerRegistrations;
    private readonly _pendingProgress;
    constructor(extHostContext: IExtHostContext, _chatProviderService: ILanguageModelsService, _languageModelStatsService: ILanguageModelStatsService, _logService: ILogService, _authenticationService: IAuthenticationService, _authenticationAccessService: IAuthenticationAccessService, _extensionService: IExtensionService);
    dispose(): void;
    $registerLanguageModelProvider(handle: number, identifier: string, metadata: ILanguageModelChatMetadata): void;
    $reportResponsePart(requestId: number, chunk: IChatResponseFragment): Promise<void>;
    $reportResponseDone(requestId: number, err: SerializedError | undefined): Promise<void>;
    $unregisterProvider(handle: number): void;
    $selectChatModels(selector: ILanguageModelChatSelector): Promise<string[]>;
    $whenLanguageModelChatRequestMade(identifier: string, extensionId: ExtensionIdentifier, participant?: string | undefined, tokenCount?: number | undefined): void;
    $tryStartChatRequest(extension: ExtensionIdentifier, providerId: string, requestId: number, messages: IChatMessage[], options: {}, token: CancellationToken): Promise<any>;
    $countTokens(provider: string, value: string | IChatMessage, token: CancellationToken): Promise<number>;
    private _registerAuthenticationProvider;
}
