import { Disposable } from "vs/base/common/lifecycle";
import { IAccessibilitySignalService } from "vs/platform/accessibilitySignal/browser/accessibilitySignalService";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IChatAccessibilityService } from "vs/workbench/contrib/chat/browser/chat";
import { IChatResponseViewModel } from "vs/workbench/contrib/chat/common/chatViewModel";
export declare class ChatAccessibilityService extends Disposable implements IChatAccessibilityService {
    private readonly _accessibilitySignalService;
    private readonly _instantiationService;
    private readonly _configurationService;
    readonly _serviceBrand: undefined;
    private _pendingSignalMap;
    private _requestId;
    constructor(_accessibilitySignalService: IAccessibilitySignalService, _instantiationService: IInstantiationService, _configurationService: IConfigurationService);
    acceptRequest(): number;
    acceptResponse(response: IChatResponseViewModel | string | undefined, requestId: number): void;
}
