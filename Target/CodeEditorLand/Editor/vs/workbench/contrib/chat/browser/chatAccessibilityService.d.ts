import { Disposable } from "../../../../base/common/lifecycle.js";
import { IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import type { IChatResponseViewModel } from "../common/chatViewModel.js";
import type { IChatAccessibilityService } from "./chat.js";
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