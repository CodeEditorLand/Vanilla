import { IDocumentFilterDto, MainThreadShareShape } from "vs/workbench/api/common/extHost.protocol";
import { IShareService } from "vs/workbench/contrib/share/common/share";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
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
