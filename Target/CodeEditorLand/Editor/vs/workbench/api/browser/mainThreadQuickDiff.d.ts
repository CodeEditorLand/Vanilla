import { UriComponents } from "vs/base/common/uri";
import { IDocumentFilterDto, MainThreadQuickDiffShape } from "vs/workbench/api/common/extHost.protocol";
import { IQuickDiffService } from "vs/workbench/contrib/scm/common/quickDiff";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
export declare class MainThreadQuickDiff implements MainThreadQuickDiffShape {
    private readonly quickDiffService;
    private readonly proxy;
    private providerDisposables;
    constructor(extHostContext: IExtHostContext, quickDiffService: IQuickDiffService);
    $registerQuickDiffProvider(handle: number, selector: IDocumentFilterDto[], label: string, rootUri: UriComponents | undefined): Promise<void>;
    $unregisterQuickDiffProvider(handle: number): Promise<void>;
    dispose(): void;
}
