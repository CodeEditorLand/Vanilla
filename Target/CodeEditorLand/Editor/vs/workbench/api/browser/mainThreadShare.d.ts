import { IShareService } from "../../contrib/share/common/share.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type IDocumentFilterDto, type MainThreadShareShape } from "../common/extHost.protocol.js";
export declare class MainThreadShare implements MainThreadShareShape {
    private readonly shareService;
    private readonly proxy;
    private providers;
    private providerDisposables;
    constructor(extHostContext: IExtHostContext, shareService: IShareService);
    $registerShareProvider(handle: number, selector: IDocumentFilterDto[], id: string, label: string, priority: number): void;
    $unregisterShareProvider(handle: number): void;
    dispose(): void;
}
